import type { Kind, Plan, Session, Variation } from '../types';
import type { MuscleGroup } from '../supabase/prefs';
import { groupForMovement, muscleGroups, type MuscleGroupMeta } from './muscleGroups';

export interface AddableExercise {
  slot: string; // variations key (also the display name of the movement)
  kinds: Kind[]; // equipment options available for it
  preview: Variation | null; // first variation, for an image/label in the picker
  group: MuscleGroup; // muscle group this movement trains
}

// Exercises the user can ADD to a session: every movement the plan has variations
// for, minus the ones already in the session. Sorted alphabetically for the picker.
export function addableExercises(plan: Plan, session: Session): AddableExercise[] {
  const present = new Set(session.slots.map((s) => s[0]));
  const out: AddableExercise[] = [];
  for (const [slot, vars] of Object.entries(plan.variations)) {
    if (present.has(slot)) continue;
    const kinds = Object.keys(vars) as Kind[];
    if (!kinds.length) continue;
    out.push({ slot, kinds, preview: vars[kinds[0]] ?? null, group: groupForMovement(slot) });
  }
  out.sort((a, b) => a.slot.localeCompare(b.slot));
  return out;
}

export interface AddableGroup {
  group: MuscleGroupMeta;
  exercises: AddableExercise[];
}

// The same addable exercises, bucketed by muscle group for a "browse by muscle"
// picker. Only groups that have at least one addable exercise are returned, in
// the canonical muscleGroups order.
export function addableByGroup(plan: Plan, session: Session): AddableGroup[] {
  const all = addableExercises(plan, session);
  return muscleGroups
    .map((group) => ({ group, exercises: all.filter((e) => e.group === group.key) }))
    .filter((g) => g.exercises.length > 0);
}
