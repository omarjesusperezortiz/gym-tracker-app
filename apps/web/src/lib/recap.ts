// Pure, framework-free helper that summarises the current Mon–Sun week from the
// full workout history: sessions trained, tonnage lifted, sets logged, any new
// weight PRs set this week, and the live training streak. Side-effect-free and
// `now`-injectable so it's trivially unit-testable.
import { exerciseId } from '@gym-tracker/core';
import type { LoggedWorkout } from './workouts';
import { workoutVolume } from './stats';
import { computeStreak } from './progression';

export interface WeekPR {
  /** Exercise display name. */
  slot: string;
  /** New heaviest weight logged this week, kg. */
  weight: number;
  /** Previous heaviest before this week, kg (0 if first-ever load). */
  previous: number;
}

export interface WeeklyRecap {
  /** Number of logged workouts (not rest markers) in the current week. */
  workouts: number;
  /** Total tonnage this week: Σ weight × reps, kg. */
  volumeKg: number;
  /** Sets actually logged (any weight or reps entered) this week. */
  sets: number;
  /** New weight PRs set this week, heaviest first. */
  prs: WeekPR[];
  /** Consecutive-day training streak ending today (or yesterday). */
  streak: number;
}

// Start (inclusive) and next-week start (exclusive) of the Mon–Sun week that
// contains `now`. Local time, midnight-aligned — matches stats.weekVolume.
export function weekBounds(now: Date): { start: Date; end: Date } {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

function isLogged(set: { w: string; r: string }): boolean {
  return set.w !== '' || set.r !== '';
}

// Heaviest weight logged for a stable exercise id across the given workouts.
function topWeightFor(workouts: LoggedWorkout[], id: string): number {
  let best = 0;
  for (const w of workouts) {
    if (w.type !== 'workout') continue;
    for (const s of w.slots) {
      if (exerciseId(s.slot) !== id) continue;
      for (const set of s.sets) {
        const v = parseFloat(set.w);
        if (!isNaN(v) && v > best) best = v;
      }
    }
  }
  return best;
}

// New weight PRs achieved in `weekWorkouts`: any exercise whose heaviest set
// this week beats its heaviest ever before this week. One entry per exercise
// (its best new lift), sorted heaviest-first. `priorWorkouts` is everything
// strictly before the week window.
function findWeekPRs(weekWorkouts: LoggedWorkout[], priorWorkouts: LoggedWorkout[]): WeekPR[] {
  const bestThisWeek = new Map<string, { slot: string; weight: number }>();
  for (const w of weekWorkouts) {
    if (w.type !== 'workout') continue;
    for (const s of w.slots) {
      const id = exerciseId(s.slot);
      for (const set of s.sets) {
        const v = parseFloat(set.w);
        if (isNaN(v) || v <= 0) continue;
        const cur = bestThisWeek.get(id);
        if (!cur || v > cur.weight) bestThisWeek.set(id, { slot: s.slot, weight: v });
      }
    }
  }

  const prs: WeekPR[] = [];
  for (const [id, { slot, weight }] of bestThisWeek) {
    const previous = topWeightFor(priorWorkouts, id);
    if (weight > previous) prs.push({ slot, weight, previous });
  }
  prs.sort((a, b) => b.weight - a.weight);
  return prs;
}

// Compute the whole week summary from full history. `now` defaults to the real
// clock; inject a fixed Date in tests.
export function weeklyRecap(history: LoggedWorkout[], now: Date = new Date()): WeeklyRecap {
  const { start, end } = weekBounds(now);
  const inWeek = (w: LoggedWorkout) => {
    const t = new Date(w.date);
    return t >= start && t < end;
  };

  const weekWorkouts = history.filter((w) => w.type === 'workout' && inWeek(w));
  const priorWorkouts = history.filter((w) => new Date(w.date) < start);

  let volumeKg = 0;
  let sets = 0;
  for (const w of weekWorkouts) {
    volumeKg += workoutVolume(w);
    for (const s of w.slots) sets += s.sets.filter(isLogged).length;
  }

  const streak = computeStreak(
    history.filter((w) => w.type === 'workout').map((w) => w.date),
    now
  );

  return {
    workouts: weekWorkouts.length,
    volumeKg: Math.round(volumeKg),
    sets,
    prs: findWeekPRs(weekWorkouts, priorWorkouts),
    streak,
  };
}

// Compact human-readable tonnage, e.g. 12,450 kg → "12.5k kg", 800 → "800 kg".
export function formatVolume(kg: number): string {
  if (kg >= 1000) {
    const k = kg / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1)}k kg`;
  }
  return `${kg} kg`;
}
