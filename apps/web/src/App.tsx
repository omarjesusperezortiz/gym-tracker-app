import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { AuthProvider } from './auth/AuthContext';
import { AuthGate } from './auth/AuthGate';
import { createQueryClient } from './lib/queryClient';
import { registerMutationDefaults } from './lib/mutationDefaults';
import { useRealtimeSync } from './lib/useRealtimeSync';
import { AppStateProvider, useAppState } from './state/AppState';
import { ToastProvider } from './components/Toast';
import { Nav } from './components/Nav';
import { OfflineBar } from './components/OfflineBar';
import { OnboardingGate } from './onboarding/OnboardingGate';
import { TodayView } from './views/TodayView';
import { HomeView } from './views/HomeView';
import { TrainView } from './views/TrainView';
import { CalendarView } from './views/CalendarView';
import { ProgressView } from './views/ProgressView';
import { MealsView } from './views/MealsView';
import { ExercisesView } from './views/ExercisesView';
import { ProfileView } from './views/ProfileView';

function Screens() {
  const { state } = useAppState();
  switch (state.view) {
    case 'today':
      return <TodayView />;
    case 'home':
      return <HomeView />;
    case 'train':
      return <TrainView />;
    case 'calendar':
      return <CalendarView />;
    case 'progress':
      return <ProgressView />;
    case 'meals':
      return <MealsView />;
    case 'exercises':
      return <ExercisesView />;
    case 'profile':
      return <ProfileView />;
    default:
      return null;
  }
}

function Shell() {
  const { state } = useAppState();
  useRealtimeSync();
  // Train brings its own sticky bar (which carries the notch padding), so only
  // the other screens need .wrap to reserve the safe-area inset at the top.
  const inTrain = state.view === 'train';
  return (
    <>
      <div className={`wrap${inTrain ? ' wrap-train' : ''}`}>
        <Screens />
      </div>
      {/* Hide the tab nav during an active workout (M-1): the Train screen has
          its own Save/Finish dock, and two stacked bottom bars would cover the
          set inputs — plus it keeps users from wandering off mid-session. */}
      {!inTrain && <Nav />}
    </>
  );
}

const queryClient = createQueryClient();
registerMutationDefaults(queryClient);

// Persist the cache to localStorage so the app opens instantly with the last
// data — and works offline. Paused (offline) mutations are persisted too and
// resume on reconnect/reload.
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'gym-tracker-cache',
});

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60_000,
        // Bump when cache shape changes to invalidate old persisted data.
        buster: 'v1',
      }}
      onSuccess={() => {
        // Once the persisted cache is restored, replay anything queued offline.
        void queryClient.resumePausedMutations();
      }}
    >
      <AuthProvider>
        <ToastProvider>
          <AuthGate>
            <AppStateProvider>
              <OnboardingGate>
                <OfflineBar />
                <Shell />
              </OnboardingGate>
            </AppStateProvider>
          </AuthGate>
        </ToastProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}
