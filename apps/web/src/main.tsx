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
import { CatalogExplorer } from './dev/CatalogExplorer';
import { EdbLibrary } from './dev/EdbLibrary';
import { TestIndex } from './dev/TestIndex';
import './styles/test-index.css';
import './styles/catalog-explorer.css';
import './styles/edb-library.css';
import './styles.css';
import './styles/mobile-shell.css';

// Register the Supabase client before anything renders — core's getSupabase()
// throws if called before this, and several components call it during their
// first render (AuthContext, TrainView's finishWorkout, etc).
setSupabase(createSupabase(window.localStorage));

// Dev/test routes. The primary URL shape is HASH-based (`/#/test`, `/#/test/card`)
// because GitHub Pages doesn't serve custom paths — a hash never leaves the
// server, so /gym-tracker-app/#/test loads index.html and we route in the
// browser. Legacy `?test=` / `?showcase=` links still work for muscle memory.
function parseRoute(): string | null {
  const hash = window.location.hash.replace(/^#\/?/, ''); // "#/test/card" → "test/card"
  if (hash.startsWith('test')) {
    const rest = hash.slice(4).replace(/^\/+/, ''); // "" or "card"
    return rest || 'index';
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('test') ?? params.get('showcase') ?? null;
}

// Test/dev routes that should escape the phone-width shell and use the full
// viewport (desktop-first curation tools, catalog explorers, etc).
const DESKTOP_ROUTES = new Set(['edb', 'varlab']);

function applyDesktopClass(r: string | null) {
  const wants = r != null && DESKTOP_ROUTES.has(r);
  document.body.classList.toggle('desktop-route', wants);
}

let route = parseRoute();
applyDesktopClass(route);
window.addEventListener('hashchange', () => {
  // Any change in the /#/test/<slug> segment needs a re-mount so switching
  // between test pages from the index feels instant.
  const next = parseRoute();
  if (next !== route) {
    route = next;
    applyDesktopClass(route);
    root.render(<StrictMode>{render()}</StrictMode>);
  }
});

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
    case 'catalog':
      return <CatalogExplorer />;
    case 'edb':
      return <EdbLibrary />;
    default:
      // No route → real app.
      return <App />;
  }
}

const root = createRoot(document.getElementById('root')!);
root.render(<StrictMode>{render()}</StrictMode>);
