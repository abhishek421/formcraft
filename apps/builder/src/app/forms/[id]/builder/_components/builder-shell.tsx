"use client";

import { useState, useCallback, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  addField,
  updateField,
  deleteField,
  reorderFields,
  updateFormTitle,
  togglePublish,
  updateFormTheme,
} from "../actions";

// ─── Types ───────────────────────────────────────────────────────────────────

type Field = {
  id: string;
  form_id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  position: number;
  variable?: string;
  config: Record<string, unknown>;
  logic: unknown[];
};

type Form = {
  id: string;
  title: string;
  published: boolean;
  settings: Record<string, unknown>;
  theme: Record<string, unknown>;
};

function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

type FormThemeTokens = {
  bg: string; primary: string; dFont: string; bFont: string;
  bRadius: string; textColor: string; textMuted: string;
};

// ─── Widget config ────────────────────────────────────────────────────────────

const WIDGET_GROUPS = [
  {
    label: "Questions",
    types: [
      { type: "short_text", label: "Short Text", icon: "Aa" },
      { type: "long_text", label: "Long Text", icon: "¶" },
      { type: "email", label: "Email", icon: "@" },
      { type: "number", label: "Number", icon: "01" },
      { type: "phone", label: "Phone", icon: "☎" },
      { type: "url", label: "URL", icon: "↗" },
      { type: "date", label: "Date", icon: "▦" },
    ],
  },
  {
    label: "Choice",
    types: [
      { type: "multiple_choice", label: "Multiple Choice", icon: "◉" },
      { type: "dropdown", label: "Dropdown", icon: "▾" },
      { type: "yes_no", label: "Yes / No", icon: "Y/N" },
      { type: "rating", label: "Rating", icon: "★" },
      { type: "opinion_scale", label: "Opinion Scale", icon: "◂▸" },
    ],
  },
  {
    label: "Content",
    types: [
      { type: "statement", label: "Statement", icon: "≡" },
      { type: "welcome_screen", label: "Welcome Screen", icon: "⌂" },
      { type: "file_upload", label: "File Upload", icon: "↑" },
    ],
  },
];

const ALL_TYPES = WIDGET_GROUPS.flatMap((g) => g.types);

