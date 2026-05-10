import { NextRequest } from "next/server";
import { authenticateApiKey, unauthorized, notFound, badRequest } from "@/lib/api-auth";
import type { SupabaseClient } from "@supabase/supabase-js";

async function ownsForm(supabase: SupabaseClient, formId: string, userId: string) {
  const { data } = await supabase.from("forms").select("id").eq("id", formId).eq("user_id", userId).single();
  return !!data;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  if (!(await ownsForm(auth.supabase, id, auth.userId))) return notFound();

  const { data: groups, error } = await auth.supabase
    .from("question_groups")
    .select("*, question_variants(id, is_active)")
    .eq("form_id", id)
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const result = (groups ?? []).map((g: any) => {
    const { question_variants, ...group } = g;
    return {
      ...group,
      active_variant_count: (question_variants ?? []).filter((v: any) => v.is_active).length,
    };
  });

  return Response.json({ groups: result });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  if (!(await ownsForm(auth.supabase, id, auth.userId))) return notFound();

  const body = await req.json().catch(() => null);
  if (!body?.label) return badRequest("label is required");

  const { data, error } = await auth.supabase
    .from("question_groups")
    .insert({
      form_id: id,
      label: body.label,
      optimization_goal: body.optimization_goal ?? null,
      strategy: body.strategy ?? null,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ group: data }, { status: 201 });
}
