import { useEffect, useState } from 'react';
import { useAppState } from '../state/AppState';
import { useWorkouts } from '../lib/useWorkouts';
import { fetchRecommendation, localRecoFallback, relTime, type FetchedRecommendation } from '../lib/reco';
import { catalog } from '@gym-tracker/core';
import type { PlanKey } from '@gym-tracker/core';
import { IconChev } from '../lib/icons';

function isPlanKey(pk: string): pk is PlanKey {
  return pk in catalog.plans;
}

export function TodayView() {
  const { dispatch } = useAppState();
  const { history } = useWorkouts();
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

  const active: FetchedRecommendation = reco ?? localRecoFallback(history);
  const today = new Date().toISOString().slice(0, 10);
  const stale = !!(active.date && active.date !== today);
  const updated = relTime(active.generatedAt);

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
      {active.type === 'rest' ? (
        <div className="today-card rest">
          <div className="today-badge">
            {isFallback ? 'Local suggestion' : 'Recommended'}
            {stale ? ` · from ${active.date}` : ''}
          </div>
          <div className="today-emoji">{active.emoji || '😴'}</div>
          <div className="today-title">{active.title || 'Rest day'}</div>
          <div className="today-reason">{active.reason || 'Take it easy today — recovery matters.'}</div>
          <button
            className="btn sec today-cta"
            onClick={() => {
              const fb = localRecoFallback(history);
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
            {isFallback ? 'Local suggestion' : 'Recommended'}
            {stale ? ` · from ${active.date}` : ''}
          </div>
          <div className="today-emoji">{active.emoji || '💪'}</div>
          <div className="today-title">{active.title || `Today: ${active.sessionName || active.session || ''}`}</div>
          <div className="today-reason">{active.reason || ''}</div>
          {(active.exercises || []).length > 0 && (
            <div className="today-exlist">
              {active.exercises.map((x, i) => (
                <div className="today-ex" key={x + i}>
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
          {active.date ? `for ${active.date}` : ''}
        </div>
      )}
    </div>
  );
}
