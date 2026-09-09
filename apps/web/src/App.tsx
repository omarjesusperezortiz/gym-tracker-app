import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthContext';
import { AuthGate } from './auth/AuthGate';
import { createQueryClient } from './lib/queryClient';
import { AppStateProvider, useAppState } from './state/AppState';
import { ToastProvider } from './components/Toast';
import { Nav } from './components/Nav';
import { TodayView } from './views/TodayView';
import { HomeView } from './views/HomeView';
import { TrainView } from './views/TrainView';
import { CalendarView } from './views/CalendarView';
import { ProgressView } from './views/ProgressView';
import { MealsView } from './views/MealsView';
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
    case 'profile':
      return <ProfileView />;
    default:
      return null;
  }
}

function Shell() {
  const { state } = useAppState();
  // Train brings its own sticky bar (which carries the notch padding), so only
  // the other screens need .wrap to reserve the safe-area inset at the top.
  const inTrain = state.view === 'train';
  return (
    <>
      <div className={`wrap${inTrain ? ' wrap-train' : ''}`}>
        <Screens />
      </div>
      <Nav />
    </>
  );
}

const queryClient = createQueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <AuthGate>
            <AppStateProvider>
              <Shell />
            </AppStateProvider>
          </AuthGate>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
