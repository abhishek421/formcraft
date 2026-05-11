import { SettingsPanel } from "@/components/settings-panel";
import { AuthCard } from "./AuthCard";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tab?: string; success?: string }>;
}) {
  const { error, tab, success } = await searchParams;
  const defaultTab = tab === "signup" ? "signup" : "login";

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          min-height: 100vh;
          overflow: hidden;
        }

        /* ── Orb background ─────────────────────────────────── */
        .orb {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
          will-change: transform;
        }

        .orb-1 {
          width: 700px;
          height: 700px;
          background: radial-gradient(circle at center, rgba(202,255,0,0.09) 0%, transparent 65%);
          top: -280px;
          left: -180px;
          animation: drift1 22s ease-in-out infinite;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle at center, rgba(202,255,0,0.06) 0%, transparent 65%);
          bottom: -180px;
          right: -120px;
          animation: drift2 28s ease-in-out infinite;
        }

        .orb-3 {
          width: 320px;
          height: 320px;
          background: radial-gradient(circle at center, rgba(180,255,120,0.04) 0%, transparent 65%);
          top: 50%;
          left: 45%;
          transform: translate(-50%, -50%);
          animation: drift3 35s ease-in-out infinite;
        }

        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(60px, 80px) scale(1.05); }
          66%  { transform: translate(-40px, 40px) scale(0.95); }
        }

        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(-80px, -60px) scale(1.08); }
          66%  { transform: translate(40px, -30px) scale(0.96); }
        }

        @keyframes drift3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50%  { transform: translate(-50%, -50%) scale(1.3); opacity: 0.6; }
        }

        .noise {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
        }

        /* ── Layout ─────────────────────────────────────────── */
        .page {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: stretch;
        }

        /* ── Left: marketing ────────────────────────────────── */
        .left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 72px;
          border-right: 1px solid var(--border);
          gap: 40px;
          animation: fadeUp 0.6s ease both;
        }

        .wordmark {
          font-family: 'Arvo', serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: var(--accent);
          opacity: 0.9;
        }

        .marketing-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .marketing-headline {
          font-family: var(--font-display);
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 900;
          letter-spacing: -1.5px;
          line-height: 1.05;
          color: var(--text);
        }

        .marketing-headline em {
          font-style: normal;
          color: var(--accent);
        }

        .marketing-copy {
          font-size: 14px;
          color: var(--text-dim);
          line-height: 1.65;
          max-width: 380px;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text-dim);
        }

        .feature-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent);
          flex-shrink: 0;
          opacity: 0.7;
        }

        /* ── Right: auth ─────────────────────────────────────── */
        .right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 72px;
        }

        /* Shared form styles (used in AuthCard) */
        form {
          display: flex;
          flex-direction: column;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-dim);
          font-weight: 500;
          font-family: var(--font-body);
        }

        input {
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border);
          border-radius: 0;
          color: var(--text);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 300;
          padding: 10px 0;
          outline: none;
          transition: border-color 0.2s ease;
          width: 100%;
        }

        input::placeholder { color: var(--text-faint); }
        input:focus { border-bottom-color: var(--accent); }

        .error-msg {
          font-size: 11px;
          color: var(--error);
          padding: 8px 12px;
          background: var(--error-bg);
          border-left: 2px solid var(--error);
        }

        .submit-btn {
          background: var(--accent);
          color: #080808;
          border: none;
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 14px;
          cursor: pointer;
          transition: opacity 0.15s ease, transform 0.15s ease;
          width: 100%;
        }

        .submit-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .submit-btn:active { transform: translateY(0); opacity: 1; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .left { display: none; }
          .right { padding: 40px 28px; }
        }
      `}</style>

      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="noise" />

      <SettingsPanel />

      <div className="page">
        {/* Left — marketing */}
        <div className="left">
          <div className="wordmark">CleverForms</div>
          <div className="marketing-body">
            <h1 className="marketing-headline">
              Forms that<br />actually <em>convert.</em>
            </h1>
            <p className="marketing-copy">
              Forms that stay clever. Build, publish, and let your forms improve themselves — one response at a time.
            </p>
            <div className="feature-list">
              {[
                "Drag-and-drop builder with 20+ field types",
                "Conditional logic and branching flows",
                "Real-time analytics and completion insights",
                "Embed anywhere in one line of code",
              ].map((f) => (
                <div className="feature-item" key={f}>
                  <span className="feature-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — auth card */}
        <div className="right">
          <AuthCard
            defaultTab={defaultTab}
            error={error}
            success={success === "1"}
          />
        </div>
      </div>
    </>
  );
}
