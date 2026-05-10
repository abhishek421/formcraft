import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase-service";

function weightedRandom(variants: { id: string; traffic_weight: number }[]): string {
  const total = variants.reduce((sum, v) => sum + v.traffic_weight, 0);
  let rand = Math.random() * total;
  for (const v of variants) {
    rand -= v.traffic_weight;
    if (rand <= 0) return v.id;
  }
  return variants[variants.length - 1].id;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  const { id, sessionId } = await params;
  const supabase = createServiceClient();

  // Verify session belongs to this form
  const { data: session } = await supabase
    .from("form_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("form_id", id)
    .single();

  if (!session) return Response.json({ error: "Not found" }, { status: 404 });

  // Fetch active question groups
  const { data: groups, error: groupsError } = await supabase
    .from("question_groups")
    .select("id")
    .eq("form_id", id);

  if (groupsError) return Response.json({ error: groupsError.message }, { status: 500 });
  if (!groups || groups.length === 0) return Response.json({ assignments: [] });

  const assignments: {
    question_group_id: string;
    variant_id: string;
    variant: Record<string, unknown>;
  }[] = [];

  for (const group of groups) {
    // Check for existing assignment
    const { data: existing } = await supabase
      .from("variant_assignments")
      .select("variant_id, question_variants(title, description, type, config, logic)")
      .eq("session_id", sessionId)
      .eq("question_group_id", group.id)
      .single();

    if (existing) {
      const v = existing.question_variants as unknown as Record<string, unknown> | null;
      assignments.push({
        question_group_id: group.id,
        variant_id: existing.variant_id,
        variant: v ?? {},
      });
      continue;
    }

    // Fetch active variants with weights
    const { data: variants, error: variantsError } = await supabase
      .from("question_variants")
      .select("id, traffic_weight, title, description, type, config, logic")
      .eq("question_group_id", group.id)
      .eq("is_active", true);

    if (variantsError) return Response.json({ error: variantsError.message }, { status: 500 });
    if (!variants || variants.length === 0) continue;

    const chosenId = weightedRandom(variants);
    const chosen = variants.find((v) => v.id === chosenId)!;

    // Insert assignment, handle unique conflict by re-reading
    const { error: insertError } = await supabase.from("variant_assignments").insert({
      session_id: sessionId,
      question_group_id: group.id,
      variant_id: chosenId,
    });

    if (insertError) {
      // Conflict — re-read existing
      const { data: conflict } = await supabase
        .from("variant_assignments")
        .select("variant_id, question_variants(title, description, type, config, logic)")
        .eq("session_id", sessionId)
        .eq("question_group_id", group.id)
        .single();

      if (conflict) {
        const v = conflict.question_variants as unknown as Record<string, unknown> | null;
        assignments.push({
          question_group_id: group.id,
          variant_id: conflict.variant_id,
          variant: v ?? {},
        });
        continue;
      }
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    assignments.push({
      question_group_id: group.id,
      variant_id: chosenId,
      variant: {
        title: chosen.title,
        description: chosen.description,
        type: chosen.type,
        config: chosen.config,
        logic: chosen.logic,
      },
    });
  }

  return Response.json({ assignments });
}
