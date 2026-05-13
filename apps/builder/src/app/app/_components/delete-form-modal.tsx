"use client";

type Props = {
  formTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteFormModal({ formTitle, onConfirm, onCancel }: Props) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface-3)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-8)",
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
        }}
      >
        {/* Icon */}
        <div style={{
          width: "40px", height: "40px",
          borderRadius: "var(--radius-sm)",
          background: "rgba(255,107,107,0.08)",
          border: "1px solid rgba(255,107,107,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 5h12M7 5V3h4v2M14 5l-1 10H5L4 5" stroke="#ff6b6b" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "17px",
            fontWeight: 700, color: "var(--text)", letterSpacing: "-0.3px",
          }}>
            Delete form?
          </div>
          <div style={{
            fontSize: "13px", color: "var(--text-dim)",
            fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.6,
          }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>"{formTitle}"</span> will be permanently deleted along with all its responses. This cannot be undone.
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "var(--space-2) var(--space-5)",
              fontSize: "13px", fontFamily: "var(--font-body)", fontWeight: 400,
              color: "var(--text-muted)", cursor: "pointer",
              transition: "all var(--duration) var(--ease)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--text-dim)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: "rgba(255,107,107,0.12)",
              border: "1px solid rgba(255,107,107,0.3)",
              borderRadius: "var(--radius-sm)",
              padding: "var(--space-2) var(--space-5)",
              fontSize: "13px", fontFamily: "var(--font-body)", fontWeight: 500,
              color: "#ff6b6b", cursor: "pointer",
              transition: "all var(--duration) var(--ease)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,107,107,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,107,107,0.12)"; }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
