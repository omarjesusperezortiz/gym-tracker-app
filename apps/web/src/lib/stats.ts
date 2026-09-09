import type { LoggedWorkout } from './workouts';

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function weekCount(history: LoggedWorkout[]): number {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - day);
  return history.filter((e) => new Date(e.date) >= monday).length;
}

export function calcStreak(byDay: Record<string, LoggedWorkout[]>): number {
  let s = 0;
  const d = new Date();
  const today = dayKey(new Date());
  for (;;) {
    const k = dayKey(d);
    if (byDay[k]?.length) {
      s++;
      d.setDate(d.getDate() - 1);
    } else if (k === today) {
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return s;
}

export function groupByDay(history: LoggedWorkout[]): Record<string, LoggedWorkout[]> {
  const byDay: Record<string, LoggedWorkout[]> = {};
  history.forEach((e) => {
    const k = e.date.slice(0, 10);
    (byDay[k] = byDay[k] || []).push(e);
  });
  return byDay;
}

export interface ExercisePoint {
  date: string;
  top: number;
}

export function allExerciseNames(history: LoggedWorkout[]): string[] {
  const set = new Set<string>();
  history.forEach((e) => {
    if (e.type !== 'workout') return;
    (e.slots || []).forEach((s) => {
      if ((s.sets || []).some((x) => x.w !== '' && x.w != null && !isNaN(parseFloat(x.w)) && parseFloat(x.w) > 0)) {
        set.add(s.slot);
      }
    });
  });
  return Array.from(set).sort();
}

// ── Training volume (tonnage) ─────────────────────────────────
// weight × reps per set. Bodyweight and timed sets carry no load, so they add
// nothing here — that's what the muscle-balance set counts are for.
export function setVolume(set: { w: string; r: string }): number {
  const w = parseFloat(set.w);
  const r = parseFloat(set.r);
  if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) return 0;
  return w * r;
}

export function workoutVolume(workout: LoggedWorkout): number {
  if (workout.type !== 'workout') return 0;
  return workout.slots.reduce((total, slot) => total + slot.sets.reduce((sum, set) => sum + setVolume(set), 0), 0);
}

export interface VolumePoint {
  date: string;
  volume: number;
}

// One point per workout that actually moved weight, oldest first.
export function volumeSeries(history: LoggedWorkout[]): VolumePoint[] {
  return history
    .filter((w) => w.type === 'workout')
    .map((w) => ({ date: w.date, volume: workoutVolume(w) }))
    .filter((p) => p.volume > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Volume inside the Mon-Sun week `weeksAgo` weeks back (0 = this week).
export function weekVolume(history: LoggedWorkout[], weeksAgo = 0): number {
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) - weeksAgo * 7);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  return history.reduce((total, w) => {
    const t = new Date(w.date);
    return t >= monday && t < nextMonday ? total + workoutVolume(w) : total;
  }, 0);
}

// ── Muscle balance ───────────────────────────────────────────
export type MuscleGroup = 'push' | 'pull' | 'legs' | 'core' | 'other';

export const MUSCLE_GROUPS: MuscleGroup[] = ['push', 'pull', 'legs', 'core'];

// Slot names come from the catalog, so keyword rules cover them exactly (all 30
// current names classify correctly — see stats.test.ts). Order matters: "Pallof
// Press" is core, not a press; "Calf raise" is legs, not a "leg raise". And the
// keywords have to be picky: matching a bare "lat" would make "fLAT chest
// press" a pull, so lat work is caught by "pull" (lat pullover, vertical pull).
export function classifyMuscleGroup(slot: string): MuscleGroup {
  const s = slot.toLowerCase();
  if (/plank|crunch|russian twist|leg raise|pallof|core/.test(s)) return 'core';
  if (/squat|lunge|hamstring|rdl|calf|leg press|glute/.test(s)) return 'legs';
  if (/row|pull|curl|rear delt|shrug|forearm|wrist/.test(s)) return 'pull';
  if (/press|dip|fly|lateral raise|front raise|triceps|push/.test(s)) return 'push';
  return 'other';
}

export interface MuscleShare {
  group: MuscleGroup;
  sets: number;
  share: number;
}

// Sets logged per group — sets, not tonnage, so planks and pull-ups count.
export function muscleBalance(history: LoggedWorkout[]): MuscleShare[] {
  const counts: Record<MuscleGroup, number> = { push: 0, pull: 0, legs: 0, core: 0, other: 0 };
  history.forEach((w) => {
    if (w.type !== 'workout') return;
    w.slots.forEach((slot) => {
      const logged = slot.sets.filter((set) => set.w !== '' || set.r !== '').length;
      if (logged) counts[classifyMuscleGroup(slot.slot)] += logged;
    });
  });
  const total = MUSCLE_GROUPS.reduce((sum, g) => sum + counts[g], 0);
  return MUSCLE_GROUPS.map((group) => ({
    group,
    sets: counts[group],
    share: total ? counts[group] / total : 0,
  }));
}

export function exerciseSeries(history: LoggedWorkout[], name: string): ExercisePoint[] {
  const pts: ExercisePoint[] = [];
  history.forEach((e) => {
    if (e.type !== 'workout') return;
    (e.slots || []).forEach((s) => {
      if (s.slot !== name) return;
      const ws = (s.sets || []).map((x) => parseFloat(x.w)).filter((n) => !isNaN(n) && n > 0);
      if (!ws.length) return;
      pts.push({ date: e.date, top: Math.max(...ws) });
    });
  });
  pts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return pts;
}
