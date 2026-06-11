"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ACCENT, DARK_BG, DARK_DIM, DARK_MUT, DARK_TEXT, DISPLAY, MONO, SERIF_IT,
} from "./theme";

gsap.registerPlugin(ScrollTrigger);

export function FinalCta() {
  const root = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".lp-cta-big", {
          scale: 0.86,
          opacity: 0.3,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 90%", end: "top 30%", scrub: 0.8 },
        });
        gsap.from(".lp-cta-rest > *", {
          opacity: 0, y: 22, duration: 0.8, ease: "power3.out", stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: "top 55%", once: true },
        });
      });

      // Magnetic button — eases toward the cursor, springs back on leave.
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const btn = btnRef.current;
        if (!btn) return;
        const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
        const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
        const onMove = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
        };
        const onLeave = () => { xTo(0); yTo(0); };
        const zone = btn.parentElement!;
        zone.addEventListener("mousemove", onMove);
        zone.addEventListener("mouseleave", onLeave);
        return () => {
          zone.removeEventListener("mousemove", onMove);
          zone.removeEventListener("mouseleave", onLeave);
        };
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} style={{ background: DARK_BG, color: DARK_TEXT, overflow: "hidden" }}>
      <div className="lp-sec-pad" style={{ maxWidth: 1280, margin: "0 auto", paddingTop: 160, paddingBottom: 160, textAlign: "center" }}>
        <h2 className="lp-cta-big" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(64px,13vw,210px)", lineHeight: 0.92, letterSpacing: "-0.045em", margin: "0 0 48px", transformOrigin: "center 70%" }}>
          Stay<br />
          <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, color: ACCENT, letterSpacing: "-0.02em" }}>clever.</span>
        </h2>

        <div className="lp-cta-rest">
          <p style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 300, color: DARK_MUT, maxWidth: 440, margin: "0 auto 48px", lineHeight: 2.05 }}>
            Traditional forms collect responses. CleverForms learns from them —
            improving wording, structure, and conversion with every single
            submission. Yours could start learning tonight.
          </p>

          <div style={{ display: "inline-block", padding: 24 }}>
            <Link ref={btnRef} href="/login" className="lp-btn" style={{ fontSize: 13, padding: "18px 52px", display: "inline-block" }}>
              Build your first self-optimizing form
            </Link>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10.5, color: DARK_DIM, marginTop: 20, letterSpacing: "0.12em" }}>
            NO CREDIT CARD · NO-CODE SETUP · LIVE IN MINUTES
          </div>
        </div>
      </div>
    </section>
  );
}
