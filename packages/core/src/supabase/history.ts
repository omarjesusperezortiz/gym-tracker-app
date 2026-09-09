import { getSupabase } from './client';
import type { Kind, LoggedSet, LoggedSlot } from '../types';

// One logged slot instance, flattened out of a workout — used for the global
// per-exercise "last time" lookup. Mirrors the web app's `lastFor`.
export interface HistorySlotEntry {
  slot: string;
  kind: Kind;
  date: string;
  sets: LoggedSet[];
}

interface WorkoutRow {
  date: string;
  workout_slots: {
    slot: string;
    kind: Kind;
    position: number;
    workout_sets: { weight: string | null; reps: string | null; position: number }[] | null;
  }[] | null;
}

export async function fetchHistory(): Promise<HistorySlotEntry[]> {
  const { data, error } = await getSupabase()
    .from('workouts')
    .select('date, workout_slots(slot, kind, position, workout_sets(weight, reps, position))')
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
      out.push({ slot: s.slot, kind: s.kind, date: w.date, sets });
    }
  }
  return out;
}

// Global per-exercise history: the most recent time this exercise (slot) was
// logged, across ANY session/plan — preferring the same equipment kind, else any kind.
export function lastFor(history: HistorySlotEntry[], slot: string, kind: Kind): LoggedSet[] | null {
  let bestSame: LoggedSet[] | null = null;
  let bestSameT = -1;
  let bestAny: LoggedSet[] | null = null;
  let bestAnyT = -1;
  for (const e of history) {
    if (e.slot !== slot) continue;
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

export interface FinishedWorkout {
  date: string;
  plan: string;
  sess: string;
  name: string;
  slots: LoggedSlot[];
}

export async function finishWorkout(entry: FinishedWorkout): Promise<string> {
  const { data: workout, error: workoutErr } = await getSupabase()
    .from('workouts')
    .insert({ date: entry.date, plan: entry.plan, sess: entry.sess, name: entry.name, type: 'workout' })
    .select('id')
    .single();
  if (workoutErr) throw workoutErr;
  const workoutId: string = workout.id;

  for (let i = 0; i < entry.slots.length; i++) {
    const sl = entry.slots[i];
    const { data: slotRow, error: slotErr } = await getSupabase()
      .from('workout_slots')
      .insert({ workout_id: workoutId, position: i, slot: sl.slot, kind: sl.kind, done: sl.done, force: sl.force })
      .select('id')
      .single();
    if (slotErr) throw slotErr;
    if (sl.sets.length) {
      const setsPayload = sl.sets.map((s, j) => ({ slot_id: slotRow.id, position: j, weight: s.w, reps: s.r }));
      const { error: setsErr } = await getSupabase().from('workout_sets').insert(setsPayload);
      if (setsErr) throw setsErr;
    }
  }
  return workoutId;
}
