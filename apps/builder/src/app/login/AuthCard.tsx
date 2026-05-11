"use client";

import { useState } from "react";
import { login, signup } from "./actions";

export function AuthCard({
  defaultTab,
  error,
  success,
}: {
  defaultTab: "login" | "signup";
  error?: string;
  success?: boolean;
}) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);

  return (
    <>
      <style>{`
        .auth-card {
          width: 100%;
          max-width: 360px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          animation: fadeUp 0.7s 0.15s ease both;
        }

        /* Tab switcher */
        .tab-track {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 3px;
          gap: 0;
        }

        .tab-pill {
          position: absolute;
          top: 3px;
          width: calc(50% - 3px);
          height: calc(100% - 6px);
          background: var(--accent);
          border-radius: 2px;
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tab-pill.signup {
          transform: translateX(calc(100% + 6px));
        }

        .tab-btn {
          position: relative;
          z-index: 1;
          background: none;
          border: none;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 9px 0;
          cursor: pointer;
          transition: color 0.2s ease;
          color: var(--text-dim);
        }

        .tab-btn.active {
          color: #080808;
        }

        /* Slide panel */
        .panel-viewport {
          overflow: hidden;
        }

        .panel-track {
          display: flex;
          transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .panel-track.signup {
          transform: translateX(-100%);
        }

        .panel {
          min-width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .panel-heading {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .panel-title {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.6px;
          color: var(--text);
          line-height: 1.1;
        }

        .panel-sub {
          font-size: 12px;
          color: var(--text-dim);
          line-height: 1.5;
        }

        /* FOMO badge */
        .fomo-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(202,255,0,0.08);
          border: 1px solid rgba(202,255,0,0.2);
          border-radius: 20px;
          padding: 5px 10px;
          font-size: 11px;
          color: var(--accent);
          font-weight: 500;
          width: fit-content;
        }

        .fomo-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        textarea {
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
          resize: none;
          line-height: 1.5;
        }

        textarea::placeholder { color: var(--text-faint); }
        textarea:focus { border-bottom-color: var(--accent); }

        /* Success state */
        .success-box {
          padding: 16px;
          background: rgba(202,255,0,0.06);
          border: 1px solid rgba(202,255,0,0.2);
          border-radius: 4px;
          font-size: 13px;
          color: var(--accent);
          line-height: 1.5;
        }
      `}</style>

      <div className="auth-card">
        {/* Tab switcher */}
        <div className="tab-track">
          <div className={`tab-pill ${tab === "signup" ? "signup" : ""}`} />
          <button
            className={`tab-btn ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
            type="button"
          >
            Sign in
          </button>
          <button
            className={`tab-btn ${tab === "signup" ? "active" : ""}`}
            onClick={() => setTab("signup")}
            type="button"
          >
            Early access
          </button>
        </div>

        {/* Sliding panels */}
        <div className="panel-viewport">
          <div className={`panel-track ${tab === "signup" ? "signup" : ""}`}>
            {/* Login panel */}
            <div className="panel">
              <div className="panel-heading">
                <div className="panel-title">Welcome back.</div>
                <div className="panel-sub">Sign in to your CleverForms workspace.</div>
              </div>
              <form action={login}>
                <div className="field">
                  <label htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="field" style={{ marginTop: 14 }}>
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
                {error && tab === "login" && (
                  <div className="error-msg" style={{ marginTop: 12 }}>{decodeURIComponent(error)}</div>
                )}
                <button type="submit" className="submit-btn" style={{ marginTop: 20 }}>
                  Continue →
                </button>
              </form>
            </div>

            {/* Signup panel */}
            <div className="panel">
              <div className="panel-heading">
                <div className="fomo-badge">
                  <span className="fomo-dot" />
                  1,421 people already on the list
                </div>
                <div className="panel-title" style={{ marginTop: 12 }}>
                  Request early access.
                </div>
                <div className="panel-sub">
                  CleverForms Forms is invite-only right now. Drop your email — we'll reach out when a spot opens.
                </div>
              </div>
              {success ? (
                <div className="success-box">
                  You're on the list. We'll be in touch soon.
                </div>
              ) : (
                <form action={signup}>
                  <div className="field">
                    <label htmlFor="signup-email">Email</label>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="field" style={{ marginTop: 14 }}>
                    <label htmlFor="signup-reason">What made you want to try this? <span style={{ opacity: 0.4 }}>(optional)</span></label>
                    <textarea
                      id="signup-reason"
                      name="reason"
                      placeholder="I need better forms for my product..."
                      rows={3}
                    />
                  </div>
                  {error && tab === "signup" && (
                    <div className="error-msg" style={{ marginTop: 12 }}>{decodeURIComponent(error)}</div>
                  )}
                  <button type="submit" className="submit-btn" style={{ marginTop: 20 }}>
                    Request access →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
