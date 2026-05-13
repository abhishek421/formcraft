import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export const metadata: Metadata = {
  title: "About — CleverForms",
  description:
    "CleverForms is built by StayClever. We're building the form builder that actually helps you improve — not just collect.",
  alternates: { canonical: "https://forms.stayclever.in/about" },
  openGraph: {
    url: "https://forms.stayclever.in/about",
    title: "About — CleverForms",
    description: "The form builder that improves itself.",
  },
};

const ACCENT  = "#E85D3A";
const BG      = "#F4EFE6";
const SURFACE = "#EBE5DA";
const TEXT    = "#1C1917";
const MUTED   = "rgba(28,25,23,0.55)";
const DIM     = "rgba(28,25,23,0.32)";
const BORDER  = "rgba(28,25,23,0.10)";

const VALUES = [
  {
    label: "Optimization by default",
    detail: "Every form built on CleverForms runs experiments from day one. There's no 'setup required' — optimization is the default state, not a feature you have to turn on.",
  },
  {
    label: "Behavioral honesty",
    detail: "We track what users actually do — not just what they submit. Hesitation, backtracking, and abandonment are first-class signals, not ignored noise.",
  },
  {
    label: "No analytics theater",
    detail: "We don't show you dashboards full of numbers with no clear action. Every metric in CleverForms exists to tell you what to do next.",
  },
  {
    label: "Built for operators",
    detail: "Marketers, growth teams, and product managers shouldn't need an engineer or a data analyst to optimize a form. We build for people who run things.",
  },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
      `}</style>

      <PublicNav />

      {/* Hero */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 52px 72px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>ABOUT</div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(36px, 4vw, 60px)",
          fontWeight: 800, lineHeight: 1.06,
          letterSpacing: "-0.03em", marginBottom: 24, maxWidth: 720,
        }}>
          We got tired of forms that just collect.
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.9, maxWidth: 580 }}>
          CleverForms started with a simple frustration: every form builder gives you a submission count and leaves you to figure out the rest.
          We wanted forms that actually get better — automatically, with every response, without needing a data team.
        </p>
      </div>

      {/* Origin */}
      <div style={{ background: SURFACE, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 52px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 20, opacity: 0.75 }}>THE PROBLEM WE'RE SOLVING</div>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 2, marginBottom: 20 }}>
                The average form loses 68% of visitors before completion. Most of that drop-off happens at a single question —
                a confusing label, the wrong input type, a tone that doesn't match the user's expectations.
              </p>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 2, marginBottom: 20 }}>
                Traditional form builders show you <em>where</em> people left. They never tell you why, and they never fix it.
                You're expected to run your own A/B tests, interpret your own analytics, and manually update your forms based on guesswork.
              </p>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 2 }}>
                CleverForms closes that loop. It tests variants, measures real behavior, and shifts traffic to what works —
                every 15 minutes, automatically.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { stat: "68%", label: "average form drop-off rate" },
                { stat: "1",   label: "question usually causes most of it" },
                { stat: "15m", label: "optimization cycle in CleverForms" },
                { stat: "0",   label: "analysts required" },
              ].map(({ stat, label }) => (
                <div key={label} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "24px 28px", display: "flex", gap: 24, alignItems: "center" }}>
                  <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 36, fontWeight: 800, color: ACCENT, letterSpacing: "-0.03em", minWidth: 72 }}>{stat}</span>
                  <span style={{ fontSize: 12, color: MUTED, lineHeight: 1.7 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 52px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 32, opacity: 0.75 }}>HOW WE BUILD</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {VALUES.map((v, i) => (
            <div key={v.label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 32 }}>
              <div style={{ fontSize: 10, color: DIM, letterSpacing: "0.12em", marginBottom: 12 }}>0{i + 1}</div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.01em" }}>{v.label}</div>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.85 }}>{v.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div style={{ background: TEXT, padding: "72px 52px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(232,93,58,0.7)", marginBottom: 20 }}>THE TEAM</div>
          <p style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: "clamp(20px, 2.5vw, 28px)",
            fontWeight: 700, color: "#F0EDE8",
            lineHeight: 1.5, letterSpacing: "-0.015em", marginBottom: 24,
          }}>
            CleverForms is built by StayClever — a small team obsessed with reducing friction between humans and software.
          </p>
          <p style={{ fontSize: 13, color: "rgba(240,237,232,0.5)", lineHeight: 1.9, marginBottom: 32 }}>
            We've worked across growth, product, and engineering at companies where forms were a real bottleneck.
            We built CleverForms because nothing else existed that treated form optimization as a first-class problem.
          </p>
          <a href="mailto:nagendra@allyos.ai" style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase",
            color: ACCENT, textDecoration: "none",
          }}>
            Say hello → nagendra@allyos.ai
          </a>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
