import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateProfile, updatePassword } from "./actions";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error, success } = await searchParams;
  const name = (user.user_metadata?.full_name as string) ?? "";
  const joinedAt = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div style={{ padding: "var(--space-8)", maxWidth: 600 }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "24px",
          fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px",
          marginBottom: "var(--space-1)",
        }}>
          Profile
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: 300 }}>
          Manage your account details and password.
        </p>
      </div>

      {/* Feedback banners */}
      {error && (
        <div style={{
          fontSize: "12px", color: "var(--error)",
          padding: "10px 14px", background: "var(--error-bg)",
          borderLeft: "2px solid var(--error)", marginBottom: "var(--space-6)",
        }}>
          {decodeURIComponent(error)}
        </div>
      )}
      {success === "profile" && (
        <div style={{
          fontSize: "12px", color: "var(--accent)",
          padding: "10px 14px",
          background: "rgba(202,255,0,0.06)",
          borderLeft: "2px solid var(--accent)", marginBottom: "var(--space-6)",
        }}>
          Profile updated.
        </div>
      )}
      {success === "password" && (
        <div style={{
          fontSize: "12px", color: "var(--accent)",
          padding: "10px 14px",
          background: "rgba(202,255,0,0.06)",
          borderLeft: "2px solid var(--accent)", marginBottom: "var(--space-6)",
        }}>
          Password changed successfully.
        </div>
      )}

      {/* ── Account info card ── */}
      <section style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", marginBottom: "var(--space-6)",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 500 }}>
            Account info
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Avatar initials */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              background: "var(--accent)", color: "#080808",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 800,
            }}>
              {name ? name.charAt(0).toUpperCase() : user.email!.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
                {name || "—"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: 2 }}>
                Member since {joinedAt}
              </div>
            </div>
          </div>

          <form action={updateProfile} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Full name</label>
              <input
                name="full_name"
                type="text"
                defaultValue={name}
                placeholder="Your name"
                style={inputStyle}
              />
            </div>

            {/* Email (read-only) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Email</label>
              <div style={{ ...inputStyle, color: "var(--text-dim)", cursor: "default" }}>
                {user.email}
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>
                Email cannot be changed.
              </span>
            </div>

            <div>
              <button type="submit" style={btnStyle}>Save changes</button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Change password card ── */}
      <section style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 500 }}>
            Change password
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          <form action={updatePassword} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Current password</label>
              <input name="current_password" type="password" placeholder="••••••••" style={inputStyle} required />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>New password</label>
              <input name="new_password" type="password" placeholder="Min. 8 characters" style={inputStyle} required />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Confirm new password</label>
              <input name="confirm_password" type="password" placeholder="Same again" style={inputStyle} required />
            </div>
            <div>
              <button type="submit" style={btnStyle}>Update password</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
  color: "var(--text-dim)", fontWeight: 500, fontFamily: "var(--font-body)",
};

const inputStyle: React.CSSProperties = {
  background: "transparent", border: "none",
  borderBottom: "1px solid var(--border)",
  color: "var(--text)", fontFamily: "var(--font-body)",
  fontSize: "14px", fontWeight: 300,
  padding: "10px 0", outline: "none", width: "100%",
};

const btnStyle: React.CSSProperties = {
  background: "var(--accent)", color: "#080808", border: "none",
  fontFamily: "var(--font-display)", fontSize: "12px",
  fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase",
  padding: "12px 24px", cursor: "pointer",
  transition: "opacity 0.15s ease",
};
