import { notFound } from "next/navigation";
import { getForm } from "./actions";
import { BuilderShell } from "./_components/builder-shell";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { form, fields, email } = await getForm(id);

  if (!form) notFound();

  return <BuilderShell form={form} initialFields={fields} email={email} />;
}
