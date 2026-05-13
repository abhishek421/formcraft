import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export const metadata: Metadata = {
  title: "Security & Privacy — CleverForms",
  description:
    "How CleverForms protects your form data. Encryption, access controls, GDPR compliance, and responsible data handling.",
  alternates: { canonical: "https://forms.stayclever.in/security" },
  openGraph: {
    url: "https://forms.stayclever.in/security",
    title: "Security & Privacy — CleverForms",
    description: "How CleverForms protects your form data.",
  },
};

const ACCENT  = "#E85D3A";
const BG      = "#F4EFE6";
const SURFACE = "#EBE5DA";
const TEXT    = "#1C1917";
const MUTED   = "rgba(28,25,23,0.55)";
const DIM     = "rgba(28,25,23,0.32)";
const BORDER  = "rgba(28,25,23,0.10)";

const PILLARS = [
  {
    title: "Encryption in transit & at rest",
    detail:
      "All data is encrypted over TLS 1.2+. Data at rest is encrypted using AES-256. File uploads are stored with per-object encryption keys.",
  },
  {
    title: "Access controls",
    detail:
      "Form responses are only accessible to the account that owns the form. API keys are scoped and can be revoked at any time. No CleverForms employees access your data without your explicit request.",
  },
  {
    title: "GDPR compliance",
    detail:
      "CleverForms is GDPR-ready. You control what data you collect. Respondents can request deletion. We process data under a Data Processing Agreement available on request.",
  },
  {
    title: "Data minimization",
    detail:
      "We only store what your forms collect. Session analytics track field interactions without storing personally identifiable information by default.",
  },
  {
    title: "Infrastructure",
    detail:
      "Hosted on SOC 2 Type II certified infrastructure. Automated backups with point-in-time recovery. 99.9% uptime SLA on Business plan.",
  },
  {
    title: "Responsible disclosure",
    detail:
      "Found a vulnerability? Email us at security@stayclever.in. We aim to respond within 48 hours and will credit researchers who report valid issues.",
  },
];

const FAQ = [
  {
    q: "Where is my data stored?",
    a: "Data is stored in the EU (AWS eu-west-1) by default. US-region storage is available on the Business plan.",
  },
  {
    q: "Can respondents request their data be deleted?",
    a: "Yes. You can delete individual responses from the dashboard, which removes all associated data and uploaded files. Bulk deletion is also available.",
  },
  {
    q: "Do you sell or share form response data?",
    a: "No. Your form response data is never sold or shared with third parties. We use aggregate, anonymized usage data to improve the product.",
  },
  {
    q: "Is CleverForms HIPAA compliant?",
    a: "HIPAA-ready data handling — including Business Associate Agreements — is available on the Business plan. Contact us to get started.",
  },
  {
    q: "How are API keys secured?",
    a: "API keys are hashed before storage. The full key is only shown once at creation time. You can rotate or revoke any key from the settings page.",
  },
];

export default function SecurityPage() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        .faq-item { transition: border-color 0.2s; }
        .faq-item:hover { border-color: ${ACCENT} !important; }
      `}</style>
      <PublicNav />

      {/* Header */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 52px 56px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>SECURITY & PRIVACY</div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(36px, 4vw, 56px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.025em", marginBottom: 20,
        }}>
          Your data is yours.
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, maxWidth: 560 }}>
          CleverForms is built on the assumption that form response data is sensitive.
          Here&rsquo;s exactly how we protect it.
        </p>
      </div>

      {/* Pillars */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 52px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {PILLARS.map((p, i) => (
            <div key={p.title} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 32 }}>
              <div style={{ fontSize: 10, color: DIM, letterSpacing: "0.12em", marginBottom: 12 }}>0{i + 1}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.01em" }}>
                {p.title}
              </div>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.85 }}>{p.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ background: TEXT, padding: "56px 52px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
            {[
              "TLS 1.2+ encryption",
              "AES-256 at rest",
              "GDPR ready",
              "SOC 2 infrastructure",
              "HIPAA available",
              "99.9% uptime SLA",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: ACCENT, fontSize: 14 }}>✓</span>
                <span style={{ fontSize: 11, color: "rgba(240,237,232,0.6)", letterSpacing: "0.06em" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 760, margin: "80px auto 0", padding: "0 52px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 20, opacity: 0.75 }}>COMMON QUESTIONS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="faq-item"
              style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "24px 28px" }}
            >
              <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 10 }}>{item.q}</div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.8 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div style={{ textAlign: "center", padding: "80px 52px 120px" }}>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 10 }}>Have a security question or concern?</p>
        <a href="mailto:security@stayclever.in" style={{ fontSize: 12, color: ACCENT, letterSpacing: "0.04em" }}>
          security@stayclever.in
        </a>
      </div>
      <PublicFooter />
    </div>
  );
}
