import { createResource, createSignal, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import { supabase } from "../lib/supabase";
import { FormRenderer } from "../components/FormRenderer";
import type { Field, Form, VariantAssignment } from "../lib/types";

const API_BASE = `${import.meta.env.VITE_BUILDER_URL}/api/v1`;

function detectDevice(): "mobile" | "tablet" | "desktop" {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

async function loadForm(id: string): Promise<{ form: Form; fields: Field[] } | null> {
  const [formRes, fieldsRes] = await Promise.all([
    supabase.from("forms").select("id, title, settings, theme").eq("id", id).single(),
    supabase
      .from("fields")
      .select("id, type, title, description, required, position, variable, config, logic, question_group_id")
      .eq("form_id", id)
      .order("position"),
  ]);

  if (formRes.error || !formRes.data) return null;

  return {
    form: formRes.data as Form,
    fields: (fieldsRes.data ?? []) as Field[],
  };
}

async function initSession(formId: string): Promise<{
  sessionId: string;
  assignments: VariantAssignment[];
}> {
  const storageKey = `fc_session_${formId}`;
  let sessionId = localStorage.getItem(storageKey);

  if (!sessionId) {
    const body: Record<string, unknown> = { device_type: detectDevice() };
    if (document.referrer) body.referrer = document.referrer;

    const res = await fetch(`${API_BASE}/forms/${formId}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Session create failed: ${res.status}`);
    const json = await res.json();
    sessionId = json.session_id as string;
    localStorage.setItem(storageKey, sessionId);
  }

  let assignments: VariantAssignment[] = [];
  try {
    const assignRes = await fetch(`${API_BASE}/forms/${formId}/sessions/${sessionId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (assignRes.ok) {
      const assignJson = await assignRes.json();
      assignments = (assignJson.assignments ?? []) as VariantAssignment[];
    } else {
      console.error("Assign API failed:", assignRes.status);
    }
  } catch (err) {
    console.error("Assign API error:", err);
  }

  return { sessionId, assignments };
}

function mergeAssignments(fields: Field[], assignments: VariantAssignment[]): Field[] {
  if (!assignments.length) return fields;
  return fields.map((field) => {
    if (!field.question_group_id) return field;
    const assignment = assignments.find((a) => a.question_group_id === field.question_group_id);
    if (!assignment) return field;
    return {
      ...field,
      ...(assignment.title !== undefined && { title: assignment.title }),
      ...(assignment.description !== undefined && { description: assignment.description }),
      ...(assignment.type !== undefined && { type: assignment.type }),
      ...(assignment.config !== undefined && { config: assignment.config }),
      ...(assignment.logic !== undefined && { logic: assignment.logic }),
    };
  });
}

export function FormPage() {
  const params = useParams<{ id: string }>();
  const [data] = createResource(() => params.id, loadForm);
  const [sessionId, setSessionId] = createSignal<string | null>(null);
  const [assignments, setAssignments] = createSignal<VariantAssignment[]>([]);
  const [sessionReady, setSessionReady] = createSignal(false);

  createResource(
    () => (data() ? params.id : null),
    async (id) => {
      try {
        const { sessionId: sid, assignments: asgn } = await initSession(id);
        setSessionId(sid);
        setAssignments(asgn);
      } catch (err) {
        console.error("Session init error:", err);
      } finally {
        setSessionReady(true);
      }
    }
  );

  const mergedFields = () => {
    const d = data();
    if (!d) return [];
    return mergeAssignments(d.fields, assignments());
  };

  function handleRestart() {
    const id = params.id;
    localStorage.removeItem(`fc_session_${id}`);
    window.location.reload();
  }

  return (
    <Show when={!data.loading && sessionReady()} fallback={<LoadingScreen />}>
      <Show when={data()} fallback={<ErrorScreen />}>
        {(d) => (
          <FormRenderer
            form={d().form}
            fields={mergedFields()}
            sessionId={sessionId()}
            variantAssignments={assignments()}
            onRestart={handleRestart}
          />
        )}
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
