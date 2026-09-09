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
  // "X" during onboarding sets a session flag: let them into the app now WITHOUT
  // creating a profile. onboarded stays false, so next launch we ask again.
  let dismissed = false;
  try {
    dismissed = sessionStorage.getItem('onb_dismissed') === '1';
  } catch {
    /* ignore */
  }
  if (!data?.onboarded && !dismissed) return <Onboarding />;
  return <>{children}</>;
}
