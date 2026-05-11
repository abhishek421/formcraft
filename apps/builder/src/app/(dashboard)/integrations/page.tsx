"use client";

import { useState } from "react";

type Integration = {
  name: string;
  description: string;
  domain: string; // icon.horse domain, or "text:X" for no-logo fallback
};

const INTEGRATIONS: { category: string; items: Integration[] }[] = [
  {
    category: "Notifications",
    items: [
      { name: "Slack", description: "Send form responses to Slack channels", domain: "slack.com" },
      { name: "Discord", description: "Post submissions to Discord servers", domain: "discord.com" },
      { name: "WhatsApp", description: "Send response notifications via WhatsApp", domain: "whatsapp.com" },
      { name: "Telegram", description: "Forward submissions to Telegram chats or bots", domain: "telegram.org" },
      { name: "Email", description: "Trigger custom email notifications", domain: "text:@" },
    ],
  },
  {
    category: "Automation",
    items: [
      { name: "Zapier", description: "Connect to 5,000+ apps via Zapier", domain: "zapier.com" },
      { name: "Make", description: "Build complex automation workflows", domain: "make.com" },
      { name: "n8n", description: "Self-hosted workflow automation", domain: "n8n.io" },
    ],
  },
  {
    category: "Data",
    items: [
      { name: "Google Sheets", description: "Sync responses to a spreadsheet in real time", domain: "sheets.google.com" },
      { name: "Airtable", description: "Push submissions into Airtable bases", domain: "airtable.com" },
      { name: "Notion", description: "Create Notion database entries from responses", domain: "notion.so" },
    ],
  },
  {
    category: "CRM",
    items: [
      { name: "HubSpot", description: "Create or update HubSpot contacts", domain: "hubspot.com" },
      { name: "Salesforce", description: "Log leads directly into Salesforce", domain: "salesforce.com" },
      { name: "Pipedrive", description: "Add deals and contacts from form data", domain: "pipedrive.com" },
    ],
  },
  {
    category: "Payments",
    items: [
      { name: "Stripe", description: "Collect payments directly inside your form", domain: "stripe.com" },
      { name: "Razorpay", description: "Accept payments across India and globally", domain: "razorpay.com" },
      { name: "Cashfree", description: "Payment gateway built for Indian businesses", domain: "cashfree.com" },
      { name: "Paytm", description: "Accept Paytm Wallet, UPI, cards and more", domain: "paytm.com" },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <div style={{ padding: "var(--space-10) var(--space-12)", overflowY: "auto", flex: 1 }}>
      <div style={{ marginBottom: "var(--space-10)" }}>
        <div style={{
          fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
          color: "var(--text-dim)", fontFamily: "var(--font-body)", marginBottom: "var(--space-2)",
        }}>
          Connect
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "32px",
          fontWeight: 800, color: "var(--text)", letterSpacing: "-1px",
          margin: "0 0 var(--space-3)",
        }}>
          Integrations
        </h1>
        <p style={{
          fontSize: "13px", color: "var(--text-dim)",
          fontFamily: "var(--font-body)", fontWeight: 300, maxWidth: "480px",
          lineHeight: 1.7, margin: 0,
        }}>
          Connect CleverForms to the tools your team already uses. Integrations are coming soon — sign up for early access.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-10)" }}>
        {INTEGRATIONS.map((category) => (
          <div key={category.category}>
            <div style={{
              fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
              color: "var(--text-dim)", fontFamily: "var(--font-body)",
              marginBottom: "var(--space-4)",
            }}>
              {category.category}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--space-3)",
            }}>
              {category.items.map((item) => (
                <IntegrationCard key={item.name} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationLogo({ domain, name }: { domain: string; name: string }) {
  const [errored, setErrored] = useState(false);

  if (domain.startsWith("text:")) {
    return (
      <span style={{ fontSize: "15px", color: "#555", fontFamily: "monospace", fontWeight: 600 }}>
        {domain.replace("text:", "")}
      </span>
    );
  }

  if (!errored) {
    return (
      <img
        src={`https://icon.horse/icon/${domain}`}
        alt={name}
        width={26}
        height={26}
        style={{ objectFit: "contain", borderRadius: "4px" }}
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <span style={{ fontSize: "13px", color: "#555", fontFamily: "sans-serif", fontWeight: 700 }}>
      {name[0]}
    </span>
  );
}

function IntegrationCard({ name, description, domain }: Integration) {
  return (
    <div style={{
      background: "var(--surface-3)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-5)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      opacity: 0.75,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{
          width: "40px", height: "40px",
          background: "#ffffff",
          borderRadius: "var(--radius-sm)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <IntegrationLogo domain={domain} name={name} />
        </div>
        <span style={{
          fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase",
          padding: "3px 8px",
          background: "var(--border)",
          border: "1px solid var(--text-faint)",
          borderRadius: "var(--radius-full)",
          color: "var(--text-dim)",
          fontFamily: "var(--font-body)", fontWeight: 500,
        }}>
          Coming Soon
        </span>
      </div>
      <div>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: "14px",
          fontWeight: 700, color: "var(--text)", letterSpacing: "-0.2px",
          marginBottom: "var(--space-1)",
        }}>
          {name}
        </div>
        <div style={{
          fontSize: "12px", color: "var(--text-dim)",
          fontFamily: "var(--font-body)", fontWeight: 300, lineHeight: 1.6,
        }}>
          {description}
        </div>
      </div>
    </div>
  );
}
