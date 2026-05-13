"use client";

import Link from "next/link";
import { CFLogo } from "@/components/logo";

const ACCENT   = "#E85D3A";
const DARK_BG  = "#1C1917";
const DARK_TEXT = "#F0EDE8";
const DARK_MUT = "rgba(240,237,232,0.45)";
const DARK_DIM = "rgba(240,237,232,0.22)";
const DARK_BDR = "rgba(240,237,232,0.08)";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features",          href: "/features/ab-testing" },
      { label: "A/B Testing",       href: "/features/ab-testing" },
      { label: "Conditional Logic", href: "/features/conditional-logic" },
      { label: "File Uploads",      href: "/features/file-upload" },
      { label: "Analytics",         href: "/features/analytics" },
      { label: "Pricing",           href: "/pricing" },
      { label: "Changelog",         href: "/changelog" },
    ],
  },
  {
    heading: "Use Cases",
    links: [
      { label: "Healthcare",   href: "/use-cases/healthcare" },
      { label: "Education",    href: "/use-cases/education" },
      { label: "Real Estate",  href: "/use-cases/real-estate" },
      { label: "Lead Generation",     href: "/use-cases/lead-generation" },
    ],
  },
  {
    heading: "Integrations",
    links: [
      { label: "Zapier",     href: "/integrations/zapier" },
      { label: "Slack",      href: "/integrations/slack" },
      { label: "HubSpot",    href: "/integrations/hubspot" },
      { label: "Mailchimp",  href: "/integrations/mailchimp" },
      { label: "API & Docs", href: "/docs" },
    ],
  },
  {
    heading: "Compare",
    links: [
      { label: "vs Typeform",      href: "/compare/typeform" },
      { label: "vs Google Forms",  href: "/compare/google-forms" },
      { label: "vs JotForm",       href: "/compare/jotform" },
      { label: "vs Formstack",     href: "/compare/formstack" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog",                   href: "/blog" },
      { label: "Form Design",            href: "/blog/form-design" },
      { label: "A/B Testing Guide",      href: "/blog/ab-testing" },
      { label: "Survey Tips",            href: "/blog/survey-tips" },
      { label: "Security & Privacy",     href: "/security" },
      { label: "API Reference",          href: "/docs" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer style={{ background: DARK_BG, borderTop: `1px solid ${DARK_BDR}` }}>
      <style>{`
        @media (max-width: 768px) {
          .cf-footer-grid { grid-template-columns: 1fr 1fr !important; }
          .cf-footer-bottom { flex-direction: column !important; gap: 20px !important; text-align: center; }
          .cf-footer-bottom-links { justify-content: center !important; }
        }
        @media (max-width: 480px) {
          .cf-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Top strip — CTA */}
      <div style={{ borderBottom: `1px solid ${DARK_BDR}`, padding: "52px 52px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(232,93,58,0.6)", marginBottom: 12 }}>
              START BUILDING
            </div>
            <p style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "clamp(22px, 2.5vw, 32px)",
              fontWeight: 800,
              color: DARK_TEXT,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}>
              Build your first self-optimizing form.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
            <Link href="/docs" style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: DARK_MUT,
              textDecoration: "none",
              letterSpacing: "0.06em",
              padding: "10px 20px",
              border: `1px solid ${DARK_BDR}`,
              borderRadius: 5,
            }}>
              View docs
            </Link>
            <Link href="/login" style={{
              fontFamily: "'DM Mono', monospace",
              background: ACCENT,
              color: "#fff",
              padding: "10px 24px",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              borderRadius: 5,
              textDecoration: "none",
              textTransform: "uppercase",
              display: "inline-block",
            }}>
              Start free
            </Link>
          </div>
        </div>
      </div>

      {/* Main link columns */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 52px 40px" }}>
        <div className="cf-footer-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "40px 24px",
        }}>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <div style={{
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: DARK_DIM,
                marginBottom: 16,
                paddingBottom: 10,
                borderBottom: `1px solid ${DARK_BDR}`,
              }}>
                {col.heading}
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {col.links.map((link) => (
                  <li key={link.label + link.href}>
                    <Link
                      href={link.href}
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 12,
                        color: DARK_MUT,
                        textDecoration: "none",
                        lineHeight: 1.6,
                        transition: "color 0.15s",
                        display: "inline-block",
                      }}
                      onMouseOver={e => (e.currentTarget.style.color = DARK_TEXT)}
                      onMouseOut={e => (e.currentTarget.style.color = DARK_MUT)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: `1px solid ${DARK_BDR}`, padding: "24px 52px" }}>
        <div
          className="cf-footer-bottom"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CFLogo size={36} />
            <div>
              <div style={{
                fontFamily: "'Arvo', serif",
                fontWeight: 700,
                fontSize: 13,
                color: DARK_TEXT,
                letterSpacing: "-0.01em",
              }}>
                CleverForms
              </div>
              <div style={{ fontSize: 10, color: DARK_DIM, letterSpacing: "0.04em" }}>
                by StayClever
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div style={{ fontSize: 11, color: DARK_DIM, letterSpacing: "0.03em" }}>
            © {new Date().getFullYear()} StayClever. All rights reserved.
          </div>

          {/* Legal links */}
          <div
            className="cf-footer-bottom-links"
            style={{ display: "flex", gap: 20, alignItems: "center" }}
          >
            {[
              { label: "Privacy",   href: "/privacy" },
              { label: "Terms",     href: "/terms" },
              { label: "Security",  href: "/security" },
              { label: "Status",    href: "https://status.stayclever.in" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  color: DARK_DIM,
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                  transition: "color 0.15s",
                }}
                onMouseOver={e => (e.currentTarget.style.color = DARK_TEXT)}
                onMouseOut={e => (e.currentTarget.style.color = DARK_DIM)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
