import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await req.json().catch(() => ({}));

  const supabase = createServiceClient();

  const { error } = await supabase
    .from("form_sessions")
    .update({ completed_at: body.completed_at ?? new Date().toISOString() })
    .eq("id", sessionId);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
