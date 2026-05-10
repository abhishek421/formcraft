"use server";

import { createClient } from "@/lib/supabase/server";

async function ownsForm(supabase: Awaited<ReturnType<typeof createClient>>, formId: string, userId: string) {
  const { data } = await supabase.from("forms").select("id").eq("id", formId).eq("user_id", userId).single();
  return !!data;
}

export async function createGroup(formId: string, label: string): Promise<{ id: string; label: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (!(await ownsForm(supabase, formId, user.id))) return null;

  const { data, error } = await supabase
    .from("question_groups")
    .insert({ form_id: formId, label })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createVariant(
  formId: string,
  groupId: string,
  payload: {
    variant_label: string;
    title: string;
    type: string;
    description?: string;
    config?: Record<string, unknown>;
    logic?: unknown[];
  }
): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (!(await ownsForm(supabase, formId, user.id))) return null;

  const { data, error } = await supabase
    .from("question_variants")
    .insert({
      question_group_id: groupId,
      variant_label: payload.variant_label,
      title: payload.title,
      type: payload.type,
      description: payload.description ?? null,
      config: payload.config ?? {},
      logic: payload.logic ?? [],
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function listVariants(
  formId: string,
  groupId: string
): Promise<Array<{
  id: string;
  variant_label: string;
  title: string;
  description?: string;
  type: string;
  config: Record<string, unknown>;
  logic: unknown[];
  traffic_weight: number;
  is_active: boolean;
  created_at: string;
}>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  if (!(await ownsForm(supabase, formId, user.id))) return [];

  const { data } = await supabase
    .from("question_variants")
    .select("*")
    .eq("question_group_id", groupId)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function patchVariant(
  formId: string,
  groupId: string,
  variantId: string,
  updates: Partial<{ title: string; description: string; is_active: boolean; traffic_weight: number }>
): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  if (!(await ownsForm(supabase, formId, user.id))) return false;

  const { error } = await supabase
    .from("question_variants")
    .update(updates)
    .eq("id", variantId)
    .eq("question_group_id", groupId);

  return !error;
}

export async function removeVariant(
  formId: string,
  groupId: string,
  variantId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  if (!(await ownsForm(supabase, formId, user.id))) return false;

  const { error } = await supabase
    .from("question_variants")
    .delete()
    .eq("id", variantId)
    .eq("question_group_id", groupId);

  return !error;
}

export async function resetVariantWeights(
  formId: string,
  groupId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  if (!(await ownsForm(supabase, formId, user.id))) return false;

  const { data: variants } = await supabase
    .from("question_variants")
    .select("id")
    .eq("question_group_id", groupId);

  if (!variants?.length) return false;

  const weight = 1.0 / variants.length;
  await Promise.all(
    variants.map((v: { id: string }) =>
      supabase.from("question_variants").update({ traffic_weight: weight }).eq("id", v.id)
    )
  );

  return true;
}
