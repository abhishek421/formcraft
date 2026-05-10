"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeName = "lavender" | "linen" | "sage" | "peach" | "hacker";
export type ThemeMode = "dark" | "light";
export type Radius    = "sharp" | "subtle" | "rounded" | "soft";
export type Density   = "compact" | "default" | "spacious";

export const THEMES: { id: ThemeName; label: string; accent: string }[] = [
  { id: "lavender", label: "Lavender Studio", accent: "#7C5CFC" },
  { id: "linen",    label: "Warm Linen",      accent: "#E85D3A" },
  { id: "sage",     label: "Sage & Sand",     accent: "#4A7C59" },
  { id: "peach",    label: "Peach Soft",      accent: "#F06A35" },
  { id: "hacker",   label: "Hacker",          accent: "#CAFF00" },
];

export const DISPLAY_FONTS: { id: string; label: string; google?: string }[] = [
  { id: "'Syne', sans-serif",               label: "Syne",            google: "Syne:wght@400;500;600;700;800" },
  { id: "'DM Sans', sans-serif",            label: "DM Sans",         google: "DM+Sans:wght@300;400;500;600;700" },
  { id: "'Playfair Display', serif",        label: "Playfair",        google: "Playfair+Display:wght@400;500;600;700" },
  { id: "'Cabinet Grotesk', sans-serif",    label: "Cabinet",         google: "Cabinet+Grotesk:wght@400;500;700;800" },
  { id: "'Space Grotesk', sans-serif",      label: "Space Grotesk",   google: "Space+Grotesk:wght@300;400;500;600;700" },
];

export const BODY_FONTS: { id: string; label: string; google?: string }[] = [
  { id: "'DM Mono', monospace",             label: "DM Mono",         google: "DM+Mono:wght@300;400;500" },
  { id: "'Inter', sans-serif",              label: "Inter",           google: "Inter:wght@300;400;500;600" },
  { id: "'Geist Mono', monospace",          label: "Geist Mono",      google: "Geist+Mono:wght@300;400;500" },
  { id: "'IBM Plex Mono', monospace",       label: "IBM Plex Mono",   google: "IBM+Plex+Mono:wght@300;400;500" },
  { id: "'Instrument Sans', sans-serif",    label: "Instrument Sans", google: "Instrument+Sans:wght@400;500;600" },
];

export type DesignSettings = {
  theme: ThemeName;
  mode: ThemeMode;
  radius: Radius;
  density: Density;
  displayFont: string;
  bodyFont: string;
  motion: boolean;
};

type ThemeCtx = DesignSettings & {
  setTheme: (t: ThemeName) => void;
  toggleMode: () => void;
  setRadius: (r: Radius) => void;
  setDensity: (d: Density) => void;
  setDisplayFont: (f: string) => void;
  setBodyFont: (f: string) => void;
  toggleMotion: () => void;
};

const defaults: DesignSettings = {
  theme:       "linen",
  mode:        "dark",
  radius:      "sharp",
  density:     "default",
  displayFont: "'Syne', sans-serif",
  bodyFont:    "'DM Mono', monospace",
  motion:      true,
};

const Ctx = createContext<ThemeCtx>({
  ...defaults,
  setTheme: () => {},
  toggleMode: () => {},
  setRadius: () => {},
  setDensity: () => {},
  setDisplayFont: () => {},
  setBodyFont: () => {},
  toggleMotion: () => {},
});

function loadFont(googleSpec: string | undefined) {
  if (!googleSpec) return;
  const id = `gf-${googleSpec}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${googleSpec}&display=swap`;
  document.head.appendChild(link);
}

function apply(s: DesignSettings) {
  const el = document.documentElement;
  el.setAttribute("data-theme",   `${s.theme}-${s.mode}`);
  el.setAttribute("data-radius",  s.radius === "sharp" ? "" : s.radius);
  el.setAttribute("data-density", s.density === "default" ? "" : s.density);
  el.setAttribute("data-motion",  s.motion ? "" : "off");
  el.style.setProperty("--font-display", s.displayFont);
  el.style.setProperty("--font-body",    s.bodyFont);
}

function load<T>(key: string, fallback: T): T {
  try { return (localStorage.getItem(`fc-${key}`) as T) ?? fallback; } catch { return fallback; }
}
function save(key: string, val: string) {
  try { localStorage.setItem(`fc-${key}`, val); } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<DesignSettings>(defaults);

  useEffect(() => {
    const resolved: DesignSettings = {
      theme:       load("theme",        defaults.theme),
      mode:        load("mode",         defaults.mode),
      radius:      load("radius",       defaults.radius),
      density:     load("density",      defaults.density),
      displayFont: load("displayFont",  defaults.displayFont),
      bodyFont:    load("bodyFont",     defaults.bodyFont),
      motion:      load("motion",       "true") === "true",
    };
    // preload stored fonts
    const df = DISPLAY_FONTS.find(f => f.id === resolved.displayFont);
    const bf = BODY_FONTS.find(f => f.id === resolved.bodyFont);
    loadFont(df?.google);
    loadFont(bf?.google);
    setS(resolved);
    apply(resolved);
  }, []);

  function update(patch: Partial<DesignSettings>) {
    setS(prev => {
      const next = { ...prev, ...patch };
      apply(next);
      return next;
    });
  }

  return (
    <Ctx.Provider value={{
      ...s,
      setTheme: (theme) => { save("theme", theme); update({ theme }); },
      toggleMode: () => {
        const mode: ThemeMode = s.mode === "dark" ? "light" : "dark";
        save("mode", mode);
        update({ mode });
      },
      setRadius: (radius) => { save("radius", radius); update({ radius }); },
      setDensity: (density) => { save("density", density); update({ density }); },
      setDisplayFont: (displayFont) => {
        const f = DISPLAY_FONTS.find(f => f.id === displayFont);
        loadFont(f?.google);
        save("displayFont", displayFont);
        update({ displayFont });
      },
      setBodyFont: (bodyFont) => {
        const f = BODY_FONTS.find(f => f.id === bodyFont);
        loadFont(f?.google);
        save("bodyFont", bodyFont);
        update({ bodyFont });
      },
      toggleMotion: () => {
        const motion = !s.motion;
        save("motion", String(motion));
        update({ motion });
      },
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  return useContext(Ctx);
}
