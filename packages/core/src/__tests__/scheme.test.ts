import { KIND_LABEL, fmtLast, isTimeScheme, parseTarget } from '../logic/scheme';
import type { Kind } from '../types';

describe('parseTarget', () => {
  it('extracts the set count from "N × reps" schemes', () => {
    expect(parseTarget('4 × 8–10')).toBe(4);
    expect(parseTarget('3 × 20')).toBe(3);
  });

  it('defaults to 3 when the scheme has no match', () => {
    expect(parseTarget('AMRAP')).toBe(3);
    expect(parseTarget('')).toBe(3);
  });
});

describe('isTimeScheme', () => {
  it('detects time-based schemes', () => {
    expect(isTimeScheme('3 × 40–60s')).toBe(true);
  });

  it('rejects rep-based schemes', () => {
    expect(isTimeScheme('4 × 8–10')).toBe(false);
  });

  it('treats undefined as not time-based', () => {
    expect(isTimeScheme(undefined)).toBe(false);
  });
});

describe('fmtLast', () => {
  it('formats a weighted set as weight (with unit) × reps', () => {
    expect(fmtLast({ w: '40', r: '8' }, true, false)).toBe('40kg × 8');
  });

  it('formats a bodyweight set as just reps', () => {
    expect(fmtLast({ w: '', r: '12' }, false, false)).toBe('12');
  });

  it('formats a time-based set with an "s" suffix', () => {
    expect(fmtLast({ w: '', r: '45' }, false, true)).toBe('45s');
  });

  it('returns an empty string when there is no set', () => {
    expect(fmtLast(undefined, true, false)).toBe('');
  });
});

describe('KIND_LABEL', () => {
  it('maps every Kind to its display label', () => {
    const expected: Record<Kind, string> = {
      bar: 'Barbell',
      cable: 'Cable',
      machine: 'Machine',
      db: 'Dumbbell',
      bw: 'Bodyweight',
    };
    expect(KIND_LABEL).toEqual(expected);
  });
});
