import { NextRequest } from "next/server";
import { authenticateApiKey, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; responseId: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id, responseId } = await params;
  const { data: form } = await auth.supabase.from("forms").select("id").eq("id", id).eq("user_id", auth.userId).single();
  if (!form) return notFound();

  const { data: response } = await auth.supabase
    .from("responses")
    .select("id, started_at, submitted_at, metadata, answers(field_id, value)")
    .eq("id", responseId)
    .eq("form_id", id)
    .single();

  if (!response) return notFound();
  return Response.json({ response });
}
