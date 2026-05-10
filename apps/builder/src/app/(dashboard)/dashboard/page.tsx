import { getForms, createForm } from "./actions";
import { FormCard } from "../_components/form-card";

export default async function DashboardPage() {
  const forms = await getForms();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
      `}</style>

      <div style={{
        flex: 1,
        padding: "40px 48px",
        overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "40px",
        }}>
          <div>
            <div style={{
              fontSize: "11px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "rgba(240,237,232,0.3)",
              fontFamily: "'DM Mono', monospace",
              marginBottom: "8px",
            }}>
              Workspace
            </div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "32px",
              fontWeight: 800,
              color: "#F0EDE8",
              letterSpacing: "-1px",
            }}>
              Your Forms
            </h1>
          </div>

          <form action={createForm}>
            <button type="submit" style={{
              background: "#CAFF00",
              color: "#080808",
              border: "none",
              fontFamily: "'Syne', sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              padding: "12px 24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.15s ease",
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
            gap: "32px",
            marginBottom: "32px",
            padding: "16px 20px",
            background: "#111111",
            border: "1px solid rgba(240,237,232,0.06)",
          }}>
            {[
              { label: "Total Forms", value: forms.length },
              { label: "Published", value: forms.filter(f => f.published).length },
              { label: "Total Responses", value: forms.reduce((acc, f) => acc + (f.response_count ?? 0), 0) },
            ].map((stat) => (
              <div key={stat.label} style={{ display: "flex", flex: "column", gap: "4px" }}>
                <div style={{
                  fontSize: "22px",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  color: "#F0EDE8",
                  letterSpacing: "-0.5px",
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: "11px",
                  color: "rgba(240,237,232,0.3)",
                  fontFamily: "'DM Mono', monospace",
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
            gap: "16px",
          }}>
            {forms.map((form) => (
              <FormCard key={form.id} form={form} />
            ))}
          </div>
        )}
      </div>
    </>
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
      gap: "20px",
      textAlign: "center",
    }}>
      {/* Decorative grid element */}
      <div style={{
        width: "80px",
        height: "80px",
        border: "1px solid rgba(240,237,232,0.08)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1px",
        background: "rgba(240,237,232,0.02)",
        marginBottom: "8px",
      }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            background: i === 0 ? "rgba(202,255,0,0.1)" : "rgba(240,237,232,0.02)",
          }} />
        ))}
      </div>

      <div>
        <div style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "22px",
          fontWeight: 700,
          color: "#F0EDE8",
          letterSpacing: "-0.5px",
          marginBottom: "8px",
        }}>
          No forms yet
        </div>
        <div style={{
          fontSize: "13px",
          color: "rgba(240,237,232,0.3)",
          fontFamily: "'DM Mono', monospace",
          fontWeight: 300,
          maxWidth: "280px",
          lineHeight: 1.6,
        }}>
          Create your first form and start collecting responses.
        </div>
      </div>

      <form action={createForm} style={{ marginTop: "8px" }}>
        <button type="submit" style={{
          background: "#CAFF00",
          color: "#080808",
          border: "none",
          fontFamily: "'Syne', sans-serif",
          fontSize: "13px",
          fontWeight: 700,
          padding: "12px 28px",
          cursor: "pointer",
          letterSpacing: "0.5px",
        }}>
          + Create your first form
        </button>
      </form>
    </div>
  );
}
