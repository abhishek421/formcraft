"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createForm() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("forms")
    .insert({ title: "Untitled Form" })
    .select("id")
    .single();

  if (error || !data) throw new Error("Failed to create form");

  redirect(`/builder/${data.id}`);
}

export async function getForms() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("forms")
    .select(`
      id,
      title,
      published,
      updated_at,
      responses(count)
    `)
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
