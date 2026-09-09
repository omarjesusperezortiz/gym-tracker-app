import type { ReactNode } from 'react';
import { usePrefs } from '../lib/useProfileData';
import { Onboarding } from './Onboarding';

// Signed in but never set up (no prefs row, or onboarded false) → the wizard
// takes the whole screen, no tabs. Once savePrefs writes onboarded:true the
// prefs query updates and this swaps straight to the app.
export function OnboardingGate({ children }: { children: ReactNode }) {
  const { data, isPending, isError } = usePrefs();

  if (isPending) return <div className="auth-loading">Loading…</div>;
  // A prefs read that failed shouldn't trap someone in onboarding — let them in
  // and let Profile sort it out.
  if (isError) return <>{children}</>;
  if (!data?.onboarded) return <Onboarding />;
  return <>{children}</>;
}
