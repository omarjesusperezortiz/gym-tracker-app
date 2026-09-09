import { lastFor, type HistorySlotEntry } from '../supabase/history';

function entry(overrides: Partial<HistorySlotEntry>): HistorySlotEntry {
  return {
    slot: 'Flat chest press',
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
