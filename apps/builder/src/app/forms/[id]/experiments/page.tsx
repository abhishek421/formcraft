import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";

type Variant = {
  id: string;
  variant_label: string;
  title: string;
  traffic_weight: number;
  is_active: boolean;
};

type Group = {
  id: string;
  form_id: string;
  label: string;
  created_at: string;
};

type VariantStat = Variant & {
  impressions: number;
  answers: number;
  avg_ms: number | null;
};

type GroupWithStats = Group & {
  variants: VariantStat[];
  last_optimized_at: string | null;
};

async function getExperimentsData(formId: string) {
  const supabase = await createClient();

  const [{ data: form }, { data: { user } }] = await Promise.all([
    supabase.from("forms").select("id, title, published").eq("id", formId).single(),
    supabase.auth.getUser(),
  ]);

  if (!form) return null;

  const { data: groups } = await supabase
    .from("question_groups")
    .select("id, form_id, label, created_at")
    .eq("form_id", formId)
    .order("created_at", { ascending: true });

  const groupList: GroupWithStats[] = await Promise.all(
    (groups ?? []).map(async (group: Group) => {
      const { data: variants } = await supabase
        .from("question_variants")
        .select("id, variant_label, title, traffic_weight, is_active")
        .eq("group_id", group.id)
        .order("created_at", { ascending: true });

      const variantStats: VariantStat[] = await Promise.all(
        (variants ?? []).map(async (v: Variant) => {
          const [{ count: impressions }, { count: answers }, { data: answered }] = await Promise.all([
            supabase
              .from("question_events")
              .select("id", { count: "exact", head: true })
              .eq("variant_id", v.id)
              .eq("event_type", "shown"),
            supabase
              .from("question_events")
              .select("id", { count: "exact", head: true })
              .eq("variant_id", v.id)
              .eq("event_type", "answered"),
            supabase
              .from("question_events")
              .select("duration_ms")
              .eq("variant_id", v.id)
              .eq("event_type", "answered")
              .not("duration_ms", "is", null),
          ]);

          let avg_ms: number | null = null;
          if (answered && answered.length > 0) {
            const total = answered.reduce((sum: number, r: { duration_ms: number }) => sum + r.duration_ms, 0);
            avg_ms = Math.round(total / answered.length);
          }

          return { ...v, impressions: impressions ?? 0, answers: answers ?? 0, avg_ms };
        })
      );

      const { data: lastRun } = await supabase
        .from("optimization_runs")
        .select("ran_at")
        .eq("group_id", group.id)
        .order("ran_at", { ascending: false })
        .limit(1)
        .single();

      return {
        ...group,
        variants: variantStats,
        last_optimized_at: lastRun?.ran_at ?? null,
      };
    })
  );

  return { form, groups: groupList, email: user?.email ?? "" };
}

function statusBadge(v: VariantStat, totalWeight: number) {
  if (v.impressions < 100) {
    return { label: "Collecting data", color: "rgba(250,200,100,0.9)", bg: "rgba(250,200,100,0.1)", border: "rgba(250,200,100,0.3)" };
  }
  if (v.traffic_weight / totalWeight > 0.5) {
    return { label: "Winner", color: "rgba(100,220,140,0.9)", bg: "rgba(100,220,140,0.1)", border: "rgba(100,220,140,0.3)" };
  }
  return { label: "Optimizing", color: "rgba(167,139,250,0.9)", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)" };
}

