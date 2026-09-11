import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '@gym-tracker/core';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  /** True when the app was opened from a password-reset link and the user
   *  should be shown the "Set a new password" form instead of the app. */
  recovery: boolean;
  /** Leave the recovery flow (call after the password has been updated). */
  endRecovery: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function hashIsRecovery(): boolean {
  if (typeof window === 'undefined') return false;
  // Supabase puts the token + type in the URL hash, e.g. #access_token=…&type=recovery
  return window.location.hash.includes('type=recovery');
}

/** True when we returned from an OAuth provider with a ?code=… to exchange. */
function urlHasOAuthCode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('code');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState<boolean>(hashIsRecovery);

  useEffect(() => {
    const supabase = getSupabase();
    let cancelled = false;

    async function init() {
      // If Google (or any OAuth) sent us back with ?code=…, exchange it for a
      // session BEFORE we decide whether to show the sign-in screen. Without
      // this the app can read a null session first and bounce to /sign-in even
      // though the login succeeded. detectSessionInUrl also tries this, but on
      // GitHub Pages the explicit exchange is more reliable.
      if (urlHasOAuthCode()) {
        try {
          const code = new URLSearchParams(window.location.search).get('code')!;
          await supabase.auth.exchangeCodeForSession(code);
        } catch {
          // fall through — getSession below reports the real state
        }
        // Strip ?code=… (and any state) so a refresh doesn't re-exchange.
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', window.location.pathname + window.location.hash);
        }
      }
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session);
      setLoading(false);
    }

    void init();

    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      // Supabase fires PASSWORD_RECOVERY when a reset link is opened.
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  function endRecovery() {
    setRecovery(false);
    // Strip the recovery token from the URL so a refresh doesn't re-trigger it.
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  async function signOut() {
    await getSupabase().auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, loading, recovery, endRecovery, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
