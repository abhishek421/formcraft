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

type Post = {
  title: string;
  description: string;
  tag: string;
  category: string;
  publishedAt?: string;
  body?: string;
};

const POSTS: Record<string, Record<string, Post>> = {
  "form-design": {
    "why-users-abandon-forms": {
      title: "Why Users Abandon Forms (And How To Fix It Automatically)",
      description: "Most form drop-off is caused by a single badly worded question. Here's how to find it — and let your form fix it without manual intervention.",
      tag: "Conversion",
      category: "form-design",
    },
    "static-forms-are-dead": {
      title: "Static Forms Are Dead",
      description: "Publishing a form and leaving it unchanged is leaving money on the table. Here's why behavior-aware forms are the new baseline.",
      tag: "Product",
      category: "form-design",
    },
    "how-much-revenue-your-forms-lose": {
      title: "How Much Revenue Your Forms Quietly Lose",
      description: "A 10% drop in form completion on a $100k/month pipeline costs $10k. The math on fixing your forms is almost always obvious once you run it.",
      tag: "Growth",
      category: "form-design",
    },
  },
  "ab-testing": {
    "form-ab-testing-is-broken": {
      title: "Form A/B Testing Is Broken — Here's What Actually Works",
      description: "Traditional A/B testing on forms requires duplicate setups, manual traffic splitting, and a data analyst. Adaptive experimentation removes all of that.",
      tag: "Experimentation",
      category: "ab-testing",
    },
    "what-we-learned-from-thousands-of-form-interactions": {
      title: "What We Learned From Thousands of Form Interactions",
      description: "Patterns from real behavioral data: which question types cause the most hesitation, when users backtrack, and what separates high-converting forms.",
      tag: "Data",
      category: "ab-testing",
    },
  },
  "survey-tips": {
    "why-users-abandon-forms": {
      title: "Why Users Abandon Forms (And How To Fix It Automatically)",
      description: "Most form drop-off is caused by a single badly worded question. Here's how to find it.",
      tag: "Conversion",
      category: "survey-tips",
    },
    "what-we-learned-from-thousands-of-form-interactions": {
      title: "What We Learned From Thousands of Form Interactions",
      description: "Patterns from real behavioral data on form interaction.",
      tag: "Data",
      category: "survey-tips",
    },
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  "form-design": "Form Design",
  "ab-testing": "A/B Testing",
  "survey-tips": "Survey Tips",
};

export async function generateStaticParams() {
  const params: { category: string; slug: string }[] = [];
  for (const [category, posts] of Object.entries(POSTS)) {
    for (const slug of Object.keys(posts)) {
      params.push({ category, slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const post = POSTS[category]?.[slug];
  if (!post) return {};
  return {
    title: `${post.title} — CleverForms Blog`,
    description: post.description,
    alternates: { canonical: `https://forms.stayclever.in/blog/${category}/${slug}` },
    openGraph: {
      url: `https://forms.stayclever.in/blog/${category}/${slug}`,
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const post = POSTS[category]?.[slug];
  if (!post) notFound();

  const categoryLabel = CATEGORY_LABELS[category] ?? category;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
      `}</style>

      <PublicNav />

      {/* Breadcrumb */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 52px 0" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: DIM }}>
          <Link href="/blog" style={{ color: DIM }}>Blog</Link>
          <span>/</span>
          <Link href={`/blog/${category}`} style={{ color: DIM }}>{categoryLabel}</Link>
        </div>
      </div>

      {/* Header */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 52px 56px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: ACCENT, opacity: 0.8, marginBottom: 20 }}>
          {post.tag}
        </div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(28px, 3.5vw, 44px)",
          fontWeight: 800, lineHeight: 1.12,
          letterSpacing: "-0.025em", marginBottom: 20,
        }}>
          {post.title}
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, maxWidth: 560 }}>
          {post.description}
        </p>
      </div>

      {/* Coming soon */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 52px 120px" }}>
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 10, padding: "48px 40px", textAlign: "center",
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", color: DIM, marginBottom: 20 }}>COMING SOON</div>
          <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 16, letterSpacing: "-0.01em" }}>
            This post is being written.
          </p>
          <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.8, maxWidth: 400, margin: "0 auto 32px" }}>
            We&rsquo;re working on this one. Check back soon, or browse other posts in the meantime.
          </p>
          <Link href={`/blog/${category}`} style={{
            display: "inline-block",
            background: ACCENT, color: "#fff",
            padding: "10px 24px", borderRadius: 6,
            fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
            fontFamily: "'DM Mono', monospace",
          }}>
            Browse {categoryLabel}
          </Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
