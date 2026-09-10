// Light gamification: a tasteful streak-milestone nudge for a personal tracker.
// No leaderboards, no social — just a friendly "you're on a 6-day streak, 1 day
// to your Consistent badge" with a compact milestone track. Self-contained and
// exported so a view (Home/Profile) can mount it with the user's real streak.
import { useMemo } from 'react';

export interface Milestone {
  days: number;
  name: string;
  emoji: string;
}

// The badge ladder. Personal, aspirational, capped at a month so it stays
// achievable rather than turning into an infinite grind.
export const STREAK_MILESTONES: Milestone[] = [
  { days: 3, name: 'Warming Up', emoji: '🔥' },
  { days: 7, name: 'Consistent', emoji: '⚡' },
  { days: 14, name: 'Committed', emoji: '💪' },
  { days: 30, name: 'Unstoppable', emoji: '🏆' },
];

export function nextMilestone(streak: number): Milestone | null {
  return STREAK_MILESTONES.find((m) => m.days > streak) ?? null;
}

export function earnedMilestone(streak: number): Milestone | null {
  let earned: Milestone | null = null;
  for (const m of STREAK_MILESTONES) if (streak >= m.days) earned = m;
  return earned;
}

function nudgeText(streak: number): string {
  if (streak <= 0) return 'Train today to start a streak.';
  const next = nextMilestone(streak);
  if (!next) return "You've maxed every badge — pure momentum now.";
  const left = next.days - streak;
  return `${left} ${left === 1 ? 'day' : 'days'} to your '${next.name}' badge`;
}

export function StreakMilestone({ streak, className }: { streak: number; className?: string }) {
  const earned = useMemo(() => earnedMilestone(streak), [streak]);
  const next = useMemo(() => nextMilestone(streak), [streak]);

  // Progress along the current segment (previous milestone → next milestone).
  const prevDays = earned?.days ?? 0;
  const span = next ? next.days - prevDays : 1;
  const pct = next ? Math.min(100, Math.max(0, ((streak - prevDays) / span) * 100)) : 100;

  const safeStreak = Math.max(0, streak);

  return (
    <div className={`streak-mile${className ? ` ${className}` : ''}`} role="group" aria-label="Streak milestones">
      <div className="streak-mile-top">
        <div className="streak-mile-count">
          <span className="streak-mile-flame" aria-hidden="true">
            {earned?.emoji ?? '🔥'}
          </span>
          <span className="streak-mile-num">{safeStreak}</span>
          <span className="streak-mile-lbl">day{safeStreak === 1 ? '' : 's'}</span>
        </div>
        <p className="streak-mile-nudge">
          {safeStreak > 0 ? (
            <>
              You're on a <b>{safeStreak}-day streak</b> — {nudgeText(safeStreak)}
            </>
          ) : (
            nudgeText(safeStreak)
          )}
        </p>
      </div>

      <div className="streak-mile-track" aria-hidden="true">
        <div className="streak-mile-fill" style={{ width: `${pct}%` }} />
        {STREAK_MILESTONES.map((m) => {
          const done = safeStreak >= m.days;
          const isNext = next?.days === m.days;
          return (
            <div
              key={m.days}
              className={`streak-mile-dot${done ? ' done' : ''}${isNext ? ' next' : ''}`}
              style={{ left: `${(m.days / STREAK_MILESTONES[STREAK_MILESTONES.length - 1].days) * 100}%` }}
              title={`${m.name} · ${m.days} days`}
            >
              <span className="streak-mile-dot-ic">{m.emoji}</span>
              <span className="streak-mile-dot-lbl">{m.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
