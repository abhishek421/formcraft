import { notFound } from "next/navigation";
import { getPublicForm } from "./actions";
import { FormRenderer } from "./_components/form-renderer";

export default async function FormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { form, fields } = await getPublicForm(id);

  if (!form) notFound();

  return <FormRenderer form={form} fields={fields} />;
}
