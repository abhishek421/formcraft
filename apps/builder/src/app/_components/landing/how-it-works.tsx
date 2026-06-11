"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ACCENT, BG, BORDER, DIM, DISPLAY, MONO, MUTED, SERIF_IT, SURFACE, TEXT } from "./theme";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    n: "01",
    title: "Write the rivals",
    body: "Give any question two or three phrasings — different wording, tone, or input type. Your live form keeps working untouched; the variants layer quietly on top.",
    note: "No duplicate forms. No rebuild. No separate testing tool.",
    visual: ["What is your company's annual revenue?", "Roughly how much does your business make?", "Select your revenue range ↓"],
  },
  {
    n: "02",
    title: "Split the crowd",
    body: "Each visitor is dealt one variant for their whole session — server-side, deterministic, zero flicker. Come back tomorrow, see the same question.",
    note: "Weighted assignment. Consistent on every return visit.",
    visual: ["visitor #4012 → variant A", "visitor #4013 → variant C", "visitor #4014 → variant A"],
  },
  {
    n: "03",
    title: "Crown the winner",
    body: "Every 15 minutes the engine scores real behavior — answers, skips, hesitation, rage-backs — and shifts traffic toward the phrasing that converts.",
    note: "Minimum 100 impressions before rebalancing. No premature verdicts.",
    visual: ["A ▸ 62% traffic ✦ winning", "B ▸ 24% traffic", "C ▸ 14% traffic"],
  },
];

export function HowItWorks() {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      // Desktop: pin the section and translate the card track horizontally.
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const track = trackRef.current!;
        const getDistance = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      });
      // Mobile / reduced motion: simple stacked reveal.
      mm.add("(max-width: 899px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".lp-step-card").forEach((card) => {
          gsap.from(card, {
            opacity: 0,
            y: 36,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 82%", once: true },
          });
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="how" ref={root} style={{ background: BG, overflow: "hidden" }}>
      <div className="lp-how-track" ref={trackRef}>

        {/* Intro panel */}
        <div className="lp-how-intro">
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: ACCENT, marginBottom: 24, opacity: 0.8 }}>
            HOW IT WORKS
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(40px,4.6vw,72px)", fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.03em", color: TEXT, margin: 0 }}>
            Built-in<br />experimentation.<br />
            <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, color: ACCENT }}>Zero</span> manual work.
          </h2>
          <p style={{ fontFamily: MONO, fontSize: 12, color: MUTED, lineHeight: 2, maxWidth: 380, marginTop: 28, fontWeight: 300 }}>
            No duplicate forms. No separate A/B tool. No analyst on retainer.
            CleverForms runs adaptive experiments inside the form itself.
          </p>
          <div className="lp-how-cue" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", color: DIM, marginTop: 48 }}>
            KEEP SCROLLING ⟶
          </div>
        </div>

        {STEPS.map(({ n, title, body, note, visual }, i) => (
          <article key={n} className="lp-step-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "auto" }}>
              <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(64px,7vw,110px)", lineHeight: 1, letterSpacing: "-0.04em", color: "transparent", WebkitTextStroke: `1.5px ${ACCENT}` }}>
                {n}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: DIM }}>STEP {n}/03</span>
            </div>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "20px 22px", margin: "36px 0" }}>
              {visual.map((line, vi) => (
                <div
                  key={line}
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    lineHeight: 1.7,
                    padding: "8px 0",
                    color: vi === 0 && i !== 1 ? ACCENT : MUTED,
                    borderBottom: vi < visual.length - 1 ? `1px solid ${BORDER}` : "none",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily: DISPLAY, fontSize: "clamp(26px,2.4vw,36px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, color: TEXT, margin: "0 0 16px" }}>
              {title}
            </h3>
            <p style={{ fontFamily: MONO, fontSize: 12, fontWeight: 300, color: MUTED, lineHeight: 1.95, margin: "0 0 20px" }}>
              {body}
            </p>
            <div style={{ fontFamily: MONO, fontSize: 10.5, color: DIM, letterSpacing: "0.03em", lineHeight: 1.8, borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
              {note}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
