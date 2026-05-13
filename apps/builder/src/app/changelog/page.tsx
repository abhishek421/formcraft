import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export const metadata: Metadata = {
  title: "Changelog — CleverForms",
  description:
    "What's new in CleverForms. Product updates, new features, and improvements shipped by the team.",
  alternates: { canonical: "https://forms.stayclever.in/changelog" },
  openGraph: {
    url: "https://forms.stayclever.in/changelog",
    title: "Changelog — CleverForms",
    description: "Product updates and new features.",
  },
};

const ACCENT  = "#E85D3A";
const BG      = "#F4EFE6";
const SURFACE = "#EBE5DA";
const TEXT    = "#1C1917";
const MUTED   = "rgba(28,25,23,0.55)";
const DIM     = "rgba(28,25,23,0.32)";
const BORDER  = "rgba(28,25,23,0.10)";

type ChangeType = "feature" | "improvement" | "fix";

const ENTRIES: {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: { type: ChangeType; text: string }[];
}[] = [
  {
    version: "0.9.0",
    date: "May 2025",
    title: "A/B Experiments & Variant Builder",
    summary: "Run experiments across form variants with adaptive traffic weighting. No code changes required.",
    changes: [
      { type: "feature", text: "Experiment groups with multi-armed bandit traffic allocation" },
      { type: "feature", text: "Variant editor for cloning and editing form variants side-by-side" },
      { type: "feature", text: "Per-variant analytics: conversion rate, drop-off, response volume" },
      { type: "feature", text: "Reset weights to equal distribution with one click" },
      { type: "improvement", text: "Builder navigation redesigned with canvas-based variant tabs" },
    ],
  },
  {
    version: "0.8.0",
    date: "April 2025",
    title: "Integrations & API Keys",
    summary: "Webhook integrations, API key management, and the public REST API.",
    changes: [
      { type: "feature", text: "Webhook integration: send form responses to any URL" },
      { type: "feature", text: "API key management: create, rotate, and revoke keys from settings" },
      { type: "feature", text: "Public REST API v1: forms, fields, responses, sessions" },
      { type: "feature", text: "Swagger/OpenAPI docs at /docs" },
      { type: "improvement", text: "Integrations page listing available and upcoming integrations" },
    ],
  },
  {
    version: "0.7.0",
    date: "March 2025",
    title: "Responses Dashboard",
    summary: "View, filter, and export form responses. Individual response detail view.",
    changes: [
      { type: "feature", text: "Responses dashboard with per-form response list" },
      { type: "feature", text: "Response detail view with field-by-field answers" },
      { type: "feature", text: "CSV export for all responses" },
      { type: "improvement", text: "Loading skeletons throughout the app" },
      { type: "fix", text: "Response timestamps now display in the user's local timezone" },
    ],
  },
  {
    version: "0.6.0",
    date: "February 2025",
    title: "Form Builder v1",
    summary: "Drag-and-drop form builder with field types, validation, and live preview.",
    changes: [
      { type: "feature", text: "Drag-and-drop field ordering in the builder" },
      { type: "feature", text: "Field types: short text, long text, email, number, select, multi-select, file upload" },
      { type: "feature", text: "Field-level validation: required, min/max length, pattern" },
      { type: "feature", text: "Live form preview in the builder" },
      { type: "improvement", text: "Form settings panel: name, description, submit button label" },
    ],
  },
];

const TYPE_LABELS: Record<ChangeType, { label: string; color: string }> = {
  feature:     { label: "NEW",     color: "#4A8C3F" },
  improvement: { label: "IMPROVED", color: "#5B8BA8" },
  fix:         { label: "FIX",     color: ACCENT },
};

export default function ChangelogPage() {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
      `}</style>
      <PublicNav />

      {/* Header */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 52px 64px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", color: ACCENT, marginBottom: 16, opacity: 0.75 }}>CHANGELOG</div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "clamp(36px, 4vw, 52px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.025em", marginBottom: 16,
        }}>
          What&rsquo;s new.
        </h1>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8 }}>
          Every update, shipped in order. No hype — just what changed and why.
        </p>
      </div>

      {/* Entries */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 52px 120px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {ENTRIES.map((entry, i) => (
            <div
              key={entry.version}
              style={{
                background: SURFACE, border: `1px solid ${BORDER}`,
                borderRadius: 10, padding: "36px 40px",
                position: "relative",
              }}
            >
              {i === 0 && (
                <div style={{
                  position: "absolute", top: -12, left: 40,
                  background: ACCENT, color: "#fff", fontSize: 9, fontWeight: 500,
                  letterSpacing: "0.14em", padding: "4px 12px", borderRadius: 20,
                  textTransform: "uppercase",
                }}>
                  Latest
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em" }}>
                    v{entry.version}
                  </span>
                  <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700, color: TEXT }}>
                    {entry.title}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: DIM, letterSpacing: "0.06em" }}>{entry.date}</span>
              </div>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.8, marginBottom: 24 }}>{entry.summary}</p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {entry.changes.map((c, ci) => (
                  <li key={ci} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 12, color: MUTED }}>
                    <span style={{
                      fontSize: 8, fontWeight: 600, letterSpacing: "0.1em",
                      color: TYPE_LABELS[c.type].color,
                      border: `1px solid ${TYPE_LABELS[c.type].color}`,
                      padding: "2px 6px", borderRadius: 3,
                      flexShrink: 0, marginTop: 1,
                    }}>
                      {TYPE_LABELS[c.type].label}
                    </span>
                    {c.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
