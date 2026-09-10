import { describe, expect, it } from 'vitest';
import type { HistorySlotEntry } from '@gym-tracker/core';
import { bestWeight, computeStreak, progressionTarget, topEnteredWeight } from '../lib/progression';

describe('computeStreak', () => {
  const now = new Date('2026-09-10T12:00:00.000Z');

  it('counts consecutive days ending today', () => {
    expect(computeStreak(['2026-09-10', '2026-09-09', '2026-09-08'], now)).toBe(3);
  });

  it('still counts a streak that ran up to yesterday when today is empty', () => {
    expect(computeStreak(['2026-09-09', '2026-09-08'], now)).toBe(2);
  });

  it('stops at the first gap', () => {
    expect(computeStreak(['2026-09-10', '2026-09-08', '2026-09-07'], now)).toBe(1);
  });

  it('collapses multiple workouts on the same day and ignores the time part', () => {
    expect(
      computeStreak(['2026-09-10T07:00:00Z', '2026-09-10T18:00:00Z', '2026-09-09T09:00:00Z'], now)
    ).toBe(2);
  });

  it('is zero when nothing recent', () => {
    expect(computeStreak(['2026-09-01'], now)).toBe(0);
    expect(computeStreak([], now)).toBe(0);
  });
});

describe('bestWeight / topEnteredWeight', () => {
  const history: HistorySlotEntry[] = [
    { slot: 'Flat chest press', slotId: 'flat_chest_press', kind: 'bar', date: '2026-09-01', sets: [{ w: '60', r: '8' }, { w: '62.5', r: '6' }] },
    { slot: 'Flat chest press', slotId: 'flat_chest_press', kind: 'db', date: '2026-09-05', sets: [{ w: '55', r: '10' }] },
  ];

  it('finds the heaviest weight ever logged for an exercise, any kind', () => {
    expect(bestWeight(history, 'Flat chest press')).toBe(62.5);
  });

  it('is zero for an exercise with no history', () => {
    expect(bestWeight(history, 'Squat')).toBe(0);
  });

  it('reads the heaviest weight entered this session', () => {
    expect(topEnteredWeight([{ w: '40', r: '8' }, { w: '', r: '' }, { w: '65', r: '5' }])).toBe(65);
    expect(topEnteredWeight([{ w: '', r: '30' }])).toBe(0);
  });
});

describe('progressionTarget', () => {
  it('bumps weight by 2.5kg for barbell', () => {
    const s = progressionTarget('bar', { w: '40', r: '8' });
    expect(s).toMatchObject({ bump: 'weight', suggestedWeight: 42.5, primary: '42.5kg', alt: '+1 rep' });
  });

  it('bumps weight by 2.5kg for machine', () => {
    expect(progressionTarget('machine', { w: '50', r: '12' })?.suggestedWeight).toBe(52.5);
  });

  it('bumps reps for dumbbell (big weight jumps)', () => {
    const s = progressionTarget('db', { w: '22.5', r: '10' });
    expect(s).toMatchObject({ bump: 'reps', suggestedReps: 11, primary: '11 reps', suggestedWeight: 22.5 });
  });

  it('bumps reps for cable and bodyweight', () => {
    expect(progressionTarget('cable', { w: '30', r: '15' })?.bump).toBe('reps');
    expect(progressionTarget('bw', { w: '', r: '12' })).toMatchObject({ bump: 'reps', suggestedReps: 13 });
  });

  it('returns null when there is nothing to progress from', () => {
    expect(progressionTarget('bar', { w: '', r: '' })).toBeNull();
  });
});
