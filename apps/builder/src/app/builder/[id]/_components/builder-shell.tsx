"use client";

import { useState, useCallback, useTransition, useRef } from "react";
import Link from "next/link";
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

export function BuilderShell({ form, initialFields }: { form: Form; initialFields: Field[] }) {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [selectedId, setSelectedId] = useState<string | null>(initialFields[0]?.id ?? null);
  const [formTitle, setFormTitle] = useState(form.title);
  const [published, setPublished] = useState(form.published);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [, startTransition] = useTransition();

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
        ::-webkit-scrollbar-thumb { background: rgba(240,237,232,0.1); border-radius: 2px; }
        textarea, input[type=text], input[type=email], input[type=number], input[type=url] {
          outline: none;
          resize: none;
        }
        .field-row:hover .field-delete { opacity: 1 !important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#080808", color: "#F0EDE8", fontFamily: "'DM Mono', monospace" }}>

        {/* ── Top bar ── */}
        <div style={{
          height: "56px", display: "flex", alignItems: "center",
          borderBottom: "1px solid rgba(240,237,232,0.06)",
          padding: "0 20px", gap: "16px", flexShrink: 0,
          background: "#0A0A0A",
        }}>
          <Link href="/dashboard" style={{
            display: "flex", alignItems: "center", gap: "6px",
            color: "rgba(240,237,232,0.3)", textDecoration: "none",
            fontSize: "12px", fontFamily: "'DM Mono', monospace",
            transition: "color 0.12s",
          }}>
            ← Back
          </Link>

          <div style={{ width: "1px", height: "20px", background: "rgba(240,237,232,0.08)" }} />

          <input
            value={formTitle}
            onChange={(e) => {
              setFormTitle(e.target.value);
              saveTitle(e.target.value);
            }}
            style={{
              background: "transparent", border: "none",
              fontFamily: "'Syne', sans-serif", fontSize: "15px",
              fontWeight: 700, color: "#F0EDE8", letterSpacing: "-0.3px",
              width: "200px",
            }}
            placeholder="Untitled Form"
          />

          {/* Tab switcher */}
          <div style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
            {["Builder", "Responses"].map((tab) => {
              const active = tab === "Builder";
              const href = tab === "Responses"
                ? `/builder/${form.id}/responses`
                : `/builder/${form.id}`;
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

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
            <div style={{
              fontSize: "11px", color: "rgba(240,237,232,0.25)",
              fontFamily: "'DM Mono', monospace",
            }}>
              {fields.length} question{fields.length !== 1 ? "s" : ""}
            </div>

            <a
              href={`http://localhost:3001/f/${form.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "7px 16px",
                background: "transparent",
                border: "1px solid rgba(240,237,232,0.12)",
                color: "rgba(240,237,232,0.5)",
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px", cursor: "pointer",
                letterSpacing: "1px", textTransform: "uppercase",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              Preview ↗
            </a>

            <button
              onClick={handlePublish}
              style={{
                padding: "7px 16px",
                background: published ? "rgba(202,255,0,0.1)" : "transparent",
                border: `1px solid ${published ? "rgba(202,255,0,0.3)" : "rgba(240,237,232,0.12)"}`,
                color: published ? "#CAFF00" : "rgba(240,237,232,0.5)",
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px", cursor: "pointer",
                letterSpacing: "1px", textTransform: "uppercase",
                transition: "all 0.15s",
              }}
            >
              {published ? "● Live" : "Publish"}
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── Left: Field list ── */}
          <div style={{
            width: "260px", flexShrink: 0,
            borderRight: "1px solid rgba(240,237,232,0.06)",
            display: "flex", flexDirection: "column",
            background: "#0D0D0D", overflow: "hidden",
          }}>
            <div style={{
              padding: "14px 16px 10px",
              borderBottom: "1px solid rgba(240,237,232,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(240,237,232,0.25)" }}>
                Questions
              </span>
              <button
                onClick={() => setShowWidgetPicker(true)}
                style={{
                  background: "#CAFF00", border: "none", color: "#080808",
                  width: "22px", height: "22px", cursor: "pointer",
                  fontSize: "16px", lineHeight: 1, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                +
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
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

              {fields.length === 0 && (
                <div style={{
                  padding: "32px 16px", textAlign: "center",
                  fontSize: "12px", color: "rgba(240,237,232,0.2)",
                  lineHeight: 1.6,
                }}>
                  No questions yet.<br />Hit + to add one.
                </div>
              )}
            </div>

            <button
              onClick={() => setShowWidgetPicker(true)}
              style={{
                margin: "12px", padding: "10px",
                background: "transparent",
                border: "1px dashed rgba(240,237,232,0.1)",
                color: "rgba(240,237,232,0.3)",
                fontFamily: "'DM Mono', monospace",
                fontSize: "12px", cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(202,255,0,0.3)";
                (e.currentTarget as HTMLButtonElement).style.color = "#CAFF00";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,237,232,0.1)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,237,232,0.3)";
              }}
            >
              + Add question
            </button>
          </div>

          {/* ── Center: Field editor ── */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 32px" }}>
            {selectedField ? (
              <FieldEditor field={selectedField} onChange={(updates) => patchField(selectedField.id, updates)} />
            ) : (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: "16px", height: "100%",
                color: "rgba(240,237,232,0.2)", fontSize: "13px",
              }}>
                <div style={{ fontSize: "32px", opacity: 0.3 }}>⊞</div>
                Select a question or add a new one
              </div>
            )}
          </div>

          {/* ── Right: Settings ── */}
          {selectedField && (
            <div style={{
              width: "240px", flexShrink: 0,
              borderLeft: "1px solid rgba(240,237,232,0.06)",
              background: "#0D0D0D", overflowY: "auto",
              padding: "20px 16px",
              display: "flex", flexDirection: "column", gap: "24px",
            }}>
              <FieldSettings field={selectedField} allFields={fields} onChange={(updates) => patchField(selectedField.id, updates)} />
            </div>
          )}
        </div>
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
        background: isSelected ? "rgba(202,255,0,0.06)" : "transparent",
        border: `1px solid ${isSelected ? "rgba(202,255,0,0.15)" : "transparent"}`,
        cursor: "pointer",
        borderRadius: "2px",
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
          cursor: "grab", color: "rgba(240,237,232,0.2)",
          fontSize: "10px", lineHeight: 1, userSelect: "none",
          flexShrink: 0,
        }}
      >
        ⠿
      </div>

      {/* Number */}
      <div style={{
        width: "18px", height: "18px", flexShrink: 0,
        background: isSelected ? "#CAFF00" : "rgba(240,237,232,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "9px", fontWeight: 700,
        color: isSelected ? "#080808" : "rgba(240,237,232,0.4)",
        fontFamily: "'Syne', sans-serif",
      }}>
        {index + 1}
      </div>

      {/* Type icon */}
      <div style={{
        fontSize: "10px", color: isSelected ? "#CAFF00" : "rgba(240,237,232,0.3)",
        flexShrink: 0, width: "16px", textAlign: "center",
      }}>
        {getTypeIcon(field.type)}
      </div>

      {/* Title */}
      <div style={{
        flex: 1, fontSize: "12px", fontWeight: 300,
        color: isSelected ? "#F0EDE8" : "rgba(240,237,232,0.5)",
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
          color: "rgba(240,237,232,0.3)", cursor: "pointer",
          fontSize: "14px", padding: "0 2px", lineHeight: 1,
          transition: "opacity 0.12s",
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ─── Field editor (center) ────────────────────────────────────────────────────

function FieldEditor({ field, onChange }: { field: Field; onChange: (u: Partial<Field>) => void }) {
  return (
    <div style={{ width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Type label */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          padding: "4px 10px", background: "rgba(202,255,0,0.08)",
          border: "1px solid rgba(202,255,0,0.15)",
          fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
          color: "#CAFF00", fontFamily: "'DM Mono', monospace",
        }}>
          {getTypeIcon(field.type)} {getTypeLabel(field.type)}
        </div>
        {field.required && (
          <div style={{
            padding: "4px 10px", background: "rgba(255,100,100,0.06)",
            border: "1px solid rgba(255,100,100,0.15)",
            fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
            color: "rgba(255,100,100,0.7)", fontFamily: "'DM Mono', monospace",
          }}>
            Required
          </div>
        )}
      </div>

      {/* Title */}
      <textarea
        value={field.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Your question here..."
        rows={2}
        style={{
          background: "transparent", border: "none",
          fontFamily: "'Syne', sans-serif", fontSize: "28px",
          fontWeight: 700, color: "#F0EDE8", letterSpacing: "-0.5px",
          lineHeight: 1.3, width: "100%",
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
          fontFamily: "'DM Mono', monospace", fontSize: "14px",
          fontWeight: 300, color: "rgba(240,237,232,0.4)", width: "100%",
          lineHeight: 1.6,
        }}
      />

      <div style={{ height: "1px", background: "rgba(240,237,232,0.06)" }} />

      {/* Type-specific UI */}
      <FieldTypePreview field={field} onChange={onChange} />
    </div>
  );
}

// ─── Field type preview ───────────────────────────────────────────────────────

function FieldTypePreview({ field, onChange }: { field: Field; onChange: (u: Partial<Field>) => void }) {
  const inputStyle = {
    background: "#111111", border: "1px solid rgba(240,237,232,0.08)",
    color: "rgba(240,237,232,0.3)", fontFamily: "'DM Mono', monospace",
    fontSize: "14px", fontWeight: 300,
    padding: "14px 16px", width: "100%",
    pointerEvents: "none" as const,
  };

  if (field.type === "short_text" || field.type === "email" || field.type === "phone" || field.type === "url" || field.type === "number") {
    return (
      <div style={{ ...inputStyle }}>
        {field.type === "email" ? "name@example.com" :
         field.type === "phone" ? "+1 (555) 000-0000" :
         field.type === "url" ? "https://" :
         field.type === "number" ? "0" :
         "Type your answer here..."}
      </div>
    );
  }

  if (field.type === "long_text") {
    return (
      <div style={{ ...inputStyle, height: "120px", display: "flex", alignItems: "flex-start" }}>
        Type your answer here...
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
            padding: "12px 32px", border: "1px solid rgba(240,237,232,0.1)",
            fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "14px",
            color: "rgba(240,237,232,0.4)",
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
            width: "40px", height: "40px",
            border: "1px solid rgba(240,237,232,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(240,237,232,0.3)", fontSize: "18px",
          }}>★</div>
        ))}
      </div>
    );
  }

  if (field.type === "opinion_scale") {
    const steps = (field.config.steps as number) ?? 10;
    return (
      <div style={{ display: "flex", gap: "6px" }}>
        {Array.from({ length: steps }, (_, i) => (
          <div key={i} style={{
            width: "36px", height: "36px",
            border: "1px solid rgba(240,237,232,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", color: "rgba(240,237,232,0.3)",
            fontFamily: "'DM Mono', monospace",
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
          <div key={choice.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "18px", height: "18px", flexShrink: 0,
              border: "1px solid rgba(240,237,232,0.15)",
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
                borderBottom: "1px solid rgba(240,237,232,0.08)",
                color: "#F0EDE8", fontFamily: "'DM Mono', monospace",
                fontSize: "14px", fontWeight: 300, padding: "6px 0",
                flex: 1,
              }}
            />
            <button
              onClick={() => {
                onChange({ config: { ...field.config, choices: choices.filter((_, idx) => idx !== i) } });
              }}
              style={{
                background: "transparent", border: "none",
                color: "rgba(240,237,232,0.2)", cursor: "pointer", fontSize: "16px",
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
            background: "transparent", border: "1px dashed rgba(240,237,232,0.1)",
            color: "rgba(240,237,232,0.3)", fontFamily: "'DM Mono', monospace",
            fontSize: "12px", padding: "8px", cursor: "pointer",
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
        padding: "20px", background: "rgba(202,255,0,0.04)",
        border: "1px solid rgba(202,255,0,0.08)",
        fontSize: "13px", color: "rgba(240,237,232,0.3)",
        fontFamily: "'DM Mono', monospace", lineHeight: 1.6,
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
        border: "2px dashed rgba(240,237,232,0.1)", padding: "40px",
        textAlign: "center", color: "rgba(240,237,232,0.2)",
        fontFamily: "'DM Mono', monospace", fontSize: "13px",
      }}>
        ↑ Drop file here or click to upload
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
        <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(240,237,232,0.25)", marginBottom: "12px" }}>
          Field Settings
        </div>

        {/* Required toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "rgba(240,237,232,0.5)", fontWeight: 300 }}>Required</label>
          <button
            onClick={() => onChange({ required: !field.required })}
            style={{
              width: "36px", height: "20px",
              background: field.required ? "#CAFF00" : "rgba(240,237,232,0.08)",
              border: "none", borderRadius: "10px", cursor: "pointer",
              position: "relative", transition: "background 0.15s",
            }}
          >
            <div style={{
              position: "absolute", top: "3px",
              left: field.required ? "19px" : "3px",
              width: "14px", height: "14px", borderRadius: "50%",
              background: field.required ? "#080808" : "rgba(240,237,232,0.3)",
              transition: "left 0.15s",
            }} />
          </button>
        </div>

        {/* Variable name */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(240,237,232,0.25)", display: "block", marginBottom: "6px" }}>
            Variable
          </label>
          <input
            type="text"
            value={field.variable ?? ""}
            onChange={(e) => onChange({ variable: e.target.value })}
            placeholder="e.g. first_name"
            style={{
              width: "100%", background: "#111111",
              border: "1px solid rgba(240,237,232,0.08)",
              color: "#F0EDE8", fontFamily: "'DM Mono', monospace",
              fontSize: "12px", fontWeight: 300, padding: "8px 10px",
            }}
          />
          <div style={{ fontSize: "10px", color: "rgba(240,237,232,0.2)", marginTop: "6px", lineHeight: 1.5 }}>
            Use {`{{${field.variable || "variable"}}}`} in later questions
          </div>
        </div>
      </div>

      {/* Type-specific settings */}
      {(field.type === "rating" || field.type === "opinion_scale") && (
        <div>
          <label style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(240,237,232,0.25)", display: "block", marginBottom: "6px" }}>
            Steps
          </label>
          <input
            type="number"
            min={2}
            max={field.type === "rating" ? 10 : 10}
            value={(field.config.steps as number) ?? (field.type === "rating" ? 5 : 10)}
            onChange={(e) => onChange({ config: { ...field.config, steps: parseInt(e.target.value) } })}
            style={{
              width: "100%", background: "#111111",
              border: "1px solid rgba(240,237,232,0.08)",
              color: "#F0EDE8", fontFamily: "'DM Mono', monospace",
              fontSize: "12px", padding: "8px 10px",
            }}
          />
        </div>
      )}

      {field.type === "multiple_choice" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ fontSize: "12px", color: "rgba(240,237,232,0.5)", fontWeight: 300 }}>Multiple select</label>
            <button
              onClick={() => onChange({ config: { ...field.config, allow_multiple: !field.config.allow_multiple } })}
              style={{
                width: "36px", height: "20px",
                background: field.config.allow_multiple ? "#CAFF00" : "rgba(240,237,232,0.08)",
                border: "none", borderRadius: "10px", cursor: "pointer",
                position: "relative", transition: "background 0.15s",
              }}
            >
              <div style={{
                position: "absolute", top: "3px",
                left: field.config.allow_multiple ? "19px" : "3px",
                width: "14px", height: "14px", borderRadius: "50%",
                background: field.config.allow_multiple ? "#080808" : "rgba(240,237,232,0.3)",
                transition: "left 0.15s",
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
    color: "rgba(240,237,232,0.25)", marginBottom: "10px",
    fontFamily: "'DM Mono', monospace",
  };

  const selectStyle: React.CSSProperties = {
    background: "#111111", border: "1px solid rgba(240,237,232,0.08)",
    color: "#F0EDE8", fontFamily: "'DM Mono', monospace",
    fontSize: "11px", padding: "6px 8px", width: "100%",
    cursor: "pointer",
  };

  return (
    <div style={{ borderTop: "1px solid rgba(240,237,232,0.06)", paddingTop: "20px" }}>
      <div style={labelStyle}>Logic</div>

      {rules.length === 0 && (
        <div style={{
          fontSize: "11px", color: "rgba(240,237,232,0.2)",
          marginBottom: "12px", lineHeight: 1.6,
        }}>
          No rules yet. Add a rule to control where users go based on their answer.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
        {rules.map((rule) => (
          <div key={rule.id} style={{
            background: "#111111", border: "1px solid rgba(240,237,232,0.06)",
            padding: "10px", display: "flex", flexDirection: "column", gap: "6px",
          }}>
            {/* IF row */}
            <div style={{ fontSize: "10px", color: "rgba(240,237,232,0.25)", letterSpacing: "1px" }}>IF answer</div>

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
            <div style={{ fontSize: "10px", color: "rgba(240,237,232,0.25)", letterSpacing: "1px", marginTop: "2px" }}>THEN jump to</div>
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
                color: "rgba(240,237,232,0.2)", cursor: "pointer",
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
          background: "transparent", border: "1px dashed rgba(240,237,232,0.1)",
          color: "rgba(240,237,232,0.3)", fontFamily: "'DM Mono', monospace",
          fontSize: "11px", padding: "8px", cursor: "pointer", width: "100%",
          transition: "all 0.12s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(202,255,0,0.3)";
          (e.currentTarget as HTMLButtonElement).style.color = "#CAFF00";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,237,232,0.1)";
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,237,232,0.3)";
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
        background: "rgba(8,8,8,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#111111", border: "1px solid rgba(240,237,232,0.1)",
          padding: "24px", width: "480px", maxHeight: "70vh", overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px",
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 700, letterSpacing: "-0.3px" }}>
            Add Question
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "rgba(240,237,232,0.3)", cursor: "pointer", fontSize: "20px" }}>×</button>
        </div>

        {WIDGET_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: "20px" }}>
            <div style={{
              fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
              color: "rgba(240,237,232,0.25)", marginBottom: "10px",
              fontFamily: "'DM Mono', monospace",
            }}>
              {group.label}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {group.types.map((t) => (
                <button
                  key={t.type}
                  onClick={() => onSelect(t.type)}
                  style={{
                    background: "#0D0D0D", border: "1px solid rgba(240,237,232,0.06)",
                    color: "#F0EDE8", cursor: "pointer",
                    padding: "12px 10px", textAlign: "left",
                    display: "flex", flexDirection: "column", gap: "6px",
                    transition: "all 0.12s",
                    fontFamily: "'DM Mono', monospace",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(202,255,0,0.25)";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(202,255,0,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,237,232,0.06)";
                    (e.currentTarget as HTMLButtonElement).style.background = "#0D0D0D";
                  }}
                >
                  <span style={{ fontSize: "16px", color: "rgba(240,237,232,0.4)" }}>{t.icon}</span>
                  <span style={{ fontSize: "11px", fontWeight: 400, color: "rgba(240,237,232,0.6)" }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
