import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export const metadata: Metadata = {
  title: "Form Builder Features — A/B Testing, Analytics & Conditional Logic | CleverForms",
  description:
    "A/B testing, conditional logic, file uploads, and behavioral analytics — everything you need in a form builder to improve completion rates automatically.",
  alternates: { canonical: "https://forms.stayclever.in/features" },
  openGraph: {
    url: "https://forms.stayclever.in/features",
    title: "Form Builder Features — A/B Testing, Analytics & Conditional Logic | CleverForms",
    description: "Build forms that test variants, detect drop-off, and improve conversions automatically.",
  },
};

const ACCENT  = "#E85D3A";
const BG      = "#F4EFE6";
const SURFACE = "#EBE5DA";
const TEXT    = "#1C1917";
const MUTED   = "rgba(28,25,23,0.55)";
const DIM     = "rgba(28,25,23,0.32)";
const BORDER  = "rgba(28,25,23,0.10)";

const FEATURES = [
  {
    slug: "a-b-testing",
    title: "A/B Testing",
    description: "Run continuous experiments across form variants. Adaptive traffic weighting shifts users to the best-performing version automatically.",
    tag: "Core",
  },
  {
    slug: "conditional-logic",
    title: "Conditional Logic",
    description: "Show or hide fields based on previous answers. Build branching flows that feel like a conversation, not a form.",
    tag: "Core",
  },
  {
    slug: "analytics",
    title: "Analytics",
    description: "See drop-off by field, time-per-question, and completion funnels. Know exactly where users leave and why.",
    tag: "Insights",
  },
  {
    slug: "file-upload",
    title: "File Uploads",
    description: "Accept resumes, images, documents — any file type. Set size limits, accept formats, and access uploads from the dashboard.",
    tag: "Data",
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        .feat-card { transition: border-color 0.2s, transform 0.15s; }
        .feat-card:hover { border-color: ${ACCENT} !important; transform: translateY(-2px); }
      `}</style>

      <PublicNav />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 52px 56px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>FEATURES</div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(36px, 4vw, 56px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.025em", marginBottom: 20,
        }}>
          A/B testing, analytics, and conditional logic — built in.
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, maxWidth: 540 }}>
          Every feature in CleverForms is built around one idea: your form should get better with every submission, automatically.
        </p>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 120px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {FEATURES.map((f) => (
            <Link
              key={f.slug}
              href={`/features/${f.slug}`}
              className="feat-card"
              style={{
                display: "flex", flexDirection: "column", gap: 16,
                background: SURFACE, border: `1px solid ${BORDER}`,
                borderRadius: 10, padding: 32,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: ACCENT, opacity: 0.75 }}>{f.tag}</span>
                <span style={{ fontSize: 12, color: DIM }}>→</span>
              </div>
              <h2 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 22, fontWeight: 800, letterSpacing: "-0.015em", color: TEXT,
              }}>
                {f.title}
              </h2>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.85, flexGrow: 1 }}>{f.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
