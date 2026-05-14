"use client";

import { useState, useTransition } from "react";
import {
  createGroup,
  createVariant,
  listVariants,
  patchVariant,
  removeVariant,
} from "../variant-actions";
import { updateField } from "../actions";

type Field = {
  id: string;
  form_id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  position: number;
  variable?: string;
  question_group_id?: string | null;
  config: Record<string, unknown>;
  logic: unknown[];
};

type Variant = {
  id: string;
  variant_label: string;
  title: string;
  description?: string;
  type: string;
  config: Record<string, unknown>;
  logic: unknown[];
  traffic_weight: number;
  is_active: boolean;
  created_at: string;
};

const VAR_COLORS = [
  { fg: "rgba(167,139,250,0.9)", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)" },
  { fg: "rgba(96,165,250,0.9)",  bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.25)"  },
  { fg: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.25)"  },
  { fg: "rgba(251,146,60,0.9)",  bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.25)"  },
];

const LABELS = ["A", "B", "C", "D", "E", "F"];

export function VariantPanel({
  field,
  formId,
  onFieldUpdated,
  variants,
  setVariants,
  onRequestAddVariant,
}: {
  field: Field;
  formId: string;
  onFieldUpdated: (groupId: string | null, variants?: Variant[]) => void;
  variants: Variant[];
  setVariants: (v: Variant[]) => void;
  onRequestAddVariant?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const groupId = field.question_group_id;
  const totalWeight = variants.reduce((s, v) => s + v.traffic_weight, 0) || 1;
  const activeCount = variants.filter((v) => v.is_active).length;

  const turnIntoExperiment = async () => {
    setLoading(true); setError(null);
    try {
      const group = await createGroup(formId, field.title || "Untitled experiment");
      if (!group) throw new Error("Failed to create group");
      await createVariant(formId, group.id, {
        variant_label: "A", title: field.title, type: field.type,
        description: field.description, config: field.config,
        logic: field.logic as unknown[],
      });
      await updateField(field.id, { question_group_id: group.id });
      const fresh = await listVariants(formId, group.id);
      onFieldUpdated(group.id, fresh);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  const toggleActive = async (v: Variant) => {
    if (activeCount === 1 && v.is_active) return;
    const ok = await patchVariant(formId, groupId!, v.id, { is_active: !v.is_active });
    if (ok) setVariants(variants.map((x) => x.id === v.id ? { ...x, is_active: !x.is_active } : x));
  };

  const updateWeight = (variantId: string, value: number) => {
    setVariants(variants.map((v) => v.id === variantId ? { ...v, traffic_weight: value } : v));
    startTransition(() => { patchVariant(formId, groupId!, variantId, { traffic_weight: value }); });
  };

  const resetEqual = () => {
    const w = 1 / variants.length;
    variants.forEach((v) => updateWeight(v.id, w));
  };

  const deleteVariant = async (variantId: string) => {
    const ok = await removeVariant(formId, groupId!, variantId);
    if (ok) setVariants(variants.filter((v) => v.id !== variantId));
  };

  const addVariant = async () => {
    if (!groupId) return;
    const used = new Set(variants.map((v) => v.variant_label));
    const nextLabel = LABELS.find((l) => !used.has(l));
    if (!nextLabel) return;
    setLoading(true); setError(null);
    try {
      const base = variants[0];
      await createVariant(formId, groupId, {
        variant_label: nextLabel,
        title: base?.title ?? "",
        type: base?.type ?? field.type,
        description: base?.description,
        config: base?.config ?? field.config,
        logic: (base?.logic ?? field.logic) as unknown[],
      });
      const fresh = await listVariants(formId, groupId);
      setVariants(fresh);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>
          Experiments
        </div>
        <div style={{ position: "relative", display: "inline-flex" }} className="cf-exp-tip">
          <span style={{
            fontSize: "9px", color: "var(--text-faint)", cursor: "default",
            border: "1px solid var(--text-faint)", borderRadius: "50%",
            width: "14px", height: "14px", display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1, flexShrink: 0,
          }}>?</span>
          <style>{`
            .cf-exp-tip .cf-exp-tip-box { display: none; }
            .cf-exp-tip:hover .cf-exp-tip-box { display: block; }
          `}</style>
          <div className="cf-exp-tip-box" style={{
            position: "absolute", bottom: "calc(100% + 6px)", right: 0,
            background: "var(--surface-4, #1e1e2e)", border: "1px solid var(--border-mid)",
            color: "var(--text-muted)", fontSize: "11px", lineHeight: 1.5,
            padding: "7px 10px", borderRadius: "6px", whiteSpace: "nowrap",
            zIndex: 999, pointerEvents: "none",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            fontFamily: "var(--font-body)", fontWeight: 300,
          }}>
            Optimizer needs 100+ impressions<br />per variant before rebalancing traffic.
          </div>
        </div>
      </div>

      {error && <div style={{ fontSize: "11px", color: "rgba(255,100,100,0.9)", marginBottom: "8px" }}>{error}</div>}

      {!groupId ? (
        <>
          <div style={{ fontSize: "11px", color: "var(--text-faint)", marginBottom: "4px", lineHeight: 1.6 }}>
            Run A/B tests on this question.
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-faint)", marginBottom: "12px", lineHeight: 1.5, opacity: 0.7 }}>
            Variants appear as tabs on the canvas — edit each one directly.
          </div>
          <button
            onClick={turnIntoExperiment}
            disabled={loading}
            style={{
              width: "100%", padding: "8px", background: "transparent",
              border: "1px solid rgba(167,139,250,0.4)", borderRadius: "var(--radius-xs)",
              color: loading ? "var(--text-faint)" : "rgba(167,139,250,0.9)",
              fontFamily: "var(--font-body)", fontSize: "11px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all var(--duration) var(--ease)",
            }}
          >
            {loading ? "Creating…" : "Turn into experiment"}
          </button>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {variants.map((v, i) => {
            const c = VAR_COLORS[i % VAR_COLORS.length];
            const pct = Math.round((v.traffic_weight / totalWeight) * 100);
            const isLastActive = activeCount === 1 && v.is_active;

            return (
              <div key={v.id} style={{
                padding: "10px 12px",
                background: v.is_active ? c.bg : "transparent",
                border: `1px solid ${v.is_active ? c.border : "var(--text-faint)"}`,
                borderRadius: "8px",
                opacity: v.is_active ? 1 : 0.45,
                transition: "opacity 0.12s, background 0.12s",
                display: "flex", flexDirection: "column", gap: "8px",
              }}>
                {/* Header: pill | title | toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <div style={{
                    fontSize: "9px", fontWeight: 700, padding: "1px 6px", flexShrink: 0,
                    background: c.bg, border: `1px solid ${c.border}`,
                    borderRadius: "99px", color: c.fg,
                    fontFamily: "var(--font-body)", letterSpacing: "0.5px",
                  }}>
                    {v.variant_label}
                  </div>
                  <div style={{
                    flex: 1, fontSize: "11px", color: "var(--text-muted)",
                    fontFamily: "var(--font-body)", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {v.title || <em style={{ opacity: 0.35 }}>Your question here...</em>}
                  </div>
                  <div
                    onClick={() => toggleActive(v)}
                    style={{
                      width: "26px", height: "14px", borderRadius: "99px", flexShrink: 0,
                      background: v.is_active ? "var(--accent)" : "var(--text-faint)",
                      position: "relative", cursor: isLastActive ? "not-allowed" : "pointer",
                      opacity: isLastActive ? 0.4 : 1, transition: "background 0.12s",
                    }}
                  >
                    <div style={{
                      position: "absolute", top: "2px", left: v.is_active ? "13px" : "2px",
                      width: "10px", height: "10px", borderRadius: "50%",
                      background: v.is_active ? "var(--bg)" : "var(--text-dim)",
                      transition: "left 0.12s",
                    }} />
                  </div>
                </div>

                {/* Slider row */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="range" min={1} max={100} value={pct}
                    onChange={(e) => updateWeight(v.id, parseInt(e.target.value) / 100)}
                    style={{ flex: 1, height: "4px", cursor: "pointer", accentColor: c.fg }}
                  />
                  <div style={{
                    width: "34px", padding: "3px 0", textAlign: "center",
                    background: "var(--surface-3)", border: `1px solid ${c.border}`,
                    borderRadius: "4px", fontSize: "10px", color: c.fg,
                    fontFamily: "var(--font-body)", fontWeight: 600, flexShrink: 0,
                  }}>
                    {pct}%
                  </div>
                </div>

                {/* Delete */}
                {variants.length > 1 && !isLastActive && (
                  <button
                    onClick={() => deleteVariant(v.id)}
                    style={{
                      background: "transparent", border: "none", padding: 0,
                      color: "var(--text-faint)", fontFamily: "var(--font-body)",
                      fontSize: "10px", cursor: "pointer", textAlign: "left",
                      transition: "color 0.12s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#ff5555"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-faint)"; }}
                  >
                    × Remove
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={resetEqual}
            style={{
              padding: "6px", background: "transparent",
              border: "1px solid var(--border)", borderRadius: "6px",
              color: "var(--text-dim)", fontFamily: "var(--font-body)",
              fontSize: "10px", cursor: "pointer",
            }}
          >
            ⟳ Equal split
          </button>

          {variants.length < 6 && (
            <button
              onClick={onRequestAddVariant ?? addVariant}
              disabled={loading}
              style={{
                padding: "7px", background: "transparent",
                border: "1px dashed rgba(167,139,250,0.3)", borderRadius: "6px",
                color: loading ? "var(--text-faint)" : "rgba(167,139,250,0.7)",
                fontFamily: "var(--font-body)", fontSize: "11px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Adding…" : "+ Add variant"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
