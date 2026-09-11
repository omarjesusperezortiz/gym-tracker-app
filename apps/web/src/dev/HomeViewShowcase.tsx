import { QueryClientProvider } from '@tanstack/react-query';
import { AppStateProvider } from '../state/AppState';
import { AuthProvider } from '../auth/AuthContext';
import { createQueryClient } from '../lib/queryClient';
import { HomeView } from '../views/HomeView';
import { ProfileView } from '../views/ProfileView';
import { ToastProvider } from '../components/Toast';

// Standalone mount of the real HomeView (no auth) so we can screenshot the
// redesign. Uses an empty query client → useWorkouts returns []. Reached at
// ?showcase=home.
const qc = createQueryClient();

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
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <ToastProvider>
          <AppStateProvider>
            <ProfileView />
          </AppStateProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
