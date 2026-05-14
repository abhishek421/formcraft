"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WelcomeBlock =
  | { id: string; type: "heading";    content: string }
  | { id: string; type: "subheading"; content: string }
  | { id: string; type: "paragraph";  content: string }
  | { id: string; type: "quote";      content: string; attribution?: string }
  | { id: string; type: "image";      url: string; caption?: string }
  | { id: string; type: "embed";      url: string; caption?: string }
  | { id: string; type: "divider" }
  | { id: string; type: "spacer" };

type BlockType = WelcomeBlock["type"];

type Field = {
  id: string;
  title: string;
  description?: string;
  config: Record<string, unknown>;
};

type Theme = {
  bg: string; primary: string; dFont: string; bFont: string;
  bRadius: string; textColor: string; textMuted: string;
};

// ─── Block meta ───────────────────────────────────────────────────────────────

const BLOCK_TYPES: { type: BlockType; label: string; icon: string; desc: string }[] = [
  { type: "heading",    icon: "H1", label: "Heading",    desc: "Large title text" },
  { type: "subheading", icon: "H2", label: "Subheading", desc: "Section subtitle" },
  { type: "paragraph",  icon: "¶",  label: "Paragraph",  desc: "Body text" },
  { type: "quote",      icon: "❝",  label: "Quote",      desc: "Styled blockquote" },
  { type: "image",      icon: "⬜", label: "Image",      desc: "Image via URL" },
  { type: "embed",      icon: "◫",  label: "Embed",      desc: "YouTube, Loom, etc." },
  { type: "divider",    icon: "—",  label: "Divider",    desc: "Horizontal line" },
  { type: "spacer",     icon: "↕",  label: "Spacer",     desc: "Vertical gap" },
];

function makeBlock(type: BlockType): WelcomeBlock {
  const id = crypto.randomUUID();
  if (type === "heading")    return { id, type, content: "" };
  if (type === "subheading") return { id, type, content: "" };
  if (type === "paragraph")  return { id, type, content: "" };
  if (type === "quote")      return { id, type, content: "", attribution: "" };
  if (type === "image")      return { id, type, url: "", caption: "" };
  if (type === "embed")      return { id, type, url: "", caption: "" };
  if (type === "divider")    return { id, type };
  return { id, type: "spacer" };
}

