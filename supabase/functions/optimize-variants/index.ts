import { createClient } from "jsr:@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuestionGroup {
  id: string;
  form_id: string;
  label: string;
}

interface QuestionVariant {
  id: string;
  question_group_id: string;
  variant_label: string;
  traffic_weight: number;
  is_active: boolean;
}

interface VariantStats {
  variant_id: string;
  impressions: number;
  answers: number;
  avg_duration_ms: number | null;
}

interface VariantScoreSnapshot {
  variant_id: string;
  variant_label: string;
  impressions: number;
  answers: number;
  answer_rate: number;
  avg_duration_ms: number | null;
  score: number;
  new_weight: number | null;
}

interface RunSummary {
  processed: number;
  rebalanced: number;
  skipped_low_data: number;
  skipped_no_change: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_IMPRESSIONS = 100;
const SCORE_CONVERGENCE_THRESHOLD = 0.03;
const EXPLORATION_FLOOR_PER_VARIANT = 0.05;
const EXPLORATION_FLOOR_MAX_TOTAL = 0.5;
const TIME_PENALTY_WEIGHT = 0.3;
const TIME_NORMALIZATION_MS = 30_000;

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeScore(
  answers: number,
  impressions: number,
  avg_duration_ms: number | null,
): number {
  const answer_rate = answers / impressions;
  const avg_time_penalty =
    avg_duration_ms === null
      ? 0
      : clamp(avg_duration_ms / TIME_NORMALIZATION_MS, 0, 1);
  return answer_rate * (1 - TIME_PENALTY_WEIGHT * avg_time_penalty);
}

function computeWeights(scores: number[]): number[] {
  const n = scores.length;
  const floor =
    n * EXPLORATION_FLOOR_PER_VARIANT > EXPLORATION_FLOOR_MAX_TOTAL
      ? EXPLORATION_FLOOR_MAX_TOTAL / n
      : EXPLORATION_FLOOR_PER_VARIANT;
  const remaining = 1 - n * floor;
  const sum_scores = scores.reduce((a, b) => a + b, 0);

  if (sum_scores === 0) {
    // All scores zero — distribute remaining evenly
    return scores.map(() => floor + remaining / n);
  }

  return scores.map((s) => floor + (s / sum_scores) * remaining);
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
  // Auth check
  const cronSecret = Deno.env.get("CRON_SECRET");
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!cronSecret || token !== cronSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase env vars" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const summary: RunSummary = {
    processed: 0,
    rebalanced: 0,
    skipped_low_data: 0,
    skipped_no_change: 0,
    errors: [],
  };

  // Fetch all question groups across all forms
  const { data: groups, error: groupsError } = await supabase
    .from("question_groups")
    .select("id, form_id, label");

