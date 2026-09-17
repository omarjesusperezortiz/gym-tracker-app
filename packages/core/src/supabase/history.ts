import { getSupabase } from './client';
import type { Kind, LoggedSet, LoggedSlot } from '../types';
import { exerciseId, resolveExerciseId, variationExerciseId } from '../logic/exercise-id';

// One logged slot instance, flattened out of a workout — used for the global
// per-exercise "last time" lookup. Mirrors the web app's `lastFor`.
export interface HistorySlotEntry {
  slot: string; // display name (may be legacy-only on old rows)
  slotId: string; // resolved stable id at MOVEMENT level (from slot_id, or derived from the name)
  /** Resolved stable id at VARIATION level (specific exercise, e.g. barbell_bench_press).
   *  Prefers the persisted `exercise_id` column; falls back to catalog-derived
   *  variationExerciseId(slot, kind) for legacy rows. Same as slotId when no
   *  variation is resolvable (bw movements, unknowns). */
  exerciseId: string;
  kind: Kind;
  date: string;
  sets: LoggedSet[];
}

interface WorkoutRow {
  date: string;
  workout_slots: {
    slot: string;
    slot_id: string | null;
    exercise_id: string | null;
    kind: Kind;
    position: number;
    workout_sets: { weight: string | null; reps: string | null; position: number }[] | null;
  }[] | null;
}

export async function fetchHistory(): Promise<HistorySlotEntry[]> {
  const { data, error } = await getSupabase()
    .from('workouts')
    .select('date, workout_slots(slot, slot_id, exercise_id, kind, position, workout_sets(weight, reps, position))')
    .eq('type', 'workout')
    .order('date', { ascending: false });
  if (error) throw error;

  const out: HistorySlotEntry[] = [];
  for (const w of (data ?? []) as WorkoutRow[]) {
    for (const s of w.workout_slots ?? []) {
      const sets = (s.workout_sets ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((x) => ({ w: x.weight ?? '', r: x.reps ?? '' }));
      if (!sets.length) continue;
      // Bridge old (name-only) and new (id-tagged) rows to a canonical id.
      const slotId = resolveExerciseId({ slot: s.slot, slotId: s.slot_id });
      // Prefer persisted exercise_id (variation); fall back to catalog-derived
      // resolution using slot+kind; ultimately fall back to slotId (movement).
      const exerciseIdResolved =
        s.exercise_id ??
        variationExerciseId(s.slot, s.kind) ??
        slotId;
      out.push({ slot: s.slot, slotId, exerciseId: exerciseIdResolved, kind: s.kind, date: w.date, sets });
    }
  }
  return out;
}

// Global per-exercise history: the most recent time this specific EXERCISE
// (movement + equipment variation) was logged. Preferring exact variation match
// so swapping Cable → Dumbbell no longer bleeds each other's history. Falls
// back to same-movement/same-kind, then same-movement/any-kind, so legacy rows
// without an exercise_id still show something useful.
//
// `variationId` is the resolved id for the CURRENT (slot, kind) pair as computed
// by variationExerciseId — pass null when you want movement-level matching only.
export function lastFor(
  history: HistorySlotEntry[],
  slot: string,
  kind: Kind,
  variationId?: string | null,
): LoggedSet[] | null {
  const movementId = exerciseId(slot);
  const targetVar = variationId ?? variationExerciseId(slot, kind) ?? null;

  let bestExactVar: LoggedSet[] | null = null;
  let bestExactVarT = -1;
  let bestSameKind: LoggedSet[] | null = null;
  let bestSameKindT = -1;
  let bestAny: LoggedSet[] | null = null;
  let bestAnyT = -1;

  for (const e of history) {
    if (e.slotId !== movementId) continue;
    const t = Date.parse(e.date) || 0;
    if (t > bestAnyT) {
      bestAnyT = t;
      bestAny = e.sets;
    }
    if (e.kind === kind && t > bestSameKindT) {
      bestSameKindT = t;
      bestSameKind = e.sets;
    }
    if (targetVar && e.exerciseId === targetVar && t > bestExactVarT) {
      bestExactVarT = t;
      bestExactVar = e.sets;
    }
  }
  // Prefer exact variation → same equipment kind → any kind (for legacy fallback).
  return bestExactVar || bestSameKind || bestAny;
}

// The equipment kind used in the MOST RECENT logged entry for this slot (any
// session/plan), or null if never logged. Used to reopen a workout on the same
// equipment tab the user last trained — "remember where I was".
export function lastKindFor(history: HistorySlotEntry[], slot: string): Kind | null {
  const id = exerciseId(slot);
  let best: Kind | null = null;
  let bestT = -1;
  for (const e of history) {
    if (e.slotId !== id) continue;
    const t = Date.parse(e.date) || 0;
    if (t > bestT) {
      bestT = t;
      best = e.kind;
    }
  }
  return best;
}

// Every equipment kind this slot has EVER been logged with — for badging the
// tabs that carry history.
export function kindsLoggedFor(history: HistorySlotEntry[], slot: string): Set<Kind> {
  const id = exerciseId(slot);
  const out = new Set<Kind>();
  for (const e of history) if (e.slotId === id) out.add(e.kind);
  return out;
}

export interface FinishedWorkout {
  clientId?: number;
  date: string;
  plan: string;
  sess: string;
  name: string;
  type?: 'workout' | 'rest';
  slots: LoggedSlot[];
}

// Saves a whole workout in ONE round-trip via the save_workout() RPC.
// Upserts on (user_id, client_id): passing the same clientId edits in place
// instead of creating a duplicate. Returns the workout id.
export async function finishWorkout(entry: FinishedWorkout): Promise<string> {
  const payload = {
    client_id: entry.clientId ?? null,
    date: entry.date,
    plan: entry.plan,
    sess: entry.sess,
    name: entry.name,
    type: entry.type ?? 'workout',
    slots: entry.slots.map((sl) => ({
      slot: sl.slot,
      slot_id: exerciseId(sl.slot),
      exercise_id: variationExerciseId(sl.slot, sl.kind),
      kind: sl.kind,
      done: sl.done,
      force: sl.force,
      sets: sl.sets.map((s) => ({
        weight: s.w,
        reps: s.r,
        rpe: (s as LoggedSet & { rpe?: number }).rpe ?? null,
      })),
    })),
  };
  const { data, error } = await getSupabase().rpc('save_workout', { payload });
  if (error) throw error;
  return data as string;
}

// Edit an existing workout in place by its id (Calendar "continue/edit a past
// workout"). Same one-round-trip RPC, keeps the original id/date.
export interface UpdateWorkout {
  id: string;
  date?: string;
  plan: string;
  sess: string;
  name: string;
  slots: LoggedSlot[];
}

export async function updateWorkout(entry: UpdateWorkout): Promise<string> {
  const payload = {
    id: entry.id,
    date: entry.date,
    plan: entry.plan,
    sess: entry.sess,
    name: entry.name,
    type: 'workout',
    slots: entry.slots.map((sl) => ({
      slot: sl.slot,
      slot_id: exerciseId(sl.slot),
      exercise_id: variationExerciseId(sl.slot, sl.kind),
      kind: sl.kind,
      done: sl.done,
      force: sl.force,
      sets: sl.sets.map((s) => ({
        weight: s.w,
        reps: s.r,
        rpe: (s as LoggedSet & { rpe?: number }).rpe ?? null,
      })),
    })),
  };
  const { data, error } = await getSupabase().rpc('save_workout', { payload });
  if (error) throw error;
  return data as string;
}
