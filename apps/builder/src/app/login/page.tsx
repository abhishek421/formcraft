import { login } from "./actions";
import { SettingsPanel } from "@/components/settings-panel";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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

        /* Noise overlay for texture */
        .noise {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
        }

        /* ── Layout ─────────────────────────────────────────── */
        .container {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
        }

        /* ── Left panel ─────────────────────────────────────── */
        .left {
          display: flex;
          flex-direction: column;
          padding: 48px 56px;
          border-right: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }


        .logo {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.3px;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 10px;
          animation: fadeUp 0.6s ease both;
        }

        .logo-mark {
          width: 28px;
          height: 28px;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logo-mark svg { display: block; }

        .hero-block {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 32px;
          animation: fadeUp 0.6s 0.1s ease both;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--text-dim);
          font-family: var(--font-body);
          font-weight: 400;
        }

        .eyebrow-line {
          width: 32px;
          height: 1px;
          background: var(--accent);
          opacity: 0.7;
        }

        .hero-heading {
          font-family: var(--font-display);
          font-size: clamp(44px, 5.5vw, 72px);
          font-weight: 800;
          line-height: 0.92;
          letter-spacing: -2.5px;
          color: var(--text);
        }

        .hero-heading .accent-word {
          color: var(--accent);
          display: block;
        }

        .hero-sub {
          font-size: 13px;
          line-height: 1.75;
          color: var(--text-muted);
          max-width: 360px;
          font-weight: 300;
        }

        /* Feature pills */
        .features {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 12px;
          animation: fadeUp 0.5s ease both;
        }

        .feature:nth-child(1) { animation-delay: 0.25s; }
        .feature:nth-child(2) { animation-delay: 0.35s; }
        .feature:nth-child(3) { animation-delay: 0.45s; }
        .feature:nth-child(4) { animation-delay: 0.55s; }

        .feature-dot {
          width: 5px;
          height: 5px;
          background: var(--accent);
          border-radius: 50%;
          flex-shrink: 0;
          opacity: 0.7;
        }

        .feature-text {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 300;
          letter-spacing: 0.1px;
        }

        .left-footer {
          font-size: 10px;
          color: var(--text-faint);
          letter-spacing: 1px;
          font-family: var(--font-body);
          animation: fadeUp 0.6s 0.6s ease both;
        }

        /* ── Right panel ─────────────────────────────────────── */
        .right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 56px;
          background: linear-gradient(135deg, rgba(255,255,255,0.015) 0%, transparent 60%);
        }

        .form-card {
          width: 100%;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          animation: fadeUp 0.7s 0.15s ease both;
        }

        .form-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-title {
          font-family: var(--font-display);
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.8px;
          color: var(--text);
        }

        .form-sub {
          font-size: 12px;
          color: var(--text-dim);
          font-weight: 300;
          line-height: 1.6;
        }

        .form-sub em {
          font-style: normal;
          color: var(--accent);
          opacity: 0.9;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 16px;
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

        input::placeholder {
          color: var(--text-faint);
        }

        input:focus {
          border-bottom-color: var(--accent);
        }

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
          margin-top: 8px;
          width: 100%;
        }

        .submit-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .submit-btn:active {
          transform: translateY(0);
          opacity: 1;
        }

        /* Divider */
        .sep {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sep-line {
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .sep-label {
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--text-faint);
        }

        /* Test creds */
        .test-creds {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .test-label {
          font-size: 9px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--accent);
          opacity: 0.5;
          margin-bottom: 4px;
        }

        .test-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
        }

        .test-row:last-child {
          border-bottom: none;
        }

        .test-key {
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-faint);
        }

        .test-val {
          font-size: 12px;
          color: var(--text-muted);
          font-family: var(--font-body);
          font-weight: 400;
        }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .container { grid-template-columns: 1fr; }
          .left { display: none; }
          .right { padding: 32px 24px; }
        }
      `}</style>

      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="noise" />

      <SettingsPanel />

      <div className="container">
        {/* Left panel */}
        <div className="left">
          <div className="logo">
            <div className="logo-mark">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" fill="#080808" />
                <rect x="8" y="1" width="5" height="5" fill="#080808" />
                <rect x="1" y="8" width="5" height="5" fill="#080808" />
                <rect x="8" y="8" width="2.5" height="2.5" fill="#080808" />
              </svg>
            </div>
            FormCraft
          </div>

          <div className="hero-block">
            <div className="eyebrow">
              <div className="eyebrow-line" />
              Form Builder
            </div>

            <div className="hero-heading">
              Forms that<br />
              feel like
              <span className="accent-word">conversations.</span>
            </div>

            <p className="hero-sub">
              One question at a time. Logic branching, variable interpolation,
              per-form theming, and a full REST API — all in one tool.
            </p>

            <div className="features">
              <div className="feature">
                <div className="feature-dot" />
                <span className="feature-text">Conversational one-at-a-time flows</span>
              </div>
              <div className="feature">
                <div className="feature-dot" />
                <span className="feature-text">Logic branching + variable interpolation</span>
              </div>
              <div className="feature">
                <div className="feature-dot" />
                <span className="feature-text">Per-form theming and branding</span>
              </div>
              <div className="feature">
                <div className="feature-dot" />
                <span className="feature-text">REST API + API key management</span>
              </div>
            </div>
          </div>

          <div className="left-footer">© 2026 FormCraft</div>
        </div>

        {/* Right panel */}
        <div className="right">
          <div className="form-card">
            <div className="form-header">
              <div className="form-title">Welcome back.</div>
              <div className="form-sub">
                No account? <em>Early access only.</em>
              </div>
            </div>

            <form action={login}>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && <div className="error-msg">{decodeURIComponent(error)}</div>}

              <button type="submit" className="submit-btn">
                Continue →
              </button>
            </form>

            <div className="sep">
              <div className="sep-line" />
              <span className="sep-label">dev</span>
              <div className="sep-line" />
            </div>

            <div className="test-creds">
              <div className="test-label">Test credentials</div>
              <div className="test-row">
                <span className="test-key">Email</span>
                <span className="test-val">test@formcraft.dev</span>
              </div>
              <div className="test-row">
                <span className="test-key">Password</span>
                <span className="test-val">test1234</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
