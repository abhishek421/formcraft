import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authenticateApiKey, unauthorized, notFound, badRequest } from "@/lib/api-auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  const supabase = await createClient();
  const { data: form } = await supabase.from("forms").select("id").eq("id", id).eq("user_id", auth.userId).single();
  if (!form) return notFound();

  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.fields)) return badRequest("fields array is required: [{id, position}]");

  await Promise.all(
    body.fields.map(({ id: fieldId, position }: { id: string; position: number }) =>
      supabase.from("fields").update({ position }).eq("id", fieldId).eq("form_id", id)
    )
  );

  return Response.json({ ok: true });
}
