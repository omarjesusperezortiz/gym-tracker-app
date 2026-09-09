// The point of moving useWorkouts() onto TanStack Query: every view shares one
// cached fetch, so switching tabs doesn't hit the network again.
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorkouts } from '../lib/useWorkouts';
import { createTestQueryClient, withQueryClient } from '../test/queryClient';
import type { LoggedWorkout } from '../lib/workouts';

const HISTORY: LoggedWorkout[] = [
  {
    id: 'w1',
    date: '2026-01-01T12:00:00.000Z',
    plan: 'gym',
    sess: 'push',
    name: 'Push',
    type: 'workout',
    slots: [],
  },
];

vi.mock('../lib/workouts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/workouts')>();
  return { ...actual, fetchWorkouts: vi.fn(async () => HISTORY) };
});

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } }, loading: false, signOut: vi.fn() }),
}));

const { fetchWorkouts } = await import('../lib/workouts');

// Stands in for a view: mounts, reads the shared history, renders its count.
function Consumer({ label }: { label: string }) {
  const { history, loading } = useWorkouts();
  return <div data-testid={label}>{loading ? 'loading' : `${history.length}`}</div>;
}

beforeEach(() => {
  vi.mocked(fetchWorkouts).mockClear();
});

describe('useWorkouts shared cache', () => {
  it('fetches once no matter how many views consume it', async () => {
    const client = createTestQueryClient();
    render(
      withQueryClient(
        <>
          <Consumer label="today" />
          <Consumer label="home" />
          <Consumer label="calendar" />
          <Consumer label="progress" />
        </>,
        client
      )
    );

    await waitFor(() => expect(screen.getByTestId('progress')).toHaveTextContent('1'));
    expect(screen.getByTestId('today')).toHaveTextContent('1');
    expect(fetchWorkouts).toHaveBeenCalledTimes(1);
  });

  it('serves a remounted view (tab switch) from cache without refetching', async () => {
    const client = createTestQueryClient();
    const first = render(withQueryClient(<Consumer label="calendar" />, client));
    await waitFor(() => expect(screen.getByTestId('calendar')).toHaveTextContent('1'));
    expect(fetchWorkouts).toHaveBeenCalledTimes(1);

    // Leave the tab, come back: data is there on the first paint, no new fetch.
    first.unmount();
    render(withQueryClient(<Consumer label="calendar" />, client));

    expect(screen.getByTestId('calendar')).toHaveTextContent('1');
    expect(fetchWorkouts).toHaveBeenCalledTimes(1);
  });
});
