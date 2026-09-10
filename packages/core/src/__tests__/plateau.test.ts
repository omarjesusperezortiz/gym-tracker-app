import { detectPlateau, detectExercisePlateau, topSetSeries } from '../logic/plateau';
import type { MuscleHistoryEntry } from '../logic/muscleMap';

describe('detectPlateau', () => {
  it('flags a lift with no new best over its last 3 sessions', () => {
    // best is 80 early; last three (78, 80, 79) never exceed it.
    expect(detectPlateau([70, 75, 80, 78, 80, 79])).toBe(true);
  });

  it('does not flag a lift still setting new highs', () => {
    expect(detectPlateau([70, 75, 80, 82, 85])).toBe(false);
  });

  it('flags a perfectly flat lift', () => {
    expect(detectPlateau([100, 100, 100, 100])).toBe(true);
  });

  it('needs at least `window` sessions to judge', () => {
    expect(detectPlateau([80, 90])).toBe(false);
    expect(detectPlateau([100])).toBe(false);
  });

  it('respects a custom window size', () => {
    // last 2 (95, 94) beat nothing before the 100 → stalled with window 2.
    expect(detectPlateau([100, 95, 94], 2)).toBe(true);
    // but with the last 2 being 101, it's progressing.
    expect(detectPlateau([100, 95, 101], 2)).toBe(false);
  });
});

function w(date: string, slot: string, sets: Array<{ w: string; r: string }>): MuscleHistoryEntry {
  return { date, type: 'workout', slots: [{ slot, sets }] };
}

describe('topSetSeries + detectExercisePlateau', () => {
  const stalled: MuscleHistoryEntry[] = [
    w('2026-01-01', 'Bench', [{ w: '80', r: '5' }]),
    w('2026-01-08', 'Bench', [{ w: '80', r: '5' }]),
    w('2026-01-15', 'Bench', [{ w: '80', r: '4' }]),
  ];

  it('builds an oldest-first top-set series', () => {
    expect(topSetSeries(stalled, 'Bench').map((p) => p.top)).toEqual([80, 80, 80]);
  });

  it('detects a stalled exercise from full history', () => {
    const r = detectExercisePlateau(stalled, 'Bench');
    expect(r.stalled).toBe(true);
    expect(r.sessions).toBe(3);
    expect(r.bestWeight).toBe(80);
  });

  it('reports not stalled for a progressing lift', () => {
    const rising: MuscleHistoryEntry[] = [
      w('2026-01-01', 'Bench', [{ w: '80', r: '5' }]),
      w('2026-01-08', 'Bench', [{ w: '82.5', r: '5' }]),
      w('2026-01-15', 'Bench', [{ w: '85', r: '5' }]),
    ];
    expect(detectExercisePlateau(rising, 'Bench').stalled).toBe(false);
  });

  it('handles a lift with no weighted history gracefully', () => {
    const r = detectExercisePlateau([w('2026-01-01', 'Plank', [{ w: '', r: '60' }])], 'Plank');
    expect(r.stalled).toBe(false);
    expect(r.bestWeight).toBeNull();
  });
});
