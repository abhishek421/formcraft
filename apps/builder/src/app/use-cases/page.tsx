import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export const metadata: Metadata = {
  title: "Use Cases — CleverForms",
  description:
    "CleverForms for healthcare, education, real estate, and more. See how teams in every industry use adaptive forms to improve completion rates.",
  alternates: { canonical: "https://forms.stayclever.in/use-cases" },
  openGraph: {
    url: "https://forms.stayclever.in/use-cases",
    title: "Use Cases — CleverForms",
    description: "See how teams across industries use CleverForms.",
  },
};

const ACCENT  = "#E85D3A";
const BG      = "#F4EFE6";
const SURFACE = "#EBE5DA";
const TEXT    = "#1C1917";
const MUTED   = "rgba(28,25,23,0.55)";
const DIM     = "rgba(28,25,23,0.32)";
const BORDER  = "rgba(28,25,23,0.10)";

const USE_CASES = [
  {
    slug: "healthcare",
    name: "Healthcare",
    description: "Adaptive patient intake forms that skip irrelevant questions and collect clean data.",
    forms: ["Patient intake", "Medical history", "Consent forms", "Symptom checkers"],
  },
  {
    slug: "education",
    name: "Education",
    description: "Enrollment and survey forms that maximize completion rates across students and parents.",
    forms: ["Enrollment applications", "Course feedback", "Financial aid intake", "Event registration"],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    description: "Lead qualification forms that filter serious buyers from casual browsers automatically.",
    forms: ["Buyer intake", "Seller property forms", "Rental applications", "Open house registration"],
  },
  {
    slug: "lead-generation",
    name: "Lead Generation",
    description: "A/B tested lead capture forms that maximize qualified pipeline from paid and organic traffic.",
    forms: ["Inbound lead capture", "Demo requests", "Gated content", "Pricing inquiry"],
  },
];

export default function UseCasesPage() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        .uc-card { transition: border-color 0.2s, transform 0.15s; }
        .uc-card:hover { border-color: ${ACCENT} !important; transform: translateY(-2px); }
      `}</style>

      <PublicNav />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 52px 56px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>USE CASES</div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(36px, 4vw, 56px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.025em", marginBottom: 20,
        }}>
          Built for your industry.
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, maxWidth: 520 }}>
          CleverForms adapts to your workflow. See how teams in different industries use it to reduce friction and improve completion rates.
        </p>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 120px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {USE_CASES.map((uc) => (
            <Link
              key={uc.slug}
              href={`/use-cases/${uc.slug}`}
              className="uc-card"
              style={{
                display: "flex", flexDirection: "column", gap: 20,
                background: SURFACE, border: `1px solid ${BORDER}`,
                borderRadius: 10, padding: 32,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h2 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 22, fontWeight: 800, letterSpacing: "-0.015em", color: TEXT,
                }}>
                  {uc.name}
                </h2>
                <span style={{ fontSize: 12, color: DIM, flexShrink: 0, marginTop: 4 }}>→</span>
              </div>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.85 }}>{uc.description}</p>
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {uc.forms.map((f) => (
                  <span key={f} style={{
                    fontSize: 10, letterSpacing: "0.04em", color: DIM,
                    border: `1px solid ${BORDER}`, borderRadius: 4,
                    padding: "3px 8px", background: BG,
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
