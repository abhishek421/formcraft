"use client";

import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { Hero } from "./landing/hero";
import { Marquee } from "./landing/marquee";
import { Problem } from "./landing/problem";
import { HowItWorks } from "./landing/how-it-works";
import { ControlRoom } from "./landing/control-room";
import { Signals } from "./landing/signals";
import { Pricing } from "./landing/pricing";
import { FinalCta } from "./landing/final-cta";
import { ACCENT, BG, BORDER, MONO, MUTED, TEXT } from "./landing/theme";

// Subtle paper grain laid over everything — keeps the cream from feeling flat.
const NOISE_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E";

export function HomeClient() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: MONO, overflowX: "clip" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Serif:ital@0;1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::selection{background:${ACCENT};color:#fff}
        a{text-decoration:none}

        @keyframes lp-pulse{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes lp-drip{0%{transform:scaleY(0);transform-origin:top}45%{transform:scaleY(1);transform-origin:top}55%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
        @keyframes lp-marquee{to{transform:translateX(-50%)}}

        .lp-marquee-track{animation:lp-marquee 30s linear infinite}
        .lp-marquee-track:hover{animation-play-state:paused}

        .lp-btn{
          display:inline-block;background:${ACCENT};color:#fff;
          padding:15px 38px;font-size:12px;font-weight:500;letter-spacing:0.08em;
          font-family:'DM Mono',monospace;border:none;cursor:pointer;
          border-radius:6px;transition:background 0.2s,transform 0.2s,box-shadow 0.2s;
          text-transform:uppercase;will-change:transform;
        }
        .lp-btn:hover{background:#d14e2c;transform:translateY(-2px);box-shadow:0 12px 36px rgba(232,93,58,0.28)}

        .lp-hero-ghost{
          font-family:'DM Mono',monospace;font-size:12px;color:${MUTED};
          letter-spacing:0.04em;transition:color 0.18s;border-bottom:1px solid ${BORDER};
          padding-bottom:3px;
        }
        .lp-hero-ghost:hover{color:${ACCENT};border-bottom-color:${ACCENT}}

        .lp-hero-pad{padding-left:52px;padding-right:52px}
        .lp-sec-pad{padding-left:52px;padding-right:52px}
        .lp-hero-row{display:flex;justify-content:space-between;align-items:flex-end;gap:48px;flex-wrap:wrap}

        .lp-problem-grid{display:grid;grid-template-columns:1.25fr 1fr;gap:80px;align-items:end}
        .lp-sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px}
        .lp-cr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .lp-pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}

        .lp-cr-panel:hover{border-color:rgba(232,93,58,0.3)!important;transform:translateY(-4px)}
        .lp-price-card{transition:transform 0.3s cubic-bezier(0.22,1,0.36,1),border-color 0.3s,box-shadow 0.3s}
        .lp-price-card:hover{transform:translateY(-6px);border-color:rgba(232,93,58,0.35)!important;box-shadow:0 24px 48px rgba(28,25,23,0.08)}

        /* ── Horizontal how-it-works ── */
        .lp-how-track{display:flex;align-items:center;height:100vh;width:max-content;padding:0 7vw;gap:4.5vw}
        .lp-how-intro{width:min(580px,52vw);flex-shrink:0}
        .lp-step-card{
          width:min(540px,46vw);flex-shrink:0;display:flex;flex-direction:column;
          background:${BG};border:1px solid ${BORDER};border-radius:14px;
          padding:44px;height:min(660px,76vh);
          transition:border-color 0.3s;
        }
        .lp-step-card:hover{border-color:rgba(232,93,58,0.3)}

        @media(max-width:1024px){
          .lp-cr-grid{grid-template-columns:1fr}
          .lp-pricing-grid{grid-template-columns:1fr 1fr}
        }
        @media(max-width:899px){
          .lp-how-track{flex-direction:column;align-items:stretch;height:auto;width:auto;padding:88px 24px;gap:32px}
          .lp-how-intro{width:auto}
          .lp-step-card{width:auto;height:auto;padding:32px}
          .lp-how-cue{display:none}
        }
        @media(max-width:768px){
          .lp-hero-pad{padding-left:24px;padding-right:24px}
          .lp-sec-pad{padding-left:24px;padding-right:24px}
          .lp-hero-row{flex-direction:column;align-items:flex-start;gap:36px}
          .lp-problem-grid{grid-template-columns:1fr;gap:56px;align-items:start}
          .lp-sig-grid{grid-template-columns:1fr;gap:48px}
        }
        @media(max-width:480px){
          .lp-pricing-grid{grid-template-columns:1fr}
        }
        @media(prefers-reduced-motion:reduce){
          html{scroll-behavior:auto}
          .lp-marquee-track{animation:none}
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "CleverForms",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://forms.stayclever.in",
            description:
              "CleverForms automatically tests question variants, detects drop-offs, and optimizes forms in real time to improve completion rates and reduce friction.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "Free during early access",
            },
            publisher: {
              "@type": "Organization",
              name: "StayClever",
              url: "https://forms.stayclever.in",
            },
            featureList: [
              "Self-optimizing question variants",
              "Behavioral analytics",
              "Adaptive traffic allocation",
              "Real-time form experimentation",
              "No-code setup",
            ],
          }),
        }}
      />

      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          backgroundImage: `url("${NOISE_SVG}")`,
          opacity: 0.05,
          mixBlendMode: "multiply",
        }}
      />

      <PublicNav />
      <Hero />
      <Marquee />
      <Problem />
      <HowItWorks />
      <ControlRoom />
      <Signals />
      <Pricing />
      <FinalCta />
      <PublicFooter />
    </div>
  );
}
