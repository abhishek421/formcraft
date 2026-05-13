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

type CategoryData = {
  label: string;
  headline: string;
  description: string;
  posts: { slug: string; title: string; description: string; tag: string }[];
};

const CATEGORIES: Record<string, CategoryData> = {
  "form-design": {
    label: "Form Design",
    headline: "Write forms people actually want to fill out.",
    description: "Copy, structure, and question design that reduces abandonment and increases trust.",
    posts: [
      { slug: "why-users-abandon-forms", title: "Why Users Abandon Forms (And How To Fix It Automatically)", description: "Most form drop-off is caused by a single badly worded question. Here's how to find it.", tag: "Conversion" },
      { slug: "static-forms-are-dead", title: "Static Forms Are Dead", description: "Publishing a form and leaving it unchanged is leaving money on the table.", tag: "Product" },
      { slug: "how-much-revenue-your-forms-lose", title: "How Much Revenue Your Forms Quietly Lose", description: "A 10% drop in form completion on a $100k/month pipeline costs $10k.", tag: "Growth" },
    ],
  },
  "ab-testing": {
    label: "A/B Testing",
    headline: "Run experiments. Stop guessing.",
    description: "How to set up, read, and act on form experiments without a data team.",
    posts: [
      { slug: "form-ab-testing-is-broken", title: "Form A/B Testing Is Broken — Here's What Actually Works", description: "Traditional A/B testing on forms requires duplicate setups and a data analyst. Adaptive experimentation removes all of that.", tag: "Experimentation" },
      { slug: "what-we-learned-from-thousands-of-form-interactions", title: "What We Learned From Thousands of Form Interactions", description: "Patterns from real behavioral data: which question types cause the most hesitation.", tag: "Data" },
    ],
  },
  "survey-tips": {
    label: "Survey Tips",
    headline: "Get better answers from your surveys.",
    description: "Question design, timing, and structure that improves response quality and completion.",
    posts: [
      { slug: "why-users-abandon-forms", title: "Why Users Abandon Forms (And How To Fix It Automatically)", description: "Most form drop-off is caused by a single badly worded question.", tag: "Conversion" },
      { slug: "what-we-learned-from-thousands-of-form-interactions", title: "What We Learned From Thousands of Form Interactions", description: "Patterns from real behavioral data on form interaction.", tag: "Data" },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const data = CATEGORIES[category];
  if (!data) return {};
  return {
    title: `${data.label} — CleverForms Blog`,
    description: data.description,
    alternates: { canonical: `https://forms.stayclever.in/blog/${category}` },
    openGraph: {
      url: `https://forms.stayclever.in/blog/${category}`,
      title: `${data.label} — CleverForms Blog`,
      description: data.headline,
    },
  };
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = CATEGORIES[category];
  if (!data) notFound();

  const others = Object.entries(CATEGORIES).filter(([k]) => k !== category);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        .post-card { transition: border-color 0.2s, transform 0.2s; }
        .post-card:hover { border-color: ${ACCENT} !important; transform: translateY(-2px); }
      `}</style>
      <PublicNav />

      {/* Header */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 52px 56px" }}>
        <Link href="/blog" style={{ fontSize: 11, color: DIM, letterSpacing: "0.08em", display: "inline-block", marginBottom: 20 }}>← Blog</Link>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>
          {data.label.toUpperCase()}
        </div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(32px, 4vw, 52px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.025em", marginBottom: 16,
        }}>
          {data.headline}
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, maxWidth: 500 }}>
          {data.description}
        </p>
      </div>

      {/* Posts */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {data.posts.map((post) => (
            <div
              key={post.slug}
              className="post-card"
              style={{
                background: SURFACE, border: `1px solid ${BORDER}`,
                borderRadius: 8, padding: 32,
                display: "flex", flexDirection: "column", gap: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: ACCENT, opacity: 0.8 }}>
                  {post.tag}
                </span>
                <span style={{ fontSize: 10, color: DIM, letterSpacing: "0.06em" }}>COMING SOON</span>
              </div>
              <h2 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 18, fontWeight: 700, lineHeight: 1.3,
                letterSpacing: "-0.01em", color: TEXT,
              }}>
                {post.title}
              </h2>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.85, flexGrow: 1 }}>
                {post.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Other categories */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 100px" }}>
        <div style={{ fontSize: 11, color: DIM, marginBottom: 20, letterSpacing: "0.08em" }}>OTHER TOPICS</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {others.map(([k, d]) => (
            <Link
              key={k}
              href={`/blog/${k}`}
              style={{
                border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 20px",
                fontSize: 12, color: MUTED, background: SURFACE,
              }}
            >
              {d.label} →
            </Link>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
