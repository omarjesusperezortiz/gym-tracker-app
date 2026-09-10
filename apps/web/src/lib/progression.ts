// Pure helpers for the Train-experience upgrades: consecutive-day streaks, the
// "previous best" lookup that powers PR celebrations, and the next-target
// progression suggestion shown under each exercise. Kept framework-free and
// side-effect-free so they're trivially unit-testable.
import { exerciseId } from '@gym-tracker/core';
import type { HistorySlotEntry, Kind, LoggedSet } from '@gym-tracker/core';

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Consecutive-day training streak ending today (or continuing from yesterday if
// today hasn't been logged yet). Accepts any ISO date/timestamp strings; only
// the YYYY-MM-DD portion matters. Mirrors stats.calcStreak but works straight
// off a flat list of dates so the celebration screen and its test don't need to
// build a by-day map. `now` is injectable for deterministic tests.
export function computeStreak(isoDates: string[], now: Date = new Date()): number {
  const days = new Set(isoDates.map((d) => d.slice(0, 10)));
  let streak = 0;
  const cursor = new Date(now);
  const today = dayKey(now);
  for (;;) {
    const k = dayKey(cursor);
    if (days.has(k)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (k === today) {
      // Today not logged yet — the streak can still stand on yesterday.
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// Heaviest weight ever logged for an exercise (across every session/plan and
// equipment kind), in kg. 0 when it's never been loaded. Matches by stable id
// so it's rename-safe, like the rest of the history lookups.
export function bestWeight(history: HistorySlotEntry[], slot: string): number {
  const id = exerciseId(slot);
  let best = 0;
  for (const e of history) {
    if (e.slotId !== id) continue;
    for (const s of e.sets) {
      const w = parseFloat(s.w);
      if (!isNaN(w) && w > best) best = w;
    }
  }
  return best;
}

// The heaviest set the user actually entered this session for one exercise, kg.
// Used to decide, at a natural commit point, whether they just beat their PR.
export function topEnteredWeight(sets: { w: string; r: string }[]): number {
  let best = 0;
  for (const s of sets) {
    const w = parseFloat(s.w);
    if (!isNaN(w) && w > best) best = w;
  }
  return best;
}

// Barbell and machine work moves in fixed plate/pin steps, so the sensible
// nudge is +2.5 kg. Dumbbells (big jumps), cables and bodyweight progress more
// naturally by squeezing out one more rep.
const WEIGHT_BUMP_KINDS: Kind[] = ['bar', 'machine'];
export const WEIGHT_STEP_KG = 2.5;

export interface ProgressionSuggestion {
  /** Whether the suggested progression is more weight or more reps. */
  bump: 'weight' | 'reps';
  lastWeight: number | null;
  lastReps: number | null;
  /** Target weight when bumping load (else the same weight, or null if none). */
  suggestedWeight: number | null;
  /** Target reps when bumping reps (else the same reps, or null if none). */
  suggestedReps: number | null;
  /** Primary highlight, e.g. "42.5kg" or "9 reps". */
  primary: string;
  /** Optional secondary nudge, e.g. "+1 rep" alongside a weight bump. */
  alt?: string;
}

// Given the equipment kind and the reference set from last time, work out a
// sensible next target. Returns null when there's nothing to progress from.
export function progressionTarget(kind: Kind, last: LoggedSet): ProgressionSuggestion | null {
  const w = parseFloat(last.w);
  const r = parseFloat(last.r);
  const hasW = !isNaN(w) && w > 0;
  const hasR = !isNaN(r) && r > 0;
  if (!hasW && !hasR) return null;

  const bumpWeight = hasW && WEIGHT_BUMP_KINDS.includes(kind);
  if (bumpWeight) {
    const suggestedWeight = Math.round((w + WEIGHT_STEP_KG) * 100) / 100;
    return {
      bump: 'weight',
      lastWeight: w,
      lastReps: hasR ? r : null,
      suggestedWeight,
      suggestedReps: hasR ? r : null,
      primary: `${suggestedWeight}kg`,
      alt: hasR ? '+1 rep' : undefined,
    };
  }

  const suggestedReps = (hasR ? r : 0) + 1;
  return {
    bump: 'reps',
    lastWeight: hasW ? w : null,
    lastReps: hasR ? r : null,
    suggestedWeight: hasW ? w : null,
    suggestedReps,
    primary: `${suggestedReps} rep${suggestedReps === 1 ? '' : 's'}`,
    alt: undefined,
  };
}
