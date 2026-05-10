"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createGroup,
  createVariant,
  listVariants,
  patchVariant,
  removeVariant,
  resetVariantWeights,
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

const labelStyle: React.CSSProperties = {
  fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
  color: "var(--text-dim)", marginBottom: "10px", fontFamily: "var(--font-body)",
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--surface-3)",
  border: "1px solid var(--text-faint)",
  borderRadius: "var(--radius-xs)",
  color: "var(--text)", fontFamily: "var(--font-body)",
  fontSize: "12px", fontWeight: 300, padding: "6px 8px",
};

const dashedBtn: React.CSSProperties = {
  background: "transparent", border: "1px dashed var(--border-mid)",
  color: "var(--text-dim)", fontFamily: "var(--font-body)",
  fontSize: "11px", padding: "8px", cursor: "pointer",
  width: "100%", borderRadius: "var(--radius-xs)",
  transition: "all var(--duration) var(--ease)",
};

function hover(e: React.MouseEvent<HTMLButtonElement>, enter: boolean) {
  const btn = e.currentTarget;
  btn.style.borderColor = enter ? "var(--accent-border)" : "var(--border-mid)";
  btn.style.color = enter ? "var(--accent)" : "var(--text-dim)";
}

const FIELD_TYPES = [
  "short_text","long_text","email","number","phone","url","date",
  "multiple_choice","dropdown","yes_no","rating","opinion_scale",
  "statement","file_upload",
];

