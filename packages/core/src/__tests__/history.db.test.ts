import { makeQueryBuilder } from '../testUtils/mockSupabase';

const mockFrom = jest.fn();
const mockRpc = jest.fn();
jest.mock('../supabase/client', () => ({
  getSupabase: () => ({ from: mockFrom, rpc: mockRpc }),
}));

import { fetchHistory, finishWorkout } from '../supabase/history';

beforeEach(() => {
  mockFrom.mockReset();
  mockRpc.mockReset();
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
  it('sends the whole workout as one save_workout RPC payload and returns the id', async () => {
    mockRpc.mockResolvedValue({ data: 'workout-1', error: null });

    const id = await finishWorkout({
      clientId: 123,
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
    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledWith('save_workout', {
      payload: {
        client_id: 123,
        date: '2024-02-01',
        plan: 'gym',
        sess: 'push',
        name: 'Push day',
        type: 'workout',
        slots: [
          {
            slot: 'Flat chest press',
            kind: 'bar',
            done: true,
            force: false,
            sets: [
              { weight: '40', reps: '8', rpe: null },
              { weight: '42', reps: '8', rpe: null },
            ],
          },
          { slot: 'Lateral raise', kind: 'db', done: true, force: false, sets: [] },
        ],
      },
    });
  });

  it('throws when the save_workout RPC fails', async () => {
    mockRpc.mockResolvedValue({ data: null, error: new Error('rpc failed') });

    await expect(
      finishWorkout({ date: '2024-02-01', plan: 'gym', sess: 'push', name: 'Push day', slots: [] })
    ).rejects.toThrow('rpc failed');
  });
});
