"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ACCENT, ACCENT_B, ACCENT_D, BORDER, DIM, DISPLAY, MONO, MUTED, SERIF_IT, SURFACE,
} from "./theme";

gsap.registerPlugin(ScrollTrigger);

const TIERS = [
  {
    tier: "Free", price: "$0", period: "forever, during early access",
    highlight: false, badge: null, cta: "Start free", href: "/login",
    features: ["3 active forms", "2 variants per question", "1,000 sessions / month", "Basic analytics", "Community support"],
  },
  {
    tier: "Pro", price: "$29", period: "/ month",
    highlight: true, badge: "COMING SOON", cta: "Join waitlist", href: "/login",
    features: ["Unlimited forms", "Unlimited variants", "25,000 sessions / month", "Full event analytics", "API access", "Email support"],
  },
  {
    tier: "Growth", price: "$79", period: "/ month",
    highlight: false, badge: "COMING SOON", cta: "Join waitlist", href: "/login",
    features: ["Everything in Pro", "100,000 sessions / month", "Priority support", "Custom branding", "Advanced analytics"],
  },
  {
    tier: "Scale", price: "Custom", period: "volume + SLA",
    highlight: false, badge: null, cta: "Talk to us", href: "/login",
    features: ["Everything in Growth", "Custom session limits", "SSO & team roles", "Dedicated onboarding", "SLA guarantee"],
  },
];

export function Pricing() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".lp-price-head > *", {
          opacity: 0, y: 24, duration: 0.85, ease: "power3.out", stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
        });
        gsap.from(".lp-price-card", {
          opacity: 0, y: 44, duration: 0.9, ease: "power3.out", stagger: 0.1,
          scrollTrigger: { trigger: ".lp-pricing-grid", start: "top 80%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="pricing" ref={root}>
      <div className="lp-sec-pad" style={{ maxWidth: 1280, margin: "0 auto", paddingTop: 130, paddingBottom: 130 }}>
        <div className="lp-price-head" style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: ACCENT, marginBottom: 20, opacity: 0.8 }}>PRICING</div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(36px,4.2vw,64px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
            Free while it&apos;s{" "}
            <span style={{ fontFamily: SERIF_IT, fontStyle: "italic", fontWeight: 400, color: ACCENT }}>early.</span>
          </h2>
          <p style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 300, color: MUTED, lineHeight: 2, maxWidth: 480, marginTop: 20 }}>
            CleverForms is in early access. Run real self-optimizing experiments
            at no cost. Paid plans arrive when we&apos;re confident you&apos;re getting
            measurable value — not a minute sooner.
          </p>
        </div>

        <div className="lp-pricing-grid">
          {TIERS.map(({ tier, price, period, highlight, badge, cta, href, features }) => (
            <div
              key={tier}
              className="lp-price-card"
              style={{
                border: `1px solid ${highlight ? ACCENT_B : BORDER}`,
                borderRadius: 10,
                padding: 32,
                background: highlight ? ACCENT_D : SURFACE,
                position: "relative",
              }}
            >
              {badge && (
                <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: highlight ? ACCENT : DIM, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", padding: "3px 14px", borderRadius: "0 0 5px 5px", fontFamily: MONO, whiteSpace: "nowrap" }}>
                  {badge}
                </div>
              )}
              <div style={{ fontFamily: MONO, fontSize: 10, color: highlight ? ACCENT : DIM, letterSpacing: "0.1em", marginBottom: 16 }}>{tier.toUpperCase()}</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 6 }}>{price}</div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: DIM, marginBottom: 28, lineHeight: 1.5 }}>{period}</div>
              <Link
                href={href}
                className="lp-btn"
                style={{
                  display: "block", textAlign: "center",
                  background: highlight ? ACCENT : "transparent",
                  border: highlight ? "none" : `1px solid ${BORDER}`,
                  color: highlight ? "#fff" : MUTED,
                  padding: "12px 0", fontSize: 11, marginBottom: 28,
                  boxShadow: highlight ? "0 4px 16px rgba(232,93,58,0.18)" : "none",
                }}
              >
                {cta}
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {features.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, fontFamily: MONO, fontSize: 12, color: MUTED }}>
                    <span style={{ color: highlight ? ACCENT : DIM, flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
