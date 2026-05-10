"use server";

import { createClient } from "@/lib/supabase/server";

export async function getPublicForm(id: string) {
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("id, title, description, settings, theme")
    .eq("id", id)
    .single();

  const { data: fields } = await supabase
    .from("fields")
    .select("id, type, title, description, required, position, variable, config, logic")
    .eq("form_id", id)
    .order("position", { ascending: true });

  return { form, fields: fields ?? [] };
}

export async function submitResponse(
  formId: string,
  answers: { field_id: string; value: unknown }[]
) {
  const supabase = await createClient();

  const { data: response, error } = await supabase
    .from("responses")
    .insert({ form_id: formId, submitted_at: new Date().toISOString() })
    .select("id")
    .single();

  if (error || !response) throw new Error("Failed to create response");

  if (answers.length > 0) {
    await supabase.from("answers").insert(
      answers.map(({ field_id, value }) => ({
        response_id: response.id,
        field_id,
        value,
      }))
    );
  }

  return response.id;
}
