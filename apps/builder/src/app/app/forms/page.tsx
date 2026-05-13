import { getForms, createForm } from "./actions";

export const revalidate = 30;
import { FormCard } from "../_components/form-card";

export default async function DashboardPage() {
  const forms = await getForms();

  return (
    <div style={{
      flex: 1,
      padding: "var(--space-10) var(--space-12)",
      overflowY: "auto",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: "var(--space-10)",
      }}>
        <div>
          <div style={{
            fontSize: "11px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "var(--text-dim)",
            fontFamily: "var(--font-body)",
            marginBottom: "var(--space-2)",
          }}>
            Workspace
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "32px",
            fontWeight: 800,
            color: "var(--text)",
            letterSpacing: "-1px",
            margin: 0,
          }}>
            Your Forms
          </h1>
        </div>

        <form action={createForm}>
          <button type="submit" style={{
            background: "var(--accent)",
            color: "var(--accent-text)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-display)",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            padding: "var(--space-3) var(--space-6)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            transition: "opacity var(--duration) var(--ease)",
          }}>
            <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
            New Form
          </button>
        </form>
      </div>

      {/* Stats bar */}
      {forms.length > 0 && (
        <div style={{
          display: "flex",
          gap: "var(--space-8)",
          marginBottom: "var(--space-8)",
          padding: "var(--space-4) var(--space-5)",
          background: "var(--surface-3)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
        }}>
          {[
            { label: "Total Forms", value: forms.length },
            { label: "Published", value: forms.filter(f => f.published).length },
            { label: "Total Responses", value: forms.reduce((acc, f) => acc + (f.response_count ?? 0), 0) },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
              <div style={{
                fontSize: "22px",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.5px",
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: "11px",
                color: "var(--text-dim)",
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                letterSpacing: "1px",
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Forms grid or empty state */}
      {forms.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "var(--space-4)",
        }}>
          {forms.map((form) => (
            <FormCard key={form.id} form={form} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      gap: "var(--space-5)",
      textAlign: "center",
    }}>
      <div style={{
        width: "80px",
        height: "80px",
        border: "1px solid var(--text-faint)",
        borderRadius: "var(--radius-md)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1px",
        background: "var(--border)",
        marginBottom: "var(--space-2)",
      }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            background: i === 0 ? "var(--accent-border)" : "var(--border)",
            borderRadius: i === 0 ? "var(--radius-sm) 0 0 0" : 0,
          }} />
        ))}
      </div>

      <div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "22px",
          fontWeight: 700,
          color: "var(--text)",
          letterSpacing: "-0.5px",
          marginBottom: "var(--space-2)",
        }}>
          No forms yet
        </div>
        <div style={{
          fontSize: "13px",
          color: "var(--text-dim)",
          fontFamily: "var(--font-body)",
          fontWeight: 300,
          maxWidth: "280px",
          lineHeight: 1.6,
        }}>
          Create your first form and start collecting responses.
        </div>
      </div>

      <form action={createForm} style={{ marginTop: "var(--space-2)" }}>
        <button type="submit" style={{
          background: "var(--accent)",
          color: "var(--accent-text)",
          border: "none",
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-display)",
          fontSize: "13px",
          fontWeight: 700,
          padding: "var(--space-3) var(--space-6)",
          cursor: "pointer",
          letterSpacing: "0.5px",
          transition: "opacity var(--duration) var(--ease)",
        }}>
          + Create your first form
        </button>
      </form>
    </div>
  );
}
