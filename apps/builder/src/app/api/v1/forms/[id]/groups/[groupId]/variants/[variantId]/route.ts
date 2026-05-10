import { NextRequest } from "next/server";
import { authenticateApiKey, unauthorized, notFound, badRequest } from "@/lib/api-auth";
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

async function ownsVariant(supabase: SupabaseClient, groupId: string, variantId: string) {
  const { data } = await supabase
    .from("question_variants")
    .select("id")
    .eq("id", variantId)
    .eq("group_id", groupId)
    .single();
  return !!data;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string; variantId: string }> }
) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id, groupId, variantId } = await params;
  if (!(await ownsForm(auth.supabase, id, auth.userId))) return notFound();
  if (!(await ownsGroup(auth.supabase, id, groupId))) return notFound();
  if (!(await ownsVariant(auth.supabase, groupId, variantId))) return notFound();

  const body = await req.json().catch(() => ({}));

  const patch: Record<string, unknown> = {};
  if (body.variant_label !== undefined) patch.variant_label = body.variant_label;
  if (body.title !== undefined) patch.title = body.title;
  if (body.description !== undefined) patch.description = body.description;
  if (body.type !== undefined) patch.type = body.type;
  if (body.config !== undefined) patch.config = body.config;
  if (body.logic !== undefined) patch.logic = body.logic;
  if (body.is_active !== undefined) patch.is_active = body.is_active;

  const { data, error } = await auth.supabase
    .from("question_variants")
    .update(patch)
    .eq("id", variantId)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ variant: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string; variantId: string }> }
) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id, groupId, variantId } = await params;
  if (!(await ownsForm(auth.supabase, id, auth.userId))) return notFound();
  if (!(await ownsGroup(auth.supabase, id, groupId))) return notFound();
  if (!(await ownsVariant(auth.supabase, groupId, variantId))) return notFound();

  // Block deletion if this is the last active variant
  const { data: activeVariants } = await auth.supabase
    .from("question_variants")
    .select("id")
    .eq("group_id", groupId)
    .eq("is_active", true);

  const isTargetActive = (activeVariants ?? []).some((v: any) => v.id === variantId);
  if (isTargetActive && (activeVariants ?? []).length <= 1) {
    return badRequest("Cannot delete the last active variant");
  }

  const { error } = await auth.supabase.from("question_variants").delete().eq("id", variantId);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
