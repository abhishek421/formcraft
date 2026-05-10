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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedResponse = responses.find((r) => r.id === selectedId) ?? null;

  const questionFields = fields.filter(
    (f) => f.type !== "welcome_screen" && f.type !== "statement"
  );

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

  const avgCompletion = (() => {
    const times = responses
      .filter((r) => r.submitted_at)
      .map((r) => new Date(r.submitted_at!).getTime() - new Date(r.started_at).getTime());
    if (!times.length) return "—";
    const avg = times.reduce((a, b) => a + b, 0) / times.length / 1000;
    return avg < 60 ? `${Math.round(avg)}s` : `${Math.floor(avg / 60)}m ${Math.round(avg % 60)}s`;
  })();

  const rendererBase = process.env.NEXT_PUBLIC_RENDERER_URL ?? "http://localhost:3001";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .resp-row:hover { background: rgba(240,237,232,0.03) !important; cursor: pointer; }
        .resp-row:hover td { color: rgba(240,237,232,0.8) !important; }
        .detail-panel { transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); }
        .detail-panel.open { transform: translateX(0); }
      `}</style>

      <div style={{
        display: "flex", flexDirection: "column", height: "100vh",
        background: "#080808", color: "#F0EDE8",
        fontFamily: "'DM Mono', monospace", overflow: "hidden",
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

          <div style={{ display: "flex", gap: "4px", marginLeft: "24px" }}>
            {["Builder", "Responses"].map((tab) => {
              const active = tab === "Responses";
              const href = tab === "Builder" ? `/builder/${form.id}` : `/builder/${form.id}/responses`;
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

          <div style={{ marginLeft: "auto" }}>
            <a
              href={`${rendererBase}/f/${form.id}`}
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
          display: "flex",
          borderBottom: "1px solid rgba(240,237,232,0.06)",
          background: "#0D0D0D", flexShrink: 0,
        }}>
          {[
            { label: "Total Responses", value: responses.length },
            { label: "Questions", value: questionFields.length },
            { label: "Avg. Completion", value: avgCompletion },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              padding: "16px 32px",
              borderRight: i < 2 ? "1px solid rgba(240,237,232,0.06)" : "none",
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

        {/* Table area + detail panel */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>

          {/* Table */}
          <div style={{ height: "100%", overflowY: "auto", overflowX: "auto" }}>
            {responses.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: "100%", gap: "12px",
              }}>
                <div style={{ fontSize: "13px", color: "rgba(240,237,232,0.2)" }}>No responses yet.</div>
                <a
                  href={`${rendererBase}/f/${form.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "11px", color: "#CAFF00", opacity: 0.7, textDecoration: "none" }}
                >
                  Share the form ↗
                </a>
              </div>
            ) : (
              <table style={{
                width: "100%", borderCollapse: "collapse",
                fontSize: "12px", minWidth: "600px",
              }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(240,237,232,0.08)" }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Submitted</th>
                    <th style={thStyle}>Time</th>
                    {questionFields.map((f) => (
                      <th key={f.id} style={{ ...thStyle, maxWidth: "200px" }}>
                        <div style={{
                          overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap", maxWidth: "180px",
                        }}>
                          {f.title || "Untitled"}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r, i) => {
                    const map = answerMap(r);
                    const selected = r.id === selectedId;
                    return (
                      <tr
                        key={r.id}
                        className="resp-row"
                        onClick={() => setSelectedId(r.id)}
                        style={{
                          borderBottom: "1px solid rgba(240,237,232,0.04)",
                          background: selected ? "rgba(202,255,0,0.04)" : "transparent",
                          transition: "background 0.12s",
                        }}
                      >
                        <td style={{ ...tdStyle, color: selected ? "#CAFF00" : "rgba(240,237,232,0.3)", fontWeight: 500 }}>
                          #{responses.length - i}
                        </td>
                        <td style={{ ...tdStyle, color: "rgba(240,237,232,0.4)", whiteSpace: "nowrap" }}>
                          {timeAgo(r.submitted_at ?? r.started_at)}
                        </td>
                        <td style={{ ...tdStyle, color: "rgba(240,237,232,0.3)", whiteSpace: "nowrap" }}>
                          {completionTime(r) ?? "—"}
                        </td>
                        {questionFields.map((f) => (
                          <td key={f.id} style={{ ...tdStyle, maxWidth: "200px" }}>
                            <div style={{
                              overflow: "hidden", textOverflow: "ellipsis",
                              whiteSpace: "nowrap", maxWidth: "180px",
                              color: formatValue(map[f.id]) === "—"
                                ? "rgba(240,237,232,0.15)"
                                : "rgba(240,237,232,0.75)",
                            }}>
                              {formatValue(map[f.id])}
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail panel — slides in from right */}
          <div
            className={`detail-panel${selectedResponse ? " open" : ""}`}
            style={{
              position: "absolute", top: 0, right: 0,
              width: "min(560px, 90vw)", height: "100%",
              background: "#0D0D0D",
              borderLeft: "1px solid rgba(240,237,232,0.08)",
              display: "flex", flexDirection: "column",
              overflowY: "auto",
            }}
          >
            {selectedResponse && (
              <>
                {/* Panel header */}
                <div style={{
                  padding: "20px 28px",
                  borderBottom: "1px solid rgba(240,237,232,0.06)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  flexShrink: 0,
                }}>
                  <div>
                    <div style={{
                      fontFamily: "'Syne', sans-serif", fontSize: "16px",
                      fontWeight: 700, letterSpacing: "-0.3px",
                    }}>
                      Response #{responses.length - responses.findIndex((r) => r.id === selectedId)}
                    </div>
                    <div style={{ fontSize: "10px", color: "rgba(240,237,232,0.25)", marginTop: "4px" }}>
                      {new Date(selectedResponse.submitted_at ?? selectedResponse.started_at).toLocaleString()}
                      {completionTime(selectedResponse) && ` · ${completionTime(selectedResponse)}`}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    style={{
                      background: "transparent", border: "none",
                      color: "rgba(240,237,232,0.3)", fontSize: "18px",
                      cursor: "pointer", padding: "4px 8px",
                      transition: "color 0.12s",
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Answers */}
                <div style={{ padding: "8px 28px 28px", flex: 1 }}>
                  {questionFields.map((field, idx) => {
                    const map = answerMap(selectedResponse);
                    const val = formatValue(map[field.id]);
                    const empty = val === "—";
                    return (
                      <div key={field.id} style={{
                        padding: "18px 0",
                        borderBottom: "1px solid rgba(240,237,232,0.05)",
                        display: "flex", gap: "16px",
                      }}>
                        <div style={{
                          width: "20px", flexShrink: 0, paddingTop: "2px",
                          fontSize: "10px", color: "rgba(240,237,232,0.2)", fontWeight: 500,
                        }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: "11px", color: "rgba(240,237,232,0.35)",
                            marginBottom: "7px", lineHeight: 1.5,
                          }}>
                            {field.title || "Untitled question"}
                          </div>
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 16px",
  textAlign: "left",
  fontSize: "10px",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "rgba(240,237,232,0.25)",
  fontWeight: 500,
  whiteSpace: "nowrap",
  background: "#0A0A0A",
  position: "sticky",
  top: 0,
  zIndex: 1,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "12px",
  color: "rgba(240,237,232,0.6)",
  fontWeight: 300,
};
