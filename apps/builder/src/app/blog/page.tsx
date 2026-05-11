import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Form Optimization & Conversion Insights",
  description:
    "Practical guides on reducing form abandonment, adaptive experimentation, behavioral analytics, and conversion optimization for modern teams.",
  alternates: {
    canonical: "https://forms.stayclever.in/blog",
  },
  openGraph: {
    url: "https://forms.stayclever.in/blog",
    title: "Blog — CleverForms",
    description:
      "Practical guides on reducing form abandonment, adaptive experimentation, and conversion optimization.",
  },
};

const COMING_SOON = [
  {
    slug: "why-users-abandon-forms",
    title: "Why Users Abandon Forms (And How To Fix It Automatically)",
    description:
      "Most form drop-off is caused by a single badly worded question. Here's how to find it — and let your form fix it without manual intervention.",
    tag: "Conversion",
  },
  {
    slug: "static-forms-are-dead",
    title: "Static Forms Are Dead",
    description:
      "Publishing a form and leaving it unchanged is leaving money on the table. Here's why behavior-aware forms are the new baseline.",
    tag: "Product",
  },
  {
    slug: "form-ab-testing-is-broken",
    title: "Form A/B Testing Is Broken — Here's What Actually Works",
    description:
      "Traditional A/B testing on forms requires duplicate setups, manual traffic splitting, and a data analyst. Adaptive experimentation removes all of that.",
    tag: "Experimentation",
  },
  {
    slug: "how-much-revenue-your-forms-lose",
    title: "How Much Revenue Your Forms Quietly Lose",
    description:
      "A 10% drop in form completion on a $100k/month pipeline costs $10k. The math on fixing your forms is almost always obvious once you run it.",
    tag: "Growth",
  },
  {
    slug: "what-we-learned-from-thousands-of-form-interactions",
    title: "What We Learned From Thousands of Form Interactions",
    description:
      "Patterns from real behavioral data: which question types cause the most hesitation, when users backtrack, and what separates high-converting forms.",
    tag: "Data",
  },
];

const ACCENT = "#E85D3A";
const BG = "#F4EFE6";
const SURFACE = "#EBE5DA";
const TEXT = "#1C1917";
const MUTED = "rgba(28,25,23,0.55)";
const DIM = "rgba(28,25,23,0.32)";
const BORDER = "rgba(28,25,23,0.10)";

export default function BlogPage() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        .post-card { transition: border-color 0.2s, transform 0.2s; }
        .post-card:hover { border-color: ${ACCENT} !important; transform: translateY(-2px); }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(244,239,230,0.92)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${BORDER}`, padding: "0 52px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, color: TEXT }}>
            <div style={{ width: 7, height: 7, background: ACCENT, borderRadius: 2 }} />
            <span style={{ fontFamily: "'Arvo', serif", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>CleverForms</span>
          </Link>
          <Link href="/login" style={{
            background: ACCENT, color: "#fff", padding: "9px 22px",
            fontSize: 11, fontWeight: 500, letterSpacing: "0.08em",
            fontFamily: "'DM Mono', monospace", borderRadius: 5,
            textTransform: "uppercase",
          }}>
            Start free
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 52px 56px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>BLOG</div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(36px, 4vw, 56px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.025em", marginBottom: 16, color: TEXT,
        }}>
          Form optimization insights.
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, maxWidth: 520 }}>
          Practical guides on reducing abandonment, adaptive experimentation,
          and building forms that improve over time.
        </p>
      </div>

      {/* Posts */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 120px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {COMING_SOON.map((post) => (
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
                <span style={{
                  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: ACCENT, opacity: 0.8,
                }}>
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
              <div style={{ fontSize: 11, color: DIM, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                Notify me when published →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
