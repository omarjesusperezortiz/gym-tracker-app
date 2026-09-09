import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createSupabase, setSupabase } from '@gym-tracker/core';
import App from './App';
import './styles.css';

// Register the Supabase client before anything renders — core's getSupabase()
// throws if called before this, and several components call it during their
// first render (AuthContext, TrainView's finishWorkout, etc).
setSupabase(createSupabase(window.localStorage));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
