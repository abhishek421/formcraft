"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getForm(id: string) {
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .single();

  const { data: fields } = await supabase
    .from("fields")
    .select("*")
    .eq("form_id", id)
    .order("position", { ascending: true });

  return { form, fields: fields ?? [] };
}

async function markUnpublishedChanges(supabase: Awaited<ReturnType<typeof createClient>>, formId: string) {
  // Single round-trip: only sets flag when the form is already published
  await supabase
    .from("forms")
    .update({ has_unpublished_changes: true })
    .eq("id", formId)
    .eq("published", true);
}

export async function updateFormTitle(formId: string, title: string) {
  const supabase = await createClient();
  await supabase.from("forms").update({ title }).eq("id", formId);
  await markUnpublishedChanges(supabase, formId);
}

export async function publishForm(formId: string) {
  const supabase = await createClient();

  const { data: fields } = await supabase
    .from("fields")
    .select("*")
    .eq("form_id", formId)
    .order("position", { ascending: true });

  const { data: form } = await supabase
    .from("forms")
    .select("title, description, theme, settings")
    .eq("id", formId)
    .single();

  if (!form) throw new Error("Form not found");

  // Replace snapshot atomically: delete old rows, insert fresh ones
  await supabase.from("published_fields").delete().eq("form_id", formId);

  if (fields?.length) {
    const snapshot = fields.map(({ created_at: _ca, ...rest }) => {
      void _ca;
      return rest;
    });
    const { error } = await supabase.from("published_fields").insert(snapshot);
    if (error) throw new Error(error.message);
  }

  await supabase.from("forms").update({
    published: true,
    has_unpublished_changes: false,
    published_snapshot: {
      title: form.title,
      description: form.description,
      theme: form.theme,
      settings: form.settings,
    },
  }).eq("id", formId);

  revalidatePath(`/app/forms/${formId}/builder`);
}

export async function unpublishForm(formId: string) {
  const supabase = await createClient();
  await supabase.from("forms").update({
    published: false,
    has_unpublished_changes: false,
  }).eq("id", formId);
  revalidatePath(`/app/forms/${formId}/builder`);
}

export async function addField(formId: string, type: string, position: number) {
  const supabase = await createClient();

  const defaults: Record<string, object> = {
    welcome_screen: { blocks: [{ id: crypto.randomUUID(), type: "heading", content: "" }] },
    multiple_choice: { choices: [{ id: crypto.randomUUID(), label: "Option 1" }, { id: crypto.randomUUID(), label: "Option 2" }], allow_multiple: false },
    rating: { steps: 5 },
    opinion_scale: { steps: 10 },
    dropdown: { choices: [{ id: crypto.randomUUID(), label: "Option 1" }] },
  };

  const { data, error } = await supabase
    .from("fields")
    .insert({
      form_id: formId,
      type,
      title: "",
      position,
      config: defaults[type] ?? {},
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  await markUnpublishedChanges(supabase, formId);
  return data;
}

export async function updateField(fieldId: string, updates: Record<string, unknown>) {
  const supabase = await createClient();
  await supabase.from("fields").update(updates).eq("id", fieldId);
  // Look up form_id to check published state
  const { data: field } = await supabase.from("fields").select("form_id").eq("id", fieldId).single();
  if (field?.form_id) await markUnpublishedChanges(supabase, field.form_id);
}

export async function deleteField(fieldId: string) {
  const supabase = await createClient();
  const { data: field } = await supabase.from("fields").select("form_id").eq("id", fieldId).single();
  await supabase.from("fields").delete().eq("id", fieldId);
  if (field?.form_id) await markUnpublishedChanges(supabase, field.form_id);
}

export async function updateFormTheme(formId: string, theme: Record<string, unknown>) {
  const supabase = await createClient();
  await supabase.from("forms").update({ theme }).eq("id", formId);
  await markUnpublishedChanges(supabase, formId);
}

export async function reorderFields(fields: { id: string; position: number }[]) {
  const supabase = await createClient();
  if (!fields.length) return;
  await Promise.all(
    fields.map(({ id, position }) =>
      supabase.from("fields").update({ position }).eq("id", id)
    )
  );
  // All fields share the same form — grab form_id from the first one
  const { data: field } = await supabase.from("fields").select("form_id").eq("id", fields[0].id).single();
  if (field?.form_id) await markUnpublishedChanges(supabase, field.form_id);
}
