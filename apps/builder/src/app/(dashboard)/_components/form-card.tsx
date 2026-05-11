"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteForm } from "../forms/actions";

type Form = {
  id: string;
  title: string;
  published: boolean;
  updated_at: string;
  response_count?: number;
};

export function FormCard({ form }: { form: Form }) {
  const updatedAt = new Date(form.updated_at);
  const timeAgo = getTimeAgo(updatedAt);
  const [pending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${form.title}"? This cannot be undone.`)) return;
    startTransition(() => { deleteForm(form.id); });
  };

  return (
    <Link href={`/forms/${form.id}/builder`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "var(--surface-3)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-6)",
          cursor: "pointer",
          transition: "all var(--duration) var(--ease)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          height: "160px",
          position: "relative",
          overflow: "hidden",
          opacity: pending ? 0.4 : 1,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-border)";
          (e.currentTarget as HTMLDivElement).style.background = "var(--surface-4)";
          const btn = (e.currentTarget as HTMLDivElement).querySelector(".card-delete") as HTMLElement | null;
          if (btn) btn.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLDivElement).style.background = "var(--surface-3)";
          const btn = (e.currentTarget as HTMLDivElement).querySelector(".card-delete") as HTMLElement | null;
          if (btn) btn.style.opacity = "0";
        }}
      >
        {/* Status pill + delete button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-1)",
            padding: "3px var(--space-2)",
            background: form.published ? "var(--accent-dim)" : "var(--border)",
            border: `1px solid ${form.published ? "var(--accent-border)" : "var(--text-faint)"}`,
            borderRadius: "var(--radius-full)",
          }}>
            <div style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: form.published ? "var(--accent)" : "var(--text-dim)",
            }} />
            <span style={{
              fontSize: "10px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: form.published ? "var(--accent)" : "var(--text-dim)",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
            }}>
              {form.published ? "Live" : "Draft"}
            </span>
          </div>

          <span style={{
            fontSize: "11px",
            color: "var(--text-faint)",
            fontFamily: "var(--font-body)",
            fontWeight: 300,
          }}>
            {form.response_count ?? 0} responses
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "17px",
          fontWeight: 700,
          color: "var(--text)",
          letterSpacing: "-0.3px",
          lineHeight: 1.3,
          flex: 1,
        }}>
          {form.title}
        </div>

        {/* Footer */}
        <div style={{
          fontSize: "11px",
          color: "var(--text-faint)",
          fontFamily: "var(--font-body)",
          fontWeight: 300,
        }}>
          Edited {timeAgo}
        </div>

        {/* Delete button — visible on hover */}
        <button
          className="card-delete"
          onClick={handleDelete}
          title="Delete form"
          style={{
            position: "absolute",
            bottom: "var(--space-4)",
            right: "var(--space-4)",
            background: "transparent",
            border: "1px solid var(--text-faint)",
            borderRadius: "var(--radius-sm)",
            padding: "4px 8px",
            fontSize: "10px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "var(--text-dim)",
            fontFamily: "var(--font-body)",
            cursor: "pointer",
            opacity: 0,
            transition: `opacity var(--duration) var(--ease), color var(--duration) var(--ease), border-color var(--duration) var(--ease)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ff6b6b";
            e.currentTarget.style.borderColor = "#ff6b6b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-dim)";
            e.currentTarget.style.borderColor = "var(--text-faint)";
          }}
        >
          Delete
        </button>

        {/* Hover accent line */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, var(--accent), transparent)",
          opacity: 0,
          transition: `opacity var(--duration) var(--ease)`,
        }} className="card-accent" />
      </div>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
