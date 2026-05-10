import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase-service";

const VALID_EVENT_TYPES = new Set([
  "shown",
  "answered",
  "skipped",
  "abandoned",
  "backtracked",
  "validation_error",
]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await req.json().catch(() => ({}));
  const events: unknown[] = body.events;

  if (!Array.isArray(events)) {
    return Response.json({ error: "events must be an array" }, { status: 400 });
  }
  if (events.length > 50) {
    return Response.json({ error: "Max 50 events per call" }, { status: 400 });
  }

  // Validate event_types
  for (const e of events) {
    const ev = e as Record<string, unknown>;
    if (!VALID_EVENT_TYPES.has(ev.event_type as string)) {
      return Response.json(
        { error: `Invalid event_type: ${ev.event_type}` },
        { status: 400 }
      );
    }
  }

  const supabase = createServiceClient();

  const { data: session } = await supabase
    .from("form_sessions")
    .select("id")
    .eq("id", sessionId)
    .single();

  if (!session) return Response.json({ error: "Not found" }, { status: 404 });

  const rows = (events as Record<string, unknown>[]).map((e) => ({
    session_id: sessionId,
    variant_id: e.variant_id ?? null,
    field_id: e.field_id ?? null,
    event_type: e.event_type,
    duration_ms: e.duration_ms ?? null,
    metadata: e.metadata ?? null,
  }));

  const { error } = await supabase.from("question_events").insert(rows);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return new Response(null, { status: 204 });
}
