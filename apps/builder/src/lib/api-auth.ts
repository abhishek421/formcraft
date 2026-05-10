import { createClient as createBrowserClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { createHash } from "crypto";

function createServiceClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function authenticateApiKey(req: NextRequest): Promise<{ userId: string; supabase: ReturnType<typeof createServiceClient> } | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const key = auth.slice(7);
  const hash = createHash("sha256").update(key).digest("hex");

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("api_keys")
    .select("user_id")
    .eq("key_hash", hash)
    .single();

  if (!data) return null;

  supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("key_hash", hash);

  return { userId: data.user_id, supabase };
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound() {
  return Response.json({ error: "Not found" }, { status: 404 });
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}
