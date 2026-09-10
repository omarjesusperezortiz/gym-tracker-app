import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { SignIn } from './SignIn';
import { ResetPassword } from './ResetPassword';

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading, recovery } = useAuth();

  if (loading) return <div className="auth-loading">Loading…</div>;
  // A recovery link logs the user in with a temporary session, so this must be
  // checked before the normal session gate — otherwise we'd drop them into the
  // app instead of the "set a new password" form.
  if (recovery) return <ResetPassword />;
  if (!session) return <SignIn />;
  return <>{children}</>;
}
