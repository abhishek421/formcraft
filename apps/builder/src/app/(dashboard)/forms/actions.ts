"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createForm() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("forms")
    .insert({ title: "Untitled Form", user_id: user.id })
    .select("id")
    .single();

  if (error || !data) throw new Error("Failed to create form");

  redirect(`/forms/${data.id}/builder`);
}

export async function getForms() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("forms")
    .select(`id, title, published, updated_at, responses(count)`)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return [];

  return (data ?? []).map((f) => ({
    id: f.id,
    title: f.title,
    published: f.published,
    updated_at: f.updated_at,
    response_count: (f.responses as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));
}
