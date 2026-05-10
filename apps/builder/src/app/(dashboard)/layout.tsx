import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#080808",
      color: "#F0EDE8",
    }}>
      <AppSidebar email={user.email!} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
