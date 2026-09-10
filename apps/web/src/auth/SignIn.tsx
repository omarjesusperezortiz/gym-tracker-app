import '../styles/auth-extras.css';
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

  async function onGoogle() {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const supabase = getSupabase();
      const redirectTo =
        typeof window !== 'undefined' ? window.location.origin + window.location.pathname : undefined;
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      // On success the browser is redirected to Google, so no further UI update
      // is needed. If OAuth isn't configured, Supabase returns an error here.
      if (err) throw err;
    } catch (err) {
      setError(friendlyAuthError(err));
      setBusy(false);
    }
  }

  const hero = mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password';
  const hsub =
    mode === 'signin'
      ? 'Sign in to continue your fitness journey and stay connected with your gym.'
      : mode === 'signup'
        ? 'Create your account to start tracking workouts and reaching your goals.'
        : 'Enter your email and we’ll send you a link to reset your password.';
  const primaryLabel = busy
    ? 'Please wait…'
    : mode === 'signin'
      ? 'Sign In'
      : mode === 'signup'
        ? 'Create Account'
        : 'Send reset link';

  return (
    <div className="auth-screen">
      <div className="auth-hero">{hero}</div>
      <div className="auth-hsub">{hsub}</div>

      {error && <div className="auth-alert err">{error}</div>}
      {notice && <div className="auth-alert ok">{notice}</div>}

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="[email protected]"
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
              placeholder="••••••••••••"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        {mode === 'signin' && (
          <div className="auth-forgot">
            <button type="button" onClick={() => switchMode('forgot')}>
              Forgot Password?
            </button>
          </div>
        )}

        <button className="auth-primary" type="submit" disabled={busy}>
          {primaryLabel}
        </button>
      </form>

      {mode !== 'forgot' && (
        <>
          <div className="auth-divider">
            <span>Or</span>
          </div>

          <button className="auth-sso" type="button" onClick={onGoogle} disabled={busy}>
            <svg className="g" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
              />
            </svg>
            Continue with Google
          </button>

          <button className="auth-sso disabled" type="button" disabled aria-disabled="true">
            <svg className="applelogo" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.05 12.6c-.03-2.6 2.12-3.85 2.22-3.9-1.21-1.77-3.1-2-3.77-2.03-1.6-.16-3.13.94-3.94.94-.81 0-2.07-.92-3.4-.9-1.75.03-3.36 1.02-4.26 2.58-1.82 3.16-.46 7.83 1.3 10.4.86 1.26 1.88 2.67 3.22 2.62 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.8 1.39-.02 2.27-1.28 3.12-2.55.98-1.46 1.39-2.87 1.41-2.94-.03-.01-2.7-1.04-2.73-4.13zM14.6 4.87c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z" />
            </svg>
            Continue with Apple <span className="soon">Soon</span>
          </button>
        </>
      )}

      <div className="auth-foot">
        {mode === 'forgot' ? (
          <>
            Remembered it?
            <button type="button" onClick={() => switchMode('signin')}>
              Back to Sign In
            </button>
          </>
        ) : (
          <>
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            <button type="button" onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? 'Create Account' : 'Sign In'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
