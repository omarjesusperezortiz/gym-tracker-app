// Travel sessions come in difficulty levels (easy / med / hard). The app picks
// one automatically from how many times the user has completed that split, and
// the user can override it per split from the session screen (state.travelLevel).
import type { Level, LevelKey, Session, Slot, WorkoutEntry } from '@gym-tracker/core';
import type { LoggedWorkout } from './workouts';

export const LEVEL_ORDER: LevelKey[] = ['easy', 'med', 'hard'];
export const LEVEL_LABEL: Record<LevelKey, string> = { easy: 'Easy', med: 'Medium', hard: 'Hard' };

type Levels = Session['levels'];
/** Accepts both core WorkoutEntry rows and the web app's LoggedWorkout. */
type HistoryRow = Pick<WorkoutEntry | LoggedWorkout, 'plan' | 'sess' | 'type'>;

// Before the 7-split collapse travel sessions were keyed `fullbody_med` etc.;
// strip the level suffix so that history still counts toward its split.
export function splitOf(sess: string): string {
  return sess.replace(/_(easy|med|hard)$/, '');
}

export function historyForSplit<T extends HistoryRow>(history: T[], split: string): T[] {
  return history.filter(
    (w) => w.plan === 'travel' && (w.type ?? 'workout') === 'workout' && splitOf(w.sess ?? '') === split
  );
}

export function availableLevels(levels: Levels): LevelKey[] {
  return LEVEL_ORDER.filter((k) => levels?.[k]);
}

// The wanted level if the session has it, else the closest one that exists
// (Pull has no hard → med; HIIT has no easy → med).
function nearest(wanted: LevelKey, available: LevelKey[]): LevelKey {
  if (available.includes(wanted)) return wanted;
  const at = LEVEL_ORDER.indexOf(wanted);
  const byDistance = [...available].sort(
    (a, b) => Math.abs(LEVEL_ORDER.indexOf(a) - at) - Math.abs(LEVEL_ORDER.indexOf(b) - at)
  );
  return byDistance[0] ?? wanted;
}

// 0–4 completed → easy, 5–14 → med, 15+ → hard.
export function autoLevel(historyForSplit: HistoryRow[], levels: Levels): LevelKey {
  const n = historyForSplit.length;
  const wanted: LevelKey = n >= 15 ? 'hard' : n >= 5 ? 'med' : 'easy';
  return nearest(wanted, availableLevels(levels));
}

export interface ResolvedLevel {
  level: LevelKey | null;
  isAuto: boolean;
  slots: Slot[];
  muscles: string;
}

// The level to train today: the user's stored override when the session still
// offers it, otherwise the auto pick. Sessions without levels pass through.
export function resolveLevel(
  session: Session,
  history: HistoryRow[],
  split: string,
  stored: LevelKey | undefined
): ResolvedLevel {
  const available = availableLevels(session.levels);
  if (!available.length) return { level: null, isAuto: false, slots: session.slots, muscles: session.muscles };
  const useStored = !!stored && available.includes(stored);
  const level = useStored ? stored! : autoLevel(historyForSplit(history, split), session.levels);
  const picked: Level | undefined = session.levels?.[level];
  return {
    level,
    isAuto: !useStored,
    slots: picked?.slots ?? session.slots,
    muscles: picked?.muscles ?? session.muscles,
  };
}
