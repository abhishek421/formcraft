"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ACCENT, DARK_BG, DARK_DIM, DARK_MUT, DARK_TEXT, DISPLAY, MONO, SERIF_IT } from "./theme";

gsap.registerPlugin(ScrollTrigger);

export function Problem() {
  const root = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const counter = { v: 0 };
        gsap.to(counter, {
          v: 68,
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: { trigger: numRef.current, start: "top 78%", once: true },
          onUpdate: () => {
            if (numRef.current) numRef.current.textContent = String(Math.round(counter.v));
          },
        });

        gsap.from(".lp-problem-reveal", {
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
        });

        gsap.to(".lp-problem-big", {
          yPercent: -8,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="problem" ref={root} style={{ background: DARK_BG, color: DARK_TEXT, overflow: "hidden" }}>
      <div className="lp-sec-pad" style={{ maxWidth: 1280, margin: "0 auto", paddingTop: 140, paddingBottom: 140 }}>
        <div className="lp-problem-reveal" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: ACCENT, marginBottom: 48, opacity: 0.8 }}>
          THE SILENT LEAK
        </div>

        <div className="lp-problem-grid">
          <div className="lp-problem-big" style={{ position: "relative" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(120px, 22vw, 320px)", lineHeight: 0.82, letterSpacing: "-0.05em", color: DARK_TEXT }}>
              <span ref={numRef}>0</span><span style={{ color: ACCENT }}>%</span>
            </div>
            <div className="lp-problem-reveal" style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontSize: "clamp(18px, 2.2vw, 28px)", color: DARK_MUT, marginTop: 28, maxWidth: 420, lineHeight: 1.5 }}>
              of people who open a form never finish it.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 28 }}>
            <p className="lp-problem-reveal" style={{ fontFamily: MONO, fontSize: 13, fontWeight: 300, color: DARK_MUT, lineHeight: 2.1, margin: 0 }}>
              They don&apos;t complain. They don&apos;t file a ticket. They hesitate on
              one badly-worded question — and they&apos;re gone. Your dashboard calls
              it <span style={{ color: DARK_TEXT }}>&ldquo;drop-off.&rdquo;</span> We call it the most
              expensive silence in your funnel.
            </p>
            <p className="lp-problem-reveal" style={{ fontFamily: MONO, fontSize: 13, fontWeight: 300, color: DARK_MUT, lineHeight: 2.1, margin: 0 }}>
              Traditional builders show you <em style={{ color: DARK_TEXT, fontStyle: "normal" }}>where</em> people
              left. They never tell you <em style={{ color: DARK_TEXT, fontStyle: "normal" }}>why</em> —
              and they never, ever fix it.
            </p>
            <div className="lp-problem-reveal" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: DARK_DIM, borderTop: `1px solid rgba(240,237,232,0.1)`, paddingTop: 20 }}>
              CLEVERFORMS FIXES IT WHILE YOU SLEEP →
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
