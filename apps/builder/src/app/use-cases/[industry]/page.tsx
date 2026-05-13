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

type IndustryData = {
  name: string;
  headline: string;
  description: string;
  painPoints: string[];
  formTypes: { name: string; description: string }[];
  quote?: { text: string; author: string };
};

const INDUSTRIES: Record<string, IndustryData> = {
  healthcare: {
    name: "Healthcare",
    headline: "Patient intake forms that don't frustrate patients.",
    description:
      "Healthcare forms are critical — and chronically bad. Long, repetitive, confusing forms lead to errors, incomplete data, and frustrated patients before they even see a provider. CleverForms makes intake smarter with conditional logic, file uploads, and behavioral analytics.",
    painPoints: [
      "Paper forms converted to PDFs — not actual digital forms",
      "Patients abandoning intake halfway through",
      "Same questions asked multiple times across form sets",
      "No insight into where patients drop off or get confused",
    ],
    formTypes: [
      { name: "Patient intake", description: "Adaptive intake that skips irrelevant questions based on appointment type." },
      { name: "Medical history", description: "Branching logic that only surfaces relevant history sections." },
      { name: "Consent forms", description: "Digital consent with signature capture and secure file storage." },
      { name: "Symptom checkers", description: "Pre-visit triage forms that route patients based on reported symptoms." },
      { name: "Post-visit surveys", description: "Experience surveys with A/B tested copy to maximize response rates." },
    ],
    quote: {
      text: "We reduced intake time by 35% just by removing questions that didn't apply to 80% of patients.",
      author: "Operations lead, outpatient clinic",
    },
  },
  education: {
    name: "Education",
    headline: "Enrollment and feedback forms that actually get completed.",
    description:
      "Schools and universities deal with forms at scale — enrollment, financial aid, surveys, applications. Low completion rates mean lost students and incomplete data. CleverForms tracks drop-off and runs experiments to find the version that gets completed.",
    painPoints: [
      "Low survey response rates from students and parents",
      "Enrollment forms with too many required fields",
      "No data on why applications are abandoned mid-flow",
      "Generic forms that can't adapt to different degree programs",
    ],
    formTypes: [
      { name: "Enrollment applications", description: "Multi-step applications with program-specific branching." },
      { name: "Course feedback surveys", description: "End-of-term surveys optimized for completion, not length." },
      { name: "Financial aid intake", description: "Document collection with file upload and conditional eligibility questions." },
      { name: "Event registration", description: "Session-specific registration with conditional scheduling options." },
      { name: "Alumni contact updates", description: "Short, targeted forms that adapt to what's already on file." },
    ],
    quote: {
      text: "Our course survey completion went from 22% to 61% after we ran two rounds of A/B tests on the question order.",
      author: "Academic affairs coordinator",
    },
  },
  "real-estate": {
    name: "Real Estate",
    headline: "Qualify leads faster. Fewer dead-end showings.",
    description:
      "Real estate teams waste time on unqualified leads. The intake form is your first filter — but most are too long, too generic, or too blunt to convert well. CleverForms lets you collect exactly what you need with smart branching and drop-off analytics.",
    painPoints: [
      "Lead forms that are too long and get abandoned",
      "No way to distinguish serious buyers from casual browsers",
      "Same form used for buyers, sellers, and renters",
      "Low conversion on landing page inquiry forms",
    ],
    formTypes: [
      { name: "Buyer intake", description: "Timeline, budget, and pre-approval questions that branch by buyer stage." },
      { name: "Seller property forms", description: "Property detail collection that adapts to home type and condition." },
      { name: "Rental applications", description: "Income, reference, and document collection for rental qualifications." },
      { name: "Open house registration", description: "Quick capture with follow-up preference questions." },
      { name: "Agent inquiry forms", description: "A/B tested forms optimizing for contact info quality, not just volume." },
    ],
    quote: {
      text: "We split-tested two versions of our buyer intake. One version got 3× more complete submissions.",
      author: "Growth lead, boutique brokerage",
    },
  },
  "lead-generation": {
    name: "Lead Generation",
    headline: "More leads. Better quality. Less drop-off.",
    description:
      "Lead gen forms are the most important — and most neglected — part of most marketing funnels. A 10% improvement in form completion can mean thousands in additional pipeline. CleverForms A/B tests your lead forms automatically and shifts traffic to the version that converts.",
    painPoints: [
      "High drop-off on long lead gen forms",
      "No way to know which form version converts better without manual testing",
      "Generic forms that don't qualify leads before they reach sales",
      "No data on which fields cause the most abandonment",
    ],
    formTypes: [
      { name: "Inbound lead capture", description: "A/B tested forms that maximize qualified lead volume from paid and organic traffic." },
      { name: "Demo request forms", description: "Short adaptive forms that pre-qualify prospects before booking." },
      { name: "Gated content forms", description: "Optimized forms that maximize email capture from content downloads." },
      { name: "Event registration", description: "Registration forms with variant testing on field order and copy." },
      { name: "Pricing inquiry", description: "Forms that collect budget and intent signals for sales routing." },
    ],
    quote: {
      text: "We A/B tested the headline on our demo request form. One version got 40% more completions with the same traffic.",
      author: "Head of Growth, B2B SaaS",
    },
  },
};