function formatMs(ms: number | null) {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function ExperimentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getExperimentsData(id);
  if (!data) notFound();

  const { form, groups, email } = data;

  const NAV_TABS = [
    { label: "Builder", href: `/forms/${id}/builder`, active: false },
    { label: "Responses", href: `/forms/${id}/responses`, active: false },
    { label: "Experiments", href: `/forms/${id}/experiments`, active: true },
  ];

  return (
    <div suppressHydrationWarning style={{
      display: "flex", height: "100vh",
      background: "var(--bg)", color: "var(--text)",
      fontFamily: "var(--font-body)",
    }}>
      <AppSidebar email={email} defaultCollapsed={true} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{
          height: "56px", display: "flex", alignItems: "center",
          borderBottom: "1px solid var(--border)",
          padding: "0 20px", gap: "16px", flexShrink: 0,
          background: "var(--surface-2)", position: "relative",
        }}>
          <Link href="/forms" style={{
            color: "var(--text-dim)", textDecoration: "none",
            fontSize: "12px", fontFamily: "var(--font-body)",
          }}>
            ← Back
          </Link>
          <div style={{ width: "1px", height: "20px", background: "var(--text-faint)" }} />
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "15px",
            fontWeight: 700, color: "var(--text)", letterSpacing: "-0.3px",
          }}>
            {form.title}
          </div>

          {/* Tab switcher */}
          <div style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            display: "flex", background: "var(--border)",
            border: "1px solid var(--text-faint)",
            borderRadius: "var(--radius-full)", padding: "3px", gap: "2px",
          }}>
            {NAV_TABS.map((tab) => (
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
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 48px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ marginBottom: "32px" }}>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: "22px",
                fontWeight: 700, color: "var(--text)", letterSpacing: "-0.4px",
                marginBottom: "6px",
              }}>
                Experiments
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>
                A/B tests running on this form. Each group shows performance per variant.
              </div>
            </div>

            {groups.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: "16px",
                padding: "80px 32px", textAlign: "center",
                border: "1px dashed var(--border-mid)",
                borderRadius: "var(--radius-md)",
              }}>
                <div style={{ fontSize: "32px", opacity: 0.2 }}>⊗</div>
                <div style={{ fontSize: "14px", color: "var(--text-dim)", fontWeight: 300 }}>
                  No experiments yet
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-faint)", lineHeight: 1.7, maxWidth: "300px" }}>
                  Select a question in the Builder, open the Experiments section in the right panel, and click "Turn into experiment".
                </div>
                <Link href={`/forms/${id}/builder`} style={{
                  padding: "8px 20px", textDecoration: "none",
                  background: "transparent", border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-muted)",
                  fontFamily: "var(--font-body)", fontSize: "12px",
                  letterSpacing: "0.5px",
                }}>
                  Go to Builder
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {groups.map((group) => {
                  const totalWeight = group.variants.reduce((sum, v) => sum + v.traffic_weight, 0) || 1;

                  return (
                    <div key={group.id} style={{
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                    }}>
                      {/* Group header */}
                      <div style={{
                        padding: "16px 20px",
                        background: "var(--surface)",
                        borderBottom: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            fontSize: "9px", fontWeight: 700, padding: "3px 7px",
                            background: "rgba(167,139,250,0.12)",
                            border: "1px solid rgba(167,139,250,0.3)",
                            borderRadius: "var(--radius-full)",
                            color: "rgba(167,139,250,0.9)",
                            fontFamily: "var(--font-body)", letterSpacing: "0.5px",
                          }}>
                            A/B
                          </div>
                          <div style={{
                            fontFamily: "var(--font-display)", fontSize: "15px",
                            fontWeight: 700, color: "var(--text)", letterSpacing: "-0.2px",
                          }}>
                            {group.label}
                          </div>
                        </div>
                        {group.last_optimized_at && (
                          <div style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
                            Last optimized: {formatDate(group.last_optimized_at)}
                          </div>
                        )}
                      </div>

                      {/* Variants table */}
                      <div style={{ overflowX: "auto" }}>
                        <table style={{
                          width: "100%", borderCollapse: "collapse",
                          fontFamily: "var(--font-body)",
                        }}>
                          <thead>
                            <tr style={{ background: "var(--surface-2)" }}>
                              {["Variant", "Impressions", "Answer Rate", "Avg Time", "Traffic Share", "Status"].map((h) => (
                                <th key={h} style={{
                                  padding: "10px 16px", textAlign: "left",
                                  fontSize: "10px", letterSpacing: "1.5px",
                                  textTransform: "uppercase", color: "var(--text-dim)",
                                  fontWeight: 400, borderBottom: "1px solid var(--border)",
                                }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {group.variants.map((v, i) => {
                              const pct = Math.round((v.traffic_weight / totalWeight) * 100);
                              const answerRate = v.impressions > 0 ? Math.round((v.answers / v.impressions) * 100) : 0;
                              const status = statusBadge(v, totalWeight);

                              return (
                                <tr key={v.id} style={{
                                  borderBottom: i < group.variants.length - 1 ? "1px solid var(--border)" : "none",
                                  background: "transparent",
                                }}>
                                  <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <div style={{
                                        fontSize: "9px", fontWeight: 700, padding: "2px 6px",
                                        background: "rgba(167,139,250,0.1)",
                                        border: "1px solid rgba(167,139,250,0.25)",
                                        borderRadius: "var(--radius-full)",
                                        color: "rgba(167,139,250,0.9)",
                                      }}>
                                        {v.variant_label}
                                      </div>
                                      <div style={{
                                        fontSize: "12px", color: "var(--text-muted)",
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                        maxWidth: "160px",
                                      }}>
                                        {v.title || "Untitled"}
                                      </div>
                                      {!v.is_active && (
                                        <div style={{
                                          fontSize: "9px", color: "var(--text-faint)",
                                          padding: "1px 5px", border: "1px solid var(--text-faint)",
                                          borderRadius: "var(--radius-full)",
                                        }}>
                                          off
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 300 }}>
                                    {v.impressions.toLocaleString()}
                                  </td>
                                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 300 }}>
                                    {v.impressions > 0 ? `${answerRate}%` : "—"}
                                  </td>
                                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "var(--text-muted)", fontWeight: 300 }}>
                                    {formatMs(v.avg_ms)}
                                  </td>
                                  <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <div style={{
                                        height: "4px", width: "80px",
                                        background: "var(--border-mid)", borderRadius: "2px",
                                        overflow: "hidden",
                                      }}>
                                        <div style={{
                                          height: "100%", width: `${pct}%`,
                                          background: "rgba(167,139,250,0.7)",
                                          borderRadius: "2px",
                                        }} />
                                      </div>
                                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 300 }}>
                                        {pct}%
                                      </span>
                                    </div>
                                  </td>
                                  <td style={{ padding: "14px 16px" }}>
                                    <div style={{
                                      display: "inline-flex", padding: "3px 8px",
                                      background: status.bg, border: `1px solid ${status.border}`,
                                      borderRadius: "var(--radius-full)",
                                      fontSize: "10px", color: status.color,
                                      fontFamily: "var(--font-body)", letterSpacing: "0.3px",
                                    }}>
                                      {status.label}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
