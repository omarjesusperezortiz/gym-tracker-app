import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppStateProvider } from '../state/AppState';
import { AuthProvider } from '../auth/AuthContext';
import { createQueryClient } from '../lib/queryClient';
import { ToastProvider } from '../components/Toast';
import { HomeView } from '../views/HomeView';
import { ProfileView } from '../views/ProfileView';
import { TodayView } from '../views/TodayView';
import { CalendarView } from '../views/CalendarView';
import { ProgressView } from '../views/ProgressView';
import { MealsView } from '../views/MealsView';

// Standalone mounts of the real views (no auth) so we can screenshot each screen
// for the UX audit. Empty query client → hooks return empty/first-run state.
// Reached at ?showcase=home|profile|today|calendar|progress|meals.
const qc = createQueryClient();

function Shell({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <ToastProvider>
          <AppStateProvider>
            <div className="wrap">{children}</div>
          </AppStateProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export function HomeViewShowcase() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <AppStateProvider>
          <HomeView />
        </AppStateProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export function ProfileViewShowcase() {
  return (
    <Shell>
      <ProfileView />
    </Shell>
  );
}

export function TodayViewShowcase() {
  return (
    <Shell>
      <TodayView />
    </Shell>
  );
}

export function CalendarViewShowcase() {
  return (
    <Shell>
      <CalendarView />
    </Shell>
  );
}

export function ProgressViewShowcase() {
  return (
    <Shell>
      <ProgressView />
    </Shell>
  );
}

export function MealsViewShowcase() {
  return (
    <Shell>
      <MealsView />
    </Shell>
  );
}
