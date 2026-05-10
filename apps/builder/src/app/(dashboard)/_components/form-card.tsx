"use client";

import Link from "next/link";

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

  return (
    <Link href={`/builder/${form.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#111111",
          border: "1px solid rgba(240,237,232,0.06)",
          padding: "24px",
          cursor: "pointer",
          transition: "all 0.15s ease",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          height: "160px",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(202,255,0,0.2)";
          (e.currentTarget as HTMLDivElement).style.background = "#141414";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(240,237,232,0.06)";
          (e.currentTarget as HTMLDivElement).style.background = "#111111";
        }}
      >
        {/* Status pill */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "3px 8px",
            background: form.published ? "rgba(202,255,0,0.08)" : "rgba(240,237,232,0.04)",
            border: `1px solid ${form.published ? "rgba(202,255,0,0.2)" : "rgba(240,237,232,0.08)"}`,
          }}>
            <div style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: form.published ? "#CAFF00" : "rgba(240,237,232,0.3)",
            }} />
            <span style={{
              fontSize: "10px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: form.published ? "#CAFF00" : "rgba(240,237,232,0.3)",
              fontFamily: "'DM Mono', monospace",
              fontWeight: 500,
            }}>
              {form.published ? "Live" : "Draft"}
            </span>
          </div>

          <span style={{
            fontSize: "11px",
            color: "rgba(240,237,232,0.2)",
            fontFamily: "'DM Mono', monospace",
            fontWeight: 300,
          }}>
            {form.response_count ?? 0} responses
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "17px",
          fontWeight: 700,
          color: "#F0EDE8",
          letterSpacing: "-0.3px",
          lineHeight: 1.3,
          flex: 1,
        }}>
          {form.title}
        </div>

        {/* Footer */}
        <div style={{
          fontSize: "11px",
          color: "rgba(240,237,232,0.2)",
          fontFamily: "'DM Mono', monospace",
          fontWeight: 300,
        }}>
          Edited {timeAgo}
        </div>

        {/* Hover accent line */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, #CAFF00, transparent)",
          opacity: 0,
          transition: "opacity 0.15s ease",
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
