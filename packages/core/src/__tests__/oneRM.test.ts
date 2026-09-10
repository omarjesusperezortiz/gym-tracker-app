import { epley1RM, estimate1RM, bestE1RM } from '../logic/oneRM';
import type { MuscleHistoryEntry } from '../logic/muscleMap';

describe('epley1RM', () => {
  it('applies 1RM = weight × (1 + reps/30)', () => {
    expect(epley1RM(100, 5)).toBeCloseTo(116.667, 2);
    expect(epley1RM(60, 10)).toBeCloseTo(80, 5);
    expect(epley1RM(80, 8)).toBeCloseTo(101.333, 2);
  });

  it('returns the weight unchanged for a true single', () => {
    expect(epley1RM(120, 1)).toBe(120);
  });

  it('returns 0 for non-positive weight or reps', () => {
    expect(epley1RM(0, 5)).toBe(0);
    expect(epley1RM(100, 0)).toBe(0);
    expect(epley1RM(-50, 5)).toBe(0);
  });
});

describe('estimate1RM', () => {
  it('takes the best estimate across a set of working sets', () => {
    // 100×5 → 116.7 beats 90×8 → 114
    expect(estimate1RM([{ w: '90', r: '8' }, { w: '100', r: '5' }])).toBeCloseTo(116.667, 2);
  });

  it('returns null when no set carried both weight and reps', () => {
    expect(estimate1RM([{ w: '', r: '60' }])).toBeNull();
    expect(estimate1RM([])).toBeNull();
  });
});

function w(date: string, slot: string, sets: Array<{ w: string; r: string }>): MuscleHistoryEntry {
  return { date, type: 'workout', slots: [{ slot, sets }] };
}

describe('bestE1RM', () => {
  const history: MuscleHistoryEntry[] = [
    w('2026-01-01', 'Flat chest press', [{ w: '60', r: '10' }]), // 80
    w('2026-01-08', 'Flat chest press', [{ w: '70', r: '5' }]), // 81.67
    w('2026-01-15', 'Squat', [{ w: '100', r: '5' }]),
  ];

  it('finds the best estimate for a lift across all sessions', () => {
    expect(bestE1RM(history, 'Flat chest press')).toBeCloseTo(81.667, 2);
  });

  it('returns null for a lift with no weighted history', () => {
    expect(bestE1RM(history, 'Plank')).toBeNull();
  });
});
