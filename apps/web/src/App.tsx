import { AuthProvider } from './auth/AuthContext';
import { AuthGate } from './auth/AuthGate';
import { AppStateProvider, useAppState } from './state/AppState';
import { ToastProvider } from './components/Toast';
import { Header } from './components/Header';
import { Nav } from './components/Nav';
import { TodayView } from './views/TodayView';
import { HomeView } from './views/HomeView';
import { TrainView } from './views/TrainView';
import { CalendarView } from './views/CalendarView';
import { ProgressView } from './views/ProgressView';
import { MealsView } from './views/MealsView';

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
    default:
      return null;
  }
}

function Shell() {
  const { state } = useAppState();
  return (
    <>
      {state.view !== 'train' && <Header />}
      <div className="wrap">
        <Screens />
      </div>
      <Nav />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuthGate>
          <AppStateProvider>
            <Shell />
          </AppStateProvider>
        </AuthGate>
      </ToastProvider>
    </AuthProvider>
  );
}