  if (groupsError) {
    return new Response(
      JSON.stringify({ error: groupsError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!groups || groups.length === 0) {
    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  for (const group of groups as QuestionGroup[]) {
    summary.processed++;

    try {
      // Fetch active variants for this group
      const { data: variants, error: variantsError } = await supabase
        .from("question_variants")
        .select("id, question_group_id, variant_label, traffic_weight, is_active")
        .eq("question_group_id", group.id)
        .eq("is_active", true);

      if (variantsError) throw new Error(variantsError.message);
      if (!variants || variants.length === 0) continue;

      const activeVariants = variants as QuestionVariant[];

      // Aggregate stats per variant via question_events
      const statsPromises = activeVariants.map(async (variant) => {
        const { data: events, error: eventsError } = await supabase
          .from("question_events")
          .select("event_type, duration_ms")
          .eq("variant_id", variant.id);

        if (eventsError) throw new Error(eventsError.message);

        const allEvents = events ?? [];
        const impressions = allEvents.filter(
          (e) => e.event_type === "shown",
        ).length;
        const answeredEvents = allEvents.filter(
          (e) => e.event_type === "answered",
        );
        const answers = answeredEvents.length;

        const durations = answeredEvents
          .map((e) => e.duration_ms as number | null)
          .filter((d): d is number => d !== null);

        const avg_duration_ms =
          durations.length > 0
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : null;

        return {
          variant_id: variant.id,
          impressions,
          answers,
          avg_duration_ms,
        } satisfies VariantStats;
      });

      const stats = await Promise.all(statsPromises);

      // Check minimum impressions threshold
      const lowDataVariants = stats.filter(
        (s) => s.impressions < MIN_IMPRESSIONS,
      );

      if (lowDataVariants.length > 0) {
        const snapshot: VariantScoreSnapshot[] = stats.map((s) => {
          const variant = activeVariants.find((v) => v.id === s.variant_id)!;
          return {
            variant_id: s.variant_id,
            variant_label: variant.variant_label,
            impressions: s.impressions,
            answers: s.answers,
            answer_rate: s.impressions > 0 ? s.answers / s.impressions : 0,
            avg_duration_ms: s.avg_duration_ms,
            score: 0,
            new_weight: null,
          };
        });

        const lowVariantLabels = lowDataVariants.map((s) => {
          const v = activeVariants.find((vv) => vv.id === s.variant_id);
          return `${v?.variant_label ?? s.variant_id} (${s.impressions} impressions)`;
        });

        await supabase.from("optimization_runs").insert({
          question_group_id: group.id,
          action: "skipped_low_data",
          variant_scores: snapshot,
          notes: `Low data on: ${lowVariantLabels.join(", ")}`,
        });

        summary.skipped_low_data++;
        continue;
      }

      // Compute scores
      const scores = stats.map((s) =>
        computeScore(s.answers, s.impressions, s.avg_duration_ms)
      );

      // Statistical guard: check if all scores are within threshold of each other
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);

      if (maxScore - minScore <= SCORE_CONVERGENCE_THRESHOLD) {
        const snapshot: VariantScoreSnapshot[] = stats.map((s, i) => {
          const variant = activeVariants.find((v) => v.id === s.variant_id)!;
          return {
            variant_id: s.variant_id,
            variant_label: variant.variant_label,
            impressions: s.impressions,
            answers: s.answers,
            answer_rate: s.answers / s.impressions,
            avg_duration_ms: s.avg_duration_ms,
            score: scores[i],
            new_weight: null,
          };
        });

        await supabase.from("optimization_runs").insert({
          question_group_id: group.id,
          action: "skipped_no_change",
          variant_scores: snapshot,
          notes: `Score spread ${(maxScore - minScore).toFixed(4)} within convergence threshold ${SCORE_CONVERGENCE_THRESHOLD}`,
        });

        summary.skipped_no_change++;
        continue;
      }

      // Compute normalized weights with exploration floor
      const weights = computeWeights(scores);

      // Update traffic_weight on each variant
      const updatePromises = activeVariants.map((variant, i) =>
        supabase
          .from("question_variants")
          .update({ traffic_weight: weights[i] })
          .eq("id", variant.id)
      );

      const updateResults = await Promise.all(updatePromises);
      for (const result of updateResults) {
        if (result.error) throw new Error(result.error.message);
      }

      // Write rebalanced optimization run
      const snapshot: VariantScoreSnapshot[] = stats.map((s, i) => {
        const variant = activeVariants.find((v) => v.id === s.variant_id)!;
        return {
          variant_id: s.variant_id,
          variant_label: variant.variant_label,
          impressions: s.impressions,
          answers: s.answers,
          answer_rate: s.answers / s.impressions,
          avg_duration_ms: s.avg_duration_ms,
          score: scores[i],
          new_weight: weights[i],
        };
      });

      await supabase.from("optimization_runs").insert({
        question_group_id: group.id,
        action: "rebalanced",
        variant_scores: snapshot,
        notes: null,
      });

      summary.rebalanced++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      summary.errors.push(`group ${group.id}: ${msg}`);
    }
  }

  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
