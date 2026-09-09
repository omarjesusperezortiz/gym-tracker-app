// localStorage-backed draft state: which session is in progress, per-exercise
// equipment preference, and the last-selected plan. Finished workouts live in
// Supabase (see lib/workouts.ts) — only *unsaved* in-progress state is local.
export const LS_PLAN = 'gt_web_plan_v1';
export const LS_PREF = 'gt_web_pref_v1';
export const LS_DRAFT = 'gt_web_draft_v1';
export const LS_ONEOFF = 'gt_web_oneoff_v1';

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / unavailable — draft simply won't persist across reloads
  }
}
