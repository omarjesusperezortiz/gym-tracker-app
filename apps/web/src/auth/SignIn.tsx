import { useState, type FormEvent } from 'react';
import { getSupabase } from '@gym-tracker/core';
import { friendlyAuthError } from './authErrors';

type Mode = 'signin' | 'signup' | 'forgot';

export function SignIn() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const supabase = getSupabase();
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        // Autoconfirm returns a session immediately and the auth listener swaps
        // us into the app. Only tell the user to check their email if signup
        // genuinely produced no session (email confirmation is enabled).
        if (data.session) {
          setNotice('Account created — setting you up…');
        } else {
          setNotice('Account created — check your email to confirm, then sign in.');
        }
      } else {
        // forgot password
        const redirectTo = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : undefined;
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (err) throw err;
        setNotice('If that email exists, a reset link is on its way.');
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  const title = mode === 'signin' ? 'Sign in to your account' : mode === 'signup' ? 'Create your account' : 'Reset your password';

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0a0b0e" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5l11 11M2 6l4-4M18 22l4-4M3 3l1 1M20 20l1 1M3.5 9.5l6-6M14.5 20.5l6-6" />
          </svg>
        </div>
        <div className="auth-title">Trainer</div>
        <div className="auth-sub">{title}</div>
        {error && <div className="auth-error">{error}</div>}
        {notice && (
          <div className="auth-error" style={{ color: 'var(--ok)', borderColor: 'rgba(61,220,151,.3)', background: 'rgba(61,220,151,.1)' }}>
            {notice}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {mode !== 'forgot' && (
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {mode === 'signup' && <div className="hint">At least 6 characters</div>}
              {mode === 'signin' && (
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    style={{ background: 'none', border: 'none', color: 'var(--acc)', fontWeight: 600, cursor: 'pointer', fontSize: '12.5px', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}
          <button className="btn acc" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Sign up' : 'Send reset link'}
          </button>
        </form>
        <div className="auth-switch">
          {mode === 'forgot' ? (
            <>
              Remembered it?
              <button type="button" onClick={() => switchMode('signin')}>
                Back to sign in
              </button>
            </>
          ) : (
            <>
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              <button type="button" onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}>
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
