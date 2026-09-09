// Full workout history (including rest markers), queried directly against
// Supabase via core's getSupabase(). core's own fetchHistory() only returns a flat
// per-slot view for the "last time" lookup — the Calendar, Home stats, and Progress
// screens need whole workouts (id, date, type, name, slots+sets), so we query for that
// shape here instead of duplicating/forking core's lastFor logic.
import { getSupabase } from '@gym-tracker/core';
import type { HistorySlotEntry, Kind, LoggedSlot } from '@gym-tracker/core';

export interface LoggedWorkout {
  id: string;
  date: string;
  plan: string;
  sess: string | null;
  name: string;
  type: 'workout' | 'rest';
  slots: LoggedSlot[];
}

interface WorkoutRow {
  id: string;
  date: string;
  plan: string;
  sess: string | null;
  name: string | null;
  type: string;
  workout_slots:
    | {
        slot: string;
        kind: Kind;
        position: number;
        done: boolean;
        force: boolean;
        workout_sets: { weight: string | null; reps: string | null; position: number }[] | null;
      }[]
    | null;
}

export async function fetchWorkouts(): Promise<LoggedWorkout[]> {
  const { data, error } = await getSupabase()
    .from('workouts')
    .select(
      'id, date, plan, sess, name, type, workout_slots(slot, kind, position, done, force, workout_sets(weight, reps, position))'
    )
    .order('date', { ascending: false });
  if (error) throw error;

  return ((data ?? []) as WorkoutRow[]).map((w) => ({
    id: w.id,
    date: w.date,
    plan: w.plan,
    sess: w.sess,
    name: w.name ?? '',
    type: (w.type as LoggedWorkout['type']) || 'workout',
    slots: (w.workout_slots ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((s) => ({
        slot: s.slot,
        kind: s.kind,
        done: s.done,
        force: s.force,
        sets: (s.workout_sets ?? [])
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((x) => ({ w: x.weight ?? '', r: x.reps ?? '' })),
      })),
  }));
}

// Flattens our full workout list into the shape core's lastFor() expects, so the
// Train screen's "last time" hints reuse core's logic instead of reimplementing it.
export function toHistorySlotEntries(history: LoggedWorkout[]): HistorySlotEntry[] {
  const out: HistorySlotEntry[] = [];
  for (const w of history) {
    if (w.type !== 'workout') continue;
    for (const s of w.slots) {
      if (!s.sets.length) continue;
      out.push({ slot: s.slot, kind: s.kind, date: w.date, sets: s.sets });
    }
  }
  return out;
}

export async function logDayMarker(date: string, type: 'rest'): Promise<void> {
  const { error } = await getSupabase()
    .from('workouts')
    .insert({ date, type, name: 'Rest', plan: 'gym' });
  if (error) throw error;
}

export async function removeWorkout(id: string): Promise<void> {
  const { error } = await getSupabase().from('workouts').delete().eq('id', id);
  if (error) throw error;
}

export interface UpdateWorkoutInput {
  plan: string;
  sess: string;
  name: string;
  slots: LoggedSlot[];
}

// Updates an existing workout in place (original app's "continue/edit a past workout").
// core's finishWorkout is insert-only, so this mirrors its slot/set insert loop but
// against a fixed workout id: replace the workout's slots (workout_sets cascade-delete
// with them via the FK) and reinsert fresh ones, keeping the original id/date intact.
export async function updateWorkout(id: string, entry: UpdateWorkoutInput): Promise<void> {
  const supabase = getSupabase();
  const { error: updErr } = await supabase
    .from('workouts')
    .update({ plan: entry.plan, sess: entry.sess, name: entry.name })
    .eq('id', id);
  if (updErr) throw updErr;

  const { error: delErr } = await supabase.from('workout_slots').delete().eq('workout_id', id);
  if (delErr) throw delErr;

  for (let i = 0; i < entry.slots.length; i++) {
    const sl = entry.slots[i];
    const { data: slotRow, error: slotErr } = await supabase
      .from('workout_slots')
      .insert({ workout_id: id, position: i, slot: sl.slot, kind: sl.kind, done: sl.done, force: sl.force })
      .select('id')
      .single();
    if (slotErr) throw slotErr;
    if (sl.sets.length) {
      const setsPayload = sl.sets.map((s, j) => ({ slot_id: slotRow.id, position: j, weight: s.w, reps: s.r }));
      const { error: setsErr } = await supabase.from('workout_sets').insert(setsPayload);
      if (setsErr) throw setsErr;
    }
  }
}
