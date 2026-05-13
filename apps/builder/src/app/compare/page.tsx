import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export const metadata: Metadata = {
  title: "CleverForms vs Alternatives — Compare Form Builders",
  description:
    "How CleverForms compares to Typeform, Google Forms, JotForm, and Formstack. See which form builder is right for your team.",
  alternates: { canonical: "https://forms.stayclever.in/compare" },
  openGraph: {
    url: "https://forms.stayclever.in/compare",
    title: "CleverForms vs Alternatives",
    description: "Compare CleverForms to the leading form builders.",
  },
};

const ACCENT  = "#E85D3A";
const BG      = "#F4EFE6";
const SURFACE = "#EBE5DA";
const TEXT    = "#1C1917";
const MUTED   = "rgba(28,25,23,0.55)";
const DIM     = "rgba(28,25,23,0.32)";
const BORDER  = "rgba(28,25,23,0.10)";

const COMPETITORS = [
  { slug: "typeform",     name: "Typeform",     note: "Beautiful forms. No A/B testing. High price." },
  { slug: "google-forms", name: "Google Forms", note: "Free, but frozen in 2010." },
  { slug: "jotform",      name: "JotForm",      note: "Lots of features. No optimization layer." },
  { slug: "formstack",    name: "Formstack",    note: "Enterprise-ready. Startup-unfriendly pricing." },
];

const WHY = [
  { label: "A/B testing built-in",          detail: "No separate tool. No duplicate forms. Experiments run inside the builder." },
  { label: "Adaptive traffic weighting",    detail: "Traffic shifts automatically to the winning variant — no manual intervention." },
  { label: "Field-level drop-off analytics",detail: "See exactly which question loses users, not just where the session ended." },
  { label: "No per-response pricing",       detail: "Flat monthly pricing. High-volume teams aren't punished for success." },
];

export default function ComparePage() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        .cmp-card { transition: border-color 0.2s, transform 0.15s; }
        .cmp-card:hover { border-color: ${ACCENT} !important; transform: translateY(-2px); }
      `}</style>

      <PublicNav />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 52px 56px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>COMPARE</div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(36px, 4vw, 56px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.025em", marginBottom: 20,
        }}>
          How CleverForms stacks up.
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, maxWidth: 520 }}>
          Most form builders show you what happened. CleverForms fixes it. Here&rsquo;s how we compare.
        </p>
      </div>

      {/* Competitor cards */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 72px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {COMPETITORS.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="cmp-card"
              style={{
                display: "flex", flexDirection: "column", gap: 12,
                background: SURFACE, border: `1px solid ${BORDER}`,
                borderRadius: 10, padding: 28,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 17, fontWeight: 800, color: TEXT }}>
                  vs {c.name}
                </span>
                <span style={{ fontSize: 12, color: DIM }}>→</span>
              </div>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.8 }}>{c.note}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Why CleverForms wins */}
      <div style={{ background: TEXT, padding: "72px 52px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(232,93,58,0.7)", marginBottom: 24 }}>WHY CLEVERFORMS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {WHY.map((w) => (
              <div key={w.label} style={{ background: "rgba(240,237,232,0.04)", border: "1px solid rgba(240,237,232,0.08)", borderRadius: 8, padding: 28 }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ color: ACCENT, marginTop: 1, flexShrink: 0 }}>✓</span>
                  <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700, color: "#F0EDE8", lineHeight: 1.3 }}>{w.label}</span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(240,237,232,0.45)", lineHeight: 1.8 }}>{w.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
