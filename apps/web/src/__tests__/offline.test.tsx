// Offline-first: a workout logged while offline must be PAUSED (queued), the
// optimistic entry must stay in the cache, and it must replay when back online.
import { renderHook, waitFor, act } from '@testing-library/react';
import { onlineManager } from '@tanstack/react-query';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const finishWrite = vi.fn();
vi.mock('@gym-tracker/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gym-tracker/core')>();
  return { ...actual, finishWorkout: (v: unknown) => finishWrite(v) };
});
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } } }),
}));

const { fetchWorkouts } = await import('../lib/workouts');
vi.mock('../lib/workouts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/workouts')>();
  return { ...actual, fetchWorkouts: vi.fn(async () => []) };
});

import { useFinishWorkout } from '../lib/useWorkoutMutations';
import { useWorkouts } from '../lib/useWorkouts';
import { withQueryClient } from '../test/queryClient';
import { createQueryClient } from '../lib/queryClient';
import { registerMutationDefaults } from '../lib/mutationDefaults';
import type { FinishedWorkout } from '@gym-tracker/core';

const ENTRY: FinishedWorkout = {
  date: new Date().toISOString(),
  plan: 'gym',
  sess: 'push',
  name: 'Push',
  slots: [{ slot: 'Flat chest press', kind: 'bar', done: true, force: false, sets: [{ w: '60', r: '8' }] }],
};

describe('offline logging', () => {
  beforeEach(() => {
    finishWrite.mockReset();
    vi.mocked(fetchWorkouts).mockClear();
  });
  afterEach(() => onlineManager.setOnline(true));

  it('pauses the write while offline but keeps the optimistic entry visible', async () => {
    const client = createQueryClient();
    registerMutationDefaults(client);
    client.setDefaultOptions({
      queries: { retry: false, refetchOnWindowFocus: false, networkMode: 'offlineFirst' },
      mutations: { retry: false, networkMode: 'online' },
    });
    // Seed the shared workouts cache so the optimistic patch has an entry to
    // update (in the real app this comes from the persisted cache on load).
    client.setQueryData(['workouts', 'u1'], []);
    onlineManager.setOnline(false);

    const wrapper = ({ children }: { children: React.ReactNode }) => withQueryClient(children, client);
    const { result } = renderHook(
      () => ({ finish: useFinishWorkout(), workouts: useWorkouts() }),
      { wrapper }
    );

    act(() => {
      result.current.finish.mutate(ENTRY);
    });

    // Optimistic row is in the cache even though the write hasn't run.
    await waitFor(() => expect(result.current.workouts.history.length).toBe(1));
    expect(finishWrite).not.toHaveBeenCalled();

    // The mutation is queued (paused), not lost.
    expect(client.getMutationCache().getAll().some((m) => m.state.isPaused)).toBe(true);
  });
});
