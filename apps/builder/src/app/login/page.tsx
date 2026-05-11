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
          display: flex;
          align-items: center;
          justify-content: center;
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

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Mobile */
        @media (max-width: 768px) {
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
        <div className="right">
          <div className="form-card">
            <div className="form-header">
              <div className="form-title">Welcome back.</div>
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
          </div>
        </div>
      </div>
    </>
  );
}