function initBlocks(field: Field): WelcomeBlock[] {
  const existing = field.config.blocks as WelcomeBlock[] | undefined;
  if (existing?.length) return existing;
  // Migrate from legacy title/description
  const blocks: WelcomeBlock[] = [];
  blocks.push({ id: crypto.randomUUID(), type: "heading",   content: field.title ?? "" });
  if (field.description) blocks.push({ id: crypto.randomUUID(), type: "paragraph", content: field.description });
  return blocks;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WelcomeScreenEditor({
  field,
  onChange,
  theme: t,
}: {
  field: Field;
  onChange: (updates: Partial<Field & { config: Record<string, unknown> }>) => void;
  theme: Theme;
}) {
  const [blocks, setBlocks] = useState<WelcomeBlock[]>(() => initBlocks(field));
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [insertAfter, setInsertAfter] = useState<string | null>(null);
  const [pickerDir, setPickerDir] = useState<"up" | "down">("down");
  const pickerRef = useRef<HTMLDivElement>(null);

  const saveBlocks = useCallback((next: WelcomeBlock[]) => {
    setBlocks(next);
    // Sync title from first heading block for backward compat
    const firstHeading = next.find((b) => b.type === "heading" || b.type === "subheading");
    const title = firstHeading && "content" in firstHeading ? firstHeading.content : "";
    onChange({ config: { ...field.config, blocks: next }, title });
  }, [field.config, onChange]);

  const patchBlock = (id: string, patch: Partial<WelcomeBlock>) => {
    saveBlocks(blocks.map((b) => b.id === id ? ({ ...b, ...patch } as WelcomeBlock) : b));
  };

  const deleteBlock = (id: string) => {
    saveBlocks(blocks.filter((b) => b.id !== id));
  };

  const addBlock = (type: BlockType) => {
    const block = makeBlock(type);
    if (insertAfter === null) {
      saveBlocks([...blocks, block]);
    } else {
      const idx = blocks.findIndex((b) => b.id === insertAfter);
      const next = [...blocks];
      next.splice(idx + 1, 0, block);
      saveBlocks(next);
    }
    setShowPicker(false);
    setInsertAfter(null);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx + dir < 0 || idx + dir >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    saveBlocks(next);
  };

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openPicker = (afterId: string | null, triggerEl?: HTMLElement) => {
    setInsertAfter(afterId);
    if (triggerEl) {
      const rect = triggerEl.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setPickerDir(spaceBelow >= 300 || spaceBelow >= spaceAbove ? "down" : "up");
    }
    setShowPicker(true);
  };

  return (
    <div style={{ width: "100%", maxWidth: "640px", display: "flex", flexDirection: "column", gap: "4px", position: "relative" }}>

      {/* Blocks */}
      {blocks.map((block, idx) => (
        <BlockRow
          key={block.id}
          block={block}
          idx={idx}
          total={blocks.length}
          hovered={hoveredId === block.id}
          theme={t}
          onHover={(id) => setHoveredId(id)}
          onPatch={patchBlock}
          onDelete={deleteBlock}
          onMove={moveBlock}
          onInsertAfter={(el) => openPicker(block.id, el)}
        />
      ))}

      {/* Global add button */}
      <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", position: "relative" }} ref={pickerRef}>
        <button
          onClick={(e) => openPicker(blocks[blocks.length - 1]?.id ?? null, e.currentTarget)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "7px 16px",
            background: "transparent",
            border: `1px dashed rgba(${t.textColor === "#1A1A1A" ? "0,0,0" : "240,237,232"},0.15)`,
            borderRadius: "99px",
            color: t.textMuted, fontFamily: `'${t.bFont}', monospace`,
            fontSize: "11px", cursor: "pointer",
            transition: "all 0.12s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.primary; e.currentTarget.style.color = t.primary; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = `rgba(${t.textColor === "#1A1A1A" ? "0,0,0" : "240,237,232"},0.15)`; e.currentTarget.style.color = t.textMuted; }}
        >
          <span style={{ fontSize: "14px", lineHeight: 1 }}>+</span> Add block
        </button>

        {showPicker && (
          <BlockPicker theme={t} dir={pickerDir} onSelect={addBlock} onClose={() => setShowPicker(false)} />
        )}
      </div>

      {/* Start button preview */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginTop: "32px" }}>
        <div style={{
          background: t.primary, color: t.bg,
          padding: "14px 40px", fontFamily: `'${t.dFont}', sans-serif`,
          fontSize: "14px", fontWeight: 700, letterSpacing: "0.5px",
          borderRadius: t.bRadius, pointerEvents: "none",
          userSelect: "none",
        }}>
          Start →
        </div>
        <div style={{ fontSize: "11px", color: t.textMuted, fontFamily: `'${t.bFont}', monospace`, opacity: 0.5 }}>
          press Enter ↵
        </div>
      </div>
    </div>
  );
}

// ─── Block row wrapper ────────────────────────────────────────────────────────

function BlockRow({
  block, idx, total, hovered, theme: t,
  onHover, onPatch, onDelete, onMove, onInsertAfter,
}: {
  block: WelcomeBlock; idx: number; total: number; hovered: boolean; theme: Theme;
  onHover: (id: string | null) => void;
  onPatch: (id: string, patch: Partial<WelcomeBlock>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onInsertAfter: (triggerEl: HTMLElement) => void;
}) {
  const isLight = t.textColor === "#1A1A1A";
  const dimRgb = isLight ? "0,0,0" : "240,237,232";

  return (
    <div
      style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: "8px", group: true } as React.CSSProperties}
      onMouseEnter={() => onHover(block.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Left controls — visible on hover */}
      <div style={{
        display: "flex", flexDirection: "column", gap: "2px",
        flexShrink: 0, paddingTop: "2px",
        opacity: hovered ? 1 : 0, transition: "opacity 0.1s",
        width: "32px", alignItems: "center",
      }}>
        {idx > 0 && (
          <button onClick={() => onMove(block.id, -1)} title="Move up" style={ctrlBtn(dimRgb)}>↑</button>
        )}
        {idx < total - 1 && (
          <button onClick={() => onMove(block.id, 1)} title="Move down" style={ctrlBtn(dimRgb)}>↓</button>
        )}
        <button onClick={() => onDelete(block.id)} title="Delete block"
          style={{ ...ctrlBtn(dimRgb), color: "rgba(255,85,85,0.7)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ff5555"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,85,85,0.7)"; }}
        >×</button>
      </div>

      {/* Block content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <BlockContent block={block} theme={t} onPatch={onPatch} />
      </div>

      {/* Insert-after button — appears on hover at bottom edge */}
      {hovered && (
        <button
          onClick={(e) => onInsertAfter(e.currentTarget)}
          title="Insert block below"
          style={{
            position: "absolute", bottom: "-10px", left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            width: "20px", height: "20px", borderRadius: "50%",
            background: t.primary, border: "none",
            color: t.bg, fontSize: "13px", lineHeight: 1,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >+</button>
      )}
    </div>
  );
}

function ctrlBtn(dimRgb: string): React.CSSProperties {
  return {
    background: "transparent", border: "none",
    color: `rgba(${dimRgb},0.3)`, cursor: "pointer",
    fontSize: "11px", lineHeight: 1, padding: "2px 4px",
    borderRadius: "3px", transition: "color 0.1s",
    fontFamily: "monospace",
  };
}

// ─── Block content renderers ──────────────────────────────────────────────────

function BlockContent({
  block, theme: t, onPatch,
}: {
  block: WelcomeBlock;
  theme: Theme;
  onPatch: (id: string, patch: Partial<WelcomeBlock>) => void;
}) {
  const textAreaStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: "transparent", border: "none",
    color: t.textColor, fontFamily: `'${t.dFont}', sans-serif`,
    width: "100%", resize: "none", outline: "none",
    lineHeight: 1.3,
    ...extra,
  });

  const bodyAreaStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: "transparent", border: "none",
    color: t.textMuted, fontFamily: `'${t.bFont}', monospace`,
    width: "100%", resize: "none", outline: "none",
    lineHeight: 1.7,
    ...extra,
  });

  if (block.type === "heading") {
    return (
      <AutoTextarea
        value={block.content}
        onChange={(v) => onPatch(block.id, { content: v })}
        placeholder="Heading..."
        style={textAreaStyle({ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.5px" })}
      />
    );
  }

  if (block.type === "subheading") {
    return (
      <AutoTextarea
        value={block.content}
        onChange={(v) => onPatch(block.id, { content: v })}
        placeholder="Subheading..."
        style={textAreaStyle({ fontSize: "clamp(17px, 2.5vw, 22px)", fontWeight: 600, letterSpacing: "-0.2px" })}
      />
    );
  }

  if (block.type === "paragraph") {
    return (
      <AutoTextarea
        value={block.content}
        onChange={(v) => onPatch(block.id, { content: v })}
        placeholder="Write something..."
        style={bodyAreaStyle({ fontSize: "15px", fontWeight: 300 })}
      />
    );
  }

  if (block.type === "quote") {
    return (
      <div style={{
        borderLeft: `3px solid ${t.primary}`,
        paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "8px",
      }}>
        <AutoTextarea
          value={block.content}
          onChange={(v) => onPatch(block.id, { content: v })}
          placeholder="Quote text..."
          style={bodyAreaStyle({ fontSize: "16px", fontStyle: "italic", fontWeight: 300 })}
        />
        <input
          type="text"
          value={block.attribution ?? ""}
          onChange={(e) => onPatch(block.id, { attribution: e.target.value })}
          placeholder="— Attribution (optional)"
          style={{
            ...bodyAreaStyle({ fontSize: "11px" }),
            letterSpacing: "0.5px", opacity: 0.5,
          }}
        />
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          type="url"
          value={block.url}
          onChange={(e) => onPatch(block.id, { url: e.target.value })}
          placeholder="Image URL (https://...)"
          style={{
            background: `rgba(${t.textColor === "#1A1A1A" ? "0,0,0" : "240,237,232"},0.05)`,
            border: `1px dashed rgba(${t.textColor === "#1A1A1A" ? "0,0,0" : "240,237,232"},0.15)`,
            borderRadius: "4px", padding: "8px 10px",
            color: t.textMuted, fontFamily: `'${t.bFont}', monospace`,
            fontSize: "12px", outline: "none", width: "100%",
          }}
        />
        {block.url ? (
          <img
            src={block.url} alt={block.caption ?? ""}
            style={{ width: "100%", borderRadius: "6px", objectFit: "cover", maxHeight: "280px" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div style={{
            height: "120px", border: `1px dashed rgba(${t.textColor === "#1A1A1A" ? "0,0,0" : "240,237,232"},0.12)`,
            borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
            color: t.textMuted, fontSize: "11px", fontFamily: `'${t.bFont}', monospace`, opacity: 0.5,
          }}>
            ⬜ Image preview
          </div>
        )}
        <input
          type="text"
          value={block.caption ?? ""}
          onChange={(e) => onPatch(block.id, { caption: e.target.value })}
          placeholder="Caption (optional)"
          style={{ background: "transparent", border: "none", color: t.textMuted, fontFamily: `'${t.bFont}', monospace`, fontSize: "11px", outline: "none", opacity: 0.5, width: "100%", textAlign: "center" }}
        />
      </div>
    );
  }

  if (block.type === "embed") {
    const isYouTube = block.url.includes("youtube.com") || block.url.includes("youtu.be");
    const isLoom = block.url.includes("loom.com");
    const embedUrl = (() => {
      if (isYouTube) {
        const id = block.url.split("v=")[1]?.split("&")[0] ?? block.url.split("/").pop();
        return `https://www.youtube.com/embed/${id}`;
      }
      if (isLoom) {
        const id = block.url.split("/").pop();
        return `https://www.loom.com/embed/${id}`;
      }
      return block.url;
    })();

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          type="url"
          value={block.url}
          onChange={(e) => onPatch(block.id, { url: e.target.value })}
          placeholder="YouTube, Loom, or iframe URL..."
          style={{
            background: `rgba(${t.textColor === "#1A1A1A" ? "0,0,0" : "240,237,232"},0.05)`,
            border: `1px dashed rgba(${t.textColor === "#1A1A1A" ? "0,0,0" : "240,237,232"},0.15)`,
            borderRadius: "4px", padding: "8px 10px",
            color: t.textMuted, fontFamily: `'${t.bFont}', monospace`,
            fontSize: "12px", outline: "none", width: "100%",
          }}
        />
        {block.url ? (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "6px" }}>
            <iframe
              src={embedUrl}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              allowFullScreen
            />
          </div>
        ) : (
          <div style={{
            height: "120px", border: `1px dashed rgba(${t.textColor === "#1A1A1A" ? "0,0,0" : "240,237,232"},0.12)`,
            borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
            color: t.textMuted, fontSize: "11px", fontFamily: `'${t.bFont}', monospace`, opacity: 0.5,
          }}>
            ◫ Embed preview
          </div>
        )}
      </div>
    );
  }

  if (block.type === "divider") {
    return (
      <div style={{ padding: "10px 0", cursor: "default" }}>
        <div style={{ height: "1px", background: `rgba(${t.textColor === "#1A1A1A" ? "0,0,0" : "240,237,232"},0.15)`, width: "100%" }} />
      </div>
    );
  }

  if (block.type === "spacer") {
    return (
      <div style={{
        height: "32px", border: `1px dashed rgba(${t.textColor === "#1A1A1A" ? "0,0,0" : "240,237,232"},0.08)`,
        borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center",
        color: t.textMuted, fontSize: "9px", fontFamily: `'${t.bFont}', monospace`,
        letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.3, pointerEvents: "none",
        userSelect: "none",
      }}>
        spacer
      </div>
    );
  }

  return null;
}

// ─── Auto-resizing textarea ───────────────────────────────────────────────────

function AutoTextarea({
  value, onChange, placeholder, style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      style={{ ...style, overflow: "hidden", display: "block" }}
    />
  );
}

// ─── Block type picker ────────────────────────────────────────────────────────

function BlockPicker({ theme: t, dir, onSelect, onClose }: {
  theme: Theme;
  dir: "up" | "down";
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}) {
  void onClose;
  const pos: React.CSSProperties = dir === "up"
    ? { bottom: "calc(100% + 10px)", top: "auto" }
    : { top: "calc(100% + 10px)", bottom: "auto" };

  return (
    <div style={{
      position: "absolute", ...pos, left: "50%",
      transform: "translateX(-50%)",
      background: "var(--surface-3)", border: "1px solid var(--border-mid)",
      borderRadius: "10px", padding: "8px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      zIndex: 100, minWidth: "240px",
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: "4px",
    }}>
      {BLOCK_TYPES.map((b) => (
        <button
          key={b.type}
          onClick={() => onSelect(b.type)}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 10px", background: "transparent",
            border: "1px solid transparent", borderRadius: "6px",
            cursor: "pointer", textAlign: "left",
            transition: "all 0.1s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-4, rgba(255,255,255,0.06))"; e.currentTarget.style.borderColor = "var(--border)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
        >
          <div style={{
            width: "28px", height: "28px", borderRadius: "5px", flexShrink: 0,
            background: `${t.primary}18`, border: `1px solid ${t.primary}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: 700, color: t.primary,
            fontFamily: "monospace",
          }}>
            {b.icon}
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-body)" }}>{b.label}</div>
            <div style={{ fontSize: "9px", color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>{b.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
