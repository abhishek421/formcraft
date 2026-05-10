import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authenticateApiKey, unauthorized, notFound } from "@/lib/api-auth";

async function getOwnedForm(supabase: Awaited<ReturnType<typeof createClient>>, formId: string, userId: string) {
  const { data } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .eq("user_id", userId)
    .single();
  return data;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  const supabase = await createClient();
  const form = await getOwnedForm(supabase, id, auth.userId);
  if (!form) return notFound();

  const { data: fields } = await supabase
    .from("fields")
    .select("*")
    .eq("form_id", id)
    .order("position", { ascending: true });

  return Response.json({ form, fields: fields ?? [] });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  const supabase = await createClient();
  const form = await getOwnedForm(supabase, id, auth.userId);
  if (!form) return notFound();

  const body = await req.json().catch(() => ({}));
  const allowed = ["title", "description", "settings", "theme", "published"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const { data, error } = await supabase.from("forms").update(updates).eq("id", id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ form: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  const supabase = await createClient();
  const form = await getOwnedForm(supabase, id, auth.userId);
  if (!form) return notFound();

  await supabase.from("forms").delete().eq("id", id);
  return new Response(null, { status: 204 });
}
