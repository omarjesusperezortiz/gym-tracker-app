import { lastFor, lastKindFor, kindsLoggedFor, type HistorySlotEntry } from '../supabase/history';
import { exerciseId } from '../logic/exercise-id';

function entry(overrides: Partial<HistorySlotEntry>): HistorySlotEntry {
  const slot = overrides.slot ?? 'Flat chest press';
  return {
    slot,
    slotId: overrides.slotId ?? exerciseId(slot),
    kind: 'bar',
    date: '2024-01-01',
    sets: [{ w: '40', r: '8' }],
    ...overrides,
  };
}

describe('lastFor', () => {
  it('returns the most recent sets for a slot regardless of other entries', () => {
    const history: HistorySlotEntry[] = [
      entry({ date: '2024-01-01', sets: [{ w: '40', r: '8' }] }),
      entry({ date: '2024-02-01', sets: [{ w: '45', r: '8' }] }),
      entry({ slot: 'Lat pulldown', date: '2024-03-01', sets: [{ w: '60', r: '10' }] }),
    ];
    expect(lastFor(history, 'Flat chest press', 'bar')).toEqual([{ w: '45', r: '8' }]);
  });

  it('prefers the same kind when present', () => {
    const history: HistorySlotEntry[] = [
      entry({ kind: 'db', date: '2024-03-01', sets: [{ w: '20', r: '10' }] }),
      entry({ kind: 'bar', date: '2024-01-01', sets: [{ w: '40', r: '8' }] }),
    ];
    expect(lastFor(history, 'Flat chest press', 'bar')).toEqual([{ w: '40', r: '8' }]);
  });

  it('falls back to any kind when the requested kind was never logged', () => {
    const history: HistorySlotEntry[] = [
      entry({ kind: 'db', date: '2024-01-01', sets: [{ w: '20', r: '10' }] }),
    ];
    expect(lastFor(history, 'Flat chest press', 'bar')).toEqual([{ w: '20', r: '10' }]);
  });

  it('returns null when the slot was never logged', () => {
    const history: HistorySlotEntry[] = [entry({ slot: 'Lat pulldown' })];
    expect(lastFor(history, 'Flat chest press', 'bar')).toBeNull();
  });

  it('picks by latest date even when the array order is shuffled', () => {
    const history: HistorySlotEntry[] = [
      entry({ date: '2024-05-01', sets: [{ w: '50', r: '6' }] }),
      entry({ date: '2024-01-01', sets: [{ w: '30', r: '10' }] }),
      entry({ date: '2024-09-01', sets: [{ w: '55', r: '5' }] }),
      entry({ date: '2024-03-01', sets: [{ w: '40', r: '8' }] }),
    ];
    expect(lastFor(history, 'Flat chest press', 'bar')).toEqual([{ w: '55', r: '5' }]);
  });
});

describe('lastKindFor', () => {
  it('returns the kind from the most recent entry for the slot', () => {
    const history: HistorySlotEntry[] = [
      entry({ kind: 'bar', date: '2024-01-01' }),
      entry({ kind: 'machine', date: '2024-05-01' }),
      entry({ kind: 'db', date: '2024-03-01' }),
    ];
    expect(lastKindFor(history, 'Flat chest press')).toBe('machine');
  });

  it('returns null when the slot was never logged', () => {
    expect(lastKindFor([entry({ slot: 'Lat pulldown' })], 'Flat chest press')).toBeNull();
  });
});

describe('kindsLoggedFor', () => {
  it('collects every distinct kind the slot was logged with', () => {
    const history: HistorySlotEntry[] = [
      entry({ kind: 'bar' }),
      entry({ kind: 'machine' }),
      entry({ kind: 'bar' }),
      entry({ slot: 'Lat pulldown', kind: 'cable' }),
    ];
    expect(kindsLoggedFor(history, 'Flat chest press')).toEqual(new Set(['bar', 'machine']));
  });

  it('is empty for a slot with no history', () => {
    expect(kindsLoggedFor([], 'Flat chest press').size).toBe(0);
  });
});
