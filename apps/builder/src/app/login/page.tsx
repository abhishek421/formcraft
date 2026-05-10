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

        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .grid-fade {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 30%, var(--bg) 80%);
          pointer-events: none;
        }

        .container {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* Left panel */
        .left {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: var(--space-12);
          border-right: 1px solid var(--border);
        }

        .logo {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-dot {
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .hero-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: var(--space-6);
        }

        .hero-label {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--accent);
          font-weight: 500;
        }

        .hero-heading {
          font-family: var(--font-display);
          font-size: clamp(40px, 5vw, 64px);
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: -2px;
          color: var(--text);
        }

        .hero-heading em {
          font-style: normal;
          color: var(--accent);
        }

        .hero-sub {
          font-size: 13px;
          line-height: 1.7;
          color: var(--text-muted);
          max-width: 340px;
          font-weight: 300;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 300;
        }

        .feature-item::before {
          content: '';
          width: 20px;
          height: 1px;
          background: var(--accent);
          opacity: 0.6;
          flex-shrink: 0;
        }

        .left-footer {
          font-size: 11px;
          color: var(--text-faint);
          letter-spacing: 0.5px;
        }

        /* Right panel */
        .right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-12);
        }

        .form-wrapper {
          width: 100%;
          max-width: 360px;
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }

        .form-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .form-title {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: var(--text);
        }

        .form-subtitle {
          font-size: 12px;
          color: var(--text-dim);
          font-weight: 300;
        }

        .form-subtitle span {
          color: var(--accent);
          opacity: 0.8;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        label {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 500;
        }

        input {
          background: var(--surface-3);
          border: 1px solid var(--text-faint);
          border-radius: var(--radius-sm);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 300;
          padding: var(--space-3) var(--space-4);
          outline: none;
          transition: border-color var(--duration) var(--ease),
                      background  var(--duration) var(--ease);
          width: 100%;
        }

        input::placeholder {
          color: var(--text-faint);
        }

        input:focus {
          border-color: var(--accent);
          background: var(--surface-2);
        }

        .error-msg {
          font-size: 11px;
          color: var(--error);
          padding: var(--space-2) var(--space-3);
          background: var(--error-bg);
          border-left: 2px solid var(--error);
          border-radius: var(--radius-xs);
        }

        .submit-btn {
          background: var(--accent);
          color: var(--accent-text);
          border: none;
          border-radius: var(--radius-sm);
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: var(--space-4);
          cursor: pointer;
          transition: all var(--duration) var(--ease);
          margin-top: var(--space-2);
          width: 100%;
        }

        .submit-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: 10px;
          color: var(--text-faint);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .test-creds {
          background: var(--surface-3);
          border: 1px solid var(--accent-dim);
          border-radius: var(--radius-sm);
          padding: var(--space-3) var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .test-creds-label {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--accent);
          opacity: 0.6;
          font-weight: 500;
        }

        .test-creds-val {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 300;
        }

        .test-creds-val strong {
          color: var(--text-muted);
          font-weight: 400;
        }

        @media (max-width: 768px) {
          .container { grid-template-columns: 1fr; }
          .left { display: none; }
        }
      `}</style>

      <div className="grid-bg" />
      <div className="grid-fade" />
      <SettingsPanel />

      <div className="container">
        {/* Left panel */}
        <div className="left">
          <div className="logo">
            <div className="logo-dot" />
            FormCraft
          </div>

          <div className="hero-text">
            <div className="hero-label">AI-Native Form Builder</div>
            <div className="hero-heading">
              Forms that<br />
              <em>think</em> with<br />
              your team.
            </div>
            <p className="hero-sub">
              Variable interpolation, logic branching, and MCP-ready APIs.
              Build forms that feel like conversations.
            </p>
            <div className="feature-list">
              <div className="feature-item">Conversational multi-step flows</div>
              <div className="feature-item">Variables + logic branching</div>
              <div className="feature-item">Full MCP server — control via AI</div>
              <div className="feature-item">Drop-off analytics + partial capture</div>
            </div>
          </div>

          <div className="left-footer">© 2026 FormCraft</div>
        </div>

        {/* Right panel */}
        <div className="right">
          <div className="form-wrapper">
            <div className="form-header">
              <div className="form-title">Sign in</div>
              <div className="form-subtitle">
                No account yet? <span>Early access only.</span>
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

            <div className="divider">dev</div>

            <div className="test-creds">
              <div className="test-creds-label">Test credentials</div>
              <div className="test-creds-val">
                <strong>test@formcraft.dev</strong>
              </div>
              <div className="test-creds-val">
                <strong>test1234</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
