"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ACCENT, BG, BORDER, DIM, DISPLAY, GREEN, MONO, MUTED, SERIF_IT, SURFACE, TEXT,
} from "./theme";

gsap.registerPlugin(ScrollTrigger);

const EVENTS = [
  { e: "answered", w: "+1.0", d: "User confirmed and advanced" },
  { e: "shown", w: "—", d: "Question entered viewport" },
  { e: "skipped", w: "−0.5", d: "Optional question bypassed" },
  { e: "backtracked", w: "−0.3", d: "User pressed Back" },
  { e: "validation_error", w: "−0.4", d: "Input rejected — friction signal" },
  { e: "abandoned", w: "−1.0", d: "Session ended without finishing" },
];

const GUARANTEES = [
  "Session-level consistency — same variant for the entire journey",
  "Exploration floor — worst variant always keeps ≥5% traffic",
  "Statistical guard — no rebalancing until 100+ impressions",
  "Epsilon-greedy scoring — deterministic, transparent, auditable",
];

export function Signals() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".lp-sig-left > *", {
          opacity: 0, y: 26, duration: 0.85, ease: "power3.out", stagger: 0.09,
          scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
        });
        gsap.from(".lp-sig-row", {
          opacity: 0, x: 34, duration: 0.7, ease: "power3.out", stagger: 0.08,
          scrollTrigger: { trigger: ".lp-sig-table", start: "top 78%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="proof" ref={root} style={{ background: SURFACE, borderTop: `1px solid ${BORDER}` }}>
      <div className="lp-sec-pad" style={{ maxWidth: 1280, margin: "0 auto", paddingTop: 120, paddingBottom: 120 }}>
        <div className="lp-sig-grid">
          <div className="lp-sig-left">
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: ACCENT, marginBottom: 22, opacity: 0.8 }}>
              BEHAVIORAL ANALYTICS
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(34px,3.8vw,56px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.028em", color: TEXT, margin: "0 0 26px" }}>
              It reads<br />the{" "}
              <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, color: ACCENT }}>room.</span>
            </h2>
            <p style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 300, color: MUTED, lineHeight: 2.05, margin: "0 0 36px", maxWidth: 440 }}>
              Most analytics tell you what happened. CleverForms reads the full
              behavioral signal — hesitation, backtracking, skips, validation
              friction, answer speed — then identifies which phrasing caused the
              drop-off and quietly retires it.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {GUARANTEES.map((t) => (
                <div key={t} style={{ display: "flex", gap: 12, fontFamily: MONO, fontSize: 12, color: MUTED, lineHeight: 1.7 }}>
                  <span style={{ color: ACCENT, flexShrink: 0, marginTop: 2 }}>✓</span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="lp-sig-table" style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 32, alignSelf: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, letterSpacing: "0.14em", marginBottom: 20 }}>
              TRACKED EVENTS · SCORING WEIGHTS
            </div>
            {EVENTS.map(({ e, w, d }, i) => (
              <div
                key={e}
                className="lp-sig-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 52px 1fr",
                  gap: 16,
                  padding: "14px 0",
                  fontFamily: MONO,
                  fontSize: 11,
                  borderBottom: i < EVENTS.length - 1 ? `1px solid ${BORDER}` : "none",
                  alignItems: "center",
                }}
              >
                <span style={{ color: ACCENT, opacity: 0.7 }}>.{e}</span>
                <span style={{ color: w.startsWith("+") ? GREEN : w === "—" ? DIM : ACCENT, opacity: 0.9 }}>{w}</span>
                <span style={{ color: DIM }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