export async function generateStaticParams() {
  return Object.keys(INDUSTRIES).map((industry) => ({ industry }));
}

export async function generateMetadata({ params }: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await params;
  const data = INDUSTRIES[industry];
  if (!data) return {};
  return {
    title: `Form Builder for ${data.name} — CleverForms`,
    description: `${data.description.slice(0, 155)}`,
    alternates: { canonical: `https://forms.stayclever.in/use-cases/${industry}` },
    openGraph: {
      url: `https://forms.stayclever.in/use-cases/${industry}`,
      title: `Form Builder for ${data.name}`,
      description: data.headline,
    },
  };
}

export default async function UseCasePage({ params }: { params: Promise<{ industry: string }> }) {
  const { industry } = await params;
  const data = INDUSTRIES[industry];
  if (!data) notFound();

  const others = Object.entries(INDUSTRIES).filter(([k]) => k !== industry);

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
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>
          USE CASE — {data.name.toUpperCase()}
        </div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(32px, 4vw, 52px)",
          fontWeight: 800, lineHeight: 1.1,
          letterSpacing: "-0.025em", marginBottom: 20, maxWidth: 760,
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
            Start free
          </Link>
        </div>
      </div>

      {/* Pain points */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 64px" }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 40, maxWidth: 680 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: DIM, marginBottom: 20 }}>
            The problem with {data.name.toLowerCase()} forms today
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {data.painPoints.map((p) => (
              <li key={p} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 12, color: MUTED, lineHeight: 1.7 }}>
                <span style={{ color: ACCENT, marginTop: 2, flexShrink: 0 }}>✗</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form types */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 64px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 24, opacity: 0.75 }}>FORMS YOU CAN BUILD</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {data.formTypes.map((f) => (
            <div key={f.name} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 28 }}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 10, letterSpacing: "-0.01em" }}>
                {f.name}
              </div>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.8 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      {data.quote && (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 80px" }}>
          <div style={{ background: TEXT, borderRadius: 10, padding: "48px 52px", maxWidth: 680 }}>
            <p style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 700,
              color: "#F0EDE8", lineHeight: 1.5, letterSpacing: "-0.01em", marginBottom: 24,
            }}>
              &ldquo;{data.quote.text}&rdquo;
            </p>
            <div style={{ fontSize: 11, color: "rgba(240,237,232,0.4)", letterSpacing: "0.08em" }}>
              — {data.quote.author}
            </div>
          </div>
        </div>
      )}

      {/* Other industries */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 100px" }}>
        <div style={{ fontSize: 11, color: DIM, marginBottom: 20, letterSpacing: "0.08em" }}>OTHER USE CASES</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {others.map(([k, d]) => (
            <Link
              key={k}
              href={`/use-cases/${k}`}
              style={{
                border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 20px",
                fontSize: 12, color: MUTED, background: SURFACE,
              }}
            >
              {d.name} →
            </Link>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
