"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const full_name = (formData.get("full_name") as string).trim();

  const { error } = await supabase.auth.updateUser({
    data: { full_name },
  });

  if (error) {
    redirect("/profile?error=" + encodeURIComponent(error.message));
  }

  redirect("/profile?success=profile");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const current = formData.get("current_password") as string;
  const next = formData.get("new_password") as string;
  const confirm = formData.get("confirm_password") as string;

  if (next !== confirm) {
    redirect("/profile?error=Passwords+don%27t+match");
  }
  if (next.length < 8) {
    redirect("/profile?error=Password+must+be+at+least+8+characters");
  }

  // Re-authenticate with current password first
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });

  if (signInError) {
    redirect("/profile?error=Current+password+is+incorrect");
  }

  const { error } = await supabase.auth.updateUser({ password: next });

  if (error) {
    redirect("/profile?error=" + encodeURIComponent(error.message));
  }

  redirect("/profile?success=password");
}
