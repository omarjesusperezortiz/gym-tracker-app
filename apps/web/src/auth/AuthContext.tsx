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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState<boolean>(hashIsRecovery);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      // Supabase fires PASSWORD_RECOVERY when a reset link is opened.
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
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
