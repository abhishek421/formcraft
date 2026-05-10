"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

const NAV = [
  {
    label: "Forms",
    href: "/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="3" stroke="currentColor" strokeWidth="1.2" />
        <rect x="2" y="7" width="8" height="1.5" fill="currentColor" />
        <rect x="2" y="10.5" width="6" height="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Templates",
    href: "/templates",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="8.5" y="2" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="2" y="8.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.2" />
        <rect x="8.5" y="8.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "Integrations",
    href: "/integrations",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.2" />
        <line x1="6" y1="7" x2="10" y2="4.8" stroke="currentColor" strokeWidth="1.2" />
        <line x1="6" y1="9" x2="10" y2="11.2" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.27 1.27M11.33 11.33l1.27 1.27M3.4 12.6l1.27-1.27M11.33 4.67l1.27-1.27" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside style={{
      width: "220px",
      flexShrink: 0,
      background: "#0D0D0D",
      borderRight: "1px solid rgba(240,237,232,0.06)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: "28px 24px 24px",
        borderBottom: "1px solid rgba(240,237,232,0.06)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <div style={{
          width: "8px",
          height: "8px",
          background: "#CAFF00",
          borderRadius: "50%",
        }} />
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "17px",
          fontWeight: 800,
          color: "#F0EDE8",
          letterSpacing: "-0.3px",
        }}>
          FormCraft
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <div style={{
          fontSize: "10px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "rgba(240,237,232,0.25)",
          padding: "4px 12px 12px",
          fontFamily: "'DM Mono', monospace",
        }}>
          Workspace
        </div>
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "4px",
                fontSize: "13px",
                fontFamily: "'DM Mono', monospace",
                fontWeight: active ? 500 : 300,
                color: active ? "#F0EDE8" : "rgba(240,237,232,0.4)",
                background: active ? "rgba(240,237,232,0.06)" : "transparent",
                textDecoration: "none",
                transition: "all 0.12s ease",
                marginBottom: "2px",
              }}
            >
              <span style={{ color: active ? "#CAFF00" : "rgba(240,237,232,0.3)" }}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <span style={{
                  marginLeft: "auto",
                  width: "4px",
                  height: "4px",
                  background: "#CAFF00",
                  borderRadius: "50%",
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{
        borderTop: "1px solid rgba(240,237,232,0.06)",
        padding: "16px 12px",
      }}>
        <div style={{
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          <div style={{
            fontSize: "11px",
            color: "rgba(240,237,232,0.35)",
            fontFamily: "'DM Mono', monospace",
            fontWeight: 300,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {email}
          </div>
          <form action={logout}>
            <button type="submit" style={{
              background: "transparent",
              border: "none",
              padding: 0,
              fontSize: "11px",
              color: "rgba(240,237,232,0.25)",
              fontFamily: "'DM Mono', monospace",
              cursor: "pointer",
              letterSpacing: "0.5px",
              textAlign: "left",
            }}>
              sign out →
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
