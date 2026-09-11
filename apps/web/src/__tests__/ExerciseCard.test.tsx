import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { catalog } from '@gym-tracker/core';
import type { Kind, Slot } from '@gym-tracker/core';
import { ExerciseCard } from '../views/ExerciseCard';
import type { LiveSet, LiveSlotState } from '../state/AppState';

const PLAN = catalog.plans.gym;
const SLOT_DEF = PLAN.sessions.push.slots.find((s) => s[0] === 'Flat chest press') as Slot;

function makeInitialState(): LiveSlotState {
  return { kind: 'bar', done: false, force: false, sets: [{ w: '', r: '', last: '' }] };
}

// Reproduces the "keep entered values on equipment switch" behaviour that
// TrainView wires up via SET_KIND, but wrapped in a tiny stateful harness so
// ExerciseCard can be exercised in isolation.
function Harness() {
  const [state, setState] = useState<LiveSlotState>(makeInitialState);
  return (
    <ExerciseCard
      index={0}
      slotDef={SLOT_DEF}
      plan={PLAN}
      state={state}
      onToggleDone={() => setState((s) => ({ ...s, done: !s.done }))}
      onToggleForce={() => setState((s) => ({ ...s, force: !s.force }))}
      onKindChange={(kind: Kind) => setState((s) => ({ ...s, kind }))}
      onSetChange={(index, field, value) =>
        setState((s) => {
          const sets = (s.sets ?? []).slice();
          sets[index] = { ...sets[index], [field]: value } as LiveSet;
          return { ...s, sets };
        })
      }
      onAddSet={() => setState((s) => ({ ...s, sets: [...(s.sets ?? []), { w: '', r: '', last: '' }] }))}
      onZoom={() => {}}
    />
  );
}

describe('ExerciseCard', () => {
  it('renders the exercise name', () => {
    render(<Harness />);
    expect(screen.getByText('Flat chest press')).toBeInTheDocument();
  });

  it('keeps entered values when swapping to a different exercise', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const weightInput = screen.getByLabelText('Set 1 weight') as HTMLInputElement;
    await user.type(weightInput, '60');
    expect(weightInput).toHaveValue('60');

    // Open the Swap sheet, then pick the Dumbbell variation.
    await user.click(screen.getByRole('button', { name: /Swap .* exercise/i }));
    await user.click(screen.getByText('Dumbbell'));

    const weightInputAfterSwitch = screen.getByLabelText('Set 1 weight') as HTMLInputElement;
    expect(weightInputAfterSwitch).toHaveValue('60');
  });

  it('adds a new set row', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    expect(container.querySelectorAll('.setrow')).toHaveLength(1);
    await user.click(screen.getByText('+ Add set'));
    expect(container.querySelectorAll('.setrow')).toHaveLength(2);
  });
});
