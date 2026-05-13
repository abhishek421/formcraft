import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const ACCENT  = "#E85D3A";
const BG      = "#F4EFE6";
const SURFACE = "#EBE5DA";
const TEXT    = "#1C1917";
const MUTED   = "rgba(28,25,23,0.55)";
const DIM     = "rgba(28,25,23,0.32)";
const BORDER  = "rgba(28,25,23,0.10)";

type CompetitorData = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  weaknesses: string[];
  rows: { feature: string; us: string | boolean; them: string | boolean }[];
};

const COMPETITORS: Record<string, CompetitorData> = {
  typeform: {
    name: "Typeform",
    slug: "typeform",
    tagline: "Beautiful forms, no A/B testing, high price.",
    description:
      "Typeform pioneered the one-question-at-a-time format and looks great — but it doesn't help you optimize. You get no built-in experimentation, limited analytics, and a per-response pricing model that gets expensive fast.",
    weaknesses: [
      "No native A/B testing or variant experiments",
      "Per-response pricing punishes high-volume teams",
      "Limited conditional logic on lower plans",
      "No behavioral analytics or drop-off heatmaps",
    ],
    rows: [
      { feature: "A/B testing", us: true, them: false },
      { feature: "Adaptive variant weighting", us: true, them: false },
      { feature: "Behavioral drop-off analytics", us: true, them: false },
      { feature: "Unlimited responses (Pro)", us: true, them: false },
      { feature: "Conditional logic", us: true, them: "Paid plans only" },
      { feature: "File uploads", us: true, them: true },
      { feature: "Webhook integrations", us: true, them: true },
      { feature: "Custom domain", us: true, them: true },
      { feature: "Starting price", us: "$29/mo", them: "$25/mo (limited)" },
    ],
  },
  "google-forms": {
    name: "Google Forms",
    slug: "google-forms",
    tagline: "Free, but frozen in 2010.",
    description:
      "Google Forms is free and always available — but it hasn't meaningfully evolved in over a decade. There's no experimentation, no analytics beyond a basic summary, no conditional logic worth using, and no way to understand why users drop off.",
    weaknesses: [
      "Zero A/B testing or optimization features",
      "No drop-off or behavioral analytics",
      "No branding or custom domain",
      "No integrations beyond Google Workspace",
      "Can't embed with custom styling",
    ],
    rows: [
      { feature: "A/B testing", us: true, them: false },
      { feature: "Behavioral analytics", us: true, them: false },
      { feature: "Custom branding", us: true, them: false },
      { feature: "Custom domain", us: true, them: false },
      { feature: "Third-party integrations", us: true, them: false },
      { feature: "Conditional logic", us: true, them: "Basic only" },
      { feature: "File uploads", us: true, them: "Google Drive only" },
      { feature: "Price", us: "Free tier available", them: "Free" },
    ],
  },
  jotform: {
    name: "JotForm",
    slug: "jotform",
    tagline: "Lots of features. No optimization layer.",
    description:
      "JotForm has hundreds of templates and integrations — a Swiss Army knife of form builders. But breadth isn't the same as intelligence. There's no A/B testing, no adaptive learning, and the interface has accumulated years of technical debt.",
    weaknesses: [
      "No A/B testing or adaptive experimentation",
      "UI can feel cluttered and dated",
      "No built-in behavioral analytics",
      "Response limits even on paid plans",
    ],
    rows: [
      { feature: "A/B testing", us: true, them: false },
      { feature: "Adaptive variant weighting", us: true, them: false },
      { feature: "Behavioral analytics", us: true, them: false },
      { feature: "Unlimited responses", us: true, them: "Capped on all plans" },
      { feature: "Templates", us: "Core set", them: "10,000+" },
      { feature: "Conditional logic", us: true, them: true },
      { feature: "File uploads", us: true, them: true },
      { feature: "Payment collection", us: false, them: true },
      { feature: "Starting price", us: "$29/mo", them: "$34/mo" },
    ],
  },
  formstack: {
    name: "Formstack",
    slug: "formstack",
    tagline: "Enterprise-ready. Startup-unfriendly pricing.",
    description:
      "Formstack is a solid enterprise choice — HIPAA compliance, audit logs, approval workflows. But it's priced and designed for large organizations. If you're a startup or growth team that just needs smart, optimizing forms, you're paying for a lot you'll never use.",
    weaknesses: [
      "No A/B testing or conversion optimization",
      "Expensive — starts at $83/mo",
      "Complex setup for simple use cases",
      "No adaptive form behavior",
    ],
    rows: [
      { feature: "A/B testing", us: true, them: false },
      { feature: "Adaptive variant weighting", us: true, them: false },
      { feature: "Behavioral analytics", us: true, them: "Basic" },
      { feature: "HIPAA compliance", us: "Business plan", them: true },
      { feature: "Approval workflows", us: false, them: true },
      { feature: "Conditional logic", us: true, them: true },
      { feature: "Starting price", us: "$29/mo", them: "$83/mo" },
    ],
  },
  surveymonkey: {
    name: "SurveyMonkey",
    slug: "surveymonkey",
    tagline: "The survey standard. Not a form builder.",
    description:
      "SurveyMonkey is the default choice for surveys — but it's optimized for research, not conversion. There's no A/B testing, no adaptive optimization, and the pricing jumps fast the moment you need anything beyond basic.",
    weaknesses: [
      "No A/B testing or variant experimentation",
      "Built for research surveys, not conversion-focused forms",
      "No behavioral analytics or field-level drop-off data",
      "Per-user pricing gets expensive for growing teams",
      "No conditional logic on free or Basic plans",
    ],
    rows: [
      { feature: "A/B testing", us: true, them: false },
      { feature: "Adaptive traffic weighting", us: true, them: false },
      { feature: "Behavioral drop-off analytics", us: true, them: false },
      { feature: "Conditional logic", us: true, them: "Paid plans only" },
      { feature: "File uploads", us: true, them: false },
      { feature: "Custom domain", us: true, them: "Enterprise only" },
      { feature: "Webhook integrations", us: true, them: "Enterprise only" },
      { feature: "Starting price", us: "$29/mo", them: "$25/mo (very limited)" },
    ],
  },
  tally: {
    name: "Tally",
    slug: "tally",
    tagline: "Free and clean. No optimization.",
    description:
      "Tally is a well-designed free form builder with a Notion-like editor. It's a great starting point — but it has no experimentation, no analytics beyond basic counts, and no way to understand or improve form performance over time.",
    weaknesses: [
      "No A/B testing or variant experiments",
      "No behavioral analytics or drop-off data",
      "No adaptive optimization of any kind",
      "Limited integrations on free plan",
    ],
    rows: [
      { feature: "A/B testing", us: true, them: false },
      { feature: "Behavioral analytics", us: true, them: false },
      { feature: "Adaptive optimization", us: true, them: false },
      { feature: "Conditional logic", us: true, them: true },
      { feature: "File uploads", us: true, them: true },
      { feature: "Custom domain", us: true, them: "Paid only" },
      { feature: "Unlimited responses", us: true, them: "Free plan limited" },
      { feature: "Starting price", us: "$29/mo", them: "Free / $29/mo Pro" },
    ],
  },
  paperform: {
    name: "Paperform",
    slug: "paperform",
    tagline: "Beautiful editor. No experimentation layer.",
    description:
      "Paperform has one of the nicest form editing experiences around — doc-like, flexible, good-looking results. But like every other tool in this space, it has no A/B testing, no adaptive optimization, and no behavioral analytics.",
    weaknesses: [
      "No A/B testing or form experiments",
      "No behavioral analytics or field-level insights",
      "No adaptive traffic weighting",
      "Higher price relative to feature set",
    ],
    rows: [
      { feature: "A/B testing", us: true, them: false },
      { feature: "Adaptive optimization", us: true, them: false },
      { feature: "Behavioral analytics", us: true, them: false },
      { feature: "Conditional logic", us: true, them: true },
      { feature: "File uploads", us: true, them: true },
      { feature: "Payment collection", us: false, them: true },
      { feature: "Custom domain", us: true, them: true },
      { feature: "Starting price", us: "$29/mo", them: "$24/mo" },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(COMPETITORS).map((c) => ({ competitor: c }));
}

export async function generateMetadata({ params }: { params: Promise<{ competitor: string }> }): Promise<Metadata> {
  const { competitor } = await params;
  const data = COMPETITORS[competitor];
  if (!data) return {};
  return {
    title: `CleverForms vs ${data.name} — Comparison`,
    description: `How CleverForms compares to ${data.name}: A/B testing, pricing, analytics, and integrations. See which is right for your team.`,
    alternates: { canonical: `https://forms.stayclever.in/compare/${competitor}` },
    openGraph: {
      url: `https://forms.stayclever.in/compare/${competitor}`,
      title: `CleverForms vs ${data.name}`,
      description: data.tagline,
    },
  };
}

export default async function ComparePage({ params }: { params: Promise<{ competitor: string }> }) {
  const { competitor } = await params;
  const data = COMPETITORS[competitor];
  if (!data) notFound();

  const others = Object.values(COMPETITORS).filter((c) => c.slug !== competitor);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
      `}</style>
      <PublicNav />

      {/* Header */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 52px 56px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>COMPARE</div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(32px, 4vw, 52px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.025em", marginBottom: 20,
        }}>
          CleverForms vs {data.name}
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, maxWidth: 600 }}>
          {data.tagline}
        </p>
      </div>

      {/* Summary */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 56px" }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 40, maxWidth: 760 }}>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.9 }}>{data.description}</p>
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: DIM, marginBottom: 16 }}>
              Where {data.name} falls short
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {data.weaknesses.map((w) => (
                <li key={w} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 12, color: MUTED }}>
                  <span style={{ color: ACCENT, marginTop: 1 }}>✗</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 80px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 24, opacity: 0.75 }}>FEATURE COMPARISON</div>
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: TEXT }}>
            <div style={{ padding: "18px 28px", fontSize: 11, letterSpacing: "0.1em", color: "rgba(240,237,232,0.4)", textTransform: "uppercase" }}>Feature</div>
            <div style={{ padding: "18px 28px", fontSize: 11, letterSpacing: "0.1em", color: ACCENT, textTransform: "uppercase" }}>CleverForms</div>
            <div style={{ padding: "18px 28px", fontSize: 11, letterSpacing: "0.1em", color: "rgba(240,237,232,0.4)", textTransform: "uppercase" }}>{data.name}</div>
          </div>
          {data.rows.map((row, i) => (
            <div
              key={row.feature}
              style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                background: i % 2 === 0 ? SURFACE : BG,
                borderTop: `1px solid ${BORDER}`,
              }}
            >
              <div style={{ padding: "16px 28px", fontSize: 12, color: TEXT }}>{row.feature}</div>
              <div style={{ padding: "16px 28px", fontSize: 12, color: row.us === true ? "#4A8C3F" : row.us === false ? "#C0392B" : MUTED }}>
                {row.us === true ? "✓ Yes" : row.us === false ? "✗ No" : String(row.us)}
              </div>
              <div style={{ padding: "16px 28px", fontSize: 12, color: row.them === true ? "#4A8C3F" : row.them === false ? "#C0392B" : MUTED }}>
                {row.them === true ? "✓ Yes" : row.them === false ? "✗ No" : String(row.them)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: TEXT, padding: "72px 52px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 34, fontWeight: 800, color: "#F0EDE8",
            letterSpacing: "-0.02em", marginBottom: 16,
          }}>
            Ready to switch?
          </h2>
          <p style={{ fontSize: 13, color: "rgba(240,237,232,0.5)", lineHeight: 1.8, marginBottom: 36 }}>
            Migrate your forms in minutes. No data lost. Free for 14 days.
          </p>
          <Link href="/login" style={{
            display: "inline-block", background: ACCENT, color: "#fff",
            padding: "14px 40px", borderRadius: 6,
            fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500,
          }}>
            Start free trial
          </Link>
        </div>
      </div>

      {/* Other comparisons */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 52px 100px" }}>
        <div style={{ fontSize: 11, color: DIM, marginBottom: 24, letterSpacing: "0.08em" }}>OTHER COMPARISONS</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {others.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              style={{
                border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 20px",
                fontSize: 12, color: MUTED, background: SURFACE,
              }}
            >
              CleverForms vs {c.name} →
            </Link>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
