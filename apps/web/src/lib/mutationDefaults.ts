// Registers default mutationFns keyed by mutationKey so mutations that were
// PAUSED while offline can be REPLAYED after a page reload (TanStack rehydrates
// paused mutations from the persisted cache but needs the fn re-attached by key).
import type { QueryClient } from '@tanstack/react-query';
import {
  finishWorkout,
  updateWorkout,
  type FinishedWorkout,
  type UpdateWorkout,
} from '@gym-tracker/core';
import { logDayMarker, removeWorkout } from './workouts';

export const MUT = {
  finishWorkout: ['finishWorkout'] as const,
  updateWorkout: ['updateWorkout'] as const,
  logRestDay: ['logRestDay'] as const,
  removeWorkout: ['removeWorkout'] as const,
};

export function registerMutationDefaults(qc: QueryClient): void {
  qc.setMutationDefaults(MUT.finishWorkout, {
    mutationFn: (vars) => finishWorkout(vars as unknown as FinishedWorkout),
  });
  qc.setMutationDefaults(MUT.updateWorkout, {
    mutationFn: (vars) => updateWorkout(vars as unknown as UpdateWorkout),
  });
  qc.setMutationDefaults(MUT.logRestDay, {
    mutationFn: (vars) => logDayMarker((vars as unknown as { date: string }).date, 'rest'),
  });
  qc.setMutationDefaults(MUT.removeWorkout, {
    mutationFn: (vars) => removeWorkout((vars as unknown as { id: string }).id),
  });
}
