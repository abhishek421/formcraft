"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { submitResponse } from "../actions";

type Field = {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  position: number;
  variable?: string;
  config: Record<string, unknown>;
  logic?: unknown[];
};

type Form = {
  id: string;
  title: string;
  settings: Record<string, unknown>;
  theme: Record<string, unknown>;
};

type Phase = "welcome" | "form" | "done";
type Answers = Record<string, unknown>;

// ── Logic evaluation ──────────────────────────────────────────────────────────

type LogicJump = {
  id: string;
  operator: string;
  value: string;
  destination_field_id: string | null;
};

function evaluateLogic(field: Field, answers: Answers): string | null | undefined {
  const rules = (field.logic ?? []) as LogicJump[];
  if (!rules.length) return undefined; // no logic = undefined means go to next

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
      case "is_filled":    match = answer !== undefined && answer !== null && answer !== ""; break;
      case "is_empty":     match = !answer; break;
    }
    if (match) return rule.destination_field_id; // null = end of form
  }
  return undefined; // no rule matched = go to next
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

// ── Main renderer ─────────────────────────────────────────────────────────────

export function FormRenderer({ form, fields }: { form: Form; fields: Field[] }) {
  const questionFields = fields.filter(
    (f) => f.type !== "welcome_screen" && f.type !== "statement"
  );
  const allFields = fields; // includes welcome + statement

  const primaryColor = (form.theme?.primary_color as string) ?? "#CAFF00";
  const bgColor = (form.theme?.background_color as string) ?? "#080808";
  const showProgress = form.settings?.show_progress_bar !== false;
  const showNumbers = form.settings?.show_question_number !== false;

  const [phase, setPhase] = useState<Phase>(
    fields[0]?.type === "welcome_screen" ? "welcome" : "form"
  );
  const [currentIdx, setCurrentIdx] = useState(
    fields[0]?.type === "welcome_screen" ? 0 : 0
  );
  const [answers, setAnswers] = useState<Answers>({});
  const [animDir, setAnimDir] = useState<"up" | "down">("up");
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const currentField = allFields[currentIdx];
  const questionNumber =
    questionFields.findIndex((f) => f.id === currentField?.id) + 1;
  const totalQuestions = questionFields.length;
  const progress =
    totalQuestions > 0 ? (Math.max(0, questionNumber - 1) / totalQuestions) * 100 : 0;

  // Focus input on field change
  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentIdx, visible]);

  const transition = useCallback(
    (dir: "up" | "down", fn: () => void) => {
      setAnimDir(dir);
      setVisible(false);
      setTimeout(() => {
        fn();
        setVisible(true);
      }, 250);
    },
    []
  );

  const goNext = useCallback(() => {
    const field = allFields[currentIdx];
    if (!field) return;

    // Validate required
    if (
      field.required &&
      field.type !== "statement" &&
      field.type !== "welcome_screen"
    ) {
      const val = answers[field.id];
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

    // Evaluate logic rules
    const destination = evaluateLogic(field, answers);

    if (destination === null) {
      // Rule says end of form
      handleSubmit();
      return;
    }

    if (destination !== undefined) {
      // Rule says jump to specific field
      const destIdx = allFields.findIndex((f) => f.id === destination);
      if (destIdx !== -1) {
        transition("up", () => setCurrentIdx(destIdx));
        return;
      }
    }

    // Default: go to next
    if (currentIdx < allFields.length - 1) {
      transition("up", () => setCurrentIdx((i) => i + 1));
    } else {
      handleSubmit();
    }
  }, [allFields, currentIdx, answers, transition]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      transition("down", () => setCurrentIdx((i) => i - 1));
      setError(null);
    }
  }, [currentIdx, transition]);

  // Keyboard: Enter = next, Shift+Enter = newline for textarea
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== "form") return;
      const field = allFields[currentIdx];
      if (!field) return;
      if (e.key === "Enter" && !e.shiftKey && field.type !== "long_text") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, currentIdx, allFields, goNext]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([field_id, value]) => ({
        field_id,
        value,
      }));
      await submitResponse(form.id, payload);
      transition("up", () => setPhase("done"));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const setAnswer = (fieldId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setError(null);
  };

  const isLastField = currentIdx === allFields.length - 1;

  // ── Styles ──────────────────────────────────────────────────────────────────

  const s = {
    wrap: {
      minHeight: "100vh",
      background: bgColor,
      color: "#F0EDE8",
      fontFamily: "'DM Mono', monospace",
      display: "flex",
      flexDirection: "column" as const,
      position: "relative" as const,
      overflow: "hidden",
    } as React.CSSProperties,
    progress: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      height: "3px",
      width: `${progress}%`,
      background: primaryColor,
      transition: "width 0.4s ease",
      zIndex: 10,
    },
    nav: {
      position: "absolute" as const,
      top: "20px",
      right: "24px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      zIndex: 10,
    },
    center: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 24px",
    },
    content: {
      width: "100%",
      maxWidth: "640px",
      opacity: visible ? 1 : 0,
      transform: visible
        ? "translateY(0px)"
        : animDir === "up"
        ? "translateY(40px)"
        : "translateY(-40px)",
      transition: "opacity 0.25s ease, transform 0.25s ease",
    },
  };

  // ── Welcome screen ───────────────────────────────────────────────────────────

  if (phase === "welcome") {
    const welcomeField = fields.find((f) => f.type === "welcome_screen");
    return (
      <div style={s.wrap}>
        <div style={{ ...s.center, flexDirection: "column" as const, gap: "40px" }}>
          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.4s ease",
            textAlign: "center",
          }}>
            <div style={{
              fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase",
              color: primaryColor, marginBottom: "20px",
              fontFamily: "'DM Mono', monospace",
            }}>
              {form.title}
            </div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 800, letterSpacing: "-1.5px",
              color: "#F0EDE8", marginBottom: "16px", lineHeight: 1.1,
            }}>
              {welcomeField?.title || form.title}
            </h1>
            {welcomeField?.description && (
              <p style={{
                fontSize: "15px", color: "rgba(240,237,232,0.5)",
                lineHeight: 1.7, maxWidth: "480px", margin: "0 auto",
              }}>
                {welcomeField.description}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              const firstNonWelcome = allFields.findIndex((f) => f.type !== "welcome_screen");
              transition("up", () => {
                setCurrentIdx(firstNonWelcome > 0 ? firstNonWelcome : 0);
                setPhase("form");
              });
            }}
            style={{
              background: primaryColor, color: "#080808",
              border: "none", fontFamily: "'Syne', sans-serif",
              fontSize: "14px", fontWeight: 700,
              padding: "16px 48px", cursor: "pointer",
              letterSpacing: "0.5px",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
          >
            Start →
          </button>

          <div style={{ fontSize: "11px", color: "rgba(240,237,232,0.2)" }}>
            {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    );
  }

  // ── Done screen ──────────────────────────────────────────────────────────────

  if (phase === "done") {
    return (
      <div style={s.wrap}>
        <div style={{ ...s.center, flexDirection: "column" as const, gap: "24px", textAlign: "center" }}>
          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.4s ease",
          }}>
            <div style={{
              fontSize: "48px", marginBottom: "24px",
              filter: "grayscale(0)",
            }}>✓</div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800, letterSpacing: "-1px",
              color: "#F0EDE8", marginBottom: "12px",
            }}>
              All done!
            </h1>
            <p style={{
              fontSize: "14px", color: "rgba(240,237,232,0.4)",
              lineHeight: 1.7,
            }}>
              Your response has been recorded. Thank you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────

  if (!currentField) return null;

  const title = interpolate(currentField.title || "", allFields, answers);
  const description = currentField.description
    ? interpolate(currentField.description, allFields, answers)
    : undefined;
  const isStatement = currentField.type === "statement";

  return (
    <div style={s.wrap}>
      {/* Progress bar */}
      {showProgress && !isStatement && <div style={s.progress} />}

      {/* Nav arrows */}
      <div style={s.nav}>
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          style={{
            background: "transparent",
            border: "1px solid rgba(240,237,232,0.1)",
            color: currentIdx === 0 ? "rgba(240,237,232,0.1)" : "rgba(240,237,232,0.4)",
            width: "32px", height: "32px", cursor: currentIdx === 0 ? "default" : "pointer",
            fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >↑</button>
        <button
          onClick={goNext}
          style={{
            background: "transparent",
            border: "1px solid rgba(240,237,232,0.1)",
            color: "rgba(240,237,232,0.4)",
            width: "32px", height: "32px", cursor: "pointer",
            fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >↓</button>
      </div>

      {/* Branding */}
      <div style={{
        position: "absolute", top: "20px", left: "24px",
        fontSize: "13px", fontFamily: "'Syne', sans-serif",
        fontWeight: 700, color: "rgba(240,237,232,0.2)",
        letterSpacing: "-0.3px", zIndex: 10,
      }}>
        FormCraft
      </div>

      {/* Content */}
      <div style={s.center}>
        <div style={s.content}>
          {/* Question number */}
          {showNumbers && !isStatement && questionNumber > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              marginBottom: "20px",
            }}>
              <span style={{
                fontSize: "13px", fontWeight: 500, color: primaryColor,
                fontFamily: "'DM Mono', monospace",
              }}>
                {questionNumber}
              </span>
              <span style={{ fontSize: "13px", color: "rgba(240,237,232,0.3)" }}>→</span>
              {currentField.required && (
                <span style={{
                  fontSize: "10px", color: "rgba(255,100,100,0.6)",
                  letterSpacing: "1.5px", textTransform: "uppercase",
                }}>
                  *required
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(22px, 3.5vw, 34px)",
            fontWeight: 700, letterSpacing: "-0.5px",
            color: "#F0EDE8", marginBottom: "10px", lineHeight: 1.2,
          }}>
            {title || <span style={{ opacity: 0.3 }}>Untitled question</span>}
          </h2>

          {/* Description */}
          {description && (
            <p style={{
              fontSize: "14px", color: "rgba(240,237,232,0.45)",
              lineHeight: 1.7, marginBottom: "28px",
            }}>
              {description}
            </p>
          )}

          {/* Input */}
          {!isStatement && (
            <div style={{ marginBottom: "24px" }}>
              <FieldInput
                field={currentField}
                value={answers[currentField.id]}
                onChange={(val) => setAnswer(currentField.id, val)}
                primaryColor={primaryColor}
                inputRef={inputRef}
                onEnter={goNext}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              fontSize: "12px", color: "#FF6B6B",
              marginBottom: "16px",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <span>!</span> {error}
            </div>
          )}

          {/* OK button */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={goNext}
              disabled={submitting}
              style={{
                background: primaryColor, color: "#080808",
                border: "none", fontFamily: "'Syne', sans-serif",
                fontSize: "13px", fontWeight: 700,
                padding: "12px 24px", cursor: "pointer",
                letterSpacing: "0.5px",
                opacity: submitting ? 0.6 : 1,
                transition: "all 0.15s ease",
              }}
            >
              {submitting ? "Submitting..." : isLastField ? "Submit" : isStatement ? "Continue" : "OK"}
            </button>

            {!isStatement && !isLastField && (
              <span style={{
                fontSize: "11px", color: "rgba(240,237,232,0.2)",
                letterSpacing: "0.5px",
              }}>
                press Enter ↵
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Field input components ────────────────────────────────────────────────────

function FieldInput({
  field,
  value,
  onChange,
  primaryColor,
  inputRef,
  onEnter,
}: {
  field: Field;
  value: unknown;
  onChange: (val: unknown) => void;
  primaryColor: string;
  inputRef: React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  onEnter: () => void;
}) {
  const baseInput: React.CSSProperties = {
    background: "transparent",
    border: "none",
    borderBottom: "2px solid rgba(240,237,232,0.15)",
    color: "#F0EDE8",
    fontFamily: "'DM Mono', monospace",
    fontSize: "clamp(16px, 2.5vw, 22px)",
    fontWeight: 300,
    padding: "10px 0",
    width: "100%",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const focusStyle = `
    input:focus, textarea:focus { border-bottom-color: ${primaryColor} !important; }
  `;

  if (
    field.type === "short_text" ||
    field.type === "email" ||
    field.type === "url" ||
    field.type === "phone"
  ) {
    return (
      <>
        <style>{focusStyle}</style>
        <input
          ref={inputRef as React.MutableRefObject<HTMLInputElement>}
          type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            field.type === "email" ? "name@example.com" :
            field.type === "url" ? "https://" :
            field.type === "phone" ? "+1 (555) 000-0000" :
            "Type your answer..."
          }
          style={baseInput}
        />
      </>
    );
  }

  if (field.type === "number") {
    return (
      <>
        <style>{focusStyle}</style>
        <input
          ref={inputRef as React.MutableRefObject<HTMLInputElement>}
          type="number"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          style={baseInput}
        />
      </>
    );
  }

  if (field.type === "long_text") {
    return (
      <>
        <style>{focusStyle}</style>
        <textarea
          ref={inputRef as React.MutableRefObject<HTMLTextAreaElement>}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer..."
          rows={4}
          style={{
            ...baseInput,
            borderBottom: "none",
            border: "1px solid rgba(240,237,232,0.1)",
            padding: "14px",
            resize: "none" as const,
            lineHeight: 1.7,
          }}
        />
      </>
    );
  }

  if (field.type === "date") {
    return (
      <>
        <style>{focusStyle}</style>
        <input
          ref={inputRef as React.MutableRefObject<HTMLInputElement>}
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...baseInput, colorScheme: "dark" }}
        />
      </>
    );
  }

  if (field.type === "yes_no") {
    return (
      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        {["Yes", "No"].map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              onClick={() => { onChange(opt); setTimeout(onEnter, 300); }}
              style={{
                padding: "14px 40px",
                background: selected ? primaryColor : "transparent",
                border: `1px solid ${selected ? primaryColor : "rgba(240,237,232,0.15)"}`,
                color: selected ? "#080808" : "#F0EDE8",
                fontFamily: "'Syne', sans-serif",
                fontSize: "15px", fontWeight: 700,
                cursor: "pointer", transition: "all 0.15s",
                letterSpacing: "0.5px",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.type === "rating") {
    const steps = (field.config.steps as number) ?? 5;
    const current = value as number;
    return (
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        {Array.from({ length: steps }, (_, i) => {
          const val = i + 1;
          const filled = current >= val;
          return (
            <button
              key={i}
              onClick={() => onChange(val)}
              style={{
                width: "44px", height: "44px", border: "none",
                background: "transparent",
                color: filled ? primaryColor : "rgba(240,237,232,0.2)",
                fontSize: "24px", cursor: "pointer",
                transition: "color 0.12s, transform 0.12s",
                transform: filled ? "scale(1.1)" : "scale(1)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = primaryColor; }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = filled ? primaryColor : "rgba(240,237,232,0.2)";
              }}
            >★</button>
          );
        })}
      </div>
    );
  }

  if (field.type === "opinion_scale") {
    const steps = (field.config.steps as number) ?? 10;
    const current = value as number;
    return (
      <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" as const }}>
        {Array.from({ length: steps }, (_, i) => {
          const val = i + 1;
          const selected = current === val;
          return (
            <button
              key={i}
              onClick={() => onChange(val)}
              style={{
                width: "44px", height: "44px",
                background: selected ? primaryColor : "transparent",
                border: `1px solid ${selected ? primaryColor : "rgba(240,237,232,0.15)"}`,
                color: selected ? "#080808" : "rgba(240,237,232,0.6)",
                fontFamily: "'DM Mono', monospace",
                fontSize: "14px", cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {val}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.type === "multiple_choice" || field.type === "dropdown") {
    const choices = (field.config.choices as { id: string; label: string }[]) ?? [];
    const allowMultiple = field.config.allow_multiple as boolean;
    const selected = (value as string[]) ?? [];

    const toggle = (label: string) => {
      if (allowMultiple) {
        const next = selected.includes(label)
          ? selected.filter((s) => s !== label)
          : [...selected, label];
        onChange(next);
      } else {
        onChange([label]);
        setTimeout(onEnter, 300);
      }
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
        {choices.map((choice) => {
          const isSelected = selected.includes(choice.label);
          return (
            <button
              key={choice.id}
              onClick={() => toggle(choice.label)}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 18px", textAlign: "left",
                background: isSelected ? `${primaryColor}12` : "transparent",
                border: `1px solid ${isSelected ? primaryColor : "rgba(240,237,232,0.1)"}`,
                color: "#F0EDE8", cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: "14px", fontWeight: 300,
                transition: "all 0.12s",
              }}
            >
              <div style={{
                width: "16px", height: "16px", flexShrink: 0,
                border: `1px solid ${isSelected ? primaryColor : "rgba(240,237,232,0.2)"}`,
                borderRadius: !allowMultiple ? "50%" : "0",
                background: isSelected ? primaryColor : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isSelected && (
                  <div style={{
                    width: "6px", height: "6px",
                    background: "#080808",
                    borderRadius: !allowMultiple ? "50%" : "0",
                  }} />
                )}
              </div>
              {choice.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (field.type === "file_upload") {
    return (
      <div style={{
        border: "2px dashed rgba(240,237,232,0.1)",
        padding: "48px", textAlign: "center",
        color: "rgba(240,237,232,0.3)",
        fontSize: "14px", cursor: "pointer",
        transition: "border-color 0.15s",
      }}>
        ↑ Click or drag a file here
      </div>
    );
  }

  return null;
}
