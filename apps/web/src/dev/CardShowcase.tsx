import { useState } from 'react';
import { catalog, type Kind, type Plan, type Slot } from '@gym-tracker/core';
import { ExerciseCard } from '../views/ExerciseCard';
import type { LiveSlotState } from '../state/AppState';

// Mount a real ExerciseCard with a movement that has several equipment
// variations, to verify the demo gif tracks the selected tab. ?showcase=card
const PLAN = catalog.plans.gym as unknown as Plan;
const SLOT = PLAN.sessions.pull.slots.find((s) => s[0] === 'Vertical pull (lats)') as Slot;

export function CardShowcase() {
  const [state, setState] = useState<LiveSlotState>({
    kind: 'cable',
    done: false,
    force: false,
    sets: [
      { w: '42', r: '8', last: '40×8', done: true },
      { w: '42', r: '8', last: '40×8', done: false },
      { w: '', r: '', last: '40×8', done: false },
    ],
  } as unknown as LiveSlotState);

  return (
    <div className="wrap wrap-train" style={{ paddingTop: 24 }}>
      <ExerciseCard
        index={0}
        slotDef={SLOT}
        plan={PLAN}
        state={state}
        onToggleDone={() => {}}
        onToggleForce={() => {}}
        onKindChange={(kind: Kind) => setState((s) => ({ ...s, kind }))}
        onSetChange={() => {}}
        onToggleSetDone={(i) =>
          setState((s) => ({
            ...s,
            sets: (s.sets ?? []).map((st, j) => (j === i ? { ...st, done: !st.done } : st)),
          }))
        }
        onAddSet={() => {}}
        onDeleteSet={() => {}}
        onZoom={() => {}}
      />
    </div>
  );
}
