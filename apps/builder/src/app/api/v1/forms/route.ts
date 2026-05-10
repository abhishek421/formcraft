import { NextRequest } from "next/server";
import { authenticateApiKey, unauthorized, badRequest } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { data } = await auth.supabase
    .from("forms")
    .select("id, title, description, published, created_at, updated_at")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });

  return Response.json({ forms: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.title) return badRequest("title is required");

  const { data, error } = await auth.supabase
    .from("forms")
    .insert({
      user_id: auth.userId,
      title: body.title,
      description: body.description ?? null,
      settings: body.settings ?? undefined,
      theme: body.theme ?? undefined,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ form: data }, { status: 201 });
}
