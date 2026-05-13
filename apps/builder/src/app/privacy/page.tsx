import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export const metadata: Metadata = {
  title: "Privacy Policy — CleverForms",
  description: "CleverForms Privacy Policy. How we collect, use, and protect your data.",
  alternates: { canonical: "https://forms.stayclever.in/privacy" },
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
    title: "1. What We Collect",
    body: `Account data: name, email address, and password (hashed) when you sign up. Usage data: pages visited, features used, session duration — collected via first-party analytics to improve the product. Form response data: the responses your form respondents submit. We process this on your behalf and do not use it for our own purposes. Payment data: handled entirely by our payment processor (Stripe). We do not store card numbers.`,
  },
  {
    title: "2. How We Use Your Data",
    body: `We use your account data to operate the Service, send transactional emails, and communicate product updates. We use usage data to understand how the product is used and improve it. We do not sell your data to third parties. We do not use your form response data to train machine learning models or for advertising purposes.`,
  },
  {
    title: "3. Form Response Data",
    body: `You are the data controller for responses collected through your forms. We act as a data processor. We store response data encrypted at rest, retain it for as long as your account is active, and delete it within 30 days of account termination. You can delete individual responses or all responses for a form at any time from your dashboard.`,
  },
  {
    title: "4. Cookies and Tracking",
    body: `We use strictly necessary cookies for authentication and session management. We use first-party analytics (no third-party ad trackers) to measure product usage. We do not use cross-site tracking or retargeting cookies. You can disable cookies in your browser, though some features of the Service require them.`,
  },
  {
    title: "5. Data Sharing",
    body: `We share data with sub-processors necessary to operate the Service: cloud infrastructure (AWS), payment processing (Stripe), transactional email (to be listed). All sub-processors are contractually bound to handle data in accordance with this policy. We may disclose data if required by law or to protect the rights and safety of users.`,
  },
  {
    title: "6. Your Rights (GDPR)",
    body: `If you are in the EU/EEA, you have the right to access, correct, or delete your personal data; to restrict or object to processing; to data portability; and to lodge a complaint with your supervisory authority. To exercise these rights, email nagendra@allyos.ai. We will respond within 30 days.`,
  },
  {
    title: "7. Data Retention",
    body: `Account data is retained while your account is active and deleted within 30 days of account termination. Form response data follows the same timeline. Anonymized, aggregated usage statistics may be retained indefinitely.`,
  },
  {
    title: "8. Security",
    body: `Data is encrypted in transit (TLS 1.2+) and at rest (AES-256). Access to production data is limited to authorized personnel and requires multi-factor authentication. See our Security page for full details.`,
  },
  {
    title: "9. Children",
    body: `CleverForms is not directed at children under 13. We do not knowingly collect personal data from children. If you believe a child has provided us data, contact us at nagendra@allyos.ai and we will delete it.`,
  },
  {
    title: "10. Changes",
    body: `We may update this policy. We will notify active users by email before material changes take effect. The latest version is always at forms.stayclever.in/privacy.`,
  },
  {
    title: "11. Contact",
    body: `Privacy questions: nagendra@allyos.ai. Data Protection inquiries: same address. We aim to respond within 5 business days.`,
  },
];

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ fontSize: 12, color: DIM, lineHeight: 1.8, marginBottom: 8 }}>Last updated: May 2025</p>
        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.9 }}>
          CleverForms is operated by StayClever. This policy explains what data we collect, why, and how we protect it.
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
          <Link href="/terms" style={{ fontSize: 12, color: ACCENT }}>Terms of Service →</Link>
          <Link href="/security" style={{ fontSize: 12, color: MUTED }}>Security →</Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
