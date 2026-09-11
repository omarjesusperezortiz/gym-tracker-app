import { useState } from 'react';
import { catalog, type Kind, type Plan, type Slot } from '@gym-tracker/core';
import { ExerciseCard } from '../views/ExerciseCard';
import type { LiveSlotState } from '../state/AppState';

// Mount a real ExerciseCard (with the Swap action) for a movement that has
// multiple equipment variations. Reached at ?showcase=swap.
const PLAN = catalog.plans.gym as unknown as Plan;
const SLOT = PLAN.sessions.pull.slots.find((s) => s[0] === 'Vertical pull (lats)') as Slot;

export function SwapShowcase() {
  const [state, setState] = useState<LiveSlotState>({
    kind: 'cable',
    done: false,
    force: false,
    sets: [{ w: '', r: '' }],
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
        onAddSet={() => {}}
        onZoom={() => {}}
      />
    </div>
  );
}
