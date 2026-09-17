import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createSupabase, setSupabase } from '@gym-tracker/core';
import App from './App';
import { ExerciseShowcase } from './dev/ExerciseShowcase';
import { PickerShowcase } from './dev/PickerShowcase';
import { ExerciseAudit } from './dev/ExerciseAudit';
import { ExercisesView } from './views/ExercisesView';
import {
  HomeViewShowcase,
  ProfileViewShowcase,
  TodayViewShowcase,
  CalendarViewShowcase,
  ProgressViewShowcase,
  MealsViewShowcase,
} from './dev/HomeViewShowcase';
import { CardShowcase } from './dev/CardShowcase';
import { Home2Showcase } from './dev/Home2Showcase';
import { VarCurateShowcase } from './dev/VarCurateShowcase';
import { TestIndex } from './dev/TestIndex';
import './styles/var-curate.css';
import './styles/test-index.css';
import './styles.css';
import './styles/mobile-shell.css';

// Register the Supabase client before anything renders — core's getSupabase()
// throws if called before this, and several components call it during their
// first render (AuthContext, TrainView's finishWorkout, etc).
setSupabase(createSupabase(window.localStorage));

// Login-free test/dev routes reached at ?test=<name>. Land on ?test=index (or
// just ?test= with an empty value) to see every available page in one list —
// the entry point for prototyping and QA. `?showcase=` still works for the old
// deep links (Nuxt-friendly muscle memory).
const params = new URLSearchParams(window.location.search);
const route = params.get('test') ?? params.get('showcase') ?? null;

function render() {
  switch (route) {
    case '':
    case 'index':
      return <TestIndex />;
    case 'exercises':
      return <ExerciseShowcase />;
    case 'picker':
      return <PickerShowcase />;
    case 'audit':
      return <ExerciseAudit />;
    case 'library':
      return <ExercisesView />;
    case 'home':
      return (
        <div className="wrap">
          <HomeViewShowcase />
        </div>
      );
    case 'card':
      return <CardShowcase />;
    case 'home2':
      return <Home2Showcase />;
    case 'profile':
      return (
        <div className="wrap">
          <ProfileViewShowcase />
        </div>
      );
    case 'today':
      return <TodayViewShowcase />;
    case 'calendar':
      return <CalendarViewShowcase />;
    case 'progress':
      return <ProgressViewShowcase />;
    case 'meals':
      return <MealsViewShowcase />;
    case 'varcurate':
      return <VarCurateShowcase />;
    default:
      // Any other value (or none) → real app.
      return <App />;
  }
}

createRoot(document.getElementById('root')!).render(<StrictMode>{render()}</StrictMode>);
