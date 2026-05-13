"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function OnboardingShell({ email }: { email: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { full_name: name.trim() },
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/app/forms");
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; }

        .orb {
          position: fixed; border-radius: 50%; pointer-events: none;
          filter: blur(80px); will-change: transform;
        }
        .orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle at center, rgba(202,255,0,0.07) 0%, transparent 65%);
          top: -240px; left: -160px;
          animation: drift1 22s ease-in-out infinite;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle at center, rgba(202,255,0,0.05) 0%, transparent 65%);
          bottom: -140px; right: -100px;
          animation: drift2 28s ease-in-out infinite;
        }
        @keyframes drift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(50px,60px) scale(1.04); }
        }
        @keyframes drift2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-50px,-40px) scale(1.06); }
        }

        .page {
          position: relative; z-index: 10; min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 48px 24px;
        }

        .card {
          width: 100%; max-width: 400px;
          display: flex; flex-direction: column; gap: 32px;
          animation: fadeUp 0.6s ease both;
        }

        .card-header { display: flex; flex-direction: column; gap: 6px; }

        .invite-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(202,255,0,0.07);
          border: 1px solid rgba(202,255,0,0.18);
          border-radius: 20px; padding: 5px 10px;
          font-size: 11px; color: var(--accent);
          font-weight: 500; width: fit-content; margin-bottom: 8px;
        }

        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--accent);
        }

        .title {
          font-family: var(--font-display);
          font-size: 28px; font-weight: 800;
          letter-spacing: -0.6px; color: var(--text); line-height: 1.1;
        }

        .sub {
          font-size: 13px; color: var(--text-dim); line-height: 1.6;
        }

        .email-chip {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 12px; color: var(--accent);
          background: rgba(202,255,0,0.06);
          border: 1px solid rgba(202,255,0,0.15);
          border-radius: 4px; padding: 2px 8px;
          margin-top: 4px;
        }

        form { display: flex; flex-direction: column; gap: 20px; }

        .field { display: flex; flex-direction: column; gap: 6px; }

        label {
          font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
          color: var(--text-dim); font-weight: 500;
        }

        input {
          background: transparent; border: none;
          border-bottom: 1px solid var(--border);
          color: var(--text); font-family: var(--font-body);
          font-size: 14px; font-weight: 300;
          padding: 10px 0; outline: none;
          transition: border-color 0.2s ease; width: 100%;
        }
        input::placeholder { color: var(--text-faint); }
        input:focus { border-bottom-color: var(--accent); }

        .error-msg {
          font-size: 11px; color: var(--error);
          padding: 8px 12px; background: var(--error-bg);
          border-left: 2px solid var(--error);
        }

        .submit-btn {
          background: var(--accent); color: #080808; border: none;
          font-family: var(--font-display); font-size: 13px;
          font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 14px; cursor: pointer; width: 100%;
          transition: opacity 0.15s ease, transform 0.15s ease;
          margin-top: 4px;
        }
        .submit-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="page">
        <div className="card">
          <div className="card-header">
            <div className="invite-badge">
              <span className="badge-dot" />
              You&apos;re invited
            </div>
            <div className="title">Set up your account.</div>
            <div className="sub">
              You&apos;re in. Finish setting up your CleverForms workspace.
              <br />
              <span className="email-chip">{email}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input
                id="name"
                type="text"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="field">
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type="password"
                placeholder="Same again"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Setting up…" : "Enter CleverForms →"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
