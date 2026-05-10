"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { deleteResponse } from "../actions";

type Field = { id: string; type: string; title: string; variable?: string; position: number };
type Answer = { field_id: string; value: unknown };
type Response = { id: string; started_at: string; submitted_at: string | null; answers: Answer[] };
type Form = { id: string; title: string; published: boolean };

type SortDir = "asc" | "desc";
type SortKey = "index" | "submitted" | "time" | string; // string = field id

export function ResponsesShell({
  form,
  fields,
  responses: rawResponses,
  email,
}: {
  form: Form;
  fields: Field[];
  responses: Response[];
  email: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("submitted");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [menuCol, setMenuCol] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

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

  function completionMs(r: Response) {
    if (!r.submitted_at) return null;
    return new Date(r.submitted_at).getTime() - new Date(r.started_at).getTime();
  }

  function formatTime(ms: number | null) {
    if (ms === null) return "—";
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  }

  function handleDelete(responseId: string) {
    setDeletedIds((prev) => new Set([...prev, responseId]));
    setSelectedId(null);
    startTransition(() => deleteResponse(form.id, responseId));
  }

  // Sort
  const responses = [...rawResponses].filter((r) => !deletedIds.has(r.id)).sort((a, b) => {
    let cmp = 0;
    if (sortKey === "submitted") {
      cmp = new Date(a.submitted_at ?? a.started_at).getTime() - new Date(b.submitted_at ?? b.started_at).getTime();
    } else if (sortKey === "time") {
      cmp = (completionMs(a) ?? 0) - (completionMs(b) ?? 0);
    } else if (sortKey === "index") {
      cmp = 0; // original order = submitted asc
    } else {
      // field sort
      const aMap = answerMap(a);
      const bMap = answerMap(b);
      const av = formatValue(aMap[sortKey]);
      const bv = formatValue(bMap[sortKey]);
      cmp = av.localeCompare(bv);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const selectedResponse = responses.find((r) => r.id === selectedId) ?? null;

  const avgCompletion = (() => {
    const times = rawResponses.filter((r) => r.submitted_at).map((r) => completionMs(r)!);
    if (!times.length) return "—";
    const avg = times.reduce((a, b) => a + b, 0) / times.length / 1000;
    return avg < 60 ? `${Math.round(avg)}s` : `${Math.floor(avg / 60)}m ${Math.round(avg % 60)}s`;
  })();

  const rendererBase = process.env.NEXT_PUBLIC_RENDERER_URL ?? "http://localhost:3001";

  function handleColMenu(col: string) {
    setMenuCol((prev) => (prev === col ? null : col));
  }

  function applySort(col: SortKey) {
    if (sortKey === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(col); setSortDir("asc"); }
    setMenuCol(null);
  }

  function hideCol(col: string) {
    setHiddenCols((prev) => new Set([...prev, col]));
    setMenuCol(null);
  }

  // Close menu on outside click
  useEffect(() => {
    if (!menuCol) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuCol(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuCol]);

  const visibleBuiltin = (["submitted", "time"] as const).filter((c) => !hiddenCols.has(c));
  const visibleFields = questionFields.filter((f) => !hiddenCols.has(f.id));
  const anyHidden = hiddenCols.size > 0;

  function ColHeader({ col, label }: { col: string; label: string }) {
    const active = sortKey === col;
    const isMenuOpen = menuCol === col;
    return (
      <th style={{ ...thStyle, position: "sticky", top: 0, zIndex: 2 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            onClick={() => handleColMenu(col)}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: active ? "var(--accent)" : "var(--text-dim)",
              fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase",
              fontFamily: "var(--font-body)", fontWeight: 500,
              padding: "2px 0", display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            {label}
            <span style={{ opacity: 0.5 }}>{active ? (sortDir === "asc" ? "↑" : "↓") : "⌄"}</span>
          </button>

          {isMenuOpen && (
            <div
              ref={menuRef}
              style={{
                position: "absolute", top: "100%", left: 0, marginTop: "4px",
                background: "var(--surface-3)", border: "1px solid var(--border-mid)",
                borderRadius: "var(--radius-sm)",
                zIndex: 50, minWidth: "140px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              }}
            >
              <MenuItem onClick={() => applySort(col)}>
                Sort A → Z {sortKey === col && sortDir === "asc" ? "✓" : ""}
              </MenuItem>
              <MenuItem onClick={() => { setSortKey(col); setSortDir("desc"); setMenuCol(null); }}>
                Sort Z → A {sortKey === col && sortDir === "desc" ? "✓" : ""}
              </MenuItem>
              <div style={{ height: "1px", background: "var(--border)", margin: "2px 0" }} />
              <MenuItem onClick={() => hideCol(col)} danger>Hide column</MenuItem>
            </div>
          )}
        </div>
      </th>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .resp-row:hover { background: var(--border) !important; cursor: pointer; }
      `}</style>

      <div style={{
        display: "flex", height: "100vh",
        background: "var(--bg)", color: "var(--text)",
        fontFamily: "var(--font-body)", overflow: "hidden",
      }}>
        <AppSidebar email={email} defaultCollapsed={true} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{
          height: "56px", display: "flex", alignItems: "center",
          borderBottom: "1px solid var(--border)",
          padding: "0 20px", gap: "16px", flexShrink: 0,
          background: "var(--surface-2)", position: "relative",
        }}>
          <Link href="/forms" style={{
            color: "var(--text-dim)", textDecoration: "none", fontSize: "12px",
          }}>← Back</Link>
          <div style={{ width: "1px", height: "20px", background: "var(--text-faint)" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, letterSpacing: "-0.3px" }}>
            {form.title}
          </span>

          {/* Tab switcher — centered */}
          <div style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            display: "flex",
            background: "var(--border)",
            border: "1px solid var(--text-faint)",
            borderRadius: "var(--radius-full)",
            padding: "3px",
            gap: "2px",
          }}>
            {[
              { label: "Builder", href: `/forms/${form.id}/builder`, active: false },
              { label: "Responses", href: `/forms/${form.id}/responses`, active: true },
            ].map((tab) => (
              <Link key={tab.label} href={tab.href} style={{
                padding: "5px 18px", textDecoration: "none",
                fontSize: "12px", letterSpacing: "0.3px",
                borderRadius: "var(--radius-full)",
                background: tab.active ? "var(--border-mid)" : "transparent",
                color: tab.active ? "var(--text)" : "var(--text-dim)",
                fontFamily: "var(--font-body)",
                transition: "all var(--duration) var(--ease)",
              }}>
                {tab.label}
              </Link>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: "10px", alignItems: "center" }}>
            {anyHidden && (
              <button
                onClick={() => setHiddenCols(new Set())}
                style={{
                  background: "transparent", border: "1px solid var(--border-mid)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-muted)", fontSize: "11px", letterSpacing: "1px",
                  textTransform: "uppercase", cursor: "pointer", padding: "7px 14px",
                  fontFamily: "var(--font-body)",
                  transition: "all var(--duration) var(--ease)",
                }}
              >
                Show all ({hiddenCols.size})
              </button>
            )}
            <a href={`${rendererBase}/f/${form.id}`} target="_blank" rel="noopener noreferrer" style={{
              padding: "7px 16px", border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-muted)", fontSize: "11px", letterSpacing: "1px",
              textTransform: "uppercase", textDecoration: "none",
              fontFamily: "var(--font-body)",
              transition: "all var(--duration) var(--ease)",
            }}>
              Preview ↗
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
          {[
            { label: "Total Responses", value: rawResponses.length - deletedIds.size },
            { label: "Questions", value: questionFields.length },
            { label: "Avg. Completion", value: avgCompletion },
          ].map((stat, i) => (
            <div key={stat.label} style={{ padding: "var(--space-4) var(--space-8)", borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-dim)", marginTop: "3px" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Table + detail panel */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative", display: "flex" }}>

          {/* Table scroll container */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
            {rawResponses.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px" }}>
                <div style={{ fontSize: "13px", color: "var(--text-faint)" }}>No responses yet.</div>
                <a href={`${rendererBase}/f/${form.id}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "11px", color: "var(--accent)", opacity: 0.7, textDecoration: "none" }}>
                  Share the form ↗
                </a>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "600px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--text-faint)", background: "var(--surface-2)" }}>
                    <th style={{ ...thStyle, position: "sticky", top: 0, zIndex: 2 }}>#</th>
                    {!hiddenCols.has("submitted") && <ColHeader col="submitted" label="Submitted" />}
                    {!hiddenCols.has("time") && <ColHeader col="time" label="Time" />}
                    {visibleFields.map((f) => (
                      <ColHeader key={f.id} col={f.id} label={f.title || "Untitled"} />
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
                        onClick={() => setSelectedId(selected ? null : r.id)}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          background: selected ? "var(--accent-dim)" : "transparent",
                        }}
                      >
                        <td style={{ ...tdStyle, color: selected ? "var(--accent)" : "var(--text-dim)", fontWeight: 500 }}>
                          #{i + 1}
                        </td>
                        {!hiddenCols.has("submitted") && (
                          <td style={{ ...tdStyle, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                            {timeAgo(r.submitted_at ?? r.started_at)}
                          </td>
                        )}
                        {!hiddenCols.has("time") && (
                          <td style={{ ...tdStyle, color: "var(--text-dim)", whiteSpace: "nowrap" }}>
                            {formatTime(completionMs(r))}
                          </td>
                        )}
                        {visibleFields.map((f) => (
                          <td key={f.id} style={{ ...tdStyle, maxWidth: "200px" }}>
                            <div style={{
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px",
                              color: formatValue(map[f.id]) === "—" ? "var(--text-faint)" : "var(--text-muted)",
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

          {/* Detail panel */}
          <div style={{
            width: selectedResponse ? "min(520px, 45vw)" : "0",
            flexShrink: 0, overflow: "hidden",
            transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
            borderLeft: selectedResponse ? "1px solid var(--text-faint)" : "none",
            background: "var(--surface)", display: "flex", flexDirection: "column",
          }}>
            {selectedResponse && (
              <div style={{ width: "min(520px, 45vw)", height: "100%", display: "flex", flexDirection: "column", overflowY: "auto" }}>
                {/* Panel header */}
                <div style={{
                  padding: "var(--space-5) var(--space-6)",
                  borderBottom: "1px solid var(--border)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  flexShrink: 0,
                }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, letterSpacing: "-0.3px" }}>
                      Response #{responses.findIndex((r) => r.id === selectedId) + 1}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", marginTop: "4px" }}>
                      {new Date(selectedResponse.submitted_at ?? selectedResponse.started_at).toLocaleString()}
                      {completionMs(selectedResponse) !== null && ` · ${formatTime(completionMs(selectedResponse))}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => handleDelete(selectedResponse.id)}
                      disabled={isPending}
                      style={{
                        background: "transparent", border: "1px solid var(--error)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--error)", fontSize: "11px", letterSpacing: "0.5px",
                        cursor: "pointer", padding: "5px 12px",
                        fontFamily: "var(--font-body)", opacity: isPending ? 0.5 : 1,
                        transition: "all var(--duration) var(--ease)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--error)"; e.currentTarget.style.color = "var(--bg)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--error)"; }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedId(null)}
                      style={{
                        background: "transparent", border: "none",
                        color: "var(--text-dim)", fontSize: "18px",
                        cursor: "pointer", padding: "4px 8px",
                      }}
                    >✕</button>
                  </div>
                </div>

                {/* Answers */}
                <div style={{ padding: "var(--space-2) var(--space-6) var(--space-8)", flex: 1 }}>
                  {questionFields.map((field, idx) => {
                    const map = answerMap(selectedResponse);
                    const val = formatValue(map[field.id]);
                    const empty = val === "—";
                    return (
                      <div key={field.id} style={{
                        padding: "var(--space-4) 0",
                        borderBottom: "1px solid var(--border)",
                        display: "flex", gap: "var(--space-4)",
                      }}>
                        <div style={{ width: "20px", flexShrink: 0, paddingTop: "2px", fontSize: "10px", color: "var(--text-faint)", fontWeight: 500 }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "7px", lineHeight: 1.5 }}>
                            {field.title || "Untitled question"}
                          </div>
                          <div style={{
                            fontSize: "15px",
                            fontFamily: empty ? "var(--font-body)" : "var(--font-display)",
                            fontWeight: empty ? 300 : 600,
                            color: empty ? "var(--text-faint)" : "var(--text)",
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
        </div>{/* end inner flex column */}
      </div>
    </>
  );
}

function MenuItem({ onClick, danger, children }: { onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block", width: "100%", textAlign: "left",
        padding: "var(--space-2) var(--space-3)", background: "transparent", border: "none",
        color: danger ? "var(--error)" : "var(--text-muted)",
        fontSize: "11px", letterSpacing: "0.5px", cursor: "pointer",
        fontFamily: "var(--font-body)",
        transition: "background var(--duration) var(--ease), color var(--duration) var(--ease)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--border)"; e.currentTarget.style.color = danger ? "var(--error)" : "var(--text)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = danger ? "var(--error)" : "var(--text-muted)"; }}
    >
      {children}
    </button>
  );
}

const thStyle: React.CSSProperties = {
  padding: "var(--space-2) var(--space-4)",
  textAlign: "left",
  background: "var(--surface-2)",
};

const tdStyle: React.CSSProperties = {
  padding: "var(--space-3) var(--space-4)",
  fontSize: "12px",
  color: "var(--text-muted)",
  fontWeight: 300,
};
