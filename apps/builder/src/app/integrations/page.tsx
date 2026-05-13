import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export const metadata: Metadata = {
  title: "Integrations — CleverForms",
  description:
    "Connect CleverForms to your stack. Zapier, Slack, HubSpot, Mailchimp, and more — send form responses wherever your team works.",
  alternates: { canonical: "https://forms.stayclever.in/integrations" },
  openGraph: {
    url: "https://forms.stayclever.in/integrations",
    title: "Integrations — CleverForms",
    description: "Connect form responses to your entire stack.",
  },
};

const ACCENT  = "#E85D3A";
const BG      = "#F4EFE6";
const SURFACE = "#EBE5DA";
const TEXT    = "#1C1917";
const MUTED   = "rgba(28,25,23,0.55)";
const DIM     = "rgba(28,25,23,0.32)";
const BORDER  = "rgba(28,25,23,0.10)";

const INTEGRATIONS = [
  { slug: "zapier",    name: "Zapier",    category: "Automation",      description: "Connect your forms to 6,000+ apps. No code required." },
  { slug: "slack",     name: "Slack",     category: "Notifications",   description: "Get form responses in Slack the moment they arrive." },
  { slug: "hubspot",   name: "HubSpot",   category: "CRM",             description: "Every form submission lands in your CRM automatically." },
  { slug: "mailchimp", name: "Mailchimp", category: "Email Marketing", description: "Grow your list from every form submission." },
];

const COMING_SOON = [
  "Stripe", "Google Sheets", "Notion", "Salesforce",
  "ActiveCampaign", "Airtable", "Webhooks", "REST API",
];

export default function IntegrationsPage() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        .int-card { transition: border-color 0.2s, transform 0.15s; }
        .int-card:hover { border-color: ${ACCENT} !important; transform: translateY(-2px); }
      `}</style>

      <PublicNav />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 52px 56px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>INTEGRATIONS</div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(36px, 4vw, 56px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.025em", marginBottom: 20,
        }}>
          Your forms, everywhere.
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, maxWidth: 520 }}>
          Send form responses to the tools your team already uses. Set up in minutes, no engineering required.
        </p>
      </div>

      {/* Live integrations */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 56px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.16em", color: DIM, marginBottom: 20 }}>AVAILABLE NOW</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {INTEGRATIONS.map((i) => (
            <Link
              key={i.slug}
              href={`/integrations/${i.slug}`}
              className="int-card"
              style={{
                display: "flex", flexDirection: "column", gap: 14,
                background: SURFACE, border: `1px solid ${BORDER}`,
                borderRadius: 10, padding: 28,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 800, color: TEXT }}>{i.name}</div>
                  <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT, opacity: 0.7, marginTop: 4 }}>{i.category}</div>
                </div>
                <span style={{ fontSize: 12, color: DIM }}>→</span>
              </div>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.8 }}>{i.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Coming soon */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 120px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.16em", color: DIM, marginBottom: 20 }}>COMING SOON</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {COMING_SOON.map((name) => (
            <div key={name} style={{
              fontSize: 12, color: MUTED,
              border: `1px solid ${BORDER}`, borderRadius: 6,
              padding: "10px 18px", background: SURFACE,
            }}>
              {name}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: DIM, marginTop: 24, lineHeight: 1.8 }}>
          Need a specific integration?{" "}
          <a href="mailto:nagendra@allyos.ai" style={{ color: ACCENT, textDecoration: "none" }}>
            Let us know →
          </a>
        </p>
      </div>

      <PublicFooter />
    </div>
  );
}
