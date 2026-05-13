"use server";

import { createClient } from "@/lib/supabase/server";
import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

export async function createApiKey(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const raw = `fc_${randomBytes(32).toString("hex")}`;
  const hash = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 10);

  const { error } = await supabase.from("api_keys").insert({
    user_id: user.id,
    name,
    key_hash: hash,
    key_prefix: prefix,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/app/api-keys");
  return { key: raw };
}

export async function deleteApiKey(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await supabase.from("api_keys").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/app/api-keys");
}

export async function listApiKeys() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, created_at, last_used_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
