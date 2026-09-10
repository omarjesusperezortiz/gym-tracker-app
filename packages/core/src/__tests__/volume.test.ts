import { classifyWeeklySets, weeklyMuscleStats } from '../logic/volume';
import type { MuscleHistoryEntry } from '../logic/muscleMap';

describe('classifyWeeklySets', () => {
  it('flags below-maintenance volume under 10 sets/wk', () => {
    expect(classifyWeeklySets(0)).toBe('below');
    expect(classifyWeeklySets(9)).toBe('below');
  });

  it('treats 10–20 sets/wk as the optimal band', () => {
    expect(classifyWeeklySets(10)).toBe('optimal');
    expect(classifyWeeklySets(14)).toBe('optimal');
    expect(classifyWeeklySets(20)).toBe('optimal');
  });

  it('flags high volume above 20 sets/wk', () => {
    expect(classifyWeeklySets(21)).toBe('high');
    expect(classifyWeeklySets(40)).toBe('high');
  });
});

function w(date: string, slot: string, sets: Array<{ w: string; r: string }>): MuscleHistoryEntry {
  return { date, type: 'workout', slots: [{ slot, sets }] };
}

describe('weeklyMuscleStats', () => {
  const now = new Date('2026-01-15T12:00:00.000Z');
  // 14 chest sets in the trailing week (optimal), plus an old session outside it.
  const chestSets = Array.from({ length: 14 }, () => ({ w: '60', r: '8' }));
  const history: MuscleHistoryEntry[] = [
    w('2026-01-12T12:00:00.000Z', 'Flat chest press', chestSets),
    w('2025-12-01T12:00:00.000Z', 'Squat', [{ w: '100', r: '5' }]), // outside window
  ];

  it('averages sets over the window and classifies vs landmarks', () => {
    const chest = weeklyMuscleStats(history, { now }).find((s) => s.muscle === 'chest')!;
    expect(chest.setsPerWeek).toBe(14);
    expect(chest.landmark).toBe('optimal');
  });

  it('excludes sessions outside the trailing window from the weekly count', () => {
    const quads = weeklyMuscleStats(history, { now }).find((s) => s.muscle === 'quads')!;
    expect(quads.setsPerWeek).toBe(0); // the squat is 6 weeks old
    expect(quads.landmark).toBe('below');
  });

  it('reports days since a muscle was last trained, regardless of window', () => {
    const stats = weeklyMuscleStats(history, { now });
    const chest = stats.find((s) => s.muscle === 'chest')!;
    const quads = stats.find((s) => s.muscle === 'quads')!;
    expect(chest.daysSince).toBe(3); // Jan 12 → Jan 15
    expect(quads.daysSince).toBe(45); // still tracked from the old session
  });

  it('leaves lastTrained/daysSince null for untrained muscles', () => {
    const calves = weeklyMuscleStats(history, { now }).find((s) => s.muscle === 'calves')!;
    expect(calves.lastTrained).toBeNull();
    expect(calves.daysSince).toBeNull();
  });

  it('spreads counts across a multi-week window', () => {
    const stats = weeklyMuscleStats(history, { now, weeks: 8 });
    const quads = stats.find((s) => s.muscle === 'quads')!;
    expect(quads.setsPerWeek).toBe(0); // 1 set / 8 weeks rounds to 0
  });
});
