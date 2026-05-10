"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/app/login/actions";
import { SettingsPanel } from "./settings-panel";

const NAV = [
  {
    label: "Forms",
    href: "/forms",
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
    label: "API Keys",
    href: "/api-keys",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
        <path d="M9 8h5M12 6.5V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const COLLAPSED_WIDTH = 56;
const EXPANDED_WIDTH = 220;

export function AppSidebar({ email, defaultCollapsed = false }: { email: string; defaultCollapsed?: boolean }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCollapsed(defaultCollapsed);
    setMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  if (!mounted) return <div style={{ width: EXPANDED_WIDTH, flexShrink: 0 }} />;

  return (
    <aside style={{
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
    }}>

      {/* Logo + toggle */}
      <div style={{
        height: "56px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        padding: collapsed ? "0" : "0 var(--space-3) 0 var(--space-5)",
        flexShrink: 0,
        overflow: "hidden",
      }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <div style={{ width: "8px", height: "8px", background: "var(--accent)", borderRadius: "50%", flexShrink: 0 }} />
            <span style={{
              fontFamily: "var(--font-display)", fontSize: "17px",
              fontWeight: 800, color: "var(--text)", letterSpacing: "-0.3px",
              whiteSpace: "nowrap",
            }}>
              FormCraft
            </span>
          </div>
        )}
        {collapsed && (
          <div style={{ width: "8px", height: "8px", background: "var(--accent)", borderRadius: "50%" }} />
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            background: "transparent", border: "none",
            color: "var(--text-dim)", cursor: "pointer",
            padding: "var(--space-1)", display: "flex", alignItems: "center",
            transition: `color var(--duration) var(--ease)`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-dim)"; }}
        >
          {collapsed ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 7h6M7 4l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10 7H4M7 4L4 7l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? "var(--space-3) 0" : "var(--space-4) var(--space-3)", overflowY: "auto", overflowX: "hidden" }}>
        {!collapsed && (
          <div style={{
            fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
            color: "var(--text-dim)", padding: "var(--space-1) var(--space-3) var(--space-3)",
            fontFamily: "var(--font-body)",
          }}>
            Workspace
          </div>
        )}

        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");

          if (collapsed) {
            return (
              <div key={item.href} style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-1)" }}>
                <Link
                  href={item.href}
                  title={item.label}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "36px", height: "36px", borderRadius: "var(--radius-sm)",
                    color: active ? "var(--accent)" : "var(--text-dim)",
                    background: active ? "var(--accent-dim)" : "transparent",
                    textDecoration: "none", transition: `all var(--duration) var(--ease)`,
                  }}
                >
                  {item.icon}
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: "var(--space-2)",
                padding: "9px var(--space-3)", borderRadius: "var(--radius-sm)",
                fontSize: "13px", fontFamily: "var(--font-body)",
                fontWeight: active ? 500 : 300,
                color: active ? "var(--text)" : "var(--text-muted)",
                background: active ? "var(--border-mid)" : "transparent",
                textDecoration: "none", transition: `all var(--duration) var(--ease)`,
                marginBottom: "var(--space-1)", whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: active ? "var(--accent)" : "var(--text-dim)", flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <span style={{ marginLeft: "auto", width: "4px", height: "4px", background: "var(--accent)", borderRadius: "50%", flexShrink: 0 }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: settings + user + sign out */}
      <div style={{ borderTop: "1px solid var(--border)", padding: collapsed ? "var(--space-3) 0" : "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>

        {/* Settings trigger */}
        <SettingsPanel inSidebar collapsed={collapsed} />

        {/* Sign out */}
        {collapsed ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <form action={logout}>
              <button type="submit" title="Sign out" style={{
                background: "transparent", border: "none",
                color: "var(--text-faint)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "var(--radius-sm)",
                transition: `color var(--duration) var(--ease)`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-faint)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2H2v10h3M9 4l3 3-3 3M12 7H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </div>
        ) : (
          <div style={{ padding: "var(--space-1) var(--space-3)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{
              fontSize: "11px", color: "var(--text-dim)",
              fontFamily: "var(--font-body)", fontWeight: 300,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
            }}>
              {email}
            </div>
            <form action={logout}>
              <button type="submit" style={{
                background: "transparent", border: "none", padding: 0,
                fontSize: "11px", color: "var(--text-faint)",
                fontFamily: "var(--font-body)", cursor: "pointer",
                letterSpacing: "0.5px", marginLeft: "var(--space-2)",
                transition: `color var(--duration) var(--ease)`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-faint)"; }}
              >
                sign out →
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
