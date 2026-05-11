"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/forms");
}

export async function signup(formData: FormData) {
  const { createClient: createServiceClient } = await import(
    "@supabase/supabase-js"
  );
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const email = (formData.get("email") as string).trim().toLowerCase();
  const reason = (formData.get("reason") as string | null)?.trim() || null;

  const { error } = await supabase.from("waitlist").insert({ email, reason });

  if (error) {
    const msg =
      error.code === "23505"
        ? "You're already on the list."
        : error.message;
    redirect("/login?tab=signup&error=" + encodeURIComponent(msg));
  }

  redirect("/login?tab=signup&success=1");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
