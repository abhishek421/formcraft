"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Palette ───────────────────────────────────────────────────────────────────
const BG      = "#F4EFE6";
const SURFACE = "#EBE5DA";
const TEXT     = "#1C1917";
const MUTED    = "rgba(28,25,23,0.55)";
const DIM      = "rgba(28,25,23,0.32)";
const BORDER   = "rgba(28,25,23,0.10)";
const ACCENT   = "#E85D3A";
const ACCENT_D = "rgba(232,93,58,0.12)";
const ACCENT_B = "rgba(232,93,58,0.28)";
const DARK_BG  = "#1C1917";
const DARK_TEXT= "#F0EDE8";
const DARK_MUT = "rgba(240,237,232,0.50)";
const DARK_DIM = "rgba(240,237,232,0.28)";
const DARK_BDR = "rgba(240,237,232,0.08)";

const PANEL_H = 380;
const VIZ_COLORS = [ACCENT, "#7A9E6A", "#5B8BA8"];
const VIZ_LABELS = ["Variant A", "Variant B", "Variant C"];

// ── Panel 1: Optimization Engine ─────────────────────────────────────────────
function OptimizerPanel() {
  const [weights, setWeights] = useState([33, 33, 34]);
  const [events, setEvents]   = useState<{ id:number; type:string; v:number }[]>([]);
  const id = useRef(0);

  useEffect(() => {
    const t = setInterval(() => {
      setWeights(w => {
        const n = [...w];
        const d = (Math.random() - 0.32) * 1.8;
        n[0] = Math.min(74, Math.max(10, n[0] + d));
        n[1] = Math.min(52, Math.max(8,  n[1] - d * 0.5));
        n[2] = Math.max(6, 100 - n[0] - n[1]);
        return n;
      });
      const v    = Math.floor(Math.random() * 3);
      const type = ["shown","answered","answered","answered","skipped"][Math.floor(Math.random()*5)];
      setEvents(prev => [{ id: ++id.current, type, v }, ...prev.slice(0,4)]);
    }, 820);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ height:PANEL_H, display:"flex", flexDirection:"column", fontFamily:"'DM Mono',monospace" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <span style={{ fontSize:10, letterSpacing:"0.14em", color:DARK_DIM, textTransform:"uppercase" }}>Optimization Engine</span>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:ACCENT, animation:"pulse 1.4s infinite" }} />
          <span style={{ fontSize:10, color:ACCENT, letterSpacing:"0.1em" }}>LIVE</span>
        </div>
      </div>

      {VIZ_LABELS.map((lbl, i) => (
        <div key={lbl} style={{ marginBottom:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
            <span style={{ fontSize:11, color: i===0 ? ACCENT : DARK_MUT }}>
              {lbl}{i===0 && weights[0]>52 ? " · winning ✦" : ""}
            </span>
            <span style={{ fontSize:11, color:DARK_DIM }}>{weights[i].toFixed(1)}%</span>
          </div>
          <div style={{ height:3, background:"rgba(240,237,232,0.08)", borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${weights[i]}%`, background:VIZ_COLORS[i], transition:"width 0.85s cubic-bezier(0.4,0,0.2,1)", opacity:i===0?1:0.45 }} />
          </div>
        </div>
      ))}

      <div style={{ borderTop:`1px solid ${DARK_BDR}`, marginTop:"auto", paddingTop:16 }}>
        <div style={{ fontSize:9, letterSpacing:"0.14em", color:"rgba(240,237,232,0.18)", marginBottom:10 }}>EVENT STREAM</div>
        <div style={{ height:72, overflow:"hidden" }}>
          {events.map((e, i) => (
            <div key={e.id} style={{ display:"flex", gap:10, fontSize:10, opacity:1-i*0.22, marginBottom:5 }}>
              <span style={{ color:VIZ_COLORS[e.v] }}>▸</span>
              <span style={{ color:DARK_DIM, minWidth:68 }}>{VIZ_LABELS[e.v]}</span>
              <span style={{ color:DARK_MUT }}>{e.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Panel 2: Form Analytics ───────────────────────────────────────────────────
function AnalyticsPanel() {
  const questions = [
    { q:"What's your role?",       base:92 },
    { q:"Team size?",              base:78 },
    { q:"Annual budget?",          base:61 },
    { q:"Current tooling?",        base:47 },
    { q:"Timeline to decide?",     base:38 },
  ];
  const [rates, setRates] = useState(questions.map(q => q.base));
  const [lift, setLift]   = useState(34);

  useEffect(() => {
    const t = setInterval(() => {
      setRates(r => r.map((v, i) => Math.min(99, Math.max(20, v + (Math.random()-0.4) * 1.2 * (1 + i * 0.3)))));
      setLift(l => Math.min(48, Math.max(22, l + (Math.random()-0.4) * 0.6)));
    }, 1100);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ height:PANEL_H, display:"flex", flexDirection:"column", fontFamily:"'DM Mono',monospace" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <span style={{ fontSize:10, letterSpacing:"0.14em", color:DARK_DIM, textTransform:"uppercase" }}>Form Analytics</span>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#7A9E6A", animation:"pulse 1.4s infinite" }} />
          <span style={{ fontSize:10, color:"#7A9E6A", letterSpacing:"0.1em" }}>LIVE</span>
        </div>
      </div>

      <div style={{ fontSize:9, letterSpacing:"0.14em", color:"rgba(240,237,232,0.18)", marginBottom:12 }}>QUESTION DROP-OFF</div>
      {questions.map((q, i) => (
        <div key={q.q} style={{ marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:10, color:DARK_MUT, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{q.q}</span>
            <span style={{ fontSize:10, color: rates[i] > 70 ? "#7A9E6A" : rates[i] > 50 ? DARK_MUT : ACCENT, flexShrink:0 }}>{rates[i].toFixed(0)}%</span>
          </div>
          <div style={{ height:2, background:"rgba(240,237,232,0.08)", borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${rates[i]}%`, background: rates[i] > 70 ? "#7A9E6A" : rates[i] > 50 ? "#5B8BA8" : ACCENT, transition:"width 1s cubic-bezier(0.4,0,0.2,1)", opacity:0.7 }} />
          </div>
        </div>
      ))}

      <div style={{ marginTop:"auto", borderTop:`1px solid ${DARK_BDR}`, paddingTop:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:10, color:DARK_DIM }}>completion lift this week</span>
        <span style={{ fontSize:16, fontWeight:500, color:"#7A9E6A" }}>+{lift.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// ── Panel 3: Active Experiment ────────────────────────────────────────────────
function ExperimentPanel() {
  const [traffic, setTraffic] = useState([58, 26, 16]);

  useEffect(() => {
    const t = setInterval(() => {
      setTraffic(w => {
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
    { lbl:"A", q:"What is your company's annual revenue?",    color:ACCENT },
    { lbl:"B", q:"Select your revenue range ↓",               color:"#5B8BA8" },
    { lbl:"C", q:"Roughly how much does your business make?", color:DARK_DIM },
  ];

  return (
    <div style={{ height:PANEL_H, display:"flex", flexDirection:"column", fontFamily:"'DM Mono',monospace" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <span style={{ fontSize:10, letterSpacing:"0.14em", color:DARK_DIM, textTransform:"uppercase" }}>Active Experiment</span>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:ACCENT, animation:"pulse 1.4s infinite" }} />
          <span style={{ fontSize:10, color:ACCENT, letterSpacing:"0.1em" }}>LIVE</span>
        </div>
      </div>

      <div style={{ fontSize:10, color:DARK_DIM, marginBottom:20 }}>"annual revenue" · 3 variants running</div>

      {variants.map(({ lbl, q, color }, i) => (
        <div key={lbl} style={{
          marginBottom:12, padding:"14px 16px",
          background: i===0 ? "rgba(232,93,58,0.08)" : "rgba(240,237,232,0.03)",
          border:`1px solid ${i===0 ? "rgba(232,93,58,0.25)" : DARK_BDR}`,
          borderRadius:6, position:"relative",
        }}>
          {i===0 && traffic[0]>60 && (
            <div style={{ position:"absolute", top:-1, right:10, background:ACCENT, color:"#fff", fontSize:8, fontWeight:700, letterSpacing:"0.12em", padding:"2px 7px", borderRadius:"0 0 3px 3px" }}>WINNING</div>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <span style={{ fontSize:10, color }}>Variant {lbl}</span>
            <span style={{ fontSize:10, color:DARK_DIM }}>{traffic[i].toFixed(1)}%</span>
          </div>
          <div style={{ fontSize:11, color: i===0 ? DARK_TEXT : DARK_MUT, marginBottom:8, lineHeight:1.5 }}>{q}</div>
          <div style={{ height:2, background:"rgba(240,237,232,0.08)", borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${traffic[i]}%`, background:color, transition:"width 0.9s cubic-bezier(0.4,0,0.2,1)", opacity: i===0?0.9:0.35 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Hero Carousel (stacked cards) ────────────────────────────────────────────
const PANEL_DURATION = 5000;

function HeroCarousel() {
  const [active, setActive]   = useState(0);
  const [exiting, setExiting] = useState<number | null>(null);

  const advance = (cur: number) => {
    setExiting(cur);
    setTimeout(() => {
      setActive(a => (a + 1) % 3);
      setExiting(null);
    }, 520);
  };

  useEffect(() => {
    const t = setInterval(() => advance(active), PANEL_DURATION);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const panels = [
    <OptimizerPanel  key="opt" />,
    <AnalyticsPanel  key="ana" />,
    <ExperimentPanel key="exp" />,
  ];

  const stackCfg = [
    { y:0,  scale:1,    opacity:1,    z:3, blur:0  },
    { y:18, scale:0.95, opacity:0.55, z:2, blur:1  },
    { y:34, scale:0.90, opacity:0.28, z:1, blur:2  },
  ];

  return (
    <div style={{ position:"relative", height: PANEL_H + 48, overflow:"hidden" }}>
      {panels.map((panel, i) => {
        const stackPos = (i - active + 3) % 3;
        const cfg      = stackCfg[stackPos];
        const isExit   = i === exiting;

        return (
          <div
            key={i}
            style={{
              position:"absolute", top:0, left:0, right:0,
              height: PANEL_H,
              background: DARK_BG,
              border: `1px solid ${DARK_BDR}`,
              borderRadius: 10,
              padding: "28px 28px 22px",
              overflow: "hidden",
              zIndex: isExit ? 10 : cfg.z,
              transform: isExit
                ? "translateY(-112%) scale(1)"
                : `translateY(${cfg.y}px) scale(${cfg.scale})`,
              opacity: isExit ? 0 : cfg.opacity,
              filter: cfg.blur > 0 && !isExit ? `blur(${cfg.blur}px)` : "none",
              transition: isExit
                ? "transform 0.5s cubic-bezier(0.4,0,0.8,1), opacity 0.4s ease"
                : "transform 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.6s ease, filter 0.6s ease",
              pointerEvents: stackPos === 0 ? "auto" : "none",
            }}
          >
            {panel}
          </div>
        );
      })}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Page() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);

  return (
    <div style={{ minHeight:"100vh", background:BG, color:TEXT, fontFamily:"'DM Mono',monospace", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:${ACCENT};color:#fff}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        a{text-decoration:none}
        .nl{color:${MUTED};font-size:12px;letter-spacing:0.04em;transition:color 0.18s}
        .nl:hover{color:${ACCENT}}
        .btn{
          display:inline-block;background:${ACCENT};color:#fff;
          padding:14px 36px;font-size:12px;font-weight:500;letter-spacing:0.08em;
          font-family:'DM Mono',monospace;border:none;cursor:pointer;
          border-radius:5px;transition:all 0.18s;text-transform:uppercase;
        }
        .btn:hover{background:#d14e2c;transform:translateY(-1px);box-shadow:0 8px 28px rgba(232,93,58,0.22)}
        .step-card{
          background:${SURFACE};border:1px solid ${BORDER};border-radius:8px;padding:32px;
          transition:border-color 0.2s;
        }
        .step-card:hover{border-color:${ACCENT_B}}

        /* ── Responsive ── */
        .nav-inner{padding:18px 52px}
        .nav-links{display:flex;gap:32px;align-items:center}
        .hero-grid{padding:148px 52px 100px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
        .sec-pad{padding:96px 52px}
        .how-pad{padding:112px 52px}
        .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:64px}
        .variants-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .proof-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
        .pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .cta-pad{padding:120px 52px}
        .footer-inner{display:flex;justify-content:space-between;align-items:center}

        @media(max-width:1024px){
          .pricing-grid{grid-template-columns:1fr 1fr}
          .steps-grid{grid-template-columns:1fr 1fr}
        }
        @media(max-width:768px){
          .nav-inner{padding:16px 24px}
          .nav-links{display:none}
          .hero-grid{grid-template-columns:1fr;gap:48px;padding:112px 24px 72px}
          .sec-pad{padding:64px 24px}
          .how-pad{padding:72px 24px}
          .steps-grid{grid-template-columns:1fr;margin-bottom:40px}
          .variants-grid{grid-template-columns:1fr}
          .proof-grid{grid-template-columns:1fr;gap:40px}
          .pricing-grid{grid-template-columns:1fr 1fr}
          .cta-pad{padding:80px 24px}
          .footer-inner{flex-direction:column;gap:20px;text-align:center}
        }
        @media(max-width:480px){
          .pricing-grid{grid-template-columns:1fr}
        }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:100,
        background:"rgba(244,239,230,0.88)",backdropFilter:"blur(16px)",
        borderBottom:`1px solid ${BORDER}`,
      }}>
        <div className="nav-inner" style={{ maxWidth:1280, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:7, height:7, background:ACCENT, borderRadius:2 }} />
            <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:15, letterSpacing:"-0.01em" }}>FormCraft</span>
          </div>
          <div className="nav-links">
            <a href="#how" className="nl">How it works</a>
            <a href="#proof" className="nl">Why it works</a>
          </div>
          <Link href="/login" className="btn" style={{ padding:"9px 22px", fontSize:11 }}>Get started free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight:"100vh",
        display:"flex", alignItems:"center",
      }}>
      <div className="hero-grid" style={{ maxWidth:1280, margin:"0 auto", width:"100%" }}>
        <div style={{ opacity:m?1:0, animation:m?"up 0.6s ease both":"none" }}>

          <div style={{ fontSize:12, color:MUTED, letterSpacing:"0.04em", marginBottom:28, lineHeight:1.8 }}>
            Your form has a question that kills conversions.<br />
            <span style={{ color:ACCENT }}>You just don't know which one yet.</span>
          </div>

          <h1 style={{
            fontFamily:"'Bricolage Grotesque',sans-serif",
            fontSize:"clamp(52px,5.5vw,82px)",
            fontWeight:800, lineHeight:1.04,
            letterSpacing:"-0.03em", marginBottom:24, color:TEXT,
          }}>
            Forms that<br />fix themselves.
          </h1>

          <p style={{ fontSize:14, color:MUTED, lineHeight:2, maxWidth:400, marginBottom:40, fontWeight:300 }}>
            A/B test every question. Track real behavior.
            Automatically shift traffic to the wording that converts.
            No analyst. No guesswork.
          </p>

          <Link href="/login" className="btn">Run your first experiment free</Link>
        </div>

        <div style={{ opacity:m?1:0, animation:m?"up 0.6s 0.1s ease both":"none" }}>
          <HeroCarousel />
        </div>
      </div>
      </section>

      {/* ── Pain ── */}
      <section style={{ borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, background:SURFACE }}>
        <div className="sec-pad" style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ maxWidth:640 }}>
            <div style={{ fontSize:10, letterSpacing:"0.18em", color:ACCENT, marginBottom:20, opacity:0.75 }}>THE PROBLEM</div>
            <h2 style={{
              fontFamily:"'Bricolage Grotesque',sans-serif",
              fontSize:"clamp(30px,3.2vw,48px)",
              fontWeight:800, lineHeight:1.12,
              letterSpacing:"-0.025em", marginBottom:24,
            }}>
              You published your form.<br />
              You're bleeding conversions<br />
              and you don't know where.
            </h2>
            <p style={{ fontSize:13, color:MUTED, lineHeight:2, marginBottom:20 }}>
              The average form loses 68% of visitors before completion.
              Most drop-off happens at a single question —
              the one that's worded wrong, positioned wrong, or asks too much.
            </p>
            <p style={{ fontSize:13, color:MUTED, lineHeight:2 }}>
              Traditional analytics tell you <em>where</em> people left.
              FormCraft tells you <em>which variant fixes it</em>
              and routes traffic there automatically —
              every 15 minutes, around the clock.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="how-pad" style={{ maxWidth:1280, margin:"0 auto" }}>
        <div style={{ marginBottom:64 }}>
          <div style={{ fontSize:10, letterSpacing:"0.18em", color:ACCENT, marginBottom:16, opacity:0.75 }}>HOW IT WORKS</div>
          <h2 style={{
            fontFamily:"'Bricolage Grotesque',sans-serif",
            fontSize:"clamp(32px,3.5vw,52px)",
            fontWeight:800, lineHeight:1.08,
            letterSpacing:"-0.025em",
          }}>
            Set it once.<br />It improves itself.
          </h2>
        </div>

        <div className="steps-grid">
          {[
            {
              n:"01", title:"Write your variants",
              body:"Add 2–3 phrasings of any question. Different wording, tone, or input type. Two minutes.",
              note:"Your existing form keeps working. Variants are layered on top.",
            },
            {
              n:"02", title:"Traffic splits automatically",
              body:"Every visitor gets a variant for their entire session. Deterministic. No flicker.",
              note:"Weighted random assignment server-side. Same variant every time they return.",
            },
            {
              n:"03", title:"Engine finds the winner",
              body:"Every 15 minutes the optimizer scores variants and shifts traffic toward what converts.",
              note:"Minimum 100 impressions before rebalancing. No premature conclusions.",
            },
          ].map(({ n, title, body, note }) => (
            <div key={n} className="step-card">
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:ACCENT, marginBottom:20, opacity:0.45 }}>{n}</div>
              <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:19, fontWeight:700, marginBottom:12, letterSpacing:"-0.01em", lineHeight:1.25 }}>{title}</div>
              <div style={{ fontSize:12, color:MUTED, lineHeight:1.9, marginBottom:16 }}>{body}</div>
              <div style={{ fontSize:11, color:DIM, lineHeight:1.8, paddingTop:14, borderTop:`1px solid ${BORDER}` }}>{note}</div>
            </div>
          ))}
        </div>

        {/* Variant example */}
        <div style={{ background:SURFACE, borderRadius:8, border:`1px solid ${BORDER}`, padding:"32px" }}>
          <div style={{ fontSize:10, color:DIM, letterSpacing:"0.12em", marginBottom:24 }}>
            EXAMPLE — three phrasings of "annual revenue" · system found variant A converts 2.4× better
          </div>
          <div className="variants-grid">
            {[
              { lbl:"A", q:"What is your company's annual revenue?", w:62, win:true, color:ACCENT },
              { lbl:"B", q:"Roughly how much does your business make yearly?", w:24, win:false, color:"#7A9E6A" },
              { lbl:"C", q:"Select your revenue range ↓", w:14, win:false, color:"#5B8BA8" },
            ].map(({ lbl, q, w, win, color }) => (
              <div key={lbl} style={{
                border:`1px solid ${win?ACCENT_B:BORDER}`,
                borderRadius:6, padding:20,
                background:win?ACCENT_D:BG,
                position:"relative",
              }}>
                {win && (
                  <div style={{
                    position:"absolute", top:-1, right:16,
                    background:ACCENT, color:"#fff",
                    fontSize:9, fontWeight:700, letterSpacing:"0.12em",
                    padding:"3px 8px", borderRadius:"0 0 4px 4px",
                    fontFamily:"'DM Mono',monospace",
                  }}>WINNER</div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <span style={{ fontSize:10, color, fontFamily:"'DM Mono',monospace" }}>Variant {lbl}</span>
                  <span style={{ fontSize:10, color:DIM, fontFamily:"'DM Mono',monospace" }}>{w}% traffic</span>
                </div>
                <p style={{
                  fontFamily:"'Bricolage Grotesque',sans-serif",
                  fontSize:15, fontWeight:win?600:400,
                  color:win?TEXT:MUTED,
                  lineHeight:1.5, margin:0,
                }}>{q}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why it works ── */}
      <section id="proof" style={{ borderTop:`1px solid ${BORDER}`, background:SURFACE }}>
        <div className="sec-pad" style={{ maxWidth:1280, margin:"0 auto" }}>
          <div className="proof-grid">
            <div>
              <div style={{ fontSize:10, letterSpacing:"0.18em", color:ACCENT, marginBottom:18, opacity:0.75 }}>WHY IT WORKS</div>
              <h2 style={{
                fontFamily:"'Bricolage Grotesque',sans-serif",
                fontSize:"clamp(28px,3vw,42px)",
                fontWeight:800, lineHeight:1.12,
                letterSpacing:"-0.02em", marginBottom:24,
              }}>
                Tracks more than just completion rate.
              </h2>
              <p style={{ fontSize:13, color:MUTED, lineHeight:2, marginBottom:32 }}>
                Most analytics tell you what happened.
                FormCraft tracks the full behavioral signal —
                hesitation, backtracking, skips, errors —
                then decides which variant caused it.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  "Session-level consistency — same variant for the whole journey",
                  "Exploration floor — worst variant always gets ≥5% traffic",
                  "Statistical guard — no rebalancing until 100+ impressions",
                  "Epsilon-greedy scoring — deterministic and fully auditable",
                ].map(t => (
                  <div key={t} style={{ display:"flex", gap:12, fontSize:12, color:MUTED, lineHeight:1.7 }}>
                    <span style={{ color:ACCENT, flexShrink:0, marginTop:2 }}>✓</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:BG, border:`1px solid ${BORDER}`, borderRadius:8, padding:"32px" }}>
              <div style={{ fontSize:10, color:DIM, letterSpacing:"0.12em", marginBottom:20 }}>TRACKED EVENTS</div>
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {[
                  { e:"answered",         w:"+1.0",  d:"User confirmed and advanced" },
                  { e:"shown",            w:"—",     d:"Question entered viewport" },
                  { e:"skipped",          w:"−0.5",  d:"Optional question bypassed" },
                  { e:"backtracked",      w:"−0.3",  d:"User pressed Back" },
                  { e:"validation_error", w:"−0.4",  d:"Input rejected — friction signal" },
                  { e:"abandoned",        w:"−1.0",  d:"Session ended without finishing" },
                ].map(({ e, w, d }, i) => (
                  <div key={e} style={{
                    display:"grid", gridTemplateColumns:"140px 52px 1fr",
                    gap:16, padding:"14px 0", fontSize:11,
                    borderBottom: i < 5 ? `1px solid ${BORDER}` : "none",
                    alignItems:"center",
                  }}>
                    <span style={{ color:ACCENT, opacity:0.7, fontFamily:"'DM Mono',monospace" }}>.{e}</span>
                    <span style={{
                      color: w.startsWith("+") ? "#7A9E6A" : w === "—" ? DIM : ACCENT,
                      fontFamily:"'DM Mono',monospace", opacity:0.9,
                    }}>{w}</span>
                    <span style={{ color:DIM }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="how-pad" style={{ maxWidth:1280, margin:"0 auto" }}>
        <div style={{ marginBottom:64 }}>
          <div style={{ fontSize:10, letterSpacing:"0.18em", color:ACCENT, marginBottom:16, opacity:0.75 }}>PRICING</div>
          <h2 style={{
            fontFamily:"'Bricolage Grotesque',sans-serif",
            fontSize:"clamp(32px,3.5vw,52px)",
            fontWeight:800, lineHeight:1.08,
            letterSpacing:"-0.025em", marginBottom:16,
          }}>
            Free while it's early.
          </h2>
          <p style={{ fontSize:13, color:MUTED, lineHeight:2, maxWidth:480 }}>
            We're in early access. Run real experiments at no cost.
            Pricing kicks in when we're confident you're getting value.
          </p>
        </div>

        <div className="pricing-grid">
          {[
            {
              tier:"Free",
              price:"$0",
              period:"forever, during early access",
              highlight:false,
              badge:null,
              cta:"Start free",
              href:"/login",
              features:[
                "3 active forms",
                "2 variants per question",
                "1,000 sessions / month",
                "Basic analytics",
                "Community support",
              ],
            },
            {
              tier:"Pro",
              price:"$29",
              period:"/ month",
              highlight:true,
              badge:"COMING SOON",
              cta:"Join waitlist",
              href:"/login",
              features:[
                "Unlimited forms",
                "Unlimited variants",
                "25,000 sessions / month",
                "Full event analytics",
                "API access",
                "Email support",
              ],
            },
            {
              tier:"Growth",
              price:"$79",
              period:"/ month",
              highlight:false,
              badge:"COMING SOON",
              cta:"Join waitlist",
              href:"/login",
              features:[
                "Everything in Pro",
                "100,000 sessions / month",
                "Priority support",
                "Custom branding",
                "Advanced analytics",
              ],
            },
            {
              tier:"Scale",
              price:"Custom",
              period:"volume + SLA",
              highlight:false,
              badge:null,
              cta:"Talk to us",
              href:"/login",
              features:[
                "Everything in Growth",
                "Custom session limits",
                "SSO & team roles",
                "Dedicated onboarding",
                "SLA guarantee",
              ],
            },
          ].map(({ tier, price, period, highlight, badge, cta, href, features }) => (
            <div key={tier} style={{
              border:`1px solid ${highlight?ACCENT_B:BORDER}`,
              borderRadius:8, padding:"32px",
              background: highlight ? ACCENT_D : SURFACE,
              position:"relative",
            }}>
              {badge && (
                <div style={{
                  position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)",
                  background: highlight ? ACCENT : DIM, color:"#fff",
                  fontSize:9, fontWeight:700, letterSpacing:"0.12em",
                  padding:"3px 14px", borderRadius:"0 0 5px 5px",
                  fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap",
                }}>{badge}</div>
              )}
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:highlight?ACCENT:DIM, letterSpacing:"0.1em", marginBottom:16 }}>{tier.toUpperCase()}</div>
              <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:40, fontWeight:800, letterSpacing:"-0.03em", lineHeight:1, marginBottom:6 }}>{price}</div>
              <div style={{ fontSize:11, color:DIM, marginBottom:28, lineHeight:1.5 }}>{period}</div>
              <Link href={href} className="btn" style={{
                display:"block", textAlign:"center",
                background: highlight ? ACCENT : "transparent",
                border: highlight ? "none" : `1px solid ${BORDER}`,
                color: highlight ? "#fff" : MUTED,
                padding:"11px 0", fontSize:11, marginBottom:28,
                boxShadow: highlight ? "0 4px 16px rgba(232,93,58,0.18)" : "none",
              }}>{cta}</Link>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {features.map(f => (
                  <div key={f} style={{ display:"flex", gap:10, fontSize:12, color:MUTED }}>
                    <span style={{ color:highlight?ACCENT:DIM, flexShrink:0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA (dark strip) ── */}
      <section style={{ background:DARK_BG, color:DARK_TEXT }}>
        <div className="cta-pad" style={{ maxWidth:1280, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:10, letterSpacing:"0.18em", color:"rgba(232,93,58,0.7)", marginBottom:24 }}>
            EVERY DAY WITHOUT OPTIMIZATION IS WASTED CONVERSIONS
          </div>
          <h2 style={{
            fontFamily:"'Bricolage Grotesque',sans-serif",
            fontSize:"clamp(40px,5.5vw,72px)",
            fontWeight:800, lineHeight:1.04,
            letterSpacing:"-0.03em", marginBottom:24, color:DARK_TEXT,
          }}>
            Your competitors are optimizing.<br />
            <span style={{ color:ACCENT }}>Is your form?</span>
          </h2>
          <p style={{ fontSize:13, color:DARK_MUT, maxWidth:380, margin:"0 auto 44px", lineHeight:2, fontWeight:300 }}>
            Stop publishing static forms.
            FormCraft finds what converts and routes traffic there —
            automatically, every 15 minutes.
          </p>
          <Link href="/login" className="btn" style={{ fontSize:13, padding:"16px 48px" }}>
            Run your first experiment free
          </Link>
          <div style={{ fontSize:11, color:DARK_DIM, marginTop:16, letterSpacing:"0.04em" }}>
            No credit card required · Works on any form you already have
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop:`1px solid rgba(240,237,232,0.08)`, background:DARK_BG, padding:"24px 24px" }}>
        <div className="footer-inner" style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:6, height:6, background:ACCENT, borderRadius:2 }} />
            <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontWeight:800, fontSize:13, color:DARK_TEXT, letterSpacing:"-0.01em" }}>FormCraft</span>
          </div>
          <div style={{ fontSize:11, color:DARK_DIM }}>Forms that fix themselves. © 2026</div>
          <div style={{ display:"flex", gap:24 }}>
            <a href="/api/v1/docs" style={{ color:DARK_DIM, fontSize:11, letterSpacing:"0.04em", transition:"color 0.18s", textDecoration:"none" }}
               onMouseOver={e=>(e.currentTarget.style.color=ACCENT)}
               onMouseOut={e=>(e.currentTarget.style.color=DARK_DIM)}>API docs</a>
            <Link href="/login" style={{ color:DARK_DIM, fontSize:11, letterSpacing:"0.04em", transition:"color 0.18s" }}
                  onMouseOver={e=>(e.currentTarget.style.color=ACCENT)}
                  onMouseOut={e=>(e.currentTarget.style.color=DARK_DIM)}>Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
