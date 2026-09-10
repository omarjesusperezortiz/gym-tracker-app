import { describe, expect, it } from 'vitest';
import { formatVolume, weekBounds, weeklyRecap } from '../lib/recap';
import type { LoggedWorkout } from '../lib/workouts';

// A fixed "now" mid-week: Wednesday 2026-01-07 (that week's Monday is 2026-01-05).
const NOW = new Date('2026-01-07T12:00:00');

function workout(
  slot: string,
  sets: { w: string; r: string }[],
  date: string,
  extra: Partial<LoggedWorkout> = {}
): LoggedWorkout {
  return {
    id: slot + date,
    date,
    plan: 'gym',
    sess: 'push',
    name: 'Push',
    type: 'workout',
    slots: [{ slot, kind: 'bar', done: true, force: false, sets }],
    ...extra,
  };
}

describe('weekBounds', () => {
  it('anchors to the Monday of the week containing now', () => {
    const { start, end } = weekBounds(NOW);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(5); // Monday
    expect(end.getDate()).toBe(12); // next Monday, exclusive
    expect(start.getHours()).toBe(0);
  });
});

describe('weeklyRecap', () => {
  it('counts workouts, tonnage and logged sets within the current week only', () => {
    const history: LoggedWorkout[] = [
      workout('Flat chest press', [{ w: '60', r: '8' }, { w: '60', r: '8' }], '2026-01-05T10:00:00'),
      workout('Squat', [{ w: '100', r: '5' }], '2026-01-06T10:00:00'),
      // Last week — must be excluded.
      workout('Flat chest press', [{ w: '55', r: '8' }], '2026-01-01T10:00:00'),
    ];
    const r = weeklyRecap(history, NOW);
    expect(r.workouts).toBe(2);
    expect(r.sets).toBe(3);
    // 60*8 + 60*8 + 100*5 = 1460
    expect(r.volumeKg).toBe(1460);
  });

  it('flags a new weight PR set this week vs. everything before it', () => {
    const history: LoggedWorkout[] = [
      workout('Squat', [{ w: '90', r: '5' }], '2025-12-20T10:00:00'),
      workout('Squat', [{ w: '110', r: '3' }], '2026-01-06T10:00:00'),
    ];
    const r = weeklyRecap(history, NOW);
    expect(r.prs).toHaveLength(1);
    expect(r.prs[0]).toMatchObject({ weight: 110, previous: 90 });
  });

  it('does not flag a PR when the week did not beat the prior best', () => {
    const history: LoggedWorkout[] = [
      workout('Squat', [{ w: '120', r: '5' }], '2025-12-20T10:00:00'),
      workout('Squat', [{ w: '110', r: '3' }], '2026-01-06T10:00:00'),
    ];
    expect(weeklyRecap(history, NOW).prs).toEqual([]);
  });

  it('counts a first-ever loaded lift as a PR (previous 0)', () => {
    const r = weeklyRecap([workout('Deadlift', [{ w: '140', r: '3' }], '2026-01-06T10:00:00')], NOW);
    expect(r.prs).toEqual([{ slot: 'Deadlift', weight: 140, previous: 0 }]);
  });

  it('ignores rest markers and empty sets for volume and count', () => {
    const history: LoggedWorkout[] = [
      { id: 'rest', date: '2026-01-06T10:00:00', plan: 'gym', sess: null, name: 'Rest', type: 'rest', slots: [] },
      workout('Plank', [{ w: '', r: '60' }], '2026-01-05T10:00:00'),
    ];
    const r = weeklyRecap(history, NOW);
    expect(r.workouts).toBe(1);
    expect(r.volumeKg).toBe(0); // timed work carries no tonnage
    expect(r.sets).toBe(1); // reps-only set still counts as logged
    expect(r.prs).toEqual([]); // no weight → no PR
  });

  it('returns an empty recap when there are no workouts this week', () => {
    const r = weeklyRecap([workout('Squat', [{ w: '90', r: '5' }], '2026-01-01T10:00:00')], NOW);
    expect(r.workouts).toBe(0);
    expect(r.volumeKg).toBe(0);
    expect(r.sets).toBe(0);
    expect(r.prs).toEqual([]);
  });
});

describe('formatVolume', () => {
  it('formats small and large tonnages compactly', () => {
    expect(formatVolume(800)).toBe('800 kg');
    expect(formatVolume(1460)).toBe('1.5k kg');
    expect(formatVolume(12450)).toBe('12k kg');
  });
});
