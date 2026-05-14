"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVariant } from "../../builder/variant-actions";

const LABELS = ["A", "B", "C", "D", "E", "F"];

type Props = {
  formId: string;
  groupId: string;
  existingLabels: string[];
  baseType: string;
  baseTitle: string;
};

export function AddVariantButton({ formId, groupId, existingLabels, baseType, baseTitle }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const nextLabel = LABELS.find(l => !existingLabels.includes(l));
  if (!nextLabel) return null; // max 6 variants reached

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const result = await createVariant(formId, groupId, {
        variant_label: nextLabel!,
        title: baseTitle,
        type: baseType,
      });
      if (!result) {
        setError("Failed to add variant");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
      <button
        onClick={handleAdd}
        disabled={pending}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "6px 14px",
          background: "transparent",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-sm)",
          color: pending ? "var(--text-faint)" : "var(--text-muted)",
          fontFamily: "var(--font-body)",
          fontSize: "12px", letterSpacing: "0.3px",
          cursor: pending ? "not-allowed" : "pointer",
          transition: "all var(--duration) var(--ease)",
        }}
        onMouseEnter={(e) => { if (!pending) { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--text)"; } }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = pending ? "var(--text-faint)" : "var(--text-muted)"; }}
      >
        <span style={{ fontSize: "14px", lineHeight: 1 }}>+</span>
        {pending ? "Adding…" : `Add Variant ${nextLabel}`}
      </button>
      {error && <span style={{ fontSize: "11px", color: "var(--accent)" }}>{error}</span>}
    </div>
  );
}
