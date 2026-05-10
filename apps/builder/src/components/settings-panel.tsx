"use client";

import { useState, useRef, useEffect } from "react";
import {
  useTheme, THEMES, DISPLAY_FONTS, BODY_FONTS,
  type Radius, type Density,
} from "./theme-provider";

const RADIUS_OPTIONS: { id: Radius; label: string; r: string }[] = [
  { id: "sharp",   label: "Sharp",   r: "0"  },
  { id: "subtle",  label: "Subtle",  r: "4"  },
  { id: "rounded", label: "Rounded", r: "8"  },
  { id: "soft",    label: "Soft",    r: "12" },
];

const DENSITY_OPTIONS: { id: Density; label: string }[] = [
  { id: "compact",  label: "Compact"  },
  { id: "default",  label: "Default"  },
  { id: "spacious", label: "Spacious" },
];

const TABS = ["Theme", "Type", "Layout"] as const;
type Tab = typeof TABS[number];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase",
      color: "var(--text-muted)", marginBottom: "8px", fontFamily: "var(--font-body)",
    }}>
      {children}
    </div>
  );
}

function Btn({ active, onClick, children, style }: {
  active: boolean; onClick: () => void; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <button onClick={onClick} style={{
      background: active ? "var(--accent-dim)" : "transparent",
      border: active ? "1px solid var(--accent-border)" : "1px solid transparent",
      borderRadius: "var(--radius-sm)",
      padding: "6px 10px", cursor: "pointer",
      color: active ? "var(--text)" : "var(--text-muted)",
      fontFamily: "var(--font-body)", fontSize: "12px",
      transition: "all var(--duration) var(--ease)",
      ...style,
    }}>
      {children}
    </button>
  );
}

