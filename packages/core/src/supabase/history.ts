import { getSupabase } from './client';
import type { Kind, LoggedSet, LoggedSlot } from '../types';
import { exerciseId, resolveExerciseId, variationExerciseId } from '../logic/exercise-id';

// One logged slot instance, flattened out of a workout — used for the global
// per-exercise "last time" lookup. Mirrors the web app's `lastFor`.
export interface HistorySlotEntry {
  slot: string; // display name (may be legacy-only on old rows)
  slotId: string; // resolved stable id (from slot_id, or derived from the name)
  kind: Kind;
  date: string;
  sets: LoggedSet[];
}

interface WorkoutRow {
  date: string;
  workout_slots: {
    slot: string;
    slot_id: string | null;
    kind: Kind;
    position: number;
    workout_sets: { weight: string | null; reps: string | null; position: number }[] | null;
  }[] | null;
}

export async function fetchHistory(): Promise<HistorySlotEntry[]> {
  const { data, error } = await getSupabase()
    .from('workouts')
    .select('date, workout_slots(slot, slot_id, kind, position, workout_sets(weight, reps, position))')
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
      out.push({ slot: s.slot, slotId, kind: s.kind, date: w.date, sets });
    }
  }
  return out;
}

// Global per-exercise history: the most recent time this exercise (slot) was
// logged, across ANY session/plan — preferring the same equipment kind, else any kind.
// Matches by stable exercise ID so it's rename-safe and bridges old/new rows.
export function lastFor(history: HistorySlotEntry[], slot: string, kind: Kind): LoggedSet[] | null {
  const id = exerciseId(slot);
  let bestSame: LoggedSet[] | null = null;
  let bestSameT = -1;
  let bestAny: LoggedSet[] | null = null;
  let bestAnyT = -1;
  for (const e of history) {
    if (e.slotId !== id) continue;
    const t = Date.parse(e.date) || 0;
    if (t > bestAnyT) {
      bestAnyT = t;
      bestAny = e.sets;
    }
    if (e.kind === kind && t > bestSameT) {
      bestSameT = t;
      bestSame = e.sets;
    }
  }
  return bestSame || bestAny;
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
