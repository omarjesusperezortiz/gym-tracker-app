// Full-screen celebration shown when a workout is finished: headline, session
// name, a compact summary (exercises, sets, total volume, any new PRs) and the
// current day-streak as a big hero number with a flame. Purely presentational —
// all figures are computed by the caller (TrainView) from the just-logged sets.
import { useEffect } from 'react';

export interface CompletionSummary {
  sessionName: string;
  emoji: string;
  exercises: number;
  sets: number;
  /** Total tonnage in kg = sum of weight*reps across all logged sets. */
  volumeKg: number;
  /** Exercise names that set a new all-time best weight this session. */
  prs: string[];
  streak: number;
}

function fmtVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(kg >= 10000 ? 0 : 1)}t`;
  return `${Math.round(kg)}kg`;
}

export function CompletionCelebration({ summary, onDone }: { summary: CompletionSummary; onDone: () => void }) {
  // A finished workout is a natural "big moment" — a soft haptic if supported.
  useEffect(() => {
    try {
      navigator.vibrate?.([0, 40, 60, 40]);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="celebrate-overlay" role="dialog" aria-modal="true" aria-label="Workout complete">
      <div className="celebrate-card">
        <div className="cc-confetti" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>

        <div className="cc-eyebrow">✦ session complete</div>
        <h2 className="cc-head">Workout complete!</h2>
        <div className="cc-sub">
          {summary.emoji} {summary.sessionName}
        </div>

        <div className="cc-stats">
          <div className="cc-stat">
            <div className="cc-stat-v">{summary.exercises}</div>
            <div className="cc-stat-l">exercises</div>
          </div>
          <div className="cc-stat">
            <div className="cc-stat-v">{summary.sets}</div>
            <div className="cc-stat-l">sets</div>
          </div>
          <div className="cc-stat">
            <div className="cc-stat-v">{fmtVolume(summary.volumeKg)}</div>
            <div className="cc-stat-l">volume</div>
          </div>
        </div>

        {summary.prs.length > 0 && (
          <div className="cc-prs">
            <span className="cc-prs-badge">🏆 {summary.prs.length} new PR{summary.prs.length === 1 ? '' : 's'}</span>
            <span className="cc-prs-list">{summary.prs.join(' · ')}</span>
          </div>
        )}

        <div className="cc-streak">
          <div className="cc-flame">🔥</div>
          <div className="cc-streak-num">{summary.streak}</div>
          <div className="cc-streak-lbl">day{summary.streak === 1 ? '' : 's'} streak</div>
        </div>

        <button className="cc-done" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}
