"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/app/login/actions";
import { useTheme } from "./theme-provider";

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
];

const COLLAPSED_WIDTH = 56;
const EXPANDED_WIDTH = 220;

export function AppSidebar({ email, defaultCollapsed = false }: { email: string; defaultCollapsed?: boolean }) {
  const pathname = usePathname();
  const { theme, toggle: toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCollapsed(defaultCollapsed);
    setMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    setCollapsed((c) => !c);
  }

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
      transition: "width 0.2s cubic-bezier(0.4,0,0.2,1)",
      overflow: "hidden",
      zIndex: 20,
    }}>

      {/* Logo + toggle */}
      <div style={{
        height: "56px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        padding: collapsed ? "0" : "0 12px 0 20px",
        flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", background: "var(--accent)", borderRadius: "50%", flexShrink: 0 }} />
            <span style={{
              fontFamily: "'Syne', sans-serif", fontSize: "17px",
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
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            background: "transparent", border: "none",
            color: "var(--text-dim)", cursor: "pointer",
            padding: "4px", display: "flex", alignItems: "center",
            transition: "color 0.12s",
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
      <nav style={{ flex: 1, padding: collapsed ? "12px 0" : "16px 12px", overflowY: "auto" }}>
        {!collapsed && (
          <div style={{
            fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
            color: "var(--text-dim)", padding: "4px 12px 12px",
            fontFamily: "'DM Mono', monospace",
          }}>
            Workspace
          </div>
        )}

        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");

          if (collapsed) {
            return (
              <div key={item.href} style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                <Link
                  href={item.href}
                  title={item.label}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "36px", height: "36px", borderRadius: "6px",
                    color: active ? "var(--accent)" : "var(--text-dim)",
                    background: active ? "var(--accent-dim)" : "transparent",
                    textDecoration: "none", transition: "all 0.12s",
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
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: "4px",
                fontSize: "13px", fontFamily: "'DM Mono', monospace",
                fontWeight: active ? 500 : 300,
                color: active ? "var(--text)" : "var(--text-muted)",
                background: active ? "var(--border-mid)" : "transparent",
                textDecoration: "none", transition: "all 0.12s ease",
                marginBottom: "2px", whiteSpace: "nowrap",
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

      {/* Bottom: theme toggle + user */}
      <div style={{ borderTop: "1px solid var(--border)", padding: collapsed ? "12px 0" : "12px" }}>
        {/* Theme toggle */}
        {collapsed ? (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              style={{
                background: "transparent", border: "none",
                color: "var(--text-dim)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "6px",
                transition: "color 0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-dim)"; }}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        ) : (
          <div style={{ padding: "4px 12px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{
              fontSize: "11px", color: "var(--text-dim)",
              fontFamily: "'DM Mono', monospace", fontWeight: 300,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
            }}>
              {email}
            </div>
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              style={{
                background: "transparent", border: "none",
                color: "var(--text-dim)", cursor: "pointer",
                display: "flex", alignItems: "center",
                padding: "4px", marginLeft: "8px",
                transition: "color 0.12s", flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-dim)"; }}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        )}

        {/* Sign out */}
        {collapsed ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <form action={logout}>
              <button type="submit" title="Sign out" style={{
                background: "transparent", border: "none",
                color: "var(--text-faint)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "6px",
                transition: "color 0.12s",
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
          <div style={{ padding: "0 12px" }}>
            <form action={logout}>
              <button type="submit" style={{
                background: "transparent", border: "none", padding: 0,
                fontSize: "11px", color: "var(--text-faint)",
                fontFamily: "'DM Mono', monospace", cursor: "pointer",
                letterSpacing: "0.5px", textAlign: "left",
              }}>
                sign out →
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1.1 1.1M10 10l1.1 1.1M2.9 11.1L4 10M10 4l1.1-1.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M11.5 8.5A5 5 0 0 1 5.5 2.5a5 5 0 1 0 6 6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
