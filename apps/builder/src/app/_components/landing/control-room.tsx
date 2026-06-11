"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ACCENT, BLUE, DARK_BDR, DARK_BG, DARK_DIM, DARK_MUT, DARK_TEXT,
  DISPLAY, GREEN, MONO, SERIF_IT,
} from "./theme";

gsap.registerPlugin(ScrollTrigger);

const VIZ_COLORS = [ACCENT, GREEN, BLUE];
const VIZ_LABELS = ["Variant A", "Variant B", "Variant C"];

function PanelHeader({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
      <span style={{ fontSize: 10, letterSpacing: "0.14em", color: DARK_DIM, textTransform: "uppercase" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: "lp-pulse 1.4s infinite" }} />
        <span style={{ fontSize: 10, color, letterSpacing: "0.1em" }}>LIVE</span>
      </div>
    </div>
  );
}

// ── Panel 1: Optimization Engine ──────────────────────────────────────────────
function OptimizerPanel() {
  const [weights, setWeights] = useState([33, 33, 34]);
  const [events, setEvents] = useState<{ id: number; type: string; v: number }[]>([]);
  const id = useRef(0);

  useEffect(() => {
    const t = setInterval(() => {
      setWeights((w) => {
        const n = [...w];
        const d = (Math.random() - 0.32) * 1.8;
        n[0] = Math.min(74, Math.max(10, n[0] + d));
        n[1] = Math.min(52, Math.max(8, n[1] - d * 0.5));
        n[2] = Math.max(6, 100 - n[0] - n[1]);
        return n;
      });
      const v = Math.floor(Math.random() * 3);
      const type = ["shown", "answered", "answered", "answered", "skipped"][Math.floor(Math.random() * 5)];
      setEvents((prev) => [{ id: ++id.current, type, v }, ...prev.slice(0, 4)]);
    }, 820);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: MONO }}>
      <PanelHeader label="Optimization Engine" color={ACCENT} />
      {VIZ_LABELS.map((lbl, i) => (
        <div key={lbl} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: 11, color: i === 0 ? ACCENT : DARK_MUT }}>
              {lbl}{i === 0 && weights[0] > 52 ? " · winning ✦" : ""}
            </span>
            <span style={{ fontSize: 11, color: DARK_DIM }}>{weights[i].toFixed(1)}%</span>
          </div>
          <div style={{ height: 3, background: "rgba(240,237,232,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${weights[i]}%`, background: VIZ_COLORS[i], transition: "width 0.85s cubic-bezier(0.4,0,0.2,1)", opacity: i === 0 ? 1 : 0.45 }} />
          </div>
        </div>
      ))}
      <div style={{ borderTop: `1px solid ${DARK_BDR}`, marginTop: "auto", paddingTop: 16 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(240,237,232,0.18)", marginBottom: 10 }}>EVENT STREAM</div>
        <div style={{ height: 72, overflow: "hidden" }}>
          {events.map((e, i) => (
            <div key={e.id} style={{ display: "flex", gap: 10, fontSize: 10, opacity: 1 - i * 0.22, marginBottom: 5 }}>
              <span style={{ color: VIZ_COLORS[e.v] }}>▸</span>
              <span style={{ color: DARK_DIM, minWidth: 68 }}>{VIZ_LABELS[e.v]}</span>
              <span style={{ color: DARK_MUT }}>{e.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Panel 2: Form Analytics ───────────────────────────────────────────────────
const QUESTIONS = [
  { q: "What's your role?", base: 92 },
  { q: "Team size?", base: 78 },
  { q: "Annual budget?", base: 61 },
  { q: "Current tooling?", base: 47 },
  { q: "Timeline to decide?", base: 38 },
];

function AnalyticsPanel() {
  const [rates, setRates] = useState(QUESTIONS.map((q) => q.base));
  const [lift, setLift] = useState(34);

  useEffect(() => {
    const t = setInterval(() => {
      setRates((r) => r.map((v, i) => Math.min(99, Math.max(20, v + (Math.random() - 0.4) * 1.2 * (1 + i * 0.3)))));
      setLift((l) => Math.min(48, Math.max(22, l + (Math.random() - 0.4) * 0.6)));
    }, 1100);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: MONO }}>
      <PanelHeader label="Form Analytics" color={GREEN} />
      <div style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(240,237,232,0.18)", marginBottom: 12 }}>QUESTION DROP-OFF</div>
      {QUESTIONS.map((q, i) => (
        <div key={q.q} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: DARK_MUT, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.q}</span>
            <span style={{ fontSize: 10, color: rates[i] > 70 ? GREEN : rates[i] > 50 ? DARK_MUT : ACCENT, flexShrink: 0 }}>{rates[i].toFixed(0)}%</span>
          </div>
          <div style={{ height: 2, background: "rgba(240,237,232,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${rates[i]}%`, background: rates[i] > 70 ? GREEN : rates[i] > 50 ? BLUE : ACCENT, transition: "width 1s cubic-bezier(0.4,0,0.2,1)", opacity: 0.7 }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: "auto", borderTop: `1px solid ${DARK_BDR}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: DARK_DIM }}>completion lift this week</span>
        <span style={{ fontSize: 16, fontWeight: 500, color: GREEN }}>+{lift.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// ── Panel 3: Active Experiment ────────────────────────────────────────────────
function ExperimentPanel() {
  const [traffic, setTraffic] = useState([58, 26, 16]);

  useEffect(() => {
    const t = setInterval(() => {
      setTraffic((w) => {
        const n = [...w];
        const d = (Math.random() - 0.35) * 1.4;
        n[0] = Math.min(76, Math.max(40, n[0] + d));
        n[1] = Math.min(40, Math.max(12, n[1] - d * 0.6));
        n[2] = Math.max(8, 100 - n[0] - n[1]);
        return n;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const variants = [
    { lbl: "A", q: "What is your company's annual revenue?", color: ACCENT },
    { lbl: "B", q: "Select your revenue range ↓", color: BLUE },
    { lbl: "C", q: "Roughly how much does your business make?", color: DARK_DIM },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: MONO }}>
      <PanelHeader label="Active Experiment" color={ACCENT} />
      <div style={{ fontSize: 10, color: DARK_DIM, marginBottom: 20 }}>&ldquo;annual revenue&rdquo; · 3 variants running</div>
      {variants.map(({ lbl, q, color }, i) => (
        <div
          key={lbl}
          style={{
            marginBottom: 12,
            padding: "14px 16px",
            background: i === 0 ? "rgba(232,93,58,0.08)" : "rgba(240,237,232,0.03)",
            border: `1px solid ${i === 0 ? "rgba(232,93,58,0.25)" : DARK_BDR}`,
            borderRadius: 6,
            position: "relative",
          }}
        >
          {i === 0 && traffic[0] > 60 && (
            <div style={{ position: "absolute", top: -1, right: 10, background: ACCENT, color: "#fff", fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", padding: "2px 7px", borderRadius: "0 0 3px 3px" }}>WINNING</div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 10, color }}>Variant {lbl}</span>
            <span style={{ fontSize: 10, color: DARK_DIM }}>{traffic[i].toFixed(1)}%</span>
          </div>
          <div style={{ fontSize: 11, color: i === 0 ? DARK_TEXT : DARK_MUT, marginBottom: 8, lineHeight: 1.5 }}>{q}</div>
          <div style={{ height: 2, background: "rgba(240,237,232,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${traffic[i]}%`, background: color, transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)", opacity: i === 0 ? 0.9 : 0.35 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export function ControlRoom() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".lp-cr-head", {
          opacity: 0, y: 26, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
        });
        gsap.from(".lp-cr-panel", {
          opacity: 0, y: 48, rotateX: 8, duration: 1, ease: "power3.out", stagger: 0.14,
          scrollTrigger: { trigger: ".lp-cr-grid", start: "top 78%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} style={{ background: DARK_BG, color: DARK_TEXT }}>
      <div className="lp-sec-pad" style={{ maxWidth: 1280, margin: "0 auto", paddingTop: 120, paddingBottom: 120 }}>
        <div className="lp-cr-head" style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: ACCENT, marginBottom: 20, opacity: 0.8 }}>
            THE CONTROL ROOM
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(36px,4.2vw,64px)", fontWeight: 800, lineHeight: 1.04, letterSpacing: "-0.03em", margin: 0 }}>
            Watch a form{" "}
            <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, color: ACCENT }}>think.</span>
          </h2>
          <p style={{ fontFamily: MONO, fontSize: 12, fontWeight: 300, color: DARK_MUT, lineHeight: 2, maxWidth: 460, marginTop: 20 }}>
            This is live simulation of the engine at work — variants competing,
            behavior streaming in, traffic rebalancing in real time. Your
            dashboard looks exactly like this. Minus the simulation.
          </p>
        </div>

        <div className="lp-cr-grid" style={{ perspective: 1200 }}>
          {[<OptimizerPanel key="o" />, <AnalyticsPanel key="a" />, <ExperimentPanel key="e" />].map((panel, i) => (
            <div
              key={i}
              className="lp-cr-panel"
              style={{
                background: "rgba(240,237,232,0.025)",
                border: `1px solid ${DARK_BDR}`,
                borderRadius: 10,
                padding: "26px 26px 22px",
                minHeight: 400,
                transition: "border-color 0.3s, transform 0.3s",
              }}
            >
              {panel}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
