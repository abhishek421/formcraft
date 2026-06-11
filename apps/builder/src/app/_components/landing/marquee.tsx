"use client";

import { ACCENT, BORDER, DISPLAY, SURFACE, TEXT } from "./theme";

const ITEMS = [
  "TEST EVERY QUESTION",
  "DETECT FRICTION",
  "SHIFT TRAFFIC",
  "LIFT COMPLETION",
  "EVERY 15 MINUTES",
];

export function Marquee() {
  // Content rendered twice; CSS translates the track -50% for a seamless loop.
  const row = (ariaHidden: boolean) => (
    <div aria-hidden={ariaHidden || undefined} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      {ITEMS.map((t) => (
        <span key={t} style={{ display: "flex", alignItems: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(15px,1.6vw,22px)", letterSpacing: "-0.01em", color: TEXT, whiteSpace: "nowrap", padding: "0 12px" }}>
          {t}
          <span style={{ color: ACCENT, padding: "0 0 0 24px", fontSize: "0.8em" }}>✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: SURFACE, overflow: "hidden", padding: "18px 0" }}>
      <div className="lp-marquee-track" style={{ display: "flex", width: "max-content" }}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
