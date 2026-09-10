// The weekly recap card shown near the top of Home. Summarises the current
// Mon–Sun week from full workout history; renders a tasteful glass card with
// lime accents when there's ≥1 workout, or a gentle nudge when the week is
// still empty. Presentation only — all figures come from the pure recap helper.
import { useMemo } from 'react';
import type { LoggedWorkout } from '../lib/workouts';
import { formatVolume, weekBounds, weeklyRecap } from '../lib/recap';
import { ShareCard } from './ShareCard';

interface WeeklyRecapCardProps {
  history: LoggedWorkout[];
  /** Optional nudge action when the week is empty. */
  onStart?: () => void;
}

function formatWeekLabel(now: Date): string {
  const { start, end } = weekBounds(now);
  const last = new Date(end);
  last.setDate(end.getDate() - 1);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(last)}`;
}

export function WeeklyRecapCard({ history, onStart }: WeeklyRecapCardProps) {
  const now = useMemo(() => new Date(), []);
  const recap = useMemo(() => weeklyRecap(history, now), [history, now]);
  const weekLabel = useMemo(() => formatWeekLabel(now), [now]);

  if (recap.workouts === 0) {
    return (
      <div className="recap-card recap-empty">
        <div className="recap-empty-icon" aria-hidden="true">🗓️</div>
        <div className="recap-empty-text">
          <div className="recap-empty-title">No workouts yet this week</div>
          <div className="recap-empty-sub">Log one session and your recap lights up here.</div>
        </div>
        {onStart && (
          <button className="btn acc recap-empty-btn" onClick={onStart}>
            Start a workout
          </button>
        )}
      </div>
    );
  }

  const prCount = recap.prs.length;

  return (
    <div className="recap-card">
      <div className="recap-head">
        <div>
          <div className="recap-title">
            <span className="recap-dot" /> This week
          </div>
          <div className="recap-range">{weekLabel}</div>
        </div>
        <ShareCard recap={recap} weekLabel={weekLabel} />
      </div>

      <div className="recap-grid">
        <div className="recap-tile recap-tile-hero">
          <div className="recap-tv">{recap.workouts}</div>
          <div className="recap-tl">{recap.workouts === 1 ? 'workout' : 'workouts'}</div>
        </div>
        <div className="recap-tile">
          <div className="recap-tv">{formatVolume(recap.volumeKg)}</div>
          <div className="recap-tl">volume</div>
        </div>
        <div className="recap-tile">
          <div className="recap-tv">{recap.sets}</div>
          <div className="recap-tl">sets</div>
        </div>
        <div className="recap-tile">
          <div className="recap-tv">
            {recap.streak}
            <span className="recap-fire"> 🔥</span>
          </div>
          <div className="recap-tl">day streak</div>
        </div>
      </div>

      {prCount > 0 && (
        <div className="recap-prs">
          <div className="recap-prs-label">
            {prCount} new PR{prCount === 1 ? '' : 's'} this week
          </div>
          <div className="recap-prs-list">
            {recap.prs.slice(0, 3).map((pr) => (
              <div className="recap-pr" key={pr.slot}>
                <span className="recap-pr-wt">{pr.weight}kg</span>
                <span className="recap-pr-name">{pr.slot}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
