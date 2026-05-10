import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      color: "#F0EDE8",
      fontFamily: "'DM Mono', monospace",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "16px",
    }}>
      <div style={{ fontSize: "13px", opacity: 0.4 }}>logged in as</div>
      <div style={{ fontSize: "16px" }}>{user?.email}</div>
      <form action={logout}>
        <button type="submit" style={{
          marginTop: "16px",
          background: "transparent",
          border: "1px solid rgba(240,237,232,0.1)",
          color: "#F0EDE8",
          fontFamily: "'DM Mono', monospace",
          fontSize: "12px",
          padding: "10px 20px",
          cursor: "pointer",
          letterSpacing: "1px",
        }}>
          sign out
        </button>
      </form>
    </div>
  );
}
