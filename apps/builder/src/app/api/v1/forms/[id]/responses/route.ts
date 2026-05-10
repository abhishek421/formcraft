import { NextRequest } from "next/server";
import { authenticateApiKey, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req);
  if (!auth) return unauthorized();

  const { id } = await params;
  const { data: form } = await auth.supabase.from("forms").select("id").eq("id", id).eq("user_id", auth.userId).single();
  if (!form) return notFound();

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
  const offset = (page - 1) * limit;

  const { data: responses, count } = await auth.supabase
    .from("responses")
    .select("id, started_at, submitted_at, metadata, answers(field_id, value)", { count: "exact" })
    .eq("form_id", id)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return Response.json({
    responses: responses ?? [],
    pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
  });
}