export function VariantEditor({
  field,
  formId,
  onFieldUpdated,
}: {
  field: Field;
  formId: string;
  onFieldUpdated: (groupId: string | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [fetchingVariants, setFetchingVariants] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [addingVariant, setAddingVariant] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState(field.type);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const groupId = field.question_group_id;

  const fetchVariants = useCallback(async () => {
    if (!groupId) return;
    setFetchingVariants(true);
    try {
      const data = await listVariants(formId, groupId);
      setVariants(data);
    } finally {
      setFetchingVariants(false);
    }
  }, [groupId, formId]);

  useEffect(() => {
    if (groupId) fetchVariants();
    else setVariants([]);
  }, [groupId, fetchVariants]);

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
      onFieldUpdated(group.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (variant: Variant) => {
    const ok = await patchVariant(formId, groupId!, variant.id, { is_active: !variant.is_active });
    if (ok) {
      setVariants((prev) =>
        prev.map((v) => v.id === variant.id ? { ...v, is_active: !v.is_active } : v)
      );
    }
  };

  const saveEdit = async (variantId: string) => {
    const ok = await patchVariant(formId, groupId!, variantId, { title: editTitle, description: editDesc });
    if (ok) {
      setVariants((prev) =>
        prev.map((v) => v.id === variantId ? { ...v, title: editTitle, description: editDesc } : v)
      );
      setEditingId(null);
    }
  };

  const deleteVariant = async (variantId: string) => {
    const ok = await removeVariant(formId, groupId!, variantId);
    if (ok) {
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      setConfirmDeleteId(null);
    }
  };

  const addNewVariant = async () => {
    if (!newLabel.trim() || !newTitle.trim()) return;
    const variant = await createVariant(formId, groupId!, {
      variant_label: newLabel,
      title: newTitle,
      type: newType,
      config: {},
      logic: [],
    });
    if (variant) {
      await fetchVariants();
      setAddingVariant(false);
      setNewLabel("");
      setNewTitle("");
      setNewType(field.type);
    }
  };

  const doResetWeights = async () => {
    await resetVariantWeights(formId, groupId!);
    await fetchVariants();
  };

  return (
    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
      <div style={labelStyle}>Experiments</div>

      {!groupId ? (
        <>
          <div style={{ fontSize: "11px", color: "var(--text-faint)", marginBottom: "12px", lineHeight: 1.6 }}>
            Run A/B tests on this question. Different respondents see different variants.
          </div>
          {error && (
            <div style={{ fontSize: "11px", color: "rgba(255,100,100,0.9)", marginBottom: "8px" }}>
              {error}
            </div>
          )}
          <button
            onClick={turnIntoExperiment}
            disabled={loading}
            style={{
              ...dashedBtn,
              borderStyle: "solid",
              borderColor: "rgba(167,139,250,0.4)",
              color: loading ? "var(--text-faint)" : "rgba(167,139,250,0.9)",
            }}
          >
            {loading ? "Creating..." : "Turn into experiment"}
          </button>
        </>
      ) : fetchingVariants ? (
        <div style={{ fontSize: "11px", color: "var(--text-faint)" }}>Loading variants...</div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
            {variants.map((v) => {
              const pct = Math.round((v.traffic_weight / totalWeight) * 100);
              const isEditing = editingId === v.id;
              const isLastActive = activeCount === 1 && v.is_active;

              return (
                <div key={v.id} style={{
                  background: "var(--surface-3)", border: "1px solid var(--border)",
                  padding: "10px", borderRadius: "var(--radius-xs)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <div style={{
                      fontSize: "9px", fontWeight: 700, padding: "2px 6px",
                      background: "rgba(167,139,250,0.12)",
                      border: "1px solid rgba(167,139,250,0.3)",
                      borderRadius: "var(--radius-full)",
                      color: "rgba(167,139,250,0.9)",
                      fontFamily: "var(--font-body)",
                    }}>
                      {v.variant_label}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
                      {pct}% traffic
                    </div>
                    <button
                      onClick={() => toggleActive(v)}
                      disabled={isLastActive}
                      title={isLastActive ? "Cannot deactivate last active variant" : undefined}
                      style={{
                        marginLeft: "auto", width: "28px", height: "16px",
                        background: v.is_active ? "var(--accent)" : "var(--text-faint)",
                        border: "none", borderRadius: "var(--radius-full)",
                        cursor: isLastActive ? "not-allowed" : "pointer",
                        position: "relative", opacity: isLastActive ? 0.5 : 1,
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

                  {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" style={inputStyle} />
                      <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description (optional)" style={inputStyle} />
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => saveEdit(v.id)} style={{
                          flex: 1, padding: "5px", cursor: "pointer",
                          background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
                          borderRadius: "var(--radius-xs)", color: "var(--accent)",
                          fontSize: "11px", fontFamily: "var(--font-body)",
                        }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{
                          flex: 1, padding: "5px", cursor: "pointer",
                          background: "transparent", border: "1px solid var(--border)",
                          borderRadius: "var(--radius-xs)", color: "var(--text-dim)",
                          fontSize: "11px", fontFamily: "var(--font-body)",
                        }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-body)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        marginBottom: "6px",
                      }}>
                        {v.title || <em style={{ opacity: 0.4 }}>Untitled</em>}
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <button onClick={() => { setEditingId(v.id); setEditTitle(v.title); setEditDesc(v.description ?? ""); }} style={{
                          background: "transparent", border: "none", color: "var(--text-dim)",
                          cursor: "pointer", fontSize: "11px", padding: "0", fontFamily: "var(--font-body)",
                        }}>Edit</button>
                        <span style={{ color: "var(--text-faint)", fontSize: "11px" }}>·</span>
                        {confirmDeleteId === v.id ? (
                          <>
                            <button onClick={() => deleteVariant(v.id)} disabled={isLastActive} style={{
                              background: "transparent", border: "none",
                              color: "rgba(255,100,100,0.8)", cursor: "pointer",
                              fontSize: "11px", padding: "0", fontFamily: "var(--font-body)",
                            }}>Confirm</button>
                            <span style={{ color: "var(--text-faint)", fontSize: "11px" }}>·</span>
                            <button onClick={() => setConfirmDeleteId(null)} style={{
                              background: "transparent", border: "none", color: "var(--text-dim)",
                              cursor: "pointer", fontSize: "11px", padding: "0", fontFamily: "var(--font-body)",
                            }}>Cancel</button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(v.id)} disabled={isLastActive} style={{
                            background: "transparent", border: "none",
                            color: isLastActive ? "var(--text-faint)" : "var(--text-dim)",
                            cursor: isLastActive ? "not-allowed" : "pointer",
                            fontSize: "11px", padding: "0", fontFamily: "var(--font-body)",
                          }}>Delete</button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {addingVariant ? (
            <div style={{
              background: "var(--surface-3)", border: "1px solid var(--border)",
              padding: "10px", borderRadius: "var(--radius-xs)",
              display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px",
            }}>
              <div style={{ fontSize: "10px", color: "var(--text-dim)", letterSpacing: "1px", fontFamily: "var(--font-body)" }}>NEW VARIANT</div>
              <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label (e.g. B, C)" style={inputStyle} />
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Question title" style={inputStyle} />
              <select value={newType} onChange={(e) => setNewType(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={addNewVariant} style={{
                  flex: 1, padding: "6px", cursor: "pointer",
                  background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
                  borderRadius: "var(--radius-xs)", color: "var(--accent)",
                  fontSize: "11px", fontFamily: "var(--font-body)",
                }}>Add</button>
                <button onClick={() => setAddingVariant(false)} style={{
                  flex: 1, padding: "6px", cursor: "pointer",
                  background: "transparent", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xs)", color: "var(--text-dim)",
                  fontSize: "11px", fontFamily: "var(--font-body)",
                }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingVariant(true)}
              style={dashedBtn}
              onMouseEnter={(e) => hover(e, true)}
              onMouseLeave={(e) => hover(e, false)}
            >
              + Add Variant
            </button>
          )}

          <button
            onClick={doResetWeights}
            style={{ ...dashedBtn, marginTop: "6px" }}
            onMouseEnter={(e) => hover(e, true)}
            onMouseLeave={(e) => hover(e, false)}
          >
            Reset to equal weights
          </button>
        </>
      )}
    </div>
  );
}
