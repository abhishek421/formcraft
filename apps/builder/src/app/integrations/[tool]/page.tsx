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

type ToolData = {
  name: string;
  category: string;
  headline: string;
  description: string;
  steps: { title: string; detail: string }[];
  triggers: string[];
};

const TOOLS: Record<string, ToolData> = {
  zapier: {
    name: "Zapier",
    category: "Automation",
    headline: "Connect your forms to 6,000+ apps.",
    description:
      "When a form is submitted, Zapier can trigger any workflow in your stack — CRM updates, Slack alerts, email sequences, spreadsheet rows. No code, no custom integrations.",
    steps: [
      { title: "Connect CleverForms to Zapier", detail: "Authenticate with your CleverForms API key in the Zapier dashboard." },
      { title: "Choose a trigger", detail: "Select 'New Response' or 'New Session Started' as your Zap trigger event." },
      { title: "Map the fields", detail: "Map form response fields to your target app's fields." },
      { title: "Activate and test", detail: "Run a test submission to verify the Zap fires correctly." },
    ],
    triggers: [
      "Add a row to Google Sheets on every submission",
      "Create a HubSpot contact from a lead gen form",
      "Send a Slack message when a high-priority form is submitted",
      "Trigger an email sequence in Mailchimp on signup",
      "Create a Notion database entry for each response",
    ],
  },
  slack: {
    name: "Slack",
    category: "Notifications",
    headline: "Get form responses in Slack the moment they arrive.",
    description:
      "Send a Slack message to any channel whenever a form is submitted. Filter by form, by field value, or by response score. Never miss a critical submission buried in your inbox.",
    steps: [
      { title: "Add the Slack integration", detail: "Go to Integrations → Slack and authorize CleverForms to post to your workspace." },
      { title: "Choose your channel", detail: "Pick the channel where notifications should appear." },
      { title: "Configure filters (optional)", detail: "Only notify for specific forms, or when a field matches a condition." },
      { title: "Customize the message", detail: "Choose which fields appear in the Slack message preview." },
    ],
    triggers: [
      "Alert your sales team when a high-intent lead submits",
      "Post support form submissions to your #support channel",
      "Notify founders when a key user research screener is completed",
      "Send daily digests of response counts by form",
    ],
  },
  hubspot: {
    name: "HubSpot",
    category: "CRM",
    headline: "Every form submission lands in your CRM automatically.",
    description:
      "Map CleverForms fields directly to HubSpot contact, company, or deal properties. New submissions create or update HubSpot records in real time — no CSV exports, no manual entry.",
    steps: [
      { title: "Connect to HubSpot", detail: "Authenticate with your HubSpot account under Integrations → HubSpot." },
      { title: "Select a form", detail: "Choose which CleverForms form triggers the HubSpot sync." },
      { title: "Map fields to properties", detail: "Match form fields to HubSpot contact, company, or deal properties." },
      { title: "Set lifecycle stage (optional)", detail: "Automatically set a lifecycle stage or add to a list based on form values." },
    ],
    triggers: [
      "Create a contact for every lead gen form submission",
      "Update deal stage when a proposal request form is submitted",
      "Enroll contacts in a sequence based on form answers",
      "Tag contacts with form-specific properties for segmentation",
    ],
  },
  mailchimp: {
    name: "Mailchimp",
    category: "Email Marketing",
    headline: "Grow your list from every form submission.",
    description:
      "Automatically add form respondents to Mailchimp audiences. Map form fields to merge tags, assign tags and groups, and trigger email automations — all from a single form submission.",
    steps: [
      { title: "Connect Mailchimp", detail: "Authenticate under Integrations → Mailchimp using your Mailchimp API key." },
      { title: "Select an audience", detail: "Choose the Mailchimp audience where contacts should be added." },
      { title: "Map fields to merge tags", detail: "Match form fields like name and email to Mailchimp merge tags." },
      { title: "Assign tags and groups (optional)", detail: "Automatically tag contacts or assign to groups based on form answers." },
    ],
    triggers: [
      "Add newsletter signups to your main audience automatically",
      "Tag subscribers by product interest from survey answers",
      "Trigger a welcome sequence on form completion",
      "Segment your list by onboarding survey responses",
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(TOOLS).map((tool) => ({ tool }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params;
  const data = TOOLS[tool];
  if (!data) return {};
  return {
    title: `CleverForms + ${data.name} Integration`,
    description: `${data.description}`,
    alternates: { canonical: `https://forms.stayclever.in/integrations/${tool}` },
    openGraph: {
      url: `https://forms.stayclever.in/integrations/${tool}`,
      title: `CleverForms + ${data.name}`,
      description: data.headline,
    },
  };
}

export default async function IntegrationPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const data = TOOLS[tool];
  if (!data) notFound();

  const others = Object.entries(TOOLS).filter(([k]) => k !== tool);

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
          {data.category.toUpperCase()} INTEGRATION
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, color: TEXT }}>CleverForms</div>
          <div style={{ fontSize: 20, color: DIM }}>+</div>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 800, color: TEXT }}>{data.name}</div>
        </div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(32px, 4vw, 50px)",
          fontWeight: 800, lineHeight: 1.1,
          letterSpacing: "-0.025em", marginBottom: 20, maxWidth: 720,
        }}>
          {data.headline}
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, maxWidth: 560 }}>
          {data.description}
        </p>
        <div style={{ marginTop: 36 }}>
          <Link href="/login" style={{
            display: "inline-block", background: ACCENT, color: "#fff",
            padding: "13px 32px", borderRadius: 6,
            fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500,
          }}>
            Connect {data.name}
          </Link>
        </div>
      </div>

      {/* Setup steps */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 64px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 24, opacity: 0.75 }}>HOW TO SET UP</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 680 }}>
          {data.steps.map((step, i) => (
            <div key={step.title} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "24px 28px", display: "flex", gap: 24 }}>
              <div style={{ fontSize: 11, color: DIM, letterSpacing: "0.1em", minWidth: 28, paddingTop: 2 }}>0{i + 1}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.8 }}>{step.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What you can do */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 80px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 24, opacity: 0.75 }}>WHAT YOU CAN DO</div>
        <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {data.triggers.map((t) => (
            <li key={t} style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              fontSize: 12, color: MUTED, lineHeight: 1.7,
              padding: "18px 20px", background: SURFACE,
              border: `1px solid ${BORDER}`, borderRadius: 6,
            }}>
              <span style={{ color: ACCENT, marginTop: 2, flexShrink: 0 }}>→</span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Other integrations */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 100px" }}>
        <div style={{ fontSize: 11, color: DIM, marginBottom: 20, letterSpacing: "0.08em" }}>MORE INTEGRATIONS</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {others.map(([k, d]) => (
            <Link
              key={k}
              href={`/integrations/${k}`}
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
