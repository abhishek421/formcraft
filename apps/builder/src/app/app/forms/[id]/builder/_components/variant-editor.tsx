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

export function VariantPanel({
  field,
  formId,
  onFieldUpdated,
  variants,
  setVariants,
}: {
  field: Field;
  formId: string;
  onFieldUpdated: (groupId: string | null, variants?: Variant[]) => void;
  variants: Variant[];
  setVariants: (v: Variant[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const groupId = field.question_group_id;
  const totalWeight = variants.reduce((sum, v) => sum + v.traffic_weight, 0) || 1;
  const activeCount = variants.filter((v) => v.is_active).length;

  const turnIntoExperiment = async () => {
    setLoading(true);
    setError(null);
    try {
      const group = await createGroup(formId, field.title || "Untitled experiment");
      if (!group) throw new Error("Failed to create group");

      await createVariant(formId, group.id, {
        variant_label: "A",
        title: field.title,
        type: field.type,
        description: field.description,
        config: field.config,
        logic: field.logic as unknown[],
      });

      await updateField(field.id, { question_group_id: group.id });
      const fresh = await listVariants(formId, group.id);
      onFieldUpdated(group.id, fresh);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (variant: Variant) => {
    const isLastActive = activeCount === 1 && variant.is_active;
    if (isLastActive) return;
    const ok = await patchVariant(formId, groupId!, variant.id, { is_active: !variant.is_active });
    if (ok) setVariants(variants.map((v) => v.id === variant.id ? { ...v, is_active: !v.is_active } : v));
  };

  const updateWeight = (variantId: string, value: number) => {
    setVariants(variants.map((v) => v.id === variantId ? { ...v, traffic_weight: value } : v));
    startTransition(() => {
      patchVariant(formId, groupId!, variantId, { traffic_weight: value });
    });
  };

  const deleteVariantById = async (variantId: string) => {
    const ok = await removeVariant(formId, groupId!, variantId);
    if (ok) setVariants(variants.filter((v) => v.id !== variantId));
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
    color: "var(--text-dim)", marginBottom: "10px", fontFamily: "var(--font-body)",
  };

  return (
    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
      <div style={labelStyle}>Experiments</div>

      {!groupId ? (
        <>
          <div style={{ fontSize: "11px", color: "var(--text-faint)", marginBottom: "4px", lineHeight: 1.6 }}>
            Run A/B tests on this question.
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-faint)", marginBottom: "12px", lineHeight: 1.5, opacity: 0.7 }}>
            Variants appear as tabs on the canvas — edit each one directly.
          </div>
          {error && (
            <div style={{ fontSize: "11px", color: "rgba(255,100,100,0.9)", marginBottom: "8px" }}>{error}</div>
          )}
          <button
            onClick={turnIntoExperiment}
            disabled={loading}
            style={{
              width: "100%", padding: "8px",
              background: "transparent",
              border: "1px solid rgba(167,139,250,0.4)",
              borderRadius: "var(--radius-xs)",
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
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {variants.map((v) => {
            const pct = Math.round((v.traffic_weight / totalWeight) * 100);
            const isLastActive = activeCount === 1 && v.is_active;

            return (
              <div key={v.id} style={{
                background: "var(--surface-3)",
                border: `1px solid ${v.is_active ? "var(--border)" : "var(--text-faint)"}`,
                borderRadius: "var(--radius-xs)",
                padding: "10px",
                opacity: v.is_active ? 1 : 0.5,
                transition: "opacity var(--duration) var(--ease)",
              }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <div style={{
                    fontSize: "9px", fontWeight: 700, padding: "2px 6px",
                    background: "rgba(167,139,250,0.12)",
                    border: "1px solid rgba(167,139,250,0.3)",
                    borderRadius: "var(--radius-full)",
                    color: "rgba(167,139,250,0.9)",
                    fontFamily: "var(--font-body)", letterSpacing: "0.5px",
                  }}>
                    {v.variant_label}
                  </div>
                  <div style={{
                    fontSize: "11px", color: "var(--text-muted)",
                    flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    fontFamily: "var(--font-body)", fontWeight: 300,
                  }}>
                    {v.title || <em style={{ opacity: 0.4 }}>Untitled</em>}
                  </div>
                  {/* Active toggle */}
                  <button
                    onClick={() => toggleActive(v)}
                    disabled={isLastActive}
                    title={isLastActive ? "Cannot deactivate last active variant" : v.is_active ? "Deactivate" : "Activate"}
                    style={{
                      width: "28px", height: "16px", flexShrink: 0,
                      background: v.is_active ? "var(--accent)" : "var(--text-faint)",
                      border: "none", borderRadius: "var(--radius-full)",
                      cursor: isLastActive ? "not-allowed" : "pointer",
                      position: "relative",
                      transition: "background var(--duration) var(--ease)",
                    }}
                  >
                    <div style={{
                      position: "absolute", top: "2px",
                      left: v.is_active ? "14px" : "2px",
                      width: "12px", height: "12px", borderRadius: "50%",
                      background: v.is_active ? "var(--bg)" : "var(--text-dim)",
                      transition: "left var(--duration) var(--ease)",
                    }} />
                  </button>
                </div>

                {/* Traffic weight */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    flex: 1, height: "3px", background: "var(--border-mid)",
                    borderRadius: "2px", overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: "rgba(167,139,250,0.6)", borderRadius: "2px",
                      transition: "width 0.2s",
                    }} />
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={Math.round(v.traffic_weight * 100)}
                    onChange={(e) => updateWeight(v.id, parseInt(e.target.value) / 100)}
                    style={{
                      width: "44px", background: "var(--surface-4)",
                      border: "1px solid var(--text-faint)",
                      borderRadius: "var(--radius-xs)",
                      color: "var(--text-muted)", fontFamily: "var(--font-body)",
                      fontSize: "10px", padding: "3px 6px", textAlign: "right",
                    }}
                  />
                  <span style={{ fontSize: "10px", color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>%</span>
                </div>

                {/* Delete */}
                {!isLastActive && variants.length > 1 && (
                  <button
                    onClick={() => deleteVariantById(v.id)}
                    style={{
                      marginTop: "8px", background: "transparent", border: "none",
                      color: "var(--text-faint)", cursor: "pointer",
                      fontSize: "10px", fontFamily: "var(--font-body)", padding: "0",
                      letterSpacing: "0.5px",
                      transition: "color var(--duration) var(--ease)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#ff6b6b"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-faint)"; }}
                  >
                    Remove variant
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
