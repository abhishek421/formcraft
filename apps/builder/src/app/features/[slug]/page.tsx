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

type FeatureData = {
  title: string;
  headline: string;
  description: string;
  benefits: { label: string; detail: string }[];
  useCases: string[];
  faq: { q: string; a: string }[];
};

const FEATURES: Record<string, FeatureData> = {
  "ab-testing": {
    title: "A/B Testing for Forms",
    headline: "Stop guessing. Let your forms learn.",
    description:
      "CleverForms runs continuous experiments across your form variants — automatically shifting traffic to whichever version converts best. No manual analysis, no duplicate form setups, no waiting for statistical significance.",
    benefits: [
      { label: "Adaptive traffic weighting", detail: "Traffic automatically shifts toward higher-performing variants using a multi-armed bandit algorithm — no manual intervention needed." },
      { label: "Field-level experiments", detail: "Test individual questions, labels, placeholder text, or entire form flows. Not just full-page A/B splits." },
      { label: "Real-time analytics", detail: "See conversion rates, drop-off by step, and variant performance as responses come in — not a week later." },
      { label: "Zero dev work", detail: "Create variants directly in the builder. No code changes, no feature flags, no separate deployments." },
    ],
    useCases: [
      "Lead gen forms optimizing for qualified submissions",
      "Checkout flows reducing cart abandonment",
      "Onboarding surveys maximizing completion rate",
      "Job application forms improving candidate drop-off",
    ],
    faq: [
      { q: "How is this different from standard A/B testing?", a: "Traditional A/B tests split traffic 50/50 until one variant wins — wasting conversions on the losing version the whole time. CleverForms uses adaptive weighting, so the winning variant gets more traffic as the experiment runs." },
      { q: "Do I need a data analyst to interpret results?", a: "No. The dashboard shows which variant is winning and by how much. Adaptive weighting handles the optimization automatically." },
      { q: "How many variants can I test at once?", a: "Up to 5 variants per experiment on the Pro plan." },
    ],
  },
  "conditional-logic": {
    title: "Conditional Logic",
    headline: "Forms that ask the right question next.",
    description:
      "Show or hide fields based on what users have already answered. Build branching flows that feel like a conversation — not a form. Conditional logic makes forms shorter, smarter, and less frustrating.",
    benefits: [
      { label: "Show/hide fields", detail: "Display fields only when relevant. Reduce form length by 40–60% without removing information." },
      { label: "Branch entire sections", detail: "Route users to completely different question sets based on earlier answers." },
      { label: "Dynamic labels & text", detail: "Personalize field labels, placeholders, and helper text using values from previous answers." },
      { label: "Multi-condition rules", detail: "Combine AND/OR conditions across multiple fields. Build complex logic without writing code." },
    ],
    useCases: [
      "Insurance quote forms that branch by coverage type",
      "Job applications that show role-specific questions",
      "Patient intake forms that adapt to reported symptoms",
      "Event registration with session-specific options",
    ],
    faq: [
      { q: "Can I create loops or repeating sections?", a: "Not currently — conditional logic handles branching and show/hide. Repeating sections are on the roadmap." },
      { q: "Does conditional logic work in embedded forms?", a: "Yes. Embedded forms run the same conditional engine as hosted forms." },
      { q: "Is there a limit to how many rules I can create?", a: "No hard limit. Performance stays fast regardless of rule count." },
    ],
  },
  "file-upload": {
    title: "File Uploads in Forms",
    headline: "Collect files, not just text.",
    description:
      "Add file upload fields to any form. Accept resumes, images, documents, or any file type. Set size limits and accepted formats. Files are stored securely and accessible from the response dashboard.",
    benefits: [
      { label: "Any file type", detail: "Accept PDFs, images, videos, spreadsheets, or any MIME type you specify." },
      { label: "Size limits per field", detail: "Set a max file size per upload field. Reject oversized files before submission." },
      { label: "Secure storage", detail: "Uploaded files are stored encrypted. Access links expire and require authentication." },
      { label: "Bulk download", detail: "Download all uploads from a response, or export files in bulk from the responses dashboard." },
    ],
    useCases: [
      "Job applications collecting resumes and portfolios",
      "Client onboarding collecting ID and documents",
      "Design briefs collecting reference images",
      "Support tickets collecting screenshots and logs",
    ],
    faq: [
      { q: "What's the max file size?", a: "Up to 50MB per file on Pro. The Free plan supports up to 5MB." },
      { q: "How long are files stored?", a: "Files are retained as long as the response exists. Deleting a response deletes its files." },
      { q: "Can respondents upload multiple files in one field?", a: "Yes — multi-file upload is supported per field." },
    ],
  },
  "analytics": {
    title: "Form Analytics",
    headline: "Know exactly where and why users drop off.",
    description:
      "CleverForms tracks every interaction — not just completions. See which fields cause hesitation, where users abandon, how long each step takes, and how your forms improve over time.",
    benefits: [
      { label: "Drop-off by field", detail: "See the exact field where users leave. Focus optimization where it actually matters." },
      { label: "Time-per-field", detail: "Identify fields that take too long — a sign of confusing copy or too many options." },
      { label: "Completion funnel", detail: "Visualize how many users reach each step and where the biggest drop happens." },
      { label: "Variant performance", detail: "Compare conversion rates across A/B variants in the same view." },
    ],
    useCases: [
      "Marketing teams diagnosing why ad-driven form completions are low",
      "Product teams understanding onboarding friction",
      "Support teams measuring contact form quality",
      "HR teams improving job application completion rates",
    ],
    faq: [
      { q: "Does analytics work for embedded forms?", a: "Yes. Events are tracked regardless of where the form is embedded." },
      { q: "How long is analytics data retained?", a: "90 days on Pro, unlimited on Business." },
      { q: "Can I export analytics data?", a: "CSV export is available from the analytics dashboard." },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(FEATURES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = FEATURES[slug];
  if (!data) return {};
  return {
    title: `${data.title} — CleverForms`,
    description: data.description,
    alternates: { canonical: `https://forms.stayclever.in/features/${slug}` },
    openGraph: {
      url: `https://forms.stayclever.in/features/${slug}`,
      title: data.title,
      description: data.headline,
    },
  };
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = FEATURES[slug];
  if (!data) notFound();

  const others = Object.entries(FEATURES).filter(([k]) => k !== slug);

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
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>FEATURE</div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(36px, 4vw, 56px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.025em", marginBottom: 20,
        }}>
          {data.headline}
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, maxWidth: 580 }}>
          {data.description}
        </p>
        <div style={{ marginTop: 36 }}>
          <Link href="/login" style={{
            display: "inline-block", background: ACCENT, color: "#fff",
            padding: "13px 32px", borderRadius: 6,
            fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500,
          }}>
            Try it free
          </Link>
        </div>
      </div>

      {/* Benefits */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 80px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 24, opacity: 0.75 }}>HOW IT WORKS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {data.benefits.map((b, i) => (
            <div key={b.label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 32 }}>
              <div style={{ fontSize: 10, color: DIM, letterSpacing: "0.12em", marginBottom: 12 }}>0{i + 1}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.01em" }}>
                {b.label}
              </div>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.8 }}>{b.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 52px 80px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 20, opacity: 0.75 }}>USE CASES</div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {data.useCases.map((u) => (
            <li key={u} style={{
              display: "flex", gap: 16, alignItems: "flex-start",
              fontSize: 13, color: MUTED, lineHeight: 1.7,
              padding: "16px 20px", background: SURFACE,
              border: `1px solid ${BORDER}`, borderRadius: 6,
            }}>
              <span style={{ color: ACCENT, marginTop: 2 }}>→</span>
              {u}
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 52px 80px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 20, opacity: 0.75 }}>FAQ</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {data.faq.map((item) => (
            <div key={item.q} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "24px 28px" }}>
              <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 10 }}>{item.q}</div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.8 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Other features */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 100px" }}>
        <div style={{ fontSize: 11, color: DIM, marginBottom: 20, letterSpacing: "0.08em" }}>MORE FEATURES</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {others.map(([k, f]) => (
            <Link
              key={k}
              href={`/features/${k}`}
              style={{
                border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 20px",
                fontSize: 12, color: MUTED, background: SURFACE,
              }}
            >
              {f.title} →
            </Link>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
