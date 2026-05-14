"use server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddVariantButton } from "./_components/add-variant-button";

type Variant = {
  id: string;
  variant_label: string;
  title: string;
  type: string;
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

  // Tier 1: form + user in parallel
  const [{ data: form }, { data: { user } }] = await Promise.all([
    supabase.from("forms").select("id, title, published").eq("id", formId).single(),
    supabase.auth.getUser(),
  ]);

  if (!form) return null;

  // Tier 2: groups
  const { data: groups } = await supabase
    .from("question_groups")
    .select("id, form_id, label, created_at")
    .eq("form_id", formId)
    .order("created_at", { ascending: true });

  const groupIds = (groups ?? []).map((g: Group) => g.id);
  if (groupIds.length === 0) return { form, groups: [], email: user?.email ?? "" };

  // Tier 3: all variants + all optimization runs in parallel (one query each)
  const [{ data: allVariants }, { data: allRuns }] = await Promise.all([
    supabase
      .from("question_variants")
      .select("id, group_id, variant_label, title, type, traffic_weight, is_active")
      .in("group_id", groupIds)
      .order("created_at", { ascending: true }),
    supabase
      .from("optimization_runs")
      .select("group_id, ran_at")
      .in("group_id", groupIds)
      .order("ran_at", { ascending: false }),
  ]);

  const variantIds = (allVariants ?? []).map((v: Variant & { group_id: string }) => v.id);

  // Tier 4: all events in 2 queries (shown counts + answered with duration) in parallel
  const [{ data: shownEvents }, { data: answeredEvents }] = await Promise.all([
    variantIds.length > 0
      ? supabase.from("question_events").select("variant_id").in("variant_id", variantIds).eq("event_type", "shown")
      : Promise.resolve({ data: [] }),
    variantIds.length > 0
      ? supabase.from("question_events").select("variant_id, duration_ms").in("variant_id", variantIds).eq("event_type", "answered")
      : Promise.resolve({ data: [] }),
  ]);

  // Aggregate in JS
  const shownByVariant: Record<string, number> = {};
  for (const e of shownEvents ?? []) {
    shownByVariant[e.variant_id] = (shownByVariant[e.variant_id] ?? 0) + 1;
  }

  const answeredByVariant: Record<string, { count: number; totalMs: number }> = {};
  for (const e of answeredEvents ?? []) {
    if (!answeredByVariant[e.variant_id]) answeredByVariant[e.variant_id] = { count: 0, totalMs: 0 };
    answeredByVariant[e.variant_id].count += 1;
    if (e.duration_ms != null) answeredByVariant[e.variant_id].totalMs += e.duration_ms;
  }

  const lastRunByGroup: Record<string, string> = {};
  for (const r of allRuns ?? []) {
    if (!lastRunByGroup[r.group_id]) lastRunByGroup[r.group_id] = r.ran_at;
  }

  // Assemble
  const variantsByGroup: Record<string, VariantStat[]> = {};
  for (const v of (allVariants ?? []) as (Variant & { group_id: string })[]) {
    const impressions = shownByVariant[v.id] ?? 0;
    const answered = answeredByVariant[v.id];
    const answers = answered?.count ?? 0;
    const avg_ms = answered && answered.count > 0 ? Math.round(answered.totalMs / answered.count) : null;
    if (!variantsByGroup[v.group_id]) variantsByGroup[v.group_id] = [];
    variantsByGroup[v.group_id].push({ ...v, impressions, answers, avg_ms });
  }

  const groupList: GroupWithStats[] = (groups ?? []).map((g: Group) => ({
    ...g,
    variants: variantsByGroup[g.id] ?? [],
    last_optimized_at: lastRunByGroup[g.id] ?? null,
  }));

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
    { label: "Builder", href: `/app/forms/${id}/builder`, active: false },
    { label: "Responses", href: `/app/forms/${id}/responses`, active: false },
    { label: "Experiments", href: `/app/forms/${id}/experiments`, active: true },
  ];

  return (
    <div suppressHydrationWarning style={{
      display: "flex", height: "100vh",
      background: "var(--bg)", color: "var(--text)",
      fontFamily: "var(--font-body)",
    }}>
      <style>{`
        .cf-tip { position: relative; display: inline-flex; align-items: center; }
        .cf-tip-box {
          display: none;
          position: absolute; bottom: calc(100% + 8px); left: 50%;
          transform: translateX(-50%);
          background: var(--surface-4, #1e1e2e);
          border: 1px solid var(--border-mid);
          color: var(--text-muted);
          font-size: 11px; line-height: 1.5;
          padding: 7px 10px;
          border-radius: 6px;
          white-space: nowrap;
          z-index: 999;
          pointer-events: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          font-family: var(--font-body);
          font-weight: 300;
        }
        .cf-tip:hover .cf-tip-box { display: block; }
      `}</style>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{
          height: "56px", display: "flex", alignItems: "center",
          borderBottom: "1px solid var(--border)",
          padding: "0 20px", gap: "16px", flexShrink: 0,
          background: "var(--surface-2)", position: "relative",
        }}>
          <Link href="/app/forms" style={{
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
                <Link href={`/app/forms/${id}/builder`} style={{
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
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          {group.last_optimized_at && (
                            <div style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>
                              Last optimized: {formatDate(group.last_optimized_at)}
                            </div>
                          )}
                          <AddVariantButton
                            formId={id}
                            groupId={group.id}
                            existingLabels={group.variants.map(v => v.variant_label)}
                            baseType={group.variants[0]?.type ?? "short_text"}
                            baseTitle={group.variants[0]?.title ?? ""}
                          />
                        </div>
                      </div>

                      {/* Variants table */}
                      <div style={{ overflowX: "auto" }}>
                        <table style={{
                          width: "100%", borderCollapse: "collapse",
                          fontFamily: "var(--font-body)",
                        }}>
                          <thead>
                            <tr style={{ background: "var(--surface-2)" }}>
                              {[
                                { label: "Variant", tip: null },
                                { label: "Impressions", tip: "Times this variant was shown to a unique session" },
                                { label: "Answer Rate", tip: "Sessions that answered vs. total shown" },
                                { label: "Avg Time", tip: "Average time spent on this question" },
                                { label: "Traffic Share", tip: "Current % of new sessions routed to this variant" },
                                { label: "Status", tip: "Optimizer needs 100+ impressions before rebalancing" },
                              ].map(({ label, tip }) => (
                                <th key={label} style={{
                                  padding: "10px 16px", textAlign: "left",
                                  fontSize: "10px", letterSpacing: "1.5px",
                                  textTransform: "uppercase", color: "var(--text-dim)",
                                  fontWeight: 400, borderBottom: "1px solid var(--border)",
                                }}>
                                  {tip ? (
                                    <span className="cf-tip" style={{ gap: "4px" }}>
                                      {label}
                                      <span style={{ opacity: 0.4, fontSize: "9px", cursor: "default" }}>?</span>
                                      <span className="cf-tip-box">{tip}</span>
                                    </span>
                                  ) : label}
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
                                    <div className="cf-tip">
                                      <div style={{
                                        display: "inline-flex", padding: "3px 8px",
                                        background: status.bg, border: `1px solid ${status.border}`,
                                        borderRadius: "var(--radius-full)",
                                        fontSize: "10px", color: status.color,
                                        fontFamily: "var(--font-body)", letterSpacing: "0.3px",
                                        cursor: "default",
                                      }}>
                                        {status.label}
                                      </div>
                                      {v.impressions < 100 && (
                                        <div className="cf-tip-box">
                                          Needs 100 impressions before the optimizer<br />
                                          can rebalance traffic. Currently at {v.impressions}.
                                        </div>
                                      )}
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
