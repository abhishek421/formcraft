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

  const { data } = await auth.supabase.from("fields").select("*").eq("form_id", id).order("position", { ascending: true });
  return Response.json({ fields: data ?? [] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  if (!(await ownsForm(auth.supabase, id, auth.userId))) return notFound();

  const body = await req.json().catch(() => null);
  if (!body?.type) return badRequest("type is required");
  if (!body?.title) return badRequest("title is required");

  const { data: last } = await auth.supabase
    .from("fields").select("position").eq("form_id", id).order("position", { ascending: false }).limit(1).single();

  const { data, error } = await auth.supabase
    .from("fields")
    .insert({
      form_id: id,
      type: body.type,
      title: body.title,
      description: body.description ?? null,
      required: body.required ?? false,
      position: (last?.position ?? -1) + 1,
      variable: body.variable ?? null,
      config: body.config ?? {},
      logic: body.logic ?? [],
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ field: data }, { status: 201 });
}
