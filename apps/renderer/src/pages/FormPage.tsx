import { createResource, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import { supabase } from "../lib/supabase";
import { FormRenderer } from "../components/FormRenderer";
import type { Field, Form } from "../lib/types";

async function loadForm(id: string): Promise<{ form: Form; fields: Field[] } | null> {
  const [formRes, fieldsRes] = await Promise.all([
    supabase.from("forms").select("id, title, settings, theme").eq("id", id).single(),
    supabase
      .from("fields")
      .select("id, type, title, description, required, position, variable, config, logic")
      .eq("form_id", id)
      .order("position"),
  ]);

  if (formRes.error || !formRes.data) return null;

  return {
    form: formRes.data as Form,
    fields: (fieldsRes.data ?? []) as Field[],
  };
}

export function FormPage() {
  const params = useParams<{ id: string }>();
  const [data] = createResource(() => params.id, loadForm);

  return (
    <Show when={!data.loading} fallback={<LoadingScreen />}>
      <Show when={data()} fallback={<ErrorScreen />}>
        {(d) => <FormRenderer form={d().form} fields={d().fields} />}
      </Show>
    </Show>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      "min-height": "100vh",
      background: "#080808",
      display: "flex",
      "align-items": "center",
      "justify-content": "center",
    }}>
      <div style={{
        width: "32px",
        height: "32px",
        border: "2px solid rgba(202,255,0,0.15)",
        "border-top-color": "#CAFF00",
        "border-radius": "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorScreen() {
  return (
    <div style={{
      "min-height": "100vh",
      background: "#080808",
      color: "#F0EDE8",
      display: "flex",
      "align-items": "center",
      "justify-content": "center",
      "font-family": "'DM Mono', monospace",
      "flex-direction": "column",
      gap: "16px",
    }}>
      <div style={{ "font-size": "14px", opacity: "0.4" }}>This form doesn't exist or is unavailable.</div>
    </div>
  );
}
