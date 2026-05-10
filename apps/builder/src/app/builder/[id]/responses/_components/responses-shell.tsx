"use client";

import { useState } from "react";
import Link from "next/link";

type Field = { id: string; type: string; title: string; variable?: string; position: number };
type Answer = { field_id: string; value: unknown };
type Response = { id: string; started_at: string; submitted_at: string | null; answers: Answer[] };
type Form = { id: string; title: string; published: boolean };

export function ResponsesShell({
  form,
  fields,
  responses,
}: {
  form: Form;
  fields: Field[];
  responses: Response[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    responses[0]?.id ?? null
  );

  const selectedResponse = responses.find((r) => r.id === selectedId) ?? null;
  const completionRate = responses.length;

  const answerMap = (response: Response) =>
    Object.fromEntries(response.answers.map((a) => [a.field_id, a.value]));

  function formatValue(value: unknown): string {
    if (value === null || value === undefined || value === "") return "—";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  function completionTime(r: Response) {
    if (!r.submitted_at) return null;
    const ms = new Date(r.submitted_at).getTime() - new Date(r.started_at).getTime();
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  }

  const questionFields = fields.filter(
    (f) => f.type !== "welcome_screen" && f.type !== "statement"
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        display: "flex", flexDirection: "column", height: "100vh",
        background: "#080808", color: "#F0EDE8",
        fontFamily: "'DM Mono', monospace",
      }}>

        {/* Top bar */}
        <div style={{
          height: "56px", display: "flex", alignItems: "center",
          borderBottom: "1px solid rgba(240,237,232,0.06)",
          padding: "0 20px", gap: "16px", flexShrink: 0,
          background: "#0A0A0A",
        }}>
          <Link href="/dashboard" style={{
            color: "rgba(240,237,232,0.3)", textDecoration: "none",
            fontSize: "12px", transition: "color 0.12s",
          }}>← Back</Link>

          <div style={{ width: "1px", height: "20px", background: "rgba(240,237,232,0.08)" }} />

          <span style={{
            fontFamily: "'Syne', sans-serif", fontSize: "15px",
            fontWeight: 700, color: "#F0EDE8", letterSpacing: "-0.3px",
          }}>
            {form.title}
          </span>

          {/* Tab switcher */}
          <div style={{ display: "flex", gap: "4px", marginLeft: "24px" }}>
            {["Builder", "Responses"].map((tab) => {
              const active = tab === "Responses";
              const href = tab === "Builder"
                ? `/builder/${form.id}`
                : `/builder/${form.id}/responses`;
              return (
                <Link key={tab} href={href} style={{
                  padding: "5px 14px", textDecoration: "none",
                  fontSize: "12px", letterSpacing: "0.5px",
                  background: active ? "rgba(240,237,232,0.07)" : "transparent",
                  border: `1px solid ${active ? "rgba(240,237,232,0.12)" : "transparent"}`,
                  color: active ? "#F0EDE8" : "rgba(240,237,232,0.35)",
                  transition: "all 0.12s",
                }}>
                  {tab}
                </Link>
              );
            })}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: "10px", alignItems: "center" }}>
            <a
              href={`/f/${form.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "7px 16px",
                border: "1px solid rgba(240,237,232,0.12)",
                color: "rgba(240,237,232,0.5)",
                fontSize: "11px", letterSpacing: "1px",
                textTransform: "uppercase", textDecoration: "none",
              }}
            >
              Preview ↗
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: "0",
          borderBottom: "1px solid rgba(240,237,232,0.06)",
          background: "#0D0D0D", flexShrink: 0,
        }}>
          {[
            { label: "Total Responses", value: completionRate },
            { label: "Questions", value: questionFields.length },
            {
              label: "Avg. Completion",
              value: responses.length > 0
                ? (() => {
                    const times = responses
                      .filter((r) => r.submitted_at)
                      .map((r) => new Date(r.submitted_at!).getTime() - new Date(r.started_at).getTime());
                    if (!times.length) return "—";
                    const avg = times.reduce((a, b) => a + b, 0) / times.length / 1000;
                    return avg < 60 ? `${Math.round(avg)}s` : `${Math.floor(avg / 60)}m ${Math.round(avg % 60)}s`;
                  })()
                : "—",
            },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              padding: "16px 32px",
              borderRight: "1px solid rgba(240,237,232,0.06)",
              borderRightWidth: i < 2 ? 1 : 0,
            }}>
              <div style={{
                fontFamily: "'Syne', sans-serif", fontSize: "24px",
                fontWeight: 800, letterSpacing: "-0.5px", color: "#F0EDE8",
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase",
                color: "rgba(240,237,232,0.25)", marginTop: "3px",
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Response list */}
          <div style={{
            width: "280px", flexShrink: 0,
            borderRight: "1px solid rgba(240,237,232,0.06)",
            overflowY: "auto", background: "#0D0D0D",
          }}>
            {responses.length === 0 ? (
              <div style={{
                padding: "48px 24px", textAlign: "center",
                fontSize: "12px", color: "rgba(240,237,232,0.2)",
                lineHeight: 1.7,
              }}>
                No responses yet.<br />
                <a href={`/f/${form.id}`} target="_blank" rel="noopener noreferrer"
                  style={{ color: "#CAFF00", opacity: 0.7, fontSize: "11px" }}>
                  Share the form ↗
                </a>
              </div>
            ) : (
              responses.map((r, i) => {
                const selected = r.id === selectedId;
                const map = answerMap(r);
                // Show first text answer as preview
                const preview = questionFields
                  .map((f) => formatValue(map[f.id]))
                  .find((v) => v !== "—") ?? "—";

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid rgba(240,237,232,0.04)",
                      cursor: "pointer",
                      background: selected ? "rgba(202,255,0,0.05)" : "transparent",
                      borderLeft: `2px solid ${selected ? "#CAFF00" : "transparent"}`,
                      transition: "all 0.12s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{
                        fontSize: "11px", fontWeight: 500,
                        color: selected ? "#CAFF00" : "rgba(240,237,232,0.4)",
                        letterSpacing: "0.5px",
                      }}>
                        #{responses.length - i}
                      </span>
                      <span style={{ fontSize: "10px", color: "rgba(240,237,232,0.2)" }}>
                        {timeAgo(r.submitted_at ?? r.started_at)}
                      </span>
                    </div>
                    <div style={{
                      fontSize: "12px", color: "rgba(240,237,232,0.55)",
                      fontWeight: 300, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {preview}
                    </div>
                    {completionTime(r) && (
                      <div style={{ fontSize: "10px", color: "rgba(240,237,232,0.15)", marginTop: "4px" }}>
                        ⏱ {completionTime(r)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Response detail */}
          <div style={{ flex: 1, overflowY: "auto", padding: "36px 48px" }}>
            {!selectedResponse ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100%", color: "rgba(240,237,232,0.15)", fontSize: "13px",
              }}>
                Select a response to view
              </div>
            ) : (
              <div style={{ maxWidth: "640px" }}>
                {/* Header */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  marginBottom: "32px",
                }}>
                  <div>
                    <div style={{
                      fontFamily: "'Syne', sans-serif", fontSize: "20px",
                      fontWeight: 700, letterSpacing: "-0.3px", marginBottom: "6px",
                    }}>
                      Response #{responses.length - responses.findIndex((r) => r.id === selectedId)}
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(240,237,232,0.25)" }}>
                      Submitted {new Date(selectedResponse.submitted_at ?? selectedResponse.started_at).toLocaleString()}
                      {completionTime(selectedResponse) && ` · Took ${completionTime(selectedResponse)}`}
                    </div>
                  </div>
                </div>

                {/* Answers */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {questionFields.map((field, idx) => {
                    const map = answerMap(selectedResponse);
                    const val = formatValue(map[field.id]);
                    const empty = val === "—";

                    return (
                      <div key={field.id} style={{
                        padding: "20px 0",
                        borderBottom: "1px solid rgba(240,237,232,0.05)",
                        display: "flex", gap: "20px",
                      }}>
                        {/* Number */}
                        <div style={{
                          width: "24px", flexShrink: 0, paddingTop: "2px",
                          fontSize: "11px", color: "rgba(240,237,232,0.2)",
                          fontWeight: 500,
                        }}>
                          {idx + 1}
                        </div>

                        <div style={{ flex: 1 }}>
                          {/* Question */}
                          <div style={{
                            fontSize: "12px", color: "rgba(240,237,232,0.4)",
                            fontWeight: 300, marginBottom: "8px", lineHeight: 1.5,
                          }}>
                            {field.title || <em>Untitled question</em>}
                          </div>

                          {/* Answer */}
                          <div style={{
                            fontSize: "15px",
                            fontFamily: empty ? "'DM Mono', monospace" : "'Syne', sans-serif",
                            fontWeight: empty ? 300 : 600,
                            color: empty ? "rgba(240,237,232,0.15)" : "#F0EDE8",
                            letterSpacing: empty ? 0 : "-0.2px",
                          }}>
                            {val}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
