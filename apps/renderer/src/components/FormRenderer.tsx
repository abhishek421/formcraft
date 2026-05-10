import { createSignal, For, Show, onCleanup } from "solid-js";
import { supabase } from "../lib/supabase";
import type { Field, Form, Answers, LogicJump } from "../lib/types";

// ── Logic evaluation ──────────────────────────────────────────────────────────

function evaluateLogic(field: Field, answers: Answers): string | null | undefined {
  const rules = (field.logic ?? []) as LogicJump[];
  if (!rules.length) return undefined;

  const answer = answers[field.id];
  const answerStr = Array.isArray(answer) ? answer.join(", ") : String(answer ?? "");

  for (const rule of rules) {
    let match = false;
    switch (rule.operator) {
      case "equals":       match = answerStr === rule.value; break;
      case "not_equals":   match = answerStr !== rule.value; break;
      case "contains":     match = answerStr.toLowerCase().includes(rule.value.toLowerCase()); break;
      case "greater_than": match = Number(answer) > Number(rule.value); break;
      case "less_than":    match = Number(answer) < Number(rule.value); break;
      case "is_filled":
      case "is_answered":  match = answer !== undefined && answer !== null && answer !== "" && !(Array.isArray(answer) && answer.length === 0); break;
      case "is_empty":
      case "is_skipped":   match = !answer || (Array.isArray(answer) && answer.length === 0); break;
    }
    if (match) return rule.destination_field_id;
  }
  return undefined;
}

// ── Variable interpolation ────────────────────────────────────────────────────

function interpolate(text: string, fields: Field[], answers: Answers): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
    const field = fields.find((f) => f.variable === varName);
    if (!field) return `{{${varName}}}`;
    const val = answers[field.id];
    if (val === undefined || val === null) return `{{${varName}}}`;
    if (Array.isArray(val)) return val.join(", ");
    return String(val);
  });
}

// ── Submit response ───────────────────────────────────────────────────────────

async function submitResponse(formId: string, answers: Answers, startedAt: string) {
  const responseId = crypto.randomUUID();

  const { error: rErr } = await supabase.from("responses").insert({
    id: responseId,
    form_id: formId,
    started_at: startedAt,
    submitted_at: new Date().toISOString(),
  });
  if (rErr) throw rErr;

  const answerRows = Object.entries(answers).map(([field_id, value]) => ({
    response_id: responseId,
    field_id,
    value,
  }));
  if (answerRows.length > 0) {
    const { error: aErr } = await supabase.from("answers").insert(answerRows);
    if (aErr) throw aErr;
  }
}

function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ── Main component ────────────────────────────────────────────────────────────

type Phase = "welcome" | "form" | "done";