function PanelContent({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { theme, mode, radius, density, displayFont, bodyFont, motion,
    setTheme, toggleMode, setRadius, setDensity, setDisplayFont, setBodyFont, toggleMotion } = useTheme();

  return (
    <>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 8px" }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "9px 0", cursor: "pointer",
            background: "transparent", border: "none",
            borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
            color: tab === t ? "var(--text)" : "var(--text-muted)",
            fontFamily: "var(--font-body)", fontSize: "11px",
            transition: "color var(--duration) var(--ease)",
            marginBottom: "-1px",
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {tab === "Theme" && <>
          <div>
            <Label>Color</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {THEMES.map((t) => (
                <Btn key={t.id} active={theme === t.id} onClick={() => setTheme(t.id)}
                  style={{ display: "flex", alignItems: "center", gap: "10px", textAlign: "left" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: t.accent, flexShrink: 0 }} />
                  {t.label}
                </Btn>
              ))}
            </div>
          </div>

          <div>
            <Label>Mode</Label>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["dark", "light"] as const).map((m) => (
                <Btn key={m} active={mode === m} onClick={() => { if (mode !== m) toggleMode(); }}
                  style={{ flex: 1, textAlign: "center", padding: "7px 0" }}>
                  {m === "dark" ? "☾ Dark" : "☀ Light"}
                </Btn>
              ))}
            </div>
          </div>
        </>}

        {tab === "Type" && <>
          <div>
            <Label>Display font</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {DISPLAY_FONTS.map((f) => (
                <Btn key={f.id} active={displayFont === f.id} onClick={() => setDisplayFont(f.id)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}>
                  <span>{f.label}</span>
                  <span style={{ fontFamily: f.id, fontSize: "15px", fontWeight: 700 }}>Aa</span>
                </Btn>
              ))}
            </div>
          </div>

          <div>
            <Label>Body font</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {BODY_FONTS.map((f) => (
                <Btn key={f.id} active={bodyFont === f.id} onClick={() => setBodyFont(f.id)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}>
                  <span>{f.label}</span>
                  <span style={{ fontFamily: f.id, fontSize: "13px" }}>Aa</span>
                </Btn>
              ))}
            </div>
          </div>
        </>}

        {tab === "Layout" && <>
          <div>
            <Label>Roundness</Label>
            <div style={{ display: "flex", gap: "6px" }}>
              {RADIUS_OPTIONS.map((ro) => (
                <button key={ro.id} onClick={() => setRadius(ro.id)} title={ro.label} style={{
                  flex: 1, aspectRatio: "1", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: radius === ro.id ? "var(--accent-dim)" : "var(--surface-2)",
                  border: radius === ro.id ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                  borderRadius: `${ro.r}px`,
                  transition: "all var(--duration) var(--ease)",
                }}>
                  <span style={{
                    width: "12px", height: "12px",
                    background: radius === ro.id ? "var(--accent)" : "var(--border-strong)",
                    borderRadius: `${ro.r}px`,
                    transition: "all var(--duration) var(--ease)",
                  }} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Density</Label>
            <div style={{ display: "flex", gap: "6px" }}>
              {DENSITY_OPTIONS.map((d) => (
                <Btn key={d.id} active={density === d.id} onClick={() => setDensity(d.id)}
                  style={{ flex: 1, textAlign: "center", padding: "7px 0" }}>
                  {d.label}
                </Btn>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Label>Animations</Label>
            <button onClick={toggleMotion} style={{
              width: "36px", height: "20px", borderRadius: "999px",
              cursor: "pointer", border: "none", flexShrink: 0,
              background: motion ? "var(--accent)" : "var(--border-strong)",
              position: "relative", transition: "background 0.2s ease",
            }}>
              <span style={{
                position: "absolute", top: "3px",
                left: motion ? "19px" : "3px",
                width: "14px", height: "14px", borderRadius: "50%",
                background: motion ? "var(--accent-text)" : "var(--text-muted)",
                transition: "left 0.2s ease",
              }} />
            </button>
          </div>
        </>}
      </div>
    </>
  );
}

export function SettingsPanel({ inSidebar = false, collapsed = false }: { inSidebar?: boolean; collapsed?: boolean }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("Theme");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    function onOut(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOut);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onOut); };
  }, []);

  const panelBox = (
    <div style={{
      width: "256px",
      background: "var(--surface)",
      border: "1px solid var(--border-mid)",
      borderRadius: "var(--radius-md)",
      boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
      overflow: "hidden",
      fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text)" }}>Design</span>
        <span style={{ fontSize: "9px", letterSpacing: "1px", color: "var(--text-muted)", textTransform: "uppercase" }}>internal</span>
      </div>
      <PanelContent tab={tab} setTab={setTab} />
    </div>
  );

  if (inSidebar) {
    return (
      <div ref={panelRef} style={{ position: "relative" }}>
        {open && (
          <div style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: collapsed ? "calc(100% + 8px)" : 0,
            zIndex: 9999,
          }}>
            {panelBox}
          </div>
        )}

        {collapsed ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button onClick={() => setOpen((o) => !o)} title="Design settings" style={{
              background: open ? "var(--accent-dim)" : "transparent", border: "none",
              color: open ? "var(--accent)" : "var(--text-dim)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "36px", height: "36px", borderRadius: "var(--radius-sm)",
              transition: `all var(--duration) var(--ease)`,
            }}>
              ✦
            </button>
          </div>
        ) : (
          <button onClick={() => setOpen((o) => !o)} style={{
            width: "100%", background: open ? "var(--accent-dim)" : "transparent", border: "none",
            color: open ? "var(--text)" : "var(--text-muted)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "var(--space-2)",
            padding: "9px var(--space-3)", borderRadius: "var(--radius-sm)",
            fontSize: "13px", fontFamily: "var(--font-body)", fontWeight: 300,
            transition: `all var(--duration) var(--ease)`,
          }}>
            <span style={{ color: open ? "var(--accent)" : "var(--text-dim)", flexShrink: 0, fontSize: "14px" }}>✦</span>
            Design
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={panelRef} style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}>
      {open && (
        <div style={{ position: "absolute", bottom: "52px", right: 0 }}>
          {panelBox}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Design settings"
        style={{
          width: "38px", height: "38px",
          background: open ? "var(--accent)" : "var(--surface)",
          border: "1px solid var(--border-mid)",
          borderRadius: "var(--radius-md)",
          color: open ? "var(--accent-text)" : "var(--text-muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontSize: "15px",
          transition: "all var(--duration) var(--ease)",
          boxShadow: open ? "0 4px 16px rgba(0,0,0,0.2)" : "none",
        }}
      >
        ✦
      </button>
    </div>
  );
}
