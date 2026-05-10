"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteResponse(formId: string, responseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: form } = await supabase.from("forms").select("id").eq("id", formId).eq("user_id", user.id).single();
  if (!form) throw new Error("Not found");

  await supabase.from("responses").delete().eq("id", responseId).eq("form_id", formId);
  revalidatePath(`/forms/${formId}/responses`);
}
