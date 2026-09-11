import { useState } from 'react';
import { catalog, type Plan } from '@gym-tracker/core';
import { AddExerciseSheet } from '../views/AddExerciseSheet';

// Standalone mount of the real AddExerciseSheet so we can screenshot the
// muscle-group browsing without login. Reached at ?showcase=picker.
export function PickerShowcase() {
  const [open, setOpen] = useState(true);
  const gym = catalog.plans.gym as unknown as Plan;
  const session = gym.sessions.pull;
  return (
    <div style={{ minHeight: '100dvh', background: '#0a0b0e' }}>
      <button style={{ margin: 20, padding: 12, color: '#fff' }} onClick={() => setOpen(true)}>
        Open picker
      </button>
      <AddExerciseSheet
        open={open}
        onClose={() => setOpen(false)}
        plan={gym}
        session={session}
        sessionName="Pull"
        onAdd={() => {}}
      />
    </div>
  );
}
