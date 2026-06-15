"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SignalField } from "./signal-field";
import { ACCENT, DIM, DISPLAY, MONO, MUTED, SERIF_IT, TEXT } from "./theme";

gsap.registerPlugin(ScrollTrigger);

const H1_LINES: { text: string; serif?: boolean }[] = [
  { text: "Forms that" },
  { text: "improve" },
  { text: "themselves.", serif: true },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.timeline({ defaults: { ease: "power4.out" } })
          .from(".lp-hero-line-inner", { yPercent: 112, duration: 1.1, stagger: 0.09, delay: 0.15 })
          .from(".lp-hero-eyebrow", { opacity: 0, y: 14, duration: 0.7 }, 0.35)
          .from(".lp-hero-sub, .lp-hero-ctas, .lp-hero-foot", { opacity: 0, y: 18, duration: 0.8, stagger: 0.1 }, 0.65)
          .from(".lp-hero-scrollcue", { opacity: 0, duration: 0.9 }, 1.2);

        // Headline drifts up and thins out as the field scrolls past.
        gsap.to(".lp-hero-copy", {
          yPercent: -14,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom 35%", scrub: true },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".lp-hero-line-inner, .lp-hero-eyebrow, .lp-hero-sub, .lp-hero-ctas, .lp-hero-foot, .lp-hero-scrollcue", { clearProps: "all" });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      style={{ position: "relative", minHeight: "calc(100svh - 64px)", display: "flex", alignItems: "center", overflow: "hidden" }}
    >
      <SignalField />

      {/* Scrim — clears the field behind the copy so type stays crisp; field remains vivid at the edges. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 62% 75% at 30% 42%, #F4EFE6 0%, rgba(244,239,230,0.94) 42%, rgba(244,239,230,0) 78%),
            linear-gradient(180deg, rgba(244,239,230,0.9) 0%, rgba(244,239,230,0) 22%)
          `,
        }}
      />

      <div className="lp-hero-copy lp-hero-pad" style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", width: "100%" }}>
        <div className="lp-hero-eyebrow" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", color: MUTED, marginBottom: 32 }}>
          CLEVERFORMS<span style={{ color: ACCENT }}> ✦ </span>THE SELF-OPTIMIZING FORM BUILDER
        </div>

        <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 0.98, color: TEXT, marginBottom: 36, fontSize: "clamp(56px, 9.5vw, 148px)" }}>
          {H1_LINES.map(({ text, serif }) => (
            <span key={text} className="lp-hero-line" style={{ display: "block", overflow: "hidden", padding: "0.06em 0" }}>
              <span
                className="lp-hero-line-inner"
                style={{
                  display: "block",
                  ...(serif && { fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, color: ACCENT, letterSpacing: "-0.02em" }),
                }}
              >
                {text}
              </span>
            </span>
          ))}
        </h1>

        <div className="lp-hero-row">
          <p className="lp-hero-sub" style={{ fontFamily: MONO, fontSize: 13, fontWeight: 300, color: MUTED, lineHeight: 2, maxWidth: 440, margin: 0 }}>
            Every question runs quiet experiments. Every visitor teaches it
            something. Every 15 minutes, your form gets measurably better at
            not losing people.
          </p>

          <div>
            <div className="lp-hero-ctas" style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 18 }}>
              <Link href="/login" className="lp-btn">Start free</Link>
              <a href="#problem" className="lp-hero-ghost">Watch it think ↓</a>
            </div>
            <div className="lp-hero-foot" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: DIM }}>
              NO CODE · NO ANALYST · NO GUESSWORK
            </div>
            <div className="lp-hero-foot" style={{ marginTop: 16 }}>
              <a href="https://peerpush.com/p/cleverforms" target="_blank" rel="noopener" style={{ width: 230, display: "inline-block" }}>
                <img src="https://peerpush.com/p/cleverforms/badge.png" alt="CleverForms badge" style={{ width: 230 }} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        className="lp-hero-scrollcue"
        aria-hidden
        style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 2, fontFamily: MONO, fontSize: 9, letterSpacing: "0.3em", color: DIM, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
      >
        SCROLL
        <span style={{ width: 1, height: 36, background: `linear-gradient(${ACCENT}, transparent)`, display: "block", animation: "lp-drip 1.8s ease-in-out infinite" }} />
      </div>
    </section>
  );
}
