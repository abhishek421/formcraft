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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; groupId: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id, groupId } = await params;
  if (!(await ownsForm(auth.supabase, id, auth.userId))) return notFound();
  if (!(await ownsGroup(auth.supabase, id, groupId))) return notFound();

  const { data, error } = await auth.supabase
    .from("question_variants")
    .update({ traffic_weight: 1.0 })
    .eq("group_id", groupId)
    .eq("is_active", true)
    .select();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ variants: data ?? [] });
}
