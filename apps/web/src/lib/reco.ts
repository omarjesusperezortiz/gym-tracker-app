import { catalog, getSupabase } from '@gym-tracker/core';
import type { PlanKey, Recommendation } from '@gym-tracker/core';
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

// Simple client-side pick when no server recommendation exists: the broad
// (push/pull/full-body) gym session that was trained longest ago (or never).
export function localRecoFallback(history: LoggedWorkout[]): FetchedRecommendation {
  const pk: PlanKey = catalog.plans.gym ? 'gym' : (Object.keys(catalog.plans)[0] as PlanKey);
  const sessions = catalog.plans[pk].sessions;
  const broad = Object.keys(sessions).filter((k) => (sessions[k].group || 'focused') === 'broad');
  const pool = broad.length ? broad : Object.keys(sessions);

  let best = pool[0];
  let bestDays = -1;
  pool.forEach((k) => {
    const last = history
      .filter((e) => e.type === 'workout' && e.plan === pk && e.sess === k)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const days = last ? Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000) : 9999;
    if (days > bestDays) {
      bestDays = days;
      best = k;
    }
  });
  const s = sessions[best];
  return {
    date: new Date().toISOString().slice(0, 10),
    generatedAt: null,
    type: 'train',
    plan: pk,
    session: best,
    sessionName: s.name,
    emoji: s.emoji,
    title: `Today: ${s.name} ${s.emoji || ''}`.trim(),
    reason:
      bestDays >= 9999
        ? `You haven't logged ${s.name} yet — good place to start.`
        : `${s.name} was your least-recently trained session (${bestDays} day${bestDays !== 1 ? 's' : ''} ago).`,
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
