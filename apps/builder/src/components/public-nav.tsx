"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CFLogo } from "@/components/logo";

const ACCENT = "#E85D3A";
const BG     = "#F4EFE6";
const TEXT   = "#1C1917";
const MUTED  = "rgba(28,25,23,0.55)";
const DIM    = "rgba(28,25,23,0.32)";
const BORDER = "rgba(28,25,23,0.10)";

type DropdownItem = { label: string; href: string; desc?: string };

type NavItem =
  | { label: string; href: string; dropdown?: never }
  | { label: string; href?: never; dropdown: { columns: { heading?: string; items: DropdownItem[] }[] } };

const NAV: NavItem[] = [
  {
    label: "Product",
    dropdown: {
      columns: [
        {
          heading: "Features",
          items: [
            { label: "A/B Testing",        href: "/features/ab-testing",       desc: "Adaptive variant experiments" },
            { label: "Conditional Logic",   href: "/features/conditional-logic",  desc: "Smart branching flows" },
            { label: "File Uploads",        href: "/features/file-upload",        desc: "Collect docs & images" },
            { label: "Analytics",           href: "/features/analytics",          desc: "Field-level drop-off data" },
          ],
        },
        {
          heading: "Use Cases",
          items: [
            { label: "Healthcare",   href: "/use-cases/healthcare",   desc: "Patient intake & consent" },
            { label: "Education",    href: "/use-cases/education",    desc: "Enrollment & surveys" },
            { label: "Real Estate",  href: "/use-cases/real-estate",  desc: "Lead qualification" },
            { label: "Lead Generation",     href: "/use-cases/lead-generation",     desc: "Onboarding & research" },
          ],
        },
      ],
    },
  },
  {
    label: "Integrations",
    dropdown: {
      columns: [
        {
          items: [
            { label: "Zapier",     href: "/integrations/zapier",     desc: "Connect 6,000+ apps" },
            { label: "Slack",      href: "/integrations/slack",      desc: "Response notifications" },
            { label: "HubSpot",    href: "/integrations/hubspot",    desc: "Auto-sync to CRM" },
            { label: "Mailchimp",  href: "/integrations/mailchimp",  desc: "Grow your list" },
          ],
        },
      ],
    },
  },
  {
    label: "Compare",
    dropdown: {
      columns: [
        {
          items: [
            { label: "vs Typeform",      href: "/compare/typeform",      desc: "Better A/B, less cost" },
            { label: "vs Google Forms",  href: "/compare/google-forms",  desc: "Actually optimizes" },
            { label: "vs JotForm",       href: "/compare/jotform",       desc: "Smarter, not more" },
            { label: "vs Formstack",     href: "/compare/formstack",     desc: "For teams that move fast" },
          ],
        },
      ],
    },
  },
  { label: "Pricing",   href: "/pricing" },
  { label: "Blog",      href: "/blog" },
  { label: "Docs",      href: "/docs" },
];

