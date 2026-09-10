// One-rep-max estimation via the Epley formula: 1RM = w · (1 + reps/30).
// A single heavy set implies a whole strength curve — surfacing an estimated
// 1RM turns a logbook into something you can benchmark against.
import type { MuscleHistoryEntry } from './muscleMap';

// Epley. A true 1-rep set returns the weight unchanged (1 + 1/30 would inflate
// it), and non-positive inputs yield 0.
export function epley1RM(weight: number, reps: number): number {
  if (!(weight > 0) || !(reps > 0)) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export interface RepSet {
  w: string;
  r: string;
}

// Best estimated 1RM across a group of sets (strings straight off the log).
// Returns null when nothing in the group carried both weight and reps.
export function estimate1RM(sets: ReadonlyArray<RepSet>): number | null {
  let best = 0;
  for (const s of sets) {
    const w = parseFloat(s.w);
    const r = parseFloat(s.r);
    if (isNaN(w) || isNaN(r)) continue;
    best = Math.max(best, epley1RM(w, r));
  }
  return best > 0 ? best : null;
}

// Best estimated 1RM for one exercise across all history.
export function bestE1RM(history: ReadonlyArray<MuscleHistoryEntry>, name: string): number | null {
  let best = 0;
  for (const w of history) {
    if (w.type && w.type !== 'workout') continue;
    for (const slot of w.slots) {
      if (slot.slot !== name) continue;
      const e = estimate1RM(slot.sets);
      if (e != null) best = Math.max(best, e);
    }
  }
  return best > 0 ? best : null;
}
