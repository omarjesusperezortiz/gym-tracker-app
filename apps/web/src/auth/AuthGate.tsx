import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { SignIn } from './SignIn';

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <div className="auth-loading">Loading…</div>;
  if (!session) return <SignIn />;
  return <>{children}</>;
}
