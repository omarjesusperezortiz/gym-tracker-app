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
