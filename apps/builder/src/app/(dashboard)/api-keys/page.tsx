import { listApiKeys } from "./actions";
import { ApiKeysShell } from "./_components/api-keys-shell";

export default async function ApiKeysPage() {
  const keys = await listApiKeys();

  return (
    <div style={{ padding: "var(--space-8) var(--space-8)" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "24px",
          fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px",
          marginBottom: "var(--space-1)",
        }}>
          API Keys
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: 300 }}>
          Use these keys to access the CleverForms REST API and MCP server.
        </p>
      </div>
      <ApiKeysShell keys={keys} />
    </div>
  );
}