export function FormRenderer(props: { form: Form; fields: Field[] }) {
  const allFields = () => props.fields;
  const questionFields = () => props.fields.filter(
    (f) => f.type !== "welcome_screen" && f.type !== "statement"
  );

  const primaryColor = () => props.form.theme?.primary_color ?? "#CAFF00";
  const bgColor = () => props.form.theme?.background_color ?? "#080808";
  const displayFont = () => (props.form.theme?.display_font as string) ?? "Syne";
  const bodyFont = () => (props.form.theme?.body_font as string) ?? "DM Mono";
  const buttonRadius = () => (props.form.theme?.button_radius as string) ?? "0px";
  const brandName = () => (props.form.theme?.brand_name as string) ?? "";
  const brandLogo = () => (props.form.theme?.brand_logo_url as string) ?? "";
  const showProgress = () => props.form.settings?.show_progress_bar !== false;
  const showNumbers = () => props.form.settings?.show_question_number !== false;

  const storageKey = `fc_draft_${props.form.id}`;

  function loadDraft(): { phase: Phase; idx: number; answers: Answers; startedAt: string } | null {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function saveDraft(phase: Phase, idx: number, answers: Answers, startedAt: string) {
    if (phase === "done") { localStorage.removeItem(storageKey); return; }
    try { localStorage.setItem(storageKey, JSON.stringify({ phase, idx, answers, startedAt })); } catch {}
  }

  const draft = loadDraft();
  const initialPhase: Phase = draft?.phase ?? (props.fields[0]?.type === "welcome_screen" ? "welcome" : "form");

  const [phase, setPhase] = createSignal<Phase>(initialPhase);
  const [startedAt] = createSignal(draft?.startedAt ?? new Date().toISOString());
  const [currentIdx, setCurrentIdx] = createSignal(draft?.idx ?? 0);
  const [answers, setAnswers] = createSignal<Answers>(draft?.answers ?? {});
  const [animDir, setAnimDir] = createSignal<"up" | "down">("up");
  const [visible, setVisible] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [submitting, setSubmitting] = createSignal(false);

  const currentField = () => allFields()[currentIdx()];
  const questionNumber = () => questionFields().findIndex((f) => f.id === currentField()?.id) + 1;
  const totalQuestions = () => questionFields().length;
  const progress = () => totalQuestions() > 0 ? (Math.max(0, questionNumber() - 1) / totalQuestions()) * 100 : 0;
  const isLastField = () => currentIdx() === allFields().length - 1;

  function transition(dir: "up" | "down", fn: () => void) {
    setAnimDir(dir);
    setVisible(false);
    setTimeout(() => { fn(); setVisible(true); }, 250);
  }

  function setAnswer(fieldId: string, value: unknown) {
    setAnswers((prev) => {
      const next = { ...prev, [fieldId]: value };
      saveDraft(phase(), currentIdx(), next, startedAt());
      return next;
    });
    setError(null);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitResponse(props.form.id, answers(), startedAt());
      saveDraft("done", currentIdx(), answers(), startedAt());
      transition("up", () => setPhase("done"));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    const field = currentField();
    if (!field) return;

    if (field.required && field.type !== "statement" && field.type !== "welcome_screen") {
      const val = answers()[field.id];
      if (val === undefined || val === null || val === "") {
        setError("This question requires an answer.");
        return;
      }
      if (Array.isArray(val) && val.length === 0) {
        setError("Please select at least one option.");
        return;
      }
    }

    setError(null);

    const destination = evaluateLogic(field, answers());

    if (destination === null) {
      handleSubmit();
      return;
    }

    if (destination !== undefined) {
      const destIdx = allFields().findIndex((f) => f.id === destination);
      if (destIdx !== -1) {
        transition("up", () => setCurrentIdx(destIdx));
        return;
      }
    }

    if (currentIdx() < allFields().length - 1) {
      transition("up", () => {
        const next = currentIdx() + 1;
        setCurrentIdx(next);
        saveDraft(phase(), next, answers(), startedAt());
      });
    } else {
      handleSubmit();
    }
  }

  function goPrev() {
    if (currentIdx() > 0) {
      transition("down", () => {
        const prev = currentIdx() - 1;
        setCurrentIdx(prev);
        saveDraft(phase(), prev, answers(), startedAt());
      });
      setError(null);
    }
  }

  // Keyboard handler
  const handler = (e: KeyboardEvent) => {
    if (phase() !== "form") return;
    const field = currentField();
    if (!field) return;
    if (e.key === "Enter" && !e.shiftKey && field.type !== "long_text") {
      e.preventDefault();
      goNext();
    }
  };
  window.addEventListener("keydown", handler);
  onCleanup(() => window.removeEventListener("keydown", handler));

  const light = () => isLightColor(bgColor());
  const textRgb = () => light() ? "20,20,20" : "240,237,232";
  const textColor = () => light() ? "#141414" : "#F0EDE8";
  const textMuted = () => `rgba(${textRgb()},0.45)`;

  const wrapStyle = () => ({
    "min-height": "100vh",
    background: bgColor(),
    color: textColor(),
    "font-family": `'${bodyFont()}', monospace`,
    display: "flex",
    "flex-direction": "column" as const,
    position: "relative" as const,
    overflow: "hidden",
  });

  const contentStyle = () => ({
    width: "100%",
    "max-width": "640px",
    opacity: visible() ? "1" : "0",
    transform: visible()
      ? "translateY(0px)"
      : animDir() === "up" ? "translateY(40px)" : "translateY(-40px)",
    transition: "opacity 0.25s ease, transform 0.25s ease",
  });

  // ── Welcome screen ───────────────────────────────────────────────────────────

  const welcomeField = () => props.fields.find((f) => f.type === "welcome_screen");

  return (
    <Show when={phase() === "welcome"} fallback={
      <Show when={phase() === "done"} fallback={
        // Form phase
        <Show when={currentField()}>
          {(field) => {
            const title = () => interpolate(field().title || "", allFields(), answers());
            const description = () => field().description ? interpolate(field().description!, allFields(), answers()) : undefined;
            const isStatement = () => field().type === "statement";

            return (
              <div style={wrapStyle()}>
                <style>{`
                  @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(displayFont())}:wght@400;700;800&family=${encodeURIComponent(bodyFont())}:wght@300;400;500&display=swap');
                  * { box-sizing: border-box; margin: 0; padding: 0; }
                  input:focus, textarea:focus { border-bottom-color: ${primaryColor()} !important; }
                  input[type=date]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.3); }
                `}</style>

                {/* Progress bar */}
                <Show when={showProgress() && !isStatement()}>
                  <div style={{
                    position: "absolute", top: "0", left: "0",
                    height: "3px", width: `${progress()}%`,
                    background: primaryColor(),
                    transition: "width 0.4s ease", "z-index": "10",
                  }} />
                </Show>

                {/* User brand top-left */}
                <Show when={brandName() || brandLogo()}>
                  <div style={{
                    position: "absolute", top: "20px", left: "24px",
                    display: "flex", "align-items": "center", gap: "8px", "z-index": "10",
                  }}>
                    <Show when={brandLogo()}>
                      <img src={brandLogo()} alt="" style={{ height: "22px", width: "auto", "object-fit": "contain" }} />
                    </Show>
                    <Show when={brandName()}>
                      <span style={{
                        "font-size": "13px", "font-family": `'${displayFont()}', sans-serif`,
                        "font-weight": "700", color: textColor(),
                        "letter-spacing": "-0.3px",
                      }}>{brandName()}</span>
                    </Show>
                  </div>
                </Show>

                {/* Start over — bottom-left */}
                <div style={{ position: "absolute", bottom: "20px", left: "24px", "z-index": "10" }}>
                  <button
                    onClick={() => {
                      localStorage.removeItem(storageKey);
                      setAnswers({});
                      setError(null);
                      const firstNonWelcome = allFields().findIndex((f) => f.type !== "welcome_screen");
                      transition("down", () => {
                        setCurrentIdx(firstNonWelcome > 0 ? firstNonWelcome : 0);
                      });
                    }}
                    style={{
                      background: "transparent", border: "none",
                      "font-size": "11px", color: `rgba(${textRgb()},0.2)`,
                      cursor: "pointer", "font-family": `'${bodyFont()}', monospace`,
                      "letter-spacing": "0.3px", transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = `rgba(${textRgb()},0.45)`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = `rgba(${textRgb()},0.2)`; }}
                  >
                    ↺ restart
                  </button>
                </div>

                {/* FormCraft badge bottom-right */}
                <div style={{
                  position: "absolute", bottom: "20px", right: "24px", "z-index": "10",
                }}>
                  <a
                    href="https://formcraft.so"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", "align-items": "center", gap: "5px",
                      "font-size": "11px", "font-family": `'${bodyFont()}', monospace`,
                      color: `rgba(${textRgb()},0.25)`, "text-decoration": "none",
                      "letter-spacing": "0.3px",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = `rgba(${textRgb()},0.5)`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = `rgba(${textRgb()},0.25)`; }}
                  >
                    Made with <strong style={{ "font-weight": 600 }}>FormCraft</strong> ✦
                  </a>
                </div>

                {/* Nav arrows */}
                <div style={{
                  position: "absolute", top: "20px", right: "24px",
                  display: "flex", "align-items": "center", gap: "8px", "z-index": "10",
                }}>
                  <button
                    onClick={goPrev}
                    disabled={currentIdx() === 0}
                    style={{
                      background: "transparent",
                      border: `1px solid rgba(${textRgb()},0.1)`,
                      color: currentIdx() === 0 ? `rgba(${textRgb()},0.1)` : `rgba(${textRgb()},0.4)`,
                      width: "32px", height: "32px",
                      cursor: currentIdx() === 0 ? "default" : "pointer",
                      "font-size": "14px", display: "flex",
                      "align-items": "center", "justify-content": "center",
                    }}
                  >↑</button>
                  <button
                    onClick={goNext}
                    style={{
                      background: "transparent",
                      border: `1px solid rgba(${textRgb()},0.1)`,
                      color: `rgba(${textRgb()},0.4)`,
                      width: "32px", height: "32px", cursor: "pointer",
                      "font-size": "14px", display: "flex",
                      "align-items": "center", "justify-content": "center",
                    }}
                  >↓</button>
                </div>

                {/* Content */}
                <div style={{
                  flex: "1", display: "flex", "align-items": "center",
                  "justify-content": "center", padding: "80px 24px",
                }}>
                  <div style={contentStyle()}>
                    {/* Question number */}
                    <Show when={showNumbers() && !isStatement() && questionNumber() > 0}>
                      <div style={{ display: "flex", "align-items": "center", gap: "8px", "margin-bottom": "20px" }}>
                        <span style={{ "font-size": "13px", "font-weight": "500", color: primaryColor(), "font-family": `'${bodyFont()}', monospace` }}>
                          {questionNumber()}
                        </span>
                        <span style={{ "font-size": "13px", color: `rgba(${textRgb()},0.3)` }}>→</span>
                        <Show when={field().required}>
                          <span style={{ "font-size": "10px", color: "rgba(255,100,100,0.6)", "letter-spacing": "1.5px", "text-transform": "uppercase" }}>
                            *required
                          </span>
                        </Show>
                      </div>
                    </Show>

                    {/* Title */}
                    <h2 style={{
                      "font-family": `'${displayFont()}', sans-serif`,
                      "font-size": "clamp(22px, 3.5vw, 34px)",
                      "font-weight": "700", "letter-spacing": "-0.5px",
                      color: textColor(), "margin-bottom": "10px", "line-height": "1.2",
                    }}>
                      {title() || <span style={{ opacity: "0.3" }}>Untitled question</span>}
                    </h2>

                    {/* Description */}
                    <Show when={description()}>
                      <p style={{ "font-size": "14px", color: textMuted(), "line-height": "1.7", "margin-bottom": "28px" }}>
                        {description()}
                      </p>
                    </Show>

                    {/* Input */}
                    <Show when={!isStatement()}>
                      <div style={{ "margin-bottom": "24px" }}>
                        <FieldInput
                          field={field()}
                          value={answers()[field().id]}
                          onChange={(val) => setAnswer(field().id, val)}
                          primaryColor={primaryColor()}
                          bodyFont={bodyFont()}
                          buttonRadius={buttonRadius()}
                          bgColor={bgColor()}
                          textColor={textColor()}
                          textRgb={textRgb()}
                          onEnter={goNext}
                        />
                      </div>
                    </Show>

                    {/* Error */}
                    <Show when={error()}>
                      <div style={{ "font-size": "12px", color: "#FF6B6B", "margin-bottom": "16px", display: "flex", "align-items": "center", gap: "6px" }}>
                        <span>!</span> {error()}
                      </div>
                    </Show>

                    {/* OK button */}
                    <div style={{ display: "flex", "align-items": "center", gap: "12px" }}>
                      <button
                        onClick={goNext}
                        disabled={submitting()}
                        style={{
                          background: primaryColor(), color: bgColor(),
                          border: "none", "font-family": `'${displayFont()}', sans-serif`,
                          "font-size": "13px", "font-weight": "700",
                          padding: "12px 24px", cursor: "pointer",
                          "letter-spacing": "0.5px", "border-radius": buttonRadius(),
                          opacity: submitting() ? "0.6" : "1",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {submitting() ? "Submitting..." : isLastField() ? "Submit" : isStatement() ? "Continue" : "OK"}
                      </button>
                      <Show when={!isStatement() && !isLastField()}>
                        <span style={{ "font-size": "11px", color: `rgba(${textRgb()},0.2)`, "letter-spacing": "0.5px" }}>
                          press Enter ↵
                        </span>
                      </Show>
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        </Show>
      }>
        {/* Done screen */}
        <div style={wrapStyle()}>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(displayFont())}:wght@400;700;800&family=${encodeURIComponent(bodyFont())}:wght@300;400;500&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
          <BrandHeader brandName={brandName()} brandLogo={brandLogo()} displayFont={displayFont()} textColor={textColor()} />
          <FormCraftBadge bodyFont={bodyFont()} textRgb={textRgb()} />
          <div style={{
            flex: "1", display: "flex", "align-items": "center", "justify-content": "center",
            padding: "80px 24px", "flex-direction": "column", gap: "24px", "text-align": "center",
          }}>
            <div style={{
              opacity: visible() ? "1" : "0",
              transform: visible() ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.4s ease",
            }}>
              <div style={{ "font-size": "48px", "margin-bottom": "24px", color: primaryColor() }}>✓</div>
              <h1 style={{
                "font-family": `'${displayFont()}', sans-serif`,
                "font-size": "clamp(28px, 4vw, 44px)",
                "font-weight": "800", "letter-spacing": "-1px",
                color: textColor(), "margin-bottom": "12px",
              }}>
                All done!
              </h1>
              <p style={{ "font-size": "14px", color: textMuted(), "line-height": "1.7" }}>
                Your response has been recorded. Thank you.
              </p>
            </div>
          </div>
        </div>
      </Show>
    }>
      {/* Welcome screen */}
      <div style={wrapStyle()}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(displayFont())}:wght@400;700;800&family=${encodeURIComponent(bodyFont())}:wght@300;400;500&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        <BrandHeader brandName={brandName()} brandLogo={brandLogo()} displayFont={displayFont()} textColor={textColor()} />
        <FormCraftBadge bodyFont={bodyFont()} textRgb={textRgb()} />
        <div style={{
          flex: "1", display: "flex", "align-items": "center", "justify-content": "center",
          padding: "80px 24px", "flex-direction": "column", gap: "40px",
        }}>
          <div style={{
            opacity: visible() ? "1" : "0",
            transform: visible() ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.4s ease", "text-align": "center",
          }}>
            <div style={{
              "font-size": "12px", "letter-spacing": "3px", "text-transform": "uppercase",
              color: primaryColor(), "margin-bottom": "20px", "font-family": `'${bodyFont()}', monospace`,
            }}>
              {props.form.title}
            </div>
            <h1 style={{
              "font-family": `'${displayFont()}', sans-serif`,
              "font-size": "clamp(32px, 5vw, 56px)",
              "font-weight": "800", "letter-spacing": "-1.5px",
              color: textColor(), "margin-bottom": "16px", "line-height": "1.1",
            }}>
              {welcomeField()?.title || props.form.title}
            </h1>
            <Show when={welcomeField()?.description}>
              <p style={{ "font-size": "15px", color: textMuted(), "line-height": "1.7", "max-width": "480px", margin: "0 auto" }}>
                {welcomeField()!.description}
              </p>
            </Show>
          </div>

          <button
            onClick={() => {
              const firstNonWelcome = allFields().findIndex((f) => f.type !== "welcome_screen");
              const startIdx = firstNonWelcome > 0 ? firstNonWelcome : 0;
              transition("up", () => {
                setCurrentIdx(startIdx);
                setPhase("form");
                saveDraft("form", startIdx, answers(), startedAt());
              });
            }}
            style={{
              background: primaryColor(), color: bgColor(),
              border: "none", "font-family": `'${displayFont()}', sans-serif`,
              "font-size": "14px", "font-weight": "700",
              padding: "16px 48px", cursor: "pointer",
              "letter-spacing": "0.5px", transition: "transform 0.15s ease",
              "border-radius": buttonRadius(),
            }}
          >
            Start →
          </button>

          <div style={{ display: "flex", "flex-direction": "column", "align-items": "center", gap: "12px" }}>
            <div style={{ "font-size": "11px", color: `rgba(${textRgb()},0.2)` }}>
              {totalQuestions()} question{totalQuestions() !== 1 ? "s" : ""}
            </div>
            <Show when={!!loadDraft()}>
              <button
                onClick={() => {
                  localStorage.removeItem(storageKey);
                  setAnswers({});
                  setCurrentIdx(0);
                }}
                style={{
                  background: "transparent", border: "none",
                  "font-size": "11px", color: `rgba(${textRgb()},0.25)`,
                  cursor: "pointer", "text-decoration": "underline",
                  "font-family": `'${bodyFont()}', monospace`,
                  "letter-spacing": "0.3px",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = `rgba(${textRgb()},0.5)`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = `rgba(${textRgb()},0.25)`; }}
              >
                start over
              </button>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
}

// ── Field input components ────────────────────────────────────────────────────

function FieldInput(props: {
  field: Field;
  value: unknown;
  onChange: (val: unknown) => void;
  primaryColor: string;
  bodyFont: string;
  buttonRadius: string;
  bgColor: string;
  textColor: string;
  textRgb: string;
  onEnter: () => void;
}) {
  const baseInput = {
    background: "transparent",
    border: "none",
    "border-bottom": `2px solid rgba(${props.textRgb},0.15)`,
    color: props.textColor,
    "font-family": `'${props.bodyFont}', monospace`,
    "font-size": "clamp(16px, 2.5vw, 22px)",
    "font-weight": "300",
    padding: "10px 0",
    width: "100%",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const f = () => props.field;
  const t = () => f().type;

  return (
    <Show when={t() === "short_text" || t() === "email" || t() === "url" || t() === "phone"} fallback={
      <Show when={t() === "number"} fallback={
        <Show when={t() === "long_text"} fallback={
          <Show when={t() === "date"} fallback={
            <Show when={t() === "yes_no"} fallback={
              <Show when={t() === "rating"} fallback={
                <Show when={t() === "opinion_scale"} fallback={
                  <Show when={t() === "multiple_choice" || t() === "dropdown"} fallback={
                    <Show when={t() === "file_upload"} fallback={null}>
                      {/* File upload */}
                      <div style={{
                        border: `2px dashed rgba(${props.textRgb},0.1)`,
                        padding: "48px", "text-align": "center",
                        color: `rgba(${props.textRgb},0.3)`,
                        "font-size": "14px", cursor: "pointer",
                      }}>
                        ↑ Click or drag a file here
                      </div>
                    </Show>
                  }>
                    {/* Multiple choice / dropdown */}
                    <MultipleChoiceInput field={f()} value={props.value} onChange={props.onChange} primaryColor={props.primaryColor} bodyFont={props.bodyFont} textColor={props.textColor} textRgb={props.textRgb} onEnter={props.onEnter} />
                  </Show>
                }>
                  {/* Opinion scale */}
                  <OpinionScaleInput field={f()} value={props.value} onChange={props.onChange} primaryColor={props.primaryColor} bodyFont={props.bodyFont} bgColor={props.bgColor} textRgb={props.textRgb} />
                </Show>
              }>
                {/* Rating */}
                <RatingInput field={f()} value={props.value} onChange={props.onChange} primaryColor={props.primaryColor} />
              </Show>
            }>
              {/* Yes/No */}
              <div style={{ display: "flex", gap: "12px", "margin-top": "8px" }}>
                <For each={["Yes", "No"]}>
                  {(opt) => {
                    const selected = () => props.value === opt;
                    return (
                      <button
                        onClick={() => { props.onChange(opt); setTimeout(props.onEnter, 300); }}
                        style={{
                          padding: "14px 40px",
                          background: selected() ? props.primaryColor : "transparent",
                          border: `1px solid ${selected() ? props.primaryColor : `rgba(${props.textRgb},0.15)`}`,
                          color: selected() ? props.bgColor : props.textColor,
                          "font-family": `'${props.bodyFont}', sans-serif`,
                          "font-size": "15px", "font-weight": "700",
                          cursor: "pointer", transition: "all 0.15s",
                          "letter-spacing": "0.5px", "border-radius": props.buttonRadius,
                        }}
                      >
                        {opt}
                      </button>
                    );
                  }}
                </For>
              </div>
            </Show>
          }>
            {/* Date */}
            <input
              type="date"
              value={(props.value as string) ?? ""}
              onInput={(e) => props.onChange(e.currentTarget.value)}
              style={{ ...baseInput, "color-scheme": "dark" }}
            />
          </Show>
        }>
          {/* Long text */}
          <textarea
            value={(props.value as string) ?? ""}
            onInput={(e) => props.onChange(e.currentTarget.value)}
            placeholder="Type your answer..."
            rows={4}
            style={{
              ...baseInput,
              "border-bottom": "none",
              border: `1px solid rgba(${props.textRgb},0.1)`,
              padding: "14px",
              resize: "none",
              "line-height": "1.7",
            }}
          />
        </Show>
      }>
        {/* Number */}
        <input
          type="number"
          value={(props.value as string) ?? ""}
          onInput={(e) => props.onChange(e.currentTarget.value)}
          placeholder="0"
          style={baseInput}
        />
      </Show>
    }>
      {/* Short text / email / url / phone */}
      <input
        type={t() === "email" ? "email" : t() === "url" ? "url" : "text"}
        value={(props.value as string) ?? ""}
        onInput={(e) => props.onChange(e.currentTarget.value)}
        placeholder={
          t() === "email" ? "name@example.com" :
          t() === "url" ? "https://" :
          t() === "phone" ? "+1 (555) 000-0000" :
          "Type your answer..."
        }
        style={baseInput}
      />
    </Show>
  );
}

function RatingInput(props: { field: Field; value: unknown; onChange: (v: unknown) => void; primaryColor: string }) {
  const steps = () => (props.field.config.steps as number) ?? 5;
  const current = () => props.value as number;

  return (
    <div style={{ display: "flex", gap: "8px", "margin-top": "8px" }}>
      <For each={Array.from({ length: steps() }, (_, i) => i + 1)}>
        {(val) => {
          const filled = () => current() >= val;
          return (
            <button
              onClick={() => props.onChange(val)}
              style={{
                width: "44px", height: "44px", border: "none",
                background: "transparent",
                color: filled() ? props.primaryColor : "rgba(240,237,232,0.2)",
                "font-size": "24px", cursor: "pointer",
                transition: "color 0.12s, transform 0.12s",
                transform: filled() ? "scale(1.1)" : "scale(1)",
              }}
            >★</button>
          );
        }}
      </For>
    </div>
  );
}

function OpinionScaleInput(props: { field: Field; value: unknown; onChange: (v: unknown) => void; primaryColor: string; bodyFont: string; bgColor: string; textRgb: string }) {
  const steps = () => (props.field.config.steps as number) ?? 10;
  const current = () => props.value as number;

  return (
    <div style={{ display: "flex", gap: "6px", "margin-top": "8px", "flex-wrap": "wrap" }}>
      <For each={Array.from({ length: steps() }, (_, i) => i + 1)}>
        {(val) => {
          const selected = () => current() === val;
          return (
            <button
              onClick={() => props.onChange(val)}
              style={{
                width: "44px", height: "44px",
                background: selected() ? props.primaryColor : "transparent",
                border: `1px solid ${selected() ? props.primaryColor : `rgba(${props.textRgb},0.15)`}`,
                color: selected() ? props.bgColor : `rgba(${props.textRgb},0.6)`,
                "font-family": `'${props.bodyFont}', monospace`,
                "font-size": "14px", cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {val}
            </button>
          );
        }}
      </For>
    </div>
  );
}

function MultipleChoiceInput(props: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  primaryColor: string;
  bodyFont: string;
  textColor: string;
  textRgb: string;
  onEnter: () => void;
}) {
  const choices = () => (props.field.config.choices as { id: string; label: string }[]) ?? [];
  const allowMultiple = () => props.field.config.allow_multiple as boolean;
  const selected = () => (props.value as string[]) ?? [];

  const toggle = (label: string) => {
    if (allowMultiple()) {
      const next = selected().includes(label)
        ? selected().filter((s) => s !== label)
        : [...selected(), label];
      props.onChange(next);
    } else {
      props.onChange([label]);
      setTimeout(props.onEnter, 300);
    }
  };

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "8px", "margin-top": "8px" }}>
      <For each={choices()}>
        {(choice) => {
          const isSelected = () => selected().includes(choice.label);
          return (
            <button
              onClick={() => toggle(choice.label)}
              style={{
                display: "flex", "align-items": "center", gap: "14px",
                padding: "14px 18px", "text-align": "left",
                background: isSelected() ? `${props.primaryColor}12` : "transparent",
                border: `1px solid ${isSelected() ? props.primaryColor : `rgba(${props.textRgb},0.1)`}`,
                color: props.textColor, cursor: "pointer",
                "font-family": `'${props.bodyFont}', monospace`,
                "font-size": "14px", "font-weight": "300",
                transition: "all 0.12s",
              }}
            >
              <div style={{
                width: "16px", height: "16px", "flex-shrink": "0",
                border: `1px solid ${isSelected() ? props.primaryColor : `rgba(${props.textRgb},0.2)`}`,
                "border-radius": !allowMultiple() ? "50%" : "0",
                background: isSelected() ? props.primaryColor : "transparent",
                display: "flex", "align-items": "center", "justify-content": "center",
              }}>
                <Show when={isSelected()}>
                  <div style={{
                    width: "6px", height: "6px",
                    background: "#080808",
                    "border-radius": !allowMultiple() ? "50%" : "0",
                  }} />
                </Show>
              </div>
              {choice.label}
            </button>
          );
        }}
      </For>
    </div>
  );
}

function BrandHeader(props: { brandName: string; brandLogo: string; displayFont: string; textColor: string }) {
  if (!props.brandName && !props.brandLogo) return null;
  return (
    <div style={{
      position: "absolute", top: "20px", left: "24px",
      display: "flex", "align-items": "center", gap: "8px", "z-index": "10",
    }}>
      {props.brandLogo && (
        <img src={props.brandLogo} alt="" style={{ height: "22px", width: "auto", "object-fit": "contain" }} />
      )}
      {props.brandName && (
        <span style={{
          "font-size": "13px", "font-family": `'${props.displayFont}', sans-serif`,
          "font-weight": "700", color: props.textColor, "letter-spacing": "-0.3px",
        }}>
          {props.brandName}
        </span>
      )}
    </div>
  );
}

function FormCraftBadge(props: { bodyFont: string; textRgb: string }) {
  return (
    <div style={{ position: "absolute", bottom: "20px", right: "24px", "z-index": "10" }}>
      <a
        href="https://formcraft.so"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex", "align-items": "center", gap: "4px",
          "font-size": "11px", "font-family": `'${props.bodyFont}', monospace`,
          color: `rgba(${props.textRgb},0.25)`, "text-decoration": "none",
          "letter-spacing": "0.3px", transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = `rgba(${props.textRgb},0.5)`; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = `rgba(${props.textRgb},0.25)`; }}
      >
        Made with <strong style={{ "font-weight": 600 }}>FormCraft</strong> ✦
      </a>
    </div>
  );
}
