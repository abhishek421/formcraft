import { NextRequest } from "next/server";
import { authenticateApiKey, unauthorized, notFound } from "@/lib/api-auth";
import type { SupabaseClient } from "@supabase/supabase-js";

async function ownsForm(supabase: SupabaseClient, formId: string, userId: string) {
  const { data } = await supabase.from("forms").select("id").eq("id", formId).eq("user_id", userId).single();
  return !!data;
}

async function ownsGroup(supabase: SupabaseClient, formId: string, groupId: string) {
  const { data } = await supabase
    .from("question_groups")
    .select("id")
    .eq("id", groupId)
    .eq("form_id", formId)
    .single();
  return !!data;
}

async function countEvents(supabase: SupabaseClient, variantId: string, eventType: string): Promise<number> {
  const { count } = await supabase
    .from("question_events")
    .select("id", { count: "exact", head: true })
    .eq("variant_id", variantId)
    .eq("event_type", eventType);
  return count ?? 0;
}

async function avgDuration(supabase: SupabaseClient, variantId: string): Promise<number | null> {
  const { data } = await supabase
    .from("question_events")
    .select("duration_ms")
    .eq("variant_id", variantId)
    .eq("event_type", "answered")
    .not("duration_ms", "is", null);

  if (!data || data.length === 0) return null;
  const total = data.reduce((sum: number, row: any) => sum + (row.duration_ms ?? 0), 0);
  return Math.round(total / data.length);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; groupId: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id, groupId } = await params;
  if (!(await ownsForm(auth.supabase, id, auth.userId))) return notFound();
  if (!(await ownsGroup(auth.supabase, id, groupId))) return notFound();

  const { data: variants, error: variantsError } = await auth.supabase
    .from("question_variants")
    .select("id, variant_label, traffic_weight, is_active")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  if (variantsError) return Response.json({ error: variantsError.message }, { status: 500 });

  const allVariants = variants ?? [];

  // Find winner: highest traffic_weight > 0.5
  const winner = allVariants.reduce(
    (best: any, v: any) => {
      if (v.traffic_weight > 0.5 && (!best || v.traffic_weight > best.traffic_weight)) return v;
      return best;
    },
    null as any
  );

  const variantStats = await Promise.all(
    allVariants.map(async (v: any) => {
      const [impressions, answers, skips, avg_ms] = await Promise.all([
        countEvents(auth.supabase, v.id, "shown"),
        countEvents(auth.supabase, v.id, "answered"),
        countEvents(auth.supabase, v.id, "skipped"),
        avgDuration(auth.supabase, v.id),
      ]);

      return {
        variant_id: v.id,
        label: v.variant_label,
        impressions,
        answer_rate: impressions > 0 ? answers / impressions : 0,
        avg_answer_time_ms: avg_ms,
        abandonment_rate: impressions > 0 ? skips / impressions : 0,
        traffic_weight: v.traffic_weight,
        is_active: v.is_active,
        is_winner: winner ? v.id === winner.id : false,
      };
    })
  );

  const { data: lastRun } = await auth.supabase
    .from("optimization_runs")
    .select("ran_at")
    .eq("group_id", groupId)
    .order("ran_at", { ascending: false })
    .limit(1)
    .single();

  return Response.json({
    variants: variantStats,
    last_optimized_at: lastRun?.ran_at ?? null,
  });
}
