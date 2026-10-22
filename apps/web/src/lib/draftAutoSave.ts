// Unfinished workouts are auto-saved once their day has passed: a draft session
// is stamped with the local date of its first entered value, and a session whose
// stamp is an earlier day is written to history ON THAT DAY (not today), so it
// never doubles up with the next workout. Untouched drafts are just cleared.
import { catalog } from '@gym-tracker/core';
import type { FinishedWorkout, LoggedSlot } from '@gym-tracker/core';
import { effectiveValue } from './ghost';
import type { LiveMap } from '../state/AppState';

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

/** Sessions stamped on a day before `today` (YYYY-MM-DD strings sort as dates). */
export function staleSessions(dates: Record<string, string>, today: string): string[] {
  return Object.keys(dates).filter((s) => dates[s] < today);
}

/**
 * What an auto-save keeps: only sets the user actually did — a typed value or a
 * ticked set (a ticked set keeps the ghost value it showed). An exercise ticked
 * done is kept even with no set values, same as Finish.
 */
export function autoSaveSlots(live: LiveMap, keys: string[]): LoggedSlot[] {
  const out: LoggedSlot[] = [];
  for (const key of keys) {
    const st = live[key];
    if (!st) continue;
    const liveSets = st.sets ?? [];
    const sets = liveSets
      .map((x, j) => ({ typed: x.w !== '' || x.r !== '', done: !!x.done, j }))
      .filter((x) => x.typed || x.done)
      .map(({ j }) => ({ w: effectiveValue(liveSets, j, 'w'), r: effectiveValue(liveSets, j, 'r') }));
    if (!sets.length && !st.done) continue;
    out.push({ slot: key.split('|').slice(2).join('|'), kind: st.kind, done: st.done, force: !!st.force, sets });
  }
  return out;
}

/**
 * Stable client_id for one session's auto-save on one day. save_workout upserts
 * on (user_id, client_id), so a replayed or repeated auto-save edits the same row
 * instead of adding a second workout. 53-bit hash (cyrb53) → safe JS integer.
 */
export function autoSaveClientId(sessionKey: string, day: string): number {
  const str = `autosave|${sessionKey}|${day}`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * The workout to save for a stale draft session, or null when it holds no real
 * work. Dated local noon of the day it was started, so it lands on that day
 * whether a view buckets by local or UTC date.
 */
export function autoSaveEntry(live: LiveMap, keys: string[], sessionKey: string, day: string): FinishedWorkout | null {
  const slots = autoSaveSlots(live, keys);
  if (!slots.length) return null;
  const [plan, sess] = sessionKey.split('|');
  const name = catalog.plans[plan as keyof typeof catalog.plans]?.sessions[sess]?.name ?? sess;
  return {
    clientId: autoSaveClientId(sessionKey, day),
    date: new Date(`${day}T12:00:00`).toISOString(),
    plan,
    sess,
    name,
    slots,
    autoSaved: true,
  };
}
