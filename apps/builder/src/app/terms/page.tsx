import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export const metadata: Metadata = {
  title: "Terms of Service — CleverForms",
  description: "CleverForms Terms of Service. Read our terms before using the platform.",
  alternates: { canonical: "https://forms.stayclever.in/terms" },
};

const BG      = "#F4EFE6";
const SURFACE = "#EBE5DA";
const TEXT    = "#1C1917";
const MUTED   = "rgba(28,25,23,0.55)";
const DIM     = "rgba(28,25,23,0.32)";
const BORDER  = "rgba(28,25,23,0.10)";
const ACCENT  = "#E85D3A";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using CleverForms ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users, including free and paid accounts.`,
  },
  {
    title: "2. Description of Service",
    body: `CleverForms provides a form-building and optimization platform that includes A/B testing, behavioral analytics, conditional logic, and integrations with third-party tools. Features may change over time. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.`,
  },
  {
    title: "3. Account Responsibilities",
    body: `You are responsible for maintaining the confidentiality of your account credentials. You are responsible for all activity that occurs under your account. You must notify us immediately of any unauthorized use at nagendra@allyos.ai. You may not share accounts or use the Service for purposes prohibited by applicable law.`,
  },
  {
    title: "4. Acceptable Use",
    body: `You may not use the Service to collect data without respondent consent, distribute malware or phishing content, harass or harm individuals, violate applicable law or third-party rights, or scrape, reverse-engineer, or resell the Service without written permission.`,
  },
  {
    title: "5. Form Response Data",
    body: `You own the data collected through your forms. We process this data on your behalf as a data processor. We do not sell your form response data to third parties. See our Privacy Policy for full details on how we handle data.`,
  },
  {
    title: "6. Billing and Cancellation",
    body: `Paid plans are billed monthly or annually. Cancellations take effect at the end of the current billing period. We do not offer refunds for partial periods. We reserve the right to change pricing with 30 days notice to active subscribers.`,
  },
  {
    title: "7. Limitation of Liability",
    body: `To the maximum extent permitted by law, CleverForms and StayClever shall not be liable for indirect, incidental, special, consequential, or punitive damages. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.`,
  },
  {
    title: "8. Termination",
    body: `We may suspend or terminate your account for violation of these terms, non-payment, or at our discretion with reasonable notice. You may delete your account at any time from your account settings. Upon termination, your data will be deleted within 30 days.`,
  },
  {
    title: "9. Changes to Terms",
    body: `We may update these terms from time to time. We will notify active users by email at least 14 days before material changes take effect. Continued use of the Service after changes constitutes acceptance of the new terms.`,
  },
  {
    title: "10. Contact",
    body: `For questions about these terms, contact us at nagendra@allyos.ai.`,
  },
];

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
      `}</style>

      <PublicNav />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 52px 40px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>LEGAL</div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(32px, 4vw, 48px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.025em", marginBottom: 16,
        }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 12, color: DIM, lineHeight: 1.8, marginBottom: 8 }}>
          Last updated: May 2025
        </p>
        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.9 }}>
          These terms govern your use of CleverForms, operated by StayClever.
          Please read them carefully.
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 52px 120px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SECTIONS.map((s) => (
            <div key={s.title} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "28px 32px" }}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.01em" }}>{s.title}</div>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.9 }}>{s.body}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, display: "flex", gap: 20 }}>
          <Link href="/privacy" style={{ fontSize: 12, color: ACCENT }}>Privacy Policy →</Link>
          <Link href="/security" style={{ fontSize: 12, color: MUTED }}>Security →</Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