function DropdownMenu({ columns }: { columns: { heading?: string; items: DropdownItem[] }[] }) {
  const multiCol = columns.length > 1;
  return (
    <div style={{
      position: "absolute",
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      paddingTop: 12,
      background: "transparent",
      minWidth: multiCol ? 520 : 240,
      zIndex: 200,
    }}>
    <div style={{
      display: "grid",
      gridTemplateColumns: multiCol ? `repeat(${columns.length}, 1fr)` : "1fr",
      gap: multiCol ? 24 : 0,
      background: BG,
      border: `1px solid ${BORDER}`,
      borderRadius: 10,
      boxShadow: "0 16px 48px rgba(28,25,23,0.12), 0 2px 8px rgba(28,25,23,0.06)",
      padding: "20px",
    }}>
      {/* Arrow */}
      <div style={{
        position: "absolute",
        top: 6,
        left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
        width: 10,
        height: 10,
        background: BG,
        border: `1px solid ${BORDER}`,
        borderRight: "none",
        borderBottom: "none",
        borderRadius: "2px 0 0 0",
      }} />
      {columns.map((col, ci) => (
        <div key={ci}>
          {col.heading && (
            <div style={{
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: DIM,
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: `1px solid ${BORDER}`,
            }}>
              {col.heading}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {col.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: 6,
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseOver={(e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.background = "rgba(28,25,23,0.05)")}
                onMouseOut={(e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ fontSize: 12, fontWeight: 500, color: TEXT, marginBottom: 2 }}>
                  {item.label}
                </div>
                {item.desc && (
                  <div style={{ fontSize: 11, color: DIM, lineHeight: 1.5 }}>{item.desc}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
    </div>
  );
}

export function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(null);
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href?: string) => href && pathname.startsWith(href) && href !== "/";

  return (
    <>
      <style>{`
        @keyframes navFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .cf-nav-item { position: relative; }
        .cf-nav-dropdown { animation: navFadeIn 0.18s ease both; }
        .cf-nav-link {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: ${MUTED};
          text-decoration: none;
          letter-spacing: 0.02em;
          padding: 6px 0;
          transition: color 0.15s;
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          white-space: nowrap;
        }
        .cf-nav-link:hover,
        .cf-nav-link.active { color: ${TEXT}; }
        .cf-nav-link.has-dropdown::after {
          content: '';
          display: inline-block;
          width: 0;
          height: 0;
          border-left: 3px solid transparent;
          border-right: 3px solid transparent;
          border-top: 4px solid currentColor;
          opacity: 0.5;
          transition: transform 0.15s;
        }
        .cf-nav-link.has-dropdown.open::after {
          transform: rotate(180deg);
          opacity: 1;
        }
        @media (max-width: 768px) {
          .cf-nav-desktop { display: none !important; }
          .cf-mobile-toggle { display: flex !important; }
        }
        @media (min-width: 769px) {
          .cf-mobile-toggle { display: none !important; }
          .cf-mobile-menu { display: none !important; }
        }
      `}</style>

      <nav
        ref={navRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(244,239,230,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 52px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 32,
        }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <CFLogo size={32} />
            <span style={{
              fontFamily: "'Arvo', serif",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "-0.01em",
              color: TEXT,
            }}>
              CleverForms
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="cf-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, justifyContent: "center" }}>
            {NAV.map((item) => {
              const hasDropdown = !!item.dropdown;
              const isOpen = open === item.label;

              return (
                <div
                  key={item.label}
                  className="cf-nav-item"
                  onMouseEnter={() => hasDropdown && setOpen(item.label)}
                  onMouseLeave={() => hasDropdown && setOpen(null)}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`cf-nav-link${isActive(item.href) ? " active" : ""}`}
                      style={{ padding: "6px 12px" }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      className={`cf-nav-link has-dropdown${isOpen ? " open" : ""}`}
                      style={{ padding: "6px 12px" }}
                      onClick={() => setOpen(isOpen ? null : item.label)}
                    >
                      {item.label}
                    </button>
                  )}
                  {hasDropdown && isOpen && (
                    <div className="cf-nav-dropdown">
                      <DropdownMenu columns={item.dropdown!.columns} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <Link
              href="/login"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: MUTED,
                textDecoration: "none",
                letterSpacing: "0.04em",
                padding: "8px 16px",
                borderRadius: 5,
                transition: "color 0.15s",
              }}
              onMouseOver={(e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = TEXT)}
              onMouseOut={(e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = MUTED)}
            >
              Log in
            </Link>
            <Link href="/login" style={{
              fontFamily: "'DM Mono', monospace",
              background: ACCENT,
              color: "#fff",
              padding: "9px 22px",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              borderRadius: 5,
              textDecoration: "none",
              textTransform: "uppercase",
              transition: "background 0.15s, transform 0.15s",
              display: "inline-block",
            }}
              onMouseOver={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = "#d14e2c"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseOut={(e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Start free
            </Link>

            {/* Mobile hamburger */}
            <button
              className="cf-mobile-toggle"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 8,
                display: "none",
                flexDirection: "column",
                gap: 5,
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  display: "block",
                  width: 22,
                  height: 2,
                  background: TEXT,
                  borderRadius: 1,
                  transition: "transform 0.2s, opacity 0.2s",
                  transform: mobileOpen
                    ? i === 0 ? "rotate(45deg) translate(5px, 5px)"
                    : i === 2 ? "rotate(-45deg) translate(5px, -5px)"
                    : "none"
                    : "none",
                  opacity: mobileOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="cf-mobile-menu"
            style={{
              borderTop: `1px solid ${BORDER}`,
              padding: "16px 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            {NAV.map((item) => (
              <div key={item.label}>
                {item.href ? (
                  <Link href={item.href} style={{
                    display: "block",
                    padding: "12px 0",
                    fontSize: 14,
                    color: TEXT,
                    textDecoration: "none",
                    borderBottom: `1px solid ${BORDER}`,
                  }}>
                    {item.label}
                  </Link>
                ) : (
                  <div>
                    <div style={{
                      padding: "12px 0 8px",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: DIM,
                      borderBottom: `1px solid ${BORDER}`,
                    }}>
                      {item.label}
                    </div>
                    {item.dropdown?.columns.map((col, ci) => (
                      <div key={ci}>
                        {col.items.map((sub) => (
                          <Link key={sub.href} href={sub.href} style={{
                            display: "block",
                            padding: "10px 12px",
                            fontSize: 13,
                            color: MUTED,
                            textDecoration: "none",
                          }}>
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
              <Link href="/login" style={{
                flex: 1,
                textAlign: "center",
                padding: "12px",
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                fontSize: 12,
                color: TEXT,
                textDecoration: "none",
                fontFamily: "'DM Mono', monospace",
              }}>
                Log in
              </Link>
              <Link href="/login" style={{
                flex: 1,
                textAlign: "center",
                padding: "12px",
                background: ACCENT,
                borderRadius: 6,
                fontSize: 12,
                color: "#fff",
                textDecoration: "none",
                fontFamily: "'DM Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                Start free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer so content clears the fixed nav */}
      <div style={{ height: 64 }} />
    </>
  );
}
