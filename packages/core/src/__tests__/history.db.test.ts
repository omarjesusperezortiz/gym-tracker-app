import { makeQueryBuilder } from '../testUtils/mockSupabase';

const mockFrom = jest.fn();
jest.mock('../supabase/client', () => ({
  getSupabase: () => ({ from: mockFrom }),
}));

import { fetchHistory, finishWorkout } from '../supabase/history';

beforeEach(() => {
  mockFrom.mockReset();
});

describe('fetchHistory', () => {
  it('flattens workouts→slots→sets, sorts sets by position, and drops slots with no sets', async () => {
    mockFrom.mockReturnValue(
      makeQueryBuilder({
        data: [
          {
            date: '2024-02-01',
            workout_slots: [
              {
                slot: 'Flat chest press',
                kind: 'bar',
                position: 0,
                workout_sets: [
                  { weight: '40', reps: '8', position: 1 },
                  { weight: '35', reps: '8', position: 0 },
                ],
              },
              {
                slot: 'Empty exercise',
                kind: 'bar',
                position: 1,
                workout_sets: [],
              },
              {
                slot: 'No sets column',
                kind: 'bar',
                position: 2,
                workout_sets: null,
              },
            ],
          },
        ],
        error: null,
      })
    );

    const result = await fetchHistory();

    expect(mockFrom).toHaveBeenCalledWith('workouts');
    expect(result).toEqual([
      {
        slot: 'Flat chest press',
        kind: 'bar',
        date: '2024-02-01',
        sets: [
          { w: '35', r: '8' },
          { w: '40', r: '8' },
        ],
      },
    ]);
  });

  it('throws when the query returns an error', async () => {
    const dbError = new Error('boom');
    mockFrom.mockReturnValue(makeQueryBuilder({ data: null, error: dbError }));

    await expect(fetchHistory()).rejects.toThrow('boom');
  });
});

describe('finishWorkout', () => {
  it('inserts the workout, a slot per entry, and the sets payload, then returns the workout id', async () => {
    const workoutBuilder = makeQueryBuilder({ data: { id: 'workout-1' }, error: null });
    const slotBuilder = makeQueryBuilder({ data: { id: 'slot-1' }, error: null });
    const setsBuilder = makeQueryBuilder({ data: null, error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'workouts') return workoutBuilder;
      if (table === 'workout_slots') return slotBuilder;
      if (table === 'workout_sets') return setsBuilder;
      throw new Error(`unexpected table ${table}`);
    });

    const id = await finishWorkout({
      date: '2024-02-01',
      plan: 'gym',
      sess: 'push',
      name: 'Push day',
      slots: [
        { slot: 'Flat chest press', kind: 'bar', done: true, force: false, sets: [{ w: '40', r: '8' }, { w: '42', r: '8' }] },
        { slot: 'Lateral raise', kind: 'db', done: true, force: false, sets: [] },
      ],
    });

    expect(id).toBe('workout-1');
    expect(mockFrom).toHaveBeenCalledWith('workouts');
    expect(workoutBuilder.insert).toHaveBeenCalledWith({
      date: '2024-02-01',
      plan: 'gym',
      sess: 'push',
      name: 'Push day',
      type: 'workout',
    });

    expect(slotBuilder.insert).toHaveBeenNthCalledWith(1, {
      workout_id: 'workout-1',
      position: 0,
      slot: 'Flat chest press',
      kind: 'bar',
      done: true,
      force: false,
    });
    expect(slotBuilder.insert).toHaveBeenNthCalledWith(2, {
      workout_id: 'workout-1',
      position: 1,
      slot: 'Lateral raise',
      kind: 'db',
      done: true,
      force: false,
    });

    expect(setsBuilder.insert).toHaveBeenCalledTimes(1);
    expect(setsBuilder.insert).toHaveBeenCalledWith([
      { slot_id: 'slot-1', position: 0, weight: '40', reps: '8' },
      { slot_id: 'slot-1', position: 1, weight: '42', reps: '8' },
    ]);
  });

  it('throws when the workout insert fails', async () => {
    const insertError = new Error('insert failed');
    mockFrom.mockReturnValue(makeQueryBuilder({ data: null, error: insertError }));

    await expect(
      finishWorkout({ date: '2024-02-01', plan: 'gym', sess: 'push', name: 'Push day', slots: [] })
    ).rejects.toThrow('insert failed');
  });
});
