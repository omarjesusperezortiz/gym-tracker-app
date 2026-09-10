// Weekly volume landmarks + recovery hints per muscle group.
//
// Landmarks are a deliberately simple, widely-cited heuristic for weekly hard
// sets per muscle: below maintenance, an optimal growth band, or a high load
// that may need managing. Recovery = days since a muscle was last trained.
import {
  MUSCLES,
  classifyMuscles,
  isLoggedSet,
  type Muscle,
  type MuscleHistoryEntry,
} from './muscleMap';

export type VolumeLandmark = 'below' | 'optimal' | 'high';

// <10 sets/wk = below, 10–20 = optimal, >20 = high.
export function classifyWeeklySets(setsPerWeek: number): VolumeLandmark {
  if (setsPerWeek < 10) return 'below';
  if (setsPerWeek <= 20) return 'optimal';
  return 'high';
}

export const LANDMARK_LABEL: Record<VolumeLandmark, string> = {
  below: 'below',
  optimal: 'optimal',
  high: 'high',
};

export interface WeeklyMuscleStat {
  muscle: Muscle;
  setsPerWeek: number; // rounded average hard sets per week over the window
  landmark: VolumeLandmark;
  lastTrained: string | null;
  daysSince: number | null; // whole days since last worked, relative to `now`
}

export interface WeeklyStatsOptions {
  now?: Date;
  weeks?: number; // trailing window length in weeks (default 1)
}

// Average weekly sets per muscle over the trailing `weeks` weeks ending at
// `now`, each classified against the landmarks, with a recovery figure. Every
// muscle is returned; callers filter to the ones actually trained.
export function weeklyMuscleStats(
  history: ReadonlyArray<MuscleHistoryEntry>,
  opts: WeeklyStatsOptions = {}
): WeeklyMuscleStat[] {
  const now = opts.now ?? new Date();
  const weeks = Math.max(1, opts.weeks ?? 1);
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - weeks * 7);

  const windowSets: Record<Muscle, number> = blank(0);
  const last: Record<Muscle, string | null> = blank(null) as Record<Muscle, string | null>;

  for (const w of history) {
    if (w.type && w.type !== 'workout') continue;
    const t = new Date(w.date);
    const inWindow = t >= windowStart && t <= now;
    for (const slot of w.slots) {
      const logged = slot.sets.filter(isLoggedSet).length;
      if (!logged) continue;
      for (const m of classifyMuscles(slot.slot)) {
        if (inWindow) windowSets[m] += logged;
        if (!last[m] || t.getTime() > new Date(last[m] as string).getTime()) last[m] = w.date;
      }
    }
  }

  return MUSCLES.map((muscle) => {
    const setsPerWeek = Math.round(windowSets[muscle] / weeks);
    const lastTrained = last[muscle];
    const daysSince =
      lastTrained == null
        ? null
        : Math.max(0, Math.floor((now.getTime() - new Date(lastTrained).getTime()) / 86_400_000));
    return { muscle, setsPerWeek, landmark: classifyWeeklySets(setsPerWeek), lastTrained, daysSince };
  });
}

function blank<T>(value: T): Record<Muscle, T> {
  return MUSCLES.reduce((acc, m) => {
    acc[m] = value;
    return acc;
  }, {} as Record<Muscle, T>);
}