function getTypeLabel(type: string) {
  return ALL_TYPES.find((t) => t.type === type)?.label ?? type;
}
function getTypeIcon(type: string) {
  return ALL_TYPES.find((t) => t.type === type)?.icon ?? "?";
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

function useDebounce<T extends unknown[]>(fn: (...args: T) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback((...args: T) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BuilderShell({ form, initialFields, email }: { form: Form; initialFields: Field[]; email: string }) {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [selectedId, setSelectedId] = useState<string | null>(initialFields[0]?.id ?? null);
  const [formTitle, setFormTitle] = useState(form.title);
  const [published, setPublished] = useState(form.published);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [leftTab, setLeftTab] = useState<"questions" | "style">("questions");
  const [formTheme, setFormTheme] = useState<Record<string, unknown>>(form.theme ?? {});
  const [, startTransition] = useTransition();

  const rendererBase = process.env.NEXT_PUBLIC_RENDERER_URL ?? "http://localhost:3001";
  const shareUrl = `${rendererBase}/f/${form.id}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const selectedField = fields.find((f) => f.id === selectedId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Save title debounced
  const saveTitle = useDebounce((title: string) => {
    startTransition(() => { updateFormTitle(form.id, title); });
  }, 600);

  // Save field changes debounced
  const saveField = useDebounce((id: string, updates: Record<string, unknown>) => {
    startTransition(() => { updateField(id, updates); });
  }, 500);

  // Update a field locally + persist
  const patchField = useCallback((id: string, updates: Partial<Field>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
    const { id: _id, form_id: _fid, created_at: _ca, ...safe } = updates as Record<string, unknown>;
    void _id; void _fid; void _ca;
    saveField(id, safe);
  }, [saveField]);

  useEffect(() => {
    const dFont = (formTheme.display_font as string) ?? "Syne";
    const bFont = (formTheme.body_font as string) ?? "DM Mono";
    const id = "form-fonts-link";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(dFont)}:wght@400;700;800&family=${encodeURIComponent(bFont)}:wght@300;400;500&display=swap`;
  }, [formTheme.display_font, formTheme.body_font]);

  const saveTheme = useDebounce((theme: Record<string, unknown>) => {
    startTransition(() => { updateFormTheme(form.id, theme); });
  }, 500);

  const patchTheme = useCallback((updates: Record<string, unknown>) => {
    setFormTheme((prev) => {
      const next = { ...prev, ...updates };
      saveTheme(next);
      return next;
    });
  }, [saveTheme]);

  // Add field
  const handleAddField = async (type: string) => {
    setShowWidgetPicker(false);
    const position = fields.length;
    const newField = await addField(form.id, type, position);
    setFields((prev) => [...prev, newField]);
    setSelectedId(newField.id);
  };

  // Delete field
  const handleDeleteField = (id: string) => {
    const idx = fields.findIndex((f) => f.id === id);
    startTransition(() => { deleteField(id); });
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSelectedId(fields[idx - 1]?.id ?? fields[idx + 1]?.id ?? null);
  };

  // Drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setFields((prev) => {
      const oldIdx = prev.findIndex((f) => f.id === active.id);
      const newIdx = prev.findIndex((f) => f.id === over.id);
      const reordered = arrayMove(prev, oldIdx, newIdx).map((f, i) => ({ ...f, position: i }));
      startTransition(() => {
        reorderFields(reordered.map((f) => ({ id: f.id, position: f.position })));
      });
      return reordered;
    });
  };

  // Publish toggle
  const handlePublish = () => {
    const next = !published;
    setPublished(next);
    startTransition(() => { togglePublish(form.id, next); });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border-mid); border-radius: 2px; }
        textarea, input[type=text], input[type=email], input[type=number], input[type=url] {
          outline: none;
          resize: none;
        }
        .field-row:hover .field-delete { opacity: 1 !important; }
      `}</style>

      <div suppressHydrationWarning style={{ display: "flex", height: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)" }}>
        <AppSidebar email={email} defaultCollapsed={true} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Top bar ── */}
        <div style={{
          height: "56px", display: "flex", alignItems: "center",
          borderBottom: "1px solid var(--border)",
          padding: "0 20px", gap: "16px", flexShrink: 0,
          background: "var(--surface-2)", position: "relative",
        }}>
          <Link href="/forms" style={{
            color: "var(--text-dim)", textDecoration: "none",
            fontSize: "12px", fontFamily: "var(--font-body)",
            transition: "color var(--duration) var(--ease)",
          }}>← Back</Link>

          <div style={{ width: "1px", height: "20px", background: "var(--text-faint)" }} />

          <input
            value={formTitle}
            onChange={(e) => {
              setFormTitle(e.target.value);
              saveTitle(e.target.value);
            }}
            style={{
              background: "transparent", border: "none",
              fontFamily: "var(--font-display)", fontSize: "15px",
              fontWeight: 700, color: "var(--text)", letterSpacing: "-0.3px",
              width: "200px",
            }}
            placeholder="Untitled Form"
          />

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
              { label: "Builder", href: `/forms/${form.id}/builder`, active: true },
              { label: "Responses", href: `/forms/${form.id}/responses`, active: false },
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

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
            <div style={{
              fontSize: "11px", color: "var(--text-dim)",
              fontFamily: "var(--font-body)",
            }}>
              {fields.length} question{fields.length !== 1 ? "s" : ""}
            </div>

            <button
              onClick={copyShareLink}
              style={{
                padding: "7px 16px",
                background: copied ? "var(--accent-dim)" : "transparent",
                border: `1px solid ${copied ? "var(--accent-border)" : "var(--border-strong)"}`,
                borderRadius: "var(--radius-sm)",
                color: copied ? "var(--accent)" : "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: "11px", cursor: "pointer",
                letterSpacing: "1px", textTransform: "uppercase",
                transition: "all var(--duration) var(--ease)",
              }}
            >
              {copied ? "Copied ✓" : "Copy Link"}
            </button>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "7px 16px",
                background: "transparent",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: "11px", cursor: "pointer",
                letterSpacing: "1px", textTransform: "uppercase",
                textDecoration: "none",
                transition: "all var(--duration) var(--ease)",
              }}
            >
              Preview ↗
            </a>

            <button
              onClick={handlePublish}
              style={{
                padding: "7px 16px",
                background: published ? "var(--accent-dim)" : "var(--accent)",
                border: `1px solid ${published ? "var(--accent-border)" : "var(--accent)"}`,
                borderRadius: "var(--radius-sm)",
                color: published ? "var(--accent)" : "var(--accent-text)",
                fontFamily: "var(--font-body)",
                fontSize: "11px", cursor: "pointer",
                letterSpacing: "1px", textTransform: "uppercase",
                transition: "all var(--duration) var(--ease)",
              }}
            >
              {published ? "● Live" : "Publish"}
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── Left panel ── */}
          <div style={{
            width: "260px", flexShrink: 0,
            borderRight: "1px solid var(--border)",
            display: "flex", flexDirection: "column",
            background: "var(--surface)", overflow: "hidden",
          }}>
            {/* Tab header */}
            <div style={{
              padding: "0 8px",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center",
              flexShrink: 0,
            }}>
              {(["questions", "style"] as const).map((t) => (
                <button key={t} onClick={() => setLeftTab(t)} style={{
                  flex: 1, padding: "12px 0", cursor: "pointer",
                  background: "transparent", border: "none",
                  borderBottom: leftTab === t ? "2px solid var(--accent)" : "2px solid transparent",
                  color: leftTab === t ? "var(--text)" : "var(--text-dim)",
                  fontFamily: "var(--font-body)", fontSize: "11px",
                  letterSpacing: "0.5px", textTransform: "capitalize",
                  transition: "all var(--duration) var(--ease)",
                  marginBottom: "-1px",
                }}>
                  {t === "questions" ? "Questions" : "Style"}
                </button>
              ))}
            </div>

            {leftTab === "questions" ? (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: "8px", display: "flex", flexDirection: "column" }}>
                  {fields.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "32px 16px" }}>
                      <div style={{ fontSize: "24px", opacity: 0.2 }}>⊞</div>
                      <div style={{ fontSize: "12px", color: "var(--text-faint)", textAlign: "center", lineHeight: 1.6 }}>
                        No questions yet
                      </div>
                      <button
                        onClick={() => setShowWidgetPicker(true)}
                        style={{
                          padding: "8px 16px", background: "transparent",
                          border: "1px dashed var(--border-mid)",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--text-dim)", fontFamily: "var(--font-body)",
                          fontSize: "12px", cursor: "pointer",
                          transition: "all var(--duration) var(--ease)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-border)";
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-mid)";
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)";
                        }}
                      >
                        + Add question
                      </button>
                    </div>
                  ) : (
                    <>
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                          {fields.map((field, idx) => (
                            <SortableFieldRow
                              key={field.id}
                              field={field}
                              index={idx}
                              isSelected={field.id === selectedId}
                              onSelect={() => setSelectedId(field.id)}
                              onDelete={() => handleDeleteField(field.id)}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                      <button
                        onClick={() => setShowWidgetPicker(true)}
                        style={{
                          margin: "4px 0 8px", padding: "var(--space-2) var(--space-3)",
                          background: "transparent",
                          border: "1px dashed var(--border-mid)",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--text-dim)", fontFamily: "var(--font-body)",
                          fontSize: "12px", cursor: "pointer",
                          transition: "all var(--duration) var(--ease)",
                          width: "100%",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-border)";
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-mid)";
                          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)";
                        }}
                      >
                        + Add question
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <FormStylePanel theme={formTheme} onChange={patchTheme} />
            )}
          </div>

          {/* ── Center: Field editor ── */}
          {(() => {
            const bg = (formTheme.background_color as string) ?? "#080808";
            const primary = (formTheme.primary_color as string) ?? "#CAFF00";
            const dFont = (formTheme.display_font as string) ?? "Syne";
            const bFont = (formTheme.body_font as string) ?? "DM Mono";
            const bRadius = (formTheme.button_radius as string) ?? "0px";
            const isLight = isLightColor(bg);
            const textColor = isLight ? "#1A1A1A" : "#F0EDE8";
            const textMuted = isLight ? "rgba(0,0,0,0.4)" : "rgba(240,237,232,0.45)";
            return (
              <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 32px", background: bg }}>
                {selectedField ? (
                  <FieldEditor
                    field={selectedField}
                    onChange={(updates) => patchField(selectedField.id, updates)}
                    theme={{ bg, primary, dFont, bFont, bRadius, textColor, textMuted }}
                  />
                ) : (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: "16px", height: "100%",
                    color: textMuted, fontSize: "13px", fontFamily: `'${bFont}', monospace`,
                  }}>
                    <div style={{ fontSize: "32px", opacity: 0.3 }}>⊞</div>
                    Select a question or add a new one
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Right: Settings ── */}
          {selectedField && (
            <div style={{
              width: "240px", flexShrink: 0,
              borderLeft: "1px solid var(--border)",
              background: "var(--surface)", overflowY: "auto",
              padding: "20px 16px",
              display: "flex", flexDirection: "column", gap: "24px",
            }}>
              <FieldSettings field={selectedField} allFields={fields} onChange={(updates) => patchField(selectedField.id, updates)} />
            </div>
          )}
        </div>
        </div>{/* end inner flex column */}
      </div>

      {/* ── Widget picker modal ── */}
      {showWidgetPicker && (
        <WidgetPicker
          onSelect={handleAddField}
          onClose={() => setShowWidgetPicker(false)}
        />
      )}
    </>
  );
}

// ─── Sortable field row ───────────────────────────────────────────────────────

function SortableFieldRow({
  field, index, isSelected, onSelect, onDelete,
}: {
  field: Field;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  return (
    <div
      ref={setNodeRef}
      className="field-row"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        display: "flex", alignItems: "center", gap: "8px",
        padding: "8px 10px",
        marginBottom: "2px",
        background: isSelected ? "var(--accent-dim)" : "transparent",
        border: `1px solid ${isSelected ? "var(--accent-border)" : "transparent"}`,
        cursor: "pointer",
        borderRadius: "var(--radius-xs)",
        position: "relative",
      }}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        style={{
          cursor: "grab", color: "var(--text-faint)",
          fontSize: "10px", lineHeight: 1, userSelect: "none",
          flexShrink: 0,
        }}
      >
        ⠿
      </div>

      {/* Number */}
      <div style={{
        width: "18px", height: "18px", flexShrink: 0,
        background: isSelected ? "var(--accent)" : "var(--text-faint)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "9px", fontWeight: 700,
        color: isSelected ? "var(--bg)" : "var(--text-muted)",
        fontFamily: "var(--font-display)",
      }}>
        {index + 1}
      </div>

      {/* Type icon */}
      <div style={{
        fontSize: "10px", color: isSelected ? "var(--accent)" : "var(--text-dim)",
        flexShrink: 0, width: "16px", textAlign: "center",
      }}>
        {getTypeIcon(field.type)}
      </div>

      {/* Title */}
      <div style={{
        flex: 1, fontSize: "12px", fontWeight: 300,
        color: isSelected ? "var(--text)" : "var(--text-muted)",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {field.title || <em style={{ opacity: 0.4 }}>Untitled</em>}
      </div>

      {/* Delete */}
      <button
        className="field-delete"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        style={{
          opacity: 0, background: "transparent", border: "none",
          color: "var(--text-dim)", cursor: "pointer",
          fontSize: "14px", padding: "0 2px", lineHeight: 1,
          transition: "opacity var(--duration) var(--ease)",
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ─── Field editor (center) ────────────────────────────────────────────────────

function FieldEditor({ field, onChange, theme: t }: { field: Field; onChange: (u: Partial<Field>) => void; theme: FormThemeTokens }) {
  return (
    <div style={{ width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Type + required badges */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          padding: "4px 10px",
          background: `${t.primary}18`,
          border: `1px solid ${t.primary}40`,
          borderRadius: t.bRadius || "4px",
          fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
          color: t.primary, fontFamily: `'${t.bFont}', monospace`,
        }}>
          {getTypeIcon(field.type)} {getTypeLabel(field.type)}
        </div>
        {field.required && (
          <div style={{
            padding: "4px 10px",
            background: "rgba(255,80,80,0.08)",
            border: "1px solid rgba(255,80,80,0.3)",
            borderRadius: t.bRadius || "4px",
            fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
            color: "rgba(255,120,120,0.9)", fontFamily: `'${t.bFont}', monospace`,
          }}>
            Required
          </div>
        )}
      </div>

      {/* Question number hint */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: 500, color: t.primary, fontFamily: `'${t.bFont}', monospace` }}>1</span>
        <span style={{ fontSize: "13px", color: t.textMuted }}>→</span>
      </div>

      {/* Title */}
      <textarea
        value={field.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Your question here..."
        rows={2}
        style={{
          background: "transparent", border: "none",
          fontFamily: `'${t.dFont}', sans-serif`, fontSize: "clamp(22px, 3.5vw, 34px)",
          fontWeight: 700, color: t.textColor, letterSpacing: "-0.5px",
          lineHeight: 1.2, width: "100%",
        }}
      />

      {/* Description */}
      <textarea
        value={field.description ?? ""}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Description (optional)"
        rows={2}
        style={{
          background: "transparent", border: "none",
          fontFamily: `'${t.bFont}', monospace`, fontSize: "14px",
          fontWeight: 300, color: t.textMuted, width: "100%",
          lineHeight: 1.7,
        }}
      />

      {/* Type-specific UI */}
      <FieldTypePreview field={field} onChange={onChange} theme={t} />

      {/* OK button */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
        <div style={{
          background: t.primary, color: t.bg,
          padding: "10px 24px", fontFamily: `'${t.dFont}', sans-serif`,
          fontSize: "13px", fontWeight: 700, letterSpacing: "0.5px",
          borderRadius: t.bRadius, pointerEvents: "none",
        }}>
          OK
        </div>
        <span style={{ fontSize: "11px", color: t.textMuted, fontFamily: `'${t.bFont}', monospace` }}>
          press Enter ↵
        </span>
      </div>
    </div>
  );
}

// ─── Field type preview ───────────────────────────────────────────────────────

function FieldTypePreview({ field, onChange, theme: t }: { field: Field; onChange: (u: Partial<Field>) => void; theme: FormThemeTokens }) {
  const inputStyle = {
    background: "transparent",
    borderBottom: `2px solid rgba(240,237,232,0.15)`,
    borderTop: "none", borderLeft: "none", borderRight: "none",
    color: t.textMuted, fontFamily: `'${t.bFont}', monospace`,
    fontSize: "clamp(16px, 2.5vw, 22px)", fontWeight: 300,
    padding: "10px 0", width: "100%",
    pointerEvents: "none" as const,
  };

  if (field.type === "short_text" || field.type === "email" || field.type === "phone" || field.type === "url" || field.type === "number") {
    return (
      <div style={{ ...inputStyle }}>
        {field.type === "email" ? "name@example.com" :
         field.type === "phone" ? "+1 (555) 000-0000" :
         field.type === "url" ? "https://" :
         field.type === "number" ? "0" :
         "Type your answer..."}
      </div>
    );
  }

  if (field.type === "long_text") {
    return (
      <div style={{
        background: "transparent", border: `1px solid rgba(240,237,232,0.1)`,
        padding: "14px", color: t.textMuted,
        fontFamily: `'${t.bFont}', monospace`, fontSize: "14px", fontWeight: 300,
        height: "120px", pointerEvents: "none",
      }}>
        Type your answer...
      </div>
    );
  }

  if (field.type === "date") {
    return <div style={{ ...inputStyle }}>MM / DD / YYYY</div>;
  }

  if (field.type === "yes_no") {
    return (
      <div style={{ display: "flex", gap: "12px" }}>
        {["Yes", "No"].map((opt) => (
          <div key={opt} style={{
            padding: "14px 40px", border: `1px solid rgba(240,237,232,0.15)`,
            borderRadius: t.bRadius,
            fontFamily: `'${t.dFont}', sans-serif`, fontWeight: 700, fontSize: "15px",
            color: t.textColor, pointerEvents: "none",
          }}>
            {opt}
          </div>
        ))}
      </div>
    );
  }

  if (field.type === "rating") {
    const steps = (field.config.steps as number) ?? 5;
    return (
      <div style={{ display: "flex", gap: "8px" }}>
        {Array.from({ length: steps }, (_, i) => (
          <div key={i} style={{
            width: "44px", height: "44px",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: i === 0 ? t.primary : `rgba(240,237,232,0.2)`, fontSize: "24px",
            pointerEvents: "none",
          }}>★</div>
        ))}
      </div>
    );
  }

  if (field.type === "opinion_scale") {
    const steps = (field.config.steps as number) ?? 10;
    return (
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {Array.from({ length: steps }, (_, i) => (
          <div key={i} style={{
            width: "44px", height: "44px",
            border: i === 0 ? `1px solid ${t.primary}` : `1px solid rgba(240,237,232,0.15)`,
            background: i === 0 ? t.primary : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px",
            color: i === 0 ? t.bg : "rgba(240,237,232,0.6)",
            fontFamily: `'${t.bFont}', monospace`,
            pointerEvents: "none",
          }}>
            {i + 1}
          </div>
        ))}
      </div>
    );
  }

  if (field.type === "multiple_choice" || field.type === "dropdown") {
    const choices = (field.config.choices as { id: string; label: string }[]) ?? [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {choices.map((choice, i) => (
          <div key={choice.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", border: `1px solid rgba(240,237,232,0.1)` }}>
            <div style={{
              width: "16px", height: "16px", flexShrink: 0,
              border: `1px solid rgba(240,237,232,0.2)`,
              borderRadius: field.type === "multiple_choice" && !(field.config.allow_multiple) ? "50%" : "0",
            }} />
            <input
              value={choice.label}
              onChange={(e) => {
                const updated = choices.map((c, idx) =>
                  idx === i ? { ...c, label: e.target.value } : c
                );
                onChange({ config: { ...field.config, choices: updated } });
              }}
              style={{
                background: "transparent", border: "none",
                color: t.textColor, fontFamily: `'${t.bFont}', monospace`,
                fontSize: "14px", fontWeight: 300, padding: "0",
                flex: 1,
              }}
            />
            <button
              onClick={() => {
                onChange({ config: { ...field.config, choices: choices.filter((_, idx) => idx !== i) } });
              }}
              style={{
                background: "transparent", border: "none",
                color: t.textMuted, cursor: "pointer", fontSize: "16px",
              }}
            >×</button>
          </div>
        ))}
        <button
          onClick={() => {
            const newChoice = { id: crypto.randomUUID(), label: `Option ${choices.length + 1}` };
            onChange({ config: { ...field.config, choices: [...choices, newChoice] } });
          }}
          style={{
            background: "transparent", border: `1px dashed rgba(240,237,232,0.15)`,
            color: t.textMuted, fontFamily: `'${t.bFont}', monospace`,
            fontSize: "12px", padding: "10px", cursor: "pointer",
            textAlign: "left", marginTop: "4px",
          }}
        >
          + Add option
        </button>
      </div>
    );
  }

  if (field.type === "statement" || field.type === "welcome_screen") {
    return (
      <div style={{
        padding: "20px",
        background: `${t.primary}10`,
        border: `1px solid ${t.primary}30`,
        borderRadius: t.bRadius || "4px",
        fontSize: "13px", color: t.textMuted,
        fontFamily: `'${t.bFont}', monospace`, lineHeight: 1.6,
      }}>
        {field.type === "welcome_screen"
          ? "This is the opening screen. Users will see a 'Start' button."
          : "This is a statement — no answer needed. Users press 'Continue'."}
      </div>
    );
  }

  if (field.type === "file_upload") {
    return (
      <div style={{
        border: "2px dashed rgba(240,237,232,0.1)", padding: "48px",
        textAlign: "center", color: t.textMuted,
        fontFamily: `'${t.bFont}', monospace`, fontSize: "14px",
      }}>
        ↑ Click or drag a file here
      </div>
    );
  }

  return null;
}

// ─── Field settings (right panel) ────────────────────────────────────────────

function FieldSettings({ field, allFields, onChange }: { field: Field; allFields: Field[]; onChange: (u: Partial<Field>) => void }) {
  return (
    <>
      <div>
        <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: "12px" }}>
          Field Settings
        </div>

        {/* Required toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 300 }}>Required</label>
          <button
            onClick={() => onChange({ required: !field.required })}
            style={{
              width: "36px", height: "20px",
              background: field.required ? "var(--accent)" : "var(--text-faint)",
              border: "none", borderRadius: "var(--radius-full)", cursor: "pointer",
              position: "relative", transition: "background var(--duration) var(--ease)",
            }}
          >
            <div style={{
              position: "absolute", top: "3px",
              left: field.required ? "19px" : "3px",
              width: "14px", height: "14px", borderRadius: "50%",
              background: field.required ? "var(--bg)" : "var(--text-dim)",
              transition: "left var(--duration) var(--ease)",
            }} />
          </button>
        </div>

        {/* Variable name */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
            Variable
          </label>
          <input
            type="text"
            value={field.variable ?? ""}
            onChange={(e) => onChange({ variable: e.target.value })}
            placeholder="e.g. first_name"
            style={{
              width: "100%", background: "var(--surface-3)",
              border: "1px solid var(--text-faint)",
              borderRadius: "var(--radius-xs)",
              color: "var(--text)", fontFamily: "var(--font-body)",
              fontSize: "12px", fontWeight: 300, padding: "var(--space-2) var(--space-2)",
            }}
          />
          <div style={{ fontSize: "10px", color: "var(--text-faint)", marginTop: "6px", lineHeight: 1.5 }}>
            Use {`{{${field.variable || "variable"}}}`} in later questions
          </div>
        </div>
      </div>

      {/* Type-specific settings */}
      {(field.type === "rating" || field.type === "opinion_scale") && (
        <div>
          <label style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
            Steps
          </label>
          <input
            type="number"
            min={2}
            max={field.type === "rating" ? 10 : 10}
            value={(field.config.steps as number) ?? (field.type === "rating" ? 5 : 10)}
            onChange={(e) => onChange({ config: { ...field.config, steps: parseInt(e.target.value) } })}
            style={{
              width: "100%", background: "var(--surface-3)",
              border: "1px solid var(--text-faint)",
              borderRadius: "var(--radius-xs)",
              color: "var(--text)", fontFamily: "var(--font-body)",
              fontSize: "12px", padding: "var(--space-2) var(--space-2)",
            }}
          />
        </div>
      )}

      {field.type === "multiple_choice" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 300 }}>Multiple select</label>
            <button
              onClick={() => onChange({ config: { ...field.config, allow_multiple: !field.config.allow_multiple } })}
              style={{
                width: "36px", height: "20px",
                background: field.config.allow_multiple ? "var(--accent)" : "var(--text-faint)",
                border: "none", borderRadius: "var(--radius-full)", cursor: "pointer",
                position: "relative", transition: "background var(--duration) var(--ease)",
              }}
            >
              <div style={{
                position: "absolute", top: "3px",
                left: field.config.allow_multiple ? "19px" : "3px",
                width: "14px", height: "14px", borderRadius: "50%",
                background: field.config.allow_multiple ? "var(--bg)" : "var(--text-dim)",
                transition: "left var(--duration) var(--ease)",
              }} />
            </button>
          </div>
        </div>
      )}

      {/* Logic branching — not for welcome/statement */}
      {field.type !== "welcome_screen" && field.type !== "statement" && (
        <LogicEditor field={field} allFields={allFields} onChange={onChange} />
      )}
    </>
  );
}

// ─── Logic editor ─────────────────────────────────────────────────────────────

type LogicJump = {
  id: string;
  operator: string;
  value: string;
  destination_field_id: string | null; // null = end of form
};

function LogicEditor({
  field,
  allFields,
  onChange,
}: {
  field: Field;
  allFields: Field[];
  onChange: (u: Partial<Field>) => void;
}) {
  const rules = ((field.logic ?? []) as LogicJump[]);
  const otherFields = allFields.filter((f) => f.id !== field.id);

  // Operators available per field type
  const operatorsFor = (type: string): { value: string; label: string }[] => {
    if (type === "yes_no") return [
      { value: "equals", label: "is" },
      { value: "is_filled", label: "is answered" },
    ];
    if (type === "multiple_choice" || type === "dropdown") return [
      { value: "equals", label: "is" },
      { value: "not_equals", label: "is not" },
      { value: "is_filled", label: "is answered" },
      { value: "is_empty", label: "is skipped" },
    ];
    if (type === "rating" || type === "opinion_scale" || type === "number") return [
      { value: "equals", label: "=" },
      { value: "not_equals", label: "≠" },
      { value: "greater_than", label: ">" },
      { value: "less_than", label: "<" },
      { value: "is_filled", label: "is answered" },
      { value: "is_empty", label: "is skipped" },
    ];
    if (type === "date") return [
      { value: "equals", label: "is exactly" },
      { value: "not_equals", label: "is not" },
      { value: "greater_than", label: "is after" },
      { value: "less_than", label: "is before" },
      { value: "is_filled", label: "is answered" },
      { value: "is_empty", label: "is skipped" },
    ];
    if (type === "short_text" || type === "long_text") return [
      { value: "equals", label: "equals" },
      { value: "not_equals", label: "does not equal" },
      { value: "contains", label: "contains" },
      { value: "is_filled", label: "is filled" },
      { value: "is_empty", label: "is empty" },
    ];
    // email, phone, url, file_upload
    return [
      { value: "is_filled", label: "is filled" },
      { value: "is_empty", label: "is empty" },
    ];
  };

  // Value options for choice-based fields
  const valueOptions = (): string[] => {
    if (field.type === "yes_no") return ["Yes", "No"];
    if (field.type === "multiple_choice" || field.type === "dropdown") {
      return ((field.config.choices as { id: string; label: string }[]) ?? []).map((c) => c.label);
    }
    return [];
  };

  const noValueNeeded = (op: string) =>
    op === "is_filled" || op === "is_empty" || op === "is_answered" || op === "is_skipped";

  const addRule = () => {
    const ops = operatorsFor(field.type);
    const newRule: LogicJump = {
      id: crypto.randomUUID(),
      operator: ops[0]?.value ?? "is_filled",
      value: valueOptions()[0] ?? "",
      destination_field_id: otherFields[0]?.id ?? null,
    };
    onChange({ logic: [...rules, newRule] });
  };

  const updateRule = (id: string, patch: Partial<LogicJump>) => {
    onChange({ logic: rules.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  };

  const deleteRule = (id: string) => {
    onChange({ logic: rules.filter((r) => r.id !== id) });
  };

  const operators = operatorsFor(field.type);
  const choices = valueOptions();
  const isChoiceBased = choices.length > 0;

  const labelStyle: React.CSSProperties = {
    fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
    color: "var(--text-dim)", marginBottom: "10px",
    fontFamily: "var(--font-body)",
  };

  const selectStyle: React.CSSProperties = {
    background: "var(--surface-3)", border: "1px solid var(--text-faint)",
    borderRadius: "var(--radius-xs)",
    color: "var(--text)", fontFamily: "var(--font-body)",
    fontSize: "11px", padding: "6px 8px", width: "100%",
    cursor: "pointer",
  };

  return (
    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
      <div style={labelStyle}>Logic</div>

      {rules.length === 0 && (
        <div style={{
          fontSize: "11px", color: "var(--text-faint)",
          marginBottom: "12px", lineHeight: 1.6,
        }}>
          No rules yet. Add a rule to control where users go based on their answer.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
        {rules.map((rule) => (
          <div key={rule.id} style={{
            background: "var(--surface-3)", border: "1px solid var(--border)",
            padding: "10px", display: "flex", flexDirection: "column", gap: "6px",
          }}>
            {/* IF row */}
            <div style={{ fontSize: "10px", color: "var(--text-dim)", letterSpacing: "1px" }}>IF answer</div>

            {/* Operator */}
            <select
              value={rule.operator}
              onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
              style={selectStyle}
            >
              {operators.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>

            {/* Value */}
            {!noValueNeeded(rule.operator) && (
              isChoiceBased ? (
                <select
                  value={rule.value}
                  onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  style={selectStyle}
                >
                  {choices.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={rule.value}
                  onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  placeholder="value"
                  style={{ ...selectStyle, padding: "6px 8px" }}
                />
              )
            )}

            {/* THEN row */}
            <div style={{ fontSize: "10px", color: "var(--text-dim)", letterSpacing: "1px", marginTop: "2px" }}>THEN jump to</div>
            <select
              value={rule.destination_field_id ?? "__end__"}
              onChange={(e) => updateRule(rule.id, {
                destination_field_id: e.target.value === "__end__" ? null : e.target.value,
              })}
              style={selectStyle}
            >
              <option value="__end__">End of form</option>
              {otherFields.map((f, i) => (
                <option key={f.id} value={f.id}>
                  Q{i + 1 + (allFields.findIndex(af => af.id === f.id) > allFields.findIndex(af => af.id === field.id) ? 0 : -1)}: {f.title || "Untitled"}
                </option>
              ))}
            </select>

            {/* Delete */}
            <button
              onClick={() => deleteRule(rule.id)}
              style={{
                background: "transparent", border: "none",
                color: "var(--text-faint)", cursor: "pointer",
                fontSize: "11px", textAlign: "left", padding: "0",
                marginTop: "2px",
              }}
            >
              × Remove rule
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addRule}
        style={{
          background: "transparent", border: "1px dashed var(--border-mid)",
          color: "var(--text-dim)", fontFamily: "var(--font-body)",
          fontSize: "11px", padding: "8px", cursor: "pointer", width: "100%",
          transition: "all var(--duration) var(--ease)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-border)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-mid)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)";
        }}
      >
        + Add rule
      </button>
    </div>
  );
}

// ─── Widget picker modal ──────────────────────────────────────────────────────

function WidgetPicker({ onSelect, onClose }: { onSelect: (type: string) => void; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(8,8,8,0.85)", /* modal backdrop — intentionally direct */
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface-3)", border: "1px solid var(--border-mid)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-6)", width: "480px", maxHeight: "70vh", overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-5)",
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, letterSpacing: "-0.3px" }}>
            Add Question
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "20px" }}>×</button>
        </div>

        {WIDGET_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: "20px" }}>
            <div style={{
              fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
              color: "var(--text-dim)", marginBottom: "10px",
              fontFamily: "var(--font-body)",
            }}>
              {group.label}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {group.types.map((t) => (
                <button
                  key={t.type}
                  onClick={() => onSelect(t.type)}
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--text)", cursor: "pointer",
                    padding: "var(--space-3) var(--space-2)", textAlign: "left",
                    display: "flex", flexDirection: "column", gap: "6px",
                    transition: "all var(--duration) var(--ease)",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent-border)";
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-dim)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--surface)";
                  }}
                >
                  <span style={{ fontSize: "16px", color: "var(--text-muted)" }}>{t.icon}</span>
                  <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)" }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Form Style Panel ──────────────────────────────────────────────────────────

const FORM_FONTS = [
  { id: "Syne", label: "Syne" },
  { id: "DM Sans", label: "DM Sans" },
  { id: "Inter", label: "Inter" },
  { id: "Space Grotesk", label: "Space Grotesk" },
  { id: "Playfair Display", label: "Playfair" },
];

const FORM_BODY_FONTS = [
  { id: "DM Mono", label: "DM Mono" },
  { id: "Inter", label: "Inter" },
  { id: "Instrument Sans", label: "Instrument" },
  { id: "IBM Plex Mono", label: "IBM Plex Mono" },
];

const RADIUS_PRESETS = [
  { label: "Sharp", value: "0px" },
  { label: "Subtle", value: "4px" },
  { label: "Rounded", value: "8px" },
  { label: "Soft", value: "12px" },
];

const PALETTE_PRESETS = [
  { bg: "#080808", primary: "#CAFF00", label: "Hacker" },
  { bg: "#0F0F1A", primary: "#A78BFA", label: "Violet" },
  { bg: "#FDF6EE", primary: "#E07A4F", label: "Linen" },
  { bg: "#F5F5F0", primary: "#4A7C59", label: "Sage" },
  { bg: "#0A0A0A", primary: "#60A5FA", label: "Cobalt" },
  { bg: "#1A0F0F", primary: "#FB923C", label: "Ember" },
];

function StyleLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase",
      color: "var(--text-dim)", marginBottom: "8px", fontFamily: "var(--font-body)",
    }}>
      {children}
    </div>
  );
}

function FormStylePanel({ theme, onChange }: {
  theme: Record<string, unknown>;
  onChange: (updates: Record<string, unknown>) => void;
}) {
  const bg = (theme.background_color as string) ?? "#080808";
  const primary = (theme.primary_color as string) ?? "#CAFF00";
  const displayFont = (theme.display_font as string) ?? "Syne";
  const bodyFont = (theme.body_font as string) ?? "DM Mono";
  const radius = (theme.button_radius as string) ?? "0px";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Palette presets */}
      <div>
        <StyleLabel>Palette</StyleLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
          {PALETTE_PRESETS.map((p) => {
            const active = bg === p.bg && primary === p.primary;
            return (
              <button
                key={p.label}
                onClick={() => onChange({ background_color: p.bg, primary_color: p.primary })}
                title={p.label}
                style={{
                  height: "40px", borderRadius: "4px", cursor: "pointer",
                  border: active ? "2px solid var(--accent)" : "2px solid transparent",
                  background: p.bg, position: "relative", overflow: "hidden",
                  transition: "border-color var(--duration) var(--ease)",
                }}
              >
                <span style={{
                  position: "absolute", bottom: "5px", right: "5px",
                  width: "10px", height: "10px", borderRadius: "50%",
                  background: p.primary,
                }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div>
        <StyleLabel>Colors</StyleLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Background</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "10px", color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>{bg}</span>
              <input
                type="color"
                value={bg}
                onChange={(e) => onChange({ background_color: e.target.value })}
                style={{ width: "24px", height: "24px", border: "none", borderRadius: "4px", cursor: "pointer", padding: 0 }}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>Accent</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "10px", color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>{primary}</span>
              <input
                type="color"
                value={primary}
                onChange={(e) => onChange({ primary_color: e.target.value })}
                style={{ width: "24px", height: "24px", border: "none", borderRadius: "4px", cursor: "pointer", padding: 0 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Display font */}
      <div>
        <StyleLabel>Display font</StyleLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {FORM_FONTS.map((f) => {
            const active = displayFont === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onChange({ display_font: f.id })}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: active ? "var(--accent-dim)" : "transparent",
                  border: active ? "1px solid var(--accent-border)" : "1px solid transparent",
                  borderRadius: "var(--radius-sm)",
                  padding: "6px 10px", cursor: "pointer",
                  color: active ? "var(--text)" : "var(--text-muted)",
                  fontFamily: "var(--font-body)", fontSize: "12px",
                  transition: "all var(--duration) var(--ease)",
                }}
              >
                <span>{f.label}</span>
                <span style={{ fontFamily: `'${f.id}', sans-serif`, fontSize: "15px", fontWeight: 700 }}>Aa</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body font */}
      <div>
        <StyleLabel>Body font</StyleLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {FORM_BODY_FONTS.map((f) => {
            const active = bodyFont === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onChange({ body_font: f.id })}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: active ? "var(--accent-dim)" : "transparent",
                  border: active ? "1px solid var(--accent-border)" : "1px solid transparent",
                  borderRadius: "var(--radius-sm)",
                  padding: "6px 10px", cursor: "pointer",
                  color: active ? "var(--text)" : "var(--text-muted)",
                  fontFamily: "var(--font-body)", fontSize: "12px",
                  transition: "all var(--duration) var(--ease)",
                }}
              >
                <span>{f.label}</span>
                <span style={{ fontFamily: `'${f.id}', monospace`, fontSize: "13px" }}>Aa</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Border radius */}
      <div>
        <StyleLabel>Roundness</StyleLabel>
        <div style={{ display: "flex", gap: "6px" }}>
          {RADIUS_PRESETS.map((r) => {
            const active = radius === r.value;
            return (
              <button
                key={r.value}
                onClick={() => onChange({ button_radius: r.value })}
                title={r.label}
                style={{
                  flex: 1, aspectRatio: "1", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: active ? "var(--accent-dim)" : "var(--surface-2)",
                  border: active ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                  borderRadius: r.value,
                  transition: "all var(--duration) var(--ease)",
                }}
              >
                <span style={{
                  width: "12px", height: "12px",
                  background: active ? "var(--accent)" : "var(--border-strong)",
                  borderRadius: r.value,
                  transition: "all var(--duration) var(--ease)",
                }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Live preview swatch */}
      <div>
        <StyleLabel>Preview</StyleLabel>
        <div style={{
          borderRadius: "6px", overflow: "hidden",
          border: "1px solid var(--border)",
        }}>
          <div style={{ background: bg, padding: "16px" }}>
            <div style={{
              fontSize: "13px", fontWeight: 700, color: "#F0EDE8",
              fontFamily: `'${displayFont}', sans-serif`,
              marginBottom: "8px",
            }}>
              What is your name?
            </div>
            <div style={{
              borderBottom: `2px solid ${primary}`,
              paddingBottom: "4px",
              fontSize: "12px", color: "rgba(240,237,232,0.5)",
              fontFamily: `'${bodyFont}', monospace`,
            }}>
              Type your answer...
            </div>
            <button style={{
              marginTop: "12px",
              background: primary, color: bg,
              border: "none", padding: "6px 16px",
              fontFamily: `'${displayFont}', sans-serif`,
              fontSize: "11px", fontWeight: 700, cursor: "pointer",
              borderRadius: radius,
            }}>
              OK
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
