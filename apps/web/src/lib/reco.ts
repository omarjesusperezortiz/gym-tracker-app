import { catalog, getSupabase } from '@gym-tracker/core';
import type { Goal, MuscleGroup, PlanKey, Recommendation } from '@gym-tracker/core';
import type { LoggedWorkout } from './workouts';

export interface FetchedRecommendation extends Recommendation {
  generatedAt: string | null;
}

interface RecoRow {
  date: string;
  type: string;
  plan: string;
  session: string;
  session_name: string;
  emoji: string;
  title: string;
  reason: string;
  exercises: string[];
  stats: Record<string, number>;
  generated_at: string;
}

// Reads the current user's row from `recommendations` (one row per user, RLS-scoped).
// Never throws to the caller — Today falls back to the local heuristic on any failure.
export async function fetchRecommendation(): Promise<FetchedRecommendation | null> {
  try {
    const { data, error } = await getSupabase().from('recommendations').select('*').maybeSingle();
    if (error || !data) return null;
    const r = data as RecoRow;
    return {
      date: r.date,
      type: (r.type as Recommendation['type']) || 'train',
      plan: r.plan,
      session: r.session,
      sessionName: r.session_name,
      emoji: r.emoji,
      title: r.title,
      reason: r.reason,
      exercises: r.exercises || [],
      stats: r.stats || {},
      generatedAt: r.generated_at || null,
    };
  } catch {
    return null;
  }
}

// What the local fallback uses out of the user's prefs.
export interface RecoPrefs {
  goal: Goal;
  focusMuscles: MuscleGroup[];
}

const ALL_MUSCLES: MuscleGroup[] = ['chest', 'back', 'shoulders', 'arms', 'core', 'legs'];

// One rep-range nudge per goal, appended to the reason so the suggestion reads
// like it knows what the user is training for.
const GOAL_CUE: Record<Goal, string> = {
  muscle: 'Stay in the 8–12 range and chase the pump.',
  strength: 'Go heavy — low reps, long rests.',
  fat_loss: 'Keep rests short to hold the pace.',
  endurance: 'Higher reps, shorter rests.',
  maintain: 'Just keep it ticking over.',
};

const MUSCLE_LABEL: Record<MuscleGroup, string> = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  arms: 'arms',
  core: 'core',
  legs: 'legs',
};

// Which muscle groups a session trains, read off the catalog's own `muscles`
// blurb (e.g. "back·biceps·rear delts" → back, arms, shoulders) so it keeps
// working for sessions added later. "lower back" is core work, not back, hence
// the rename before the back check.
export function sessionMuscles(muscles: string): Set<MuscleGroup> {
  const s = muscles.toLowerCase().replace(/lower back/g, 'lumbar');
  if (/everything/.test(s)) return new Set(ALL_MUSCLES);
  const out = new Set<MuscleGroup>();
  if (/chest|pec/.test(s)) out.add('chest');
  if (/back|lats|traps/.test(s)) out.add('back');
  if (/shoulder|delt/.test(s)) out.add('shoulders');
  if (/arms|bicep|tricep|forearm/.test(s)) out.add('arms');
  if (/core|abs|oblique|lumbar/.test(s)) out.add('core');
  if (/legs|glute|quad|hamstring|calf|calves/.test(s)) out.add('legs');
  return out;
}

// A session where legs are most of the work (vs full-body, which merely
// includes them) — the thing to push down when legs aren't a focus.
function isLegHeavy(muscles: Set<MuscleGroup>): boolean {
  return muscles.has('legs') && muscles.size <= 2;
}

const NEVER = 9999;

// Client-side pick when no server recommendation exists. Base signal is still
// "what haven't you trained in the longest", biased by the user's focus muscles
// and goal:
//   • broad sessions are always candidates; a focused session (chest, arms, …)
//     joins the pool only when it hits one of the user's focus muscles
//   • covering more of the focus list scores higher
//   • leg-dominant sessions are pushed down unless legs are in the focus list
export function localRecoFallback(history: LoggedWorkout[], prefs?: RecoPrefs): FetchedRecommendation {
  const pk: PlanKey = catalog.plans.gym ? 'gym' : (Object.keys(catalog.plans)[0] as PlanKey);
  const sessions = catalog.plans[pk].sessions;
  const focus = prefs?.focusMuscles ?? [];
  const musclesOf = (k: string) => sessionMuscles(sessions[k].muscles);
  const hitsFocus = (k: string) => focus.filter((m) => musclesOf(k).has(m));

  const keys = Object.keys(sessions);
  const broad = keys.filter((k) => (sessions[k].group || 'focused') === 'broad');
  const focused = keys.filter((k) => (sessions[k].group || 'focused') !== 'broad' && hitsFocus(k).length > 0);
  const pool = broad.length ? [...broad, ...focused] : keys;

  const daysSince = (k: string) => {
    const last = history
      .filter((e) => e.type === 'workout' && e.plan === pk && e.sess === k)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return last ? Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000) : NEVER;
  };

  let best = pool[0];
  let bestScore = -Infinity;
  let bestDays = NEVER;
  pool.forEach((k) => {
    const days = daysSince(k);
    // Cap the staleness term so focus still counts for a long-neglected session,
    // but keep a big bonus for something never trained at all.
    let score = Math.min(days, 21) + (days >= NEVER ? 30 : 0);
    if (focus.length) score += (hitsFocus(k).length / focus.length) * 10;
    if (!focus.includes('legs') && isLegHeavy(musclesOf(k))) score -= 7;
    if (score > bestScore) {
      bestScore = score;
      best = k;
      bestDays = days;
    }
  });

  const s = sessions[best];
  const hits = hitsFocus(best);
  const parts = [
    bestDays >= NEVER
      ? `You haven't logged ${s.name} yet — good place to start.`
      : `${s.name} was your least-recently trained session (${bestDays} day${bestDays !== 1 ? 's' : ''} ago).`,
  ];
  if (hits.length) parts.push(`Hits your focus: ${hits.map((m) => MUSCLE_LABEL[m]).join(', ')}.`);
  if (prefs?.goal) parts.push(GOAL_CUE[prefs.goal]);

  return {
    date: new Date().toISOString().slice(0, 10),
    generatedAt: null,
    type: 'train',
    plan: pk,
    session: best,
    sessionName: s.name,
    emoji: s.emoji,
    title: `Today: ${s.name} ${s.emoji || ''}`.trim(),
    reason: parts.join(' '),
    exercises: (s.slots || []).map((sl) => sl[0]),
    stats: {},
  };
}

export function relTime(iso: string | null): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return null;
  const diffSec = Math.round((Date.now() - t) / 1000);
  if (diffSec < 60) return 'just now';
  const m = Math.round(diffSec / 60);
  if (m < 60) return `${m}m ago`;
  const hr = Math.round(m / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
}
