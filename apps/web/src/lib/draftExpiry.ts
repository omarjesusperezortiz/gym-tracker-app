// Unfinished workouts expire at local midnight: a draft session is stamped with
// the local date of its first entered value, and any session whose stamp isn't
// today is discarded (no prompt, nothing written to history).

/** Local calendar date as YYYY-MM-DD (not UTC). */
export function localDateKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Milliseconds from `now` until the next local midnight. */
export function msUntilNextMidnight(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

/** `${plan}|${sess}` for a live key `${plan}|${sess}|${slot}`. */
export function sessionKeyOf(liveKey: string): string {
  const [plan, sess] = liveKey.split('|');
  return `${plan}|${sess}`;
}

/** Live keys grouped by session. */
export function liveKeysBySession(live: Record<string, unknown>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const k of Object.keys(live)) (out[sessionKeyOf(k)] ??= []).push(k);
  return out;
}

/** Sessions stamped on a day other than `today`. */
export function staleSessions(dates: Record<string, string>, today: string): string[] {
  return Object.keys(dates).filter((s) => dates[s] !== today);
}
