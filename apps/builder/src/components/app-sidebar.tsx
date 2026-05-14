"use client";

import Link from "next/link";
import { CFLogo } from "./logo";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/app/login/actions";

const NAV = [
  {
    label: "Forms",
    href: "/app/forms",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="3" stroke="currentColor" strokeWidth="1.2" />
        <rect x="2" y="7" width="8" height="1.5" fill="currentColor" />
        <rect x="2" y="10.5" width="6" height="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Integrations",
    href: "/app/integrations",
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
    label: "API Keys",
    href: "/app/api-keys",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
        <path d="M9 8h5M12 6.5V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Docs",
    href: "/docs",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="2" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <line x1="5.5" y1="5.5" x2="10.5" y2="5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="5.5" y1="10.5" x2="8.5" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/app/profile",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2.5 13c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const COLLAPSED_WIDTH = 56;
const EXPANDED_WIDTH = 220;

export function AppSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const collapsed = !hovered;
  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  if (!mounted) return <div style={{ width: COLLAPSED_WIDTH, flexShrink: 0 }} />;

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width,
        flexShrink: 0,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        transition: `width 0.2s cubic-bezier(0.4,0,0.2,1)`,
        zIndex: 20,
        overflow: "hidden",
      }}>

      {/* Logo */}
      <div style={{
        height: "56px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        paddingLeft: "20px",
        flexShrink: 0,
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}>
        <CFLogo size={20} />
        <span style={{
          marginLeft: "10px",
          fontFamily: "'Arvo', serif", fontSize: "16px",
          fontWeight: 700, color: "var(--text)",
          opacity: collapsed ? 0 : 1,
          transition: "opacity 0.15s ease",
        }}>
          CleverForms
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "var(--space-3) 0", overflowY: "auto", overflowX: "hidden" }}>
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              style={{
                display: "flex", alignItems: "center",
                height: "36px",
                paddingLeft: "20px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px", fontFamily: "var(--font-body)",
                fontWeight: active ? 500 : 300,
                color: active ? "var(--text)" : "var(--text-muted)",
                background: active ? "var(--border-mid)" : "transparent",
                textDecoration: "none",
                transition: `background var(--duration) var(--ease), color var(--duration) var(--ease)`,
                marginBottom: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              <span style={{ color: active ? "var(--accent)" : "var(--text-dim)", flexShrink: 0, display: "flex", alignItems: "center" }}>
                {item.icon}
              </span>
              <span style={{
                marginLeft: "10px",
                opacity: collapsed ? 0 : 1,
                transition: "opacity 0.15s ease",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {item.label}
              </span>
              {active && !collapsed && (
                <span style={{ marginRight: "12px", width: "4px", height: "4px", background: "var(--accent)", borderRadius: "50%", flexShrink: 0 }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + sign out */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "var(--space-3) 0", display: "flex", flexDirection: "column" }}>
        <div style={{
          display: "flex", alignItems: "center",
          height: "36px", paddingLeft: "20px",
          overflow: "hidden", whiteSpace: "nowrap",
        }}>
          <form action={logout} style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <button type="submit" title="Sign out" style={{
              background: "transparent", border: "none", padding: 0,
              color: "var(--text-faint)", cursor: "pointer",
              display: "flex", alignItems: "center", flexShrink: 0,
              transition: `color var(--duration) var(--ease)`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-faint)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H2v10h3M9 4l3 3-3 3M12 7H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span style={{
              marginLeft: "10px",
              fontSize: "11px", color: "var(--text-dim)",
              fontFamily: "var(--font-body)", fontWeight: 300,
              overflow: "hidden", textOverflow: "ellipsis",
              opacity: collapsed ? 0 : 1,
              transition: "opacity 0.15s ease",
              flex: 1,
            }}>
              {email}
            </span>
          </form>
        </div>
      </div>
    </aside>
  );
}
