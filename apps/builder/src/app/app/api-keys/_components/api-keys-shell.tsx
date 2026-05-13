"use client";

import { useState, useTransition } from "react";
import { createApiKey, deleteApiKey } from "../actions";

type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
};

export function ApiKeysShell({ keys }: { keys: ApiKey[] }) {
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    if (!name.trim()) { setError("Name is required."); return; }
    setError(null);
    startTransition(async () => {
      try {
        const { key } = await createApiKey(name.trim());
        setNewKey(key);
        setName("");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(() => deleteApiKey(id));
  };

  const handleCopy = () => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: "680px" }}>

      {/* New key reveal */}
      {newKey && (
        <div style={{
          background: "var(--accent-dim)",
          border: "1px solid var(--accent)",
          borderRadius: "var(--radius-sm)",
          padding: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}>
          <div style={{ fontSize: "12px", color: "var(--accent)", fontFamily: "var(--font-body)", marginBottom: "var(--space-2)", fontWeight: 500 }}>
            API key generated — copy it now, it won't be shown again.
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <code style={{
              flex: 1,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "10px var(--space-3)",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--text)",
              wordBreak: "break-all",
            }}>
              {newKey}
            </code>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? "var(--accent)" : "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                color: copied ? "#080808" : "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: "12px",
                padding: "10px var(--space-3)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            style={{
              marginTop: "var(--space-3)",
              background: "transparent", border: "none",
              color: "var(--text-dim)", fontSize: "11px",
              fontFamily: "var(--font-body)", cursor: "pointer",
              padding: 0,
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create form */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "var(--space-4)",
        marginBottom: "var(--space-6)",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", marginBottom: "var(--space-3)", fontFamily: "var(--font-body)" }}>
          New API key
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            placeholder="e.g. My MCP Server"
            style={{
              flex: 1,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text)",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              padding: "9px var(--space-3)",
              outline: "none",
            }}
          />
          <button
            onClick={handleCreate}
            disabled={isPending}
            style={{
              background: "var(--accent)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "#080808",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 500,
              padding: "9px var(--space-4)",
              cursor: isPending ? "default" : "pointer",
              opacity: isPending ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {isPending ? "Generating..." : "Generate"}
          </button>
        </div>
        {error && (
          <div style={{ fontSize: "12px", color: "#FF6B6B", marginTop: "var(--space-2)", fontFamily: "var(--font-body)" }}>
            {error}
          </div>
        )}
      </div>

      {/* Keys list */}
      {keys.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "var(--space-8)",
          color: "var(--text-dim)", fontSize: "13px",
          fontFamily: "var(--font-body)",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius-sm)",
        }}>
          No API keys yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {keys.map((key) => (
            <div
              key={key.id}
              style={{
                display: "flex", alignItems: "center",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "var(--space-3) var(--space-4)",
                gap: "var(--space-3)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", fontFamily: "var(--font-body)" }}>
                  {key.name}
                </div>
                <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-1)" }}>
                  <code style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>
                    {key.key_prefix}••••••••
                  </code>
                  <span style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
                    Created {new Date(key.created_at).toLocaleDateString()}
                  </span>
                  {key.last_used_at && (
                    <span style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
                      Last used {new Date(key.last_used_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(key.id)}
                disabled={isPending}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  padding: "6px var(--space-3)",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FF6B6B"; e.currentTarget.style.color = "#FF6B6B"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-dim)"; }}
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
