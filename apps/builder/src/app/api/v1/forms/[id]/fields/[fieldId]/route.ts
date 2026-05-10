import { NextRequest } from "next/server";
import { authenticateApiKey, unauthorized, notFound } from "@/lib/api-auth";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getOwnedField(supabase: SupabaseClient, formId: string, fieldId: string, userId: string) {
  const { data: form } = await supabase.from("forms").select("id").eq("id", formId).eq("user_id", userId).single();
  if (!form) return null;
  const { data: field } = await supabase.from("fields").select("*").eq("id", fieldId).eq("form_id", formId).single();
  return field;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; fieldId: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id, fieldId } = await params;
  const field = await getOwnedField(auth.supabase, id, fieldId, auth.userId);
  if (!field) return notFound();

  const body = await req.json().catch(() => ({}));
  const allowed = ["title", "description", "required", "position", "variable", "config", "logic"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await auth.supabase.from("fields").update(updates).eq("id", fieldId).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ field: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; fieldId: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id, fieldId } = await params;
  const field = await getOwnedField(auth.supabase, id, fieldId, auth.userId);
  if (!field) return notFound();

  await auth.supabase.from("fields").delete().eq("id", fieldId);
  return new Response(null, { status: 204 });
}
