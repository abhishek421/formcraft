import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CleverForms — Self-Optimizing Forms That Improve Completion Rates";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F4EFE6",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top — wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#E85D3A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "-0.5px",
            }}
          >
            CF
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 22,
              color: "#1C1917",
              letterSpacing: "-0.3px",
            }}
          >
            CleverForms
          </span>
          <span
            style={{
              fontSize: 14,
              color: "rgba(28,25,23,0.4)",
              marginLeft: 4,
            }}
          >
            by StayClever
          </span>
        </div>

        {/* Middle — headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 13,
              color: "#E85D3A",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "Georgia, serif",
            }}
          >
            Self-optimizing forms
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#1C1917",
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              fontFamily: "Georgia, serif",
            }}
          >
            Forms that
            <br />
            <span style={{ color: "#E85D3A" }}>improve themselves.</span>
          </div>
          <div
            style={{
              fontSize: 22,
              color: "rgba(28,25,23,0.55)",
              lineHeight: 1.6,
              maxWidth: 680,
              fontWeight: 400,
            }}
          >
            Automatically test question variants, detect friction, and optimize
            completion rates in real time.
          </div>
        </div>

        {/* Bottom — trust line */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["No-code setup", "Real-time optimization", "Behavioral analytics"].map(
            (t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  color: "rgba(28,25,23,0.5)",
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#E85D3A",
                    opacity: 0.7,
                  }}
                />
                {t}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
