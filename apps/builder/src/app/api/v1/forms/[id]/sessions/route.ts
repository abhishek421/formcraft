import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase-service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const supabase = createServiceClient();

  const { data: form } = await supabase
    .from("forms")
    .select("id")
    .eq("id", id)
    .eq("published", true)
    .single();

  if (!form) return Response.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("form_sessions")
    .insert({
      form_id: id,
      device_type: body.device_type ?? null,
      referrer: body.referrer ?? null,
      metadata: body.metadata ?? null,
    })
    .select("id")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ session_id: data.id }, { status: 201 });
}
