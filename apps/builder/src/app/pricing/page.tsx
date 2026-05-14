import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export const metadata: Metadata = {
  title: "Form Builder Pricing — Plans, Cost & Free Trial | CleverForms",
  description:
    "CleverForms pricing: free plan forever, Pro at $29/mo, Business at $99/mo. A/B testing form builder with transparent pricing, no per-response fees. Free 14-day trial.",
  alternates: { canonical: "https://forms.stayclever.in/pricing" },
  openGraph: {
    url: "https://forms.stayclever.in/pricing",
    title: "Form Builder Pricing — Plans, Cost & Free Trial | CleverForms",
    description: "Free plan forever. Pro at $29/mo. No per-response fees, no surprise charges.",
  },
};

const ACCENT  = "#E85D3A";
const BG      = "#F4EFE6";
const SURFACE = "#EBE5DA";
const TEXT    = "#1C1917";
const MUTED   = "rgba(28,25,23,0.55)";
const DIM     = "rgba(28,25,23,0.32)";
const BORDER  = "rgba(28,25,23,0.10)";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individuals trying things out.",
    cta: "Start free",
    ctaHref: "/login",
    highlight: false,
    features: [
      "3 forms",
      "100 responses / month",
      "Basic analytics",
      "Public form URL",
      "Email notifications",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For teams that want smarter forms.",
    cta: "Start free trial",
    ctaHref: "/login",
    highlight: true,
    features: [
      "Unlimited forms",
      "10,000 responses / month",
      "A/B testing & experiments",
      "Conditional logic",
      "File uploads",
      "Zapier & webhook integrations",
      "Custom domain",
      "Priority support",
    ],
  },
  {
    name: "Business",
    price: "$99",
    period: "per month",
    description: "For high-volume, compliance-sensitive teams.",
    cta: "Contact us",
    ctaHref: "mailto:nagendra@allyos.ai",
    highlight: false,
    features: [
      "Everything in Pro",
      "Unlimited responses",
      "HIPAA-ready data handling",
      "SSO / SAML",
      "Audit logs",
      "SLA & dedicated support",
      "Custom contract",
    ],
  },
];

const FAQ = [
  {
    q: "Is there a free trial?",
    a: "Yes — Pro is free for 14 days, no credit card required.",
  },
  {
    q: "What counts as a response?",
    a: "A response is one completed form submission. Partial or abandoned sessions don't count.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings at any time. No questions, no friction.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes — annual billing saves you 20%. Contact us to switch.",
  },
  {
    q: "Is my data secure?",
    a: "All data is encrypted in transit and at rest. See our security page for details.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        .plan-card { transition: border-color 0.2s, transform 0.15s; }
        .plan-card:hover { transform: translateY(-3px); }
        .faq-item { transition: border-color 0.2s; }
        .faq-item:hover { border-color: ${ACCENT} !important; }
      `}</style>

      <PublicNav />

      {/* Header */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 52px 64px", textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>PRICING</div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(36px, 4vw, 56px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.025em", marginBottom: 20,
        }}>
          Pay for what you use.
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, maxWidth: 480, margin: "0 auto" }}>
          Start free. Upgrade when your forms grow. No surprise charges, no per-seat pricing.
        </p>
      </div>

      {/* Plans */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="plan-card"
              style={{
                background: plan.highlight ? TEXT : SURFACE,
                border: `1px solid ${plan.highlight ? TEXT : BORDER}`,
                borderRadius: 10, padding: 36,
                display: "flex", flexDirection: "column", gap: 24,
                position: "relative",
              }}
            >
              {plan.highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: ACCENT, color: "#fff", fontSize: 9, fontWeight: 500,
                  letterSpacing: "0.14em", padding: "4px 14px", borderRadius: 20,
                  textTransform: "uppercase",
                }}>
                  Most popular
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: plan.highlight ? "rgba(240,237,232,0.5)" : DIM, marginBottom: 10 }}>
                  {plan.name}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 44, fontWeight: 800, color: plan.highlight ? "#F0EDE8" : TEXT, letterSpacing: "-0.03em" }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 11, color: plan.highlight ? "rgba(240,237,232,0.4)" : DIM }}>/ {plan.period}</span>
                </div>
                <p style={{ fontSize: 12, color: plan.highlight ? "rgba(240,237,232,0.55)" : MUTED, marginTop: 8, lineHeight: 1.7 }}>
                  {plan.description}
                </p>
              </div>

              <Link href={plan.ctaHref} style={{
                display: "block", textAlign: "center",
                background: plan.highlight ? ACCENT : "transparent",
                border: `1px solid ${plan.highlight ? ACCENT : BORDER}`,
                color: plan.highlight ? "#fff" : TEXT,
                padding: "12px 0", borderRadius: 6,
                fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500,
              }}>
                {plan.cta}
              </Link>

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: plan.highlight ? "rgba(240,237,232,0.7)" : MUTED }}>
                    <span style={{ color: ACCENT, fontSize: 14, lineHeight: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 760, margin: "100px auto 0", padding: "0 52px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>FAQ</div>
        <h2 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 40,
        }}>
          Common questions.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="faq-item"
              style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "24px 28px", background: SURFACE }}
            >
              <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 10, color: TEXT }}>{item.q}</div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.8 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "100px 52px 80px" }}>
        <p style={{ fontSize: 12, color: DIM, marginBottom: 24 }}>No credit card required to start.</p>
        <Link href="/login" style={{
          display: "inline-block", background: ACCENT, color: "#fff",
          padding: "14px 40px", borderRadius: 6,
          fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500,
        }}>
          Get started free
        </Link>
      </div>
      <PublicFooter />
    </div>
  );
}
