// Plateau detection — flags a lift whose best working weight hasn't set a new
// high across its most recent sessions, the cue for a deload or a rep change.
import type { MuscleHistoryEntry } from './muscleMap';

export interface TopSetPoint {
  date: string;
  top: number; // heaviest weight logged for the exercise that session
}

// Heaviest weight logged per session for one exercise, oldest first. Sessions
// with no weight (bodyweight/timed) are skipped.
export function topSetSeries(history: ReadonlyArray<MuscleHistoryEntry>, name: string): TopSetPoint[] {
  const pts: TopSetPoint[] = [];
  for (const w of history) {
    if (w.type && w.type !== 'workout') continue;
    for (const slot of w.slots) {
      if (slot.slot !== name) continue;
      const ws = slot.sets.map((x) => parseFloat(x.w)).filter((n) => !isNaN(n) && n > 0);
      if (ws.length) pts.push({ date: w.date, top: Math.max(...ws) });
    }
  }
  return pts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Given per-session top weights (oldest → newest), is the lift stalled? True
// when the most recent `window` sessions produced no new best over everything
// before them. Needs at least `window` sessions to judge.
export function detectPlateau(tops: ReadonlyArray<number>, window = 3): boolean {
  if (tops.length < window) return false;
  const recent = tops.slice(-window);
  const prior = tops.slice(0, -window);
  const priorBest = prior.length ? Math.max(...prior) : recent[0];
  const recentBest = Math.max(...recent);
  return recentBest <= priorBest;
}

export interface PlateauResult {
  stalled: boolean;
  sessions: number; // sessions considered (the window size, capped by history)
  bestWeight: number | null;
}

// Convenience wrapper over a full history for one exercise.
export function detectExercisePlateau(
  history: ReadonlyArray<MuscleHistoryEntry>,
  name: string,
  window = 3
): PlateauResult {
  const tops = topSetSeries(history, name).map((p) => p.top);
  return {
    stalled: detectPlateau(tops, window),
    sessions: Math.min(window, tops.length),
    bestWeight: tops.length ? Math.max(...tops) : null,
  };
}
