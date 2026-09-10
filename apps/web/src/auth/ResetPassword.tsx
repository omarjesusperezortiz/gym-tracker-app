import { useState, type FormEvent } from 'react';
import { getSupabase } from '@gym-tracker/core';
import { useAuth } from './AuthContext';
import { friendlyAuthError } from './authErrors';

/**
 * Shown when the app is opened from a password-reset link (see AuthContext's
 * `recovery` state). Lets the user choose a new password via
 * supabase.auth.updateUser({ password }).
 */
export function ResetPassword() {
  const { endRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords don’t match.');
      return;
    }
    setBusy(true);
    try {
      const supabase = getSupabase();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0a0b0e" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5l11 11M2 6l4-4M18 22l4-4M3 3l1 1M20 20l1 1M3.5 9.5l6-6M14.5 20.5l6-6" />
          </svg>
        </div>
        <div className="auth-title">Trainer</div>
        <div className="auth-sub">Set a new password</div>
        {error && <div className="auth-error">{error}</div>}
        {done ? (
          <>
            <div
              className="auth-error"
              style={{ color: 'var(--ok)', borderColor: 'rgba(61,220,151,.3)', background: 'rgba(61,220,151,.1)' }}
            >
              Password updated. You’re all set.
            </div>
            <button className="btn acc" type="button" onClick={endRecovery}>
              Continue
            </button>
          </>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="hint">At least 6 characters</div>
            </div>
            <div className="field">
              <label htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button className="btn acc" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
