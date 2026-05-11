import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingShell } from "./_components/onboarding-shell";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <OnboardingShell email={user.email!} />;
}
