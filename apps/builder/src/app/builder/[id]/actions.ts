"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getForm(id: string) {
  const supabase = await createClient();

  const [{ data: form }, { data: fields }, { data: { user } }] = await Promise.all([
    supabase.from("forms").select("*").eq("id", id).single(),
    supabase.from("fields").select("*").eq("form_id", id).order("position", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  return { form, fields: fields ?? [], email: user?.email ?? "" };
}

export async function updateFormTitle(formId: string, title: string) {
  const supabase = await createClient();
  await supabase.from("forms").update({ title }).eq("id", formId);
}

export async function togglePublish(formId: string, published: boolean) {
  const supabase = await createClient();
  await supabase.from("forms").update({ published }).eq("id", formId);
  revalidatePath(`/builder/${formId}`);
}

export async function addField(formId: string, type: string, position: number) {
  const supabase = await createClient();

  const defaults: Record<string, object> = {
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
  return data;
}

export async function updateField(fieldId: string, updates: Record<string, unknown>) {
  const supabase = await createClient();
  await supabase.from("fields").update(updates).eq("id", fieldId);
}

export async function deleteField(fieldId: string) {
  const supabase = await createClient();
  await supabase.from("fields").delete().eq("id", fieldId);
}

export async function reorderFields(fields: { id: string; position: number }[]) {
  const supabase = await createClient();
  await Promise.all(
    fields.map(({ id, position }) =>
      supabase.from("fields").update({ position }).eq("id", id)
    )
  );
}
