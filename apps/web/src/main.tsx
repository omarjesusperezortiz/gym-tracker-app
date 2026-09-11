import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createSupabase, setSupabase } from '@gym-tracker/core';
import App from './App';
import { ExerciseShowcase } from './dev/ExerciseShowcase';
import { PickerShowcase } from './dev/PickerShowcase';
import { ExerciseAudit } from './dev/ExerciseAudit';
import { ExercisesView } from './views/ExercisesView';
import './styles.css';
import './styles/mobile-shell.css';

// Register the Supabase client before anything renders — core's getSupabase()
// throws if called before this, and several components call it during their
// first render (AuthContext, TrainView's finishWorkout, etc).
setSupabase(createSupabase(window.localStorage));

// Dev showcase route (no login) — mounts the real components with the exercise
// gifs so we can review the integration. Reached at ?showcase=exercises.
const showcase = new URLSearchParams(window.location.search).get('showcase');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {showcase === 'exercises' ? (
      <ExerciseShowcase />
    ) : showcase === 'picker' ? (
      <PickerShowcase />
    ) : showcase === 'audit' ? (
      <ExerciseAudit />
    ) : showcase === 'library' ? (
      <ExercisesView />
    ) : (
      <App />
    )}
  </StrictMode>
);


