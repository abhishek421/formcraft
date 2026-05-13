import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResponsesShell } from "./_components/responses-shell";

async function getFormWithResponses(id: string) {
  const supabase = await createClient();

  const [{ data: form }, { data: fields }, { data: responses }, { data: { user } }] = await Promise.all([
    supabase.from("forms").select("id, title, published").eq("id", id).single(),
    supabase.from("fields").select("id, type, title, variable, position").eq("form_id", id).order("position", { ascending: true }),
    supabase.from("responses").select(`id, started_at, submitted_at, answers ( field_id, value )`).eq("form_id", id).order("submitted_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  if (!form) return null;

  return {
    form,
    fields: fields ?? [],
    responses: (responses ?? []).filter((r) => r.submitted_at !== null),
    email: user?.email ?? "",
  };
}

export default async function ResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getFormWithResponses(id);
  if (!data) notFound();
  return <ResponsesShell {...data} />;
}
