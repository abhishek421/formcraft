import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getForm } from "./actions";
import { BuilderShell } from "./_components/builder-shell";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ form, fields }, supabase] = await Promise.all([getForm(id), createClient()]);
  const { data: { user } } = await supabase.auth.getUser();

  if (!form) notFound();

  return <BuilderShell form={form} initialFields={fields} email={user?.email ?? ""} />;
}
