import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { HeroTitle } from '../components/HeroTitle';
import { ExerciseGif } from '../components/ExerciseGif';
import '../styles/exercise-gif.css';
import { useAppState } from '../state/AppState';
import { useWorkouts } from '../lib/useWorkouts';
import { usePrefs } from '../lib/useProfileData';
import { fetchRecommendation, localRecoFallback, relTime, type FetchedRecommendation } from '../lib/reco';
import { humanDate } from '../lib/dates';
import { catalog } from '@gym-tracker/core';
import type { PlanKey } from '@gym-tracker/core';
import { IconChev } from '../lib/icons';

function isPlanKey(pk: string): pk is PlanKey {
  return pk in catalog.plans;
}

export function TodayView() {
  const { dispatch } = useAppState();
  const { history } = useWorkouts();
  // Focus muscles + goal steer the local fallback (the server recommendation,
  // when there is one, already accounts for them).
  const prefs = usePrefs().data ?? undefined;
  const [reco, setReco] = useState<FetchedRecommendation | null>(null);
  const [isFallback, setIsFallback] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchRecommendation().then((r) => {
      if (cancelled) return;
      if (r) {
        setReco(r);
        setIsFallback(false);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const active: FetchedRecommendation = reco ?? localRecoFallback(history, prefs);
  const today = new Date().toISOString().slice(0, 10);
  const stale = !!(active.date && active.date !== today);
  const updated = relTime(active.generatedAt);

  // Small uppercase subtitle under the editorial hero = the session's muscles,
  // pulled from the catalog when the recommendation points at a real session.
  const musclesSub =
    isPlanKey(active.plan) && catalog.plans[active.plan].sessions[active.session]
      ? catalog.plans[active.plan].sessions[active.session].muscles
      : undefined;
  const heroName = active.sessionName || active.session || 'Today';

  function openSession(pk: string, sk: string) {
    if (!isPlanKey(pk) || !catalog.plans[pk].sessions[sk]) return;
    dispatch({ type: 'OPEN_SESSION', plan: pk, sess: sk });
  }

  if (!loaded) {
    return (
      <div className="today-view">
        <div className="empty">Loading today's recommendation…</div>
      </div>
    );
  }

  return (
    <div className="today-view">
      <PageHeader title="Today" subtitle="Your recommended session for today." />
      {active.type === 'rest' ? (
        <div className="today-card rest">
          <div className="today-badge">
            {isFallback ? 'Suggested for today' : 'Recommended'}
            {stale ? ` · from ${humanDate(active.date)}` : ''}
          </div>
          <div className="today-emoji">{active.emoji || '😴'}</div>
          <HeroTitle primary="Rest" accent="Day" className="today-hero" />
          <div className="today-reason">{active.reason || 'Take it easy today — recovery matters.'}</div>
          <button
            className="btn sec today-cta"
            onClick={() => {
              const fb = localRecoFallback(history, prefs);
              openSession(fb.plan, fb.session);
            }}
          >
            Do a light session anyway
            <IconChev />
          </button>
        </div>
      ) : (
        <div className="today-card">
          <div className="today-badge">
            {isFallback ? 'Suggested for today' : 'Recommended'}
            {stale ? ` · from ${humanDate(active.date)}` : ''}
          </div>
          <HeroTitle primary={heroName} accent="Day" subtitle={musclesSub} className="today-hero" />
          <div className="today-reason">{active.reason || ''}</div>
          {(active.exercises || []).length > 0 && (
            <div className="today-exlist">
              {active.exercises.map((x, i) => (
                <div className="today-ex" key={x + i}>
                  <ExerciseGif name={x} size="thumb" hideWhenMissing />
                  <span className="today-exn">{i + 1}</span>
                  {x}
                </div>
              ))}
            </div>
          )}
          <button className="btn acc today-cta" onClick={() => openSession(active.plan, active.session)}>
            Start this workout
            <IconChev />
          </button>
        </div>
      )}
      {(updated || active.date) && (
        <div className="today-meta">
          {updated ? `Updated ${updated}` : ''}
          {updated && active.date ? ' · ' : ''}
          {active.date ? `for ${humanDate(active.date)}` : ''}
        </div>
      )}
    </div>
  );
}
