import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgressView } from '../views/ProgressView';
import { useWorkouts } from '../lib/useWorkouts';
import type { LoggedWorkout } from '../lib/workouts';

vi.mock('../lib/useWorkouts', () => ({ useWorkouts: vi.fn() }));

const HISTORY: LoggedWorkout[] = [
  {
    id: 'w1',
    date: '2026-01-01T12:00:00.000Z',
    plan: 'gym',
    sess: 'push',
    name: 'Push',
    type: 'workout',
    slots: [{ slot: 'Flat chest press', kind: 'bar', done: true, force: false, sets: [{ w: '60', r: '8' }] }],
  },
  {
    id: 'w2',
    date: '2026-01-08T12:00:00.000Z',
    plan: 'gym',
    sess: 'push',
    name: 'Push',
    type: 'workout',
    slots: [{ slot: 'Flat chest press', kind: 'bar', done: true, force: false, sets: [{ w: '70', r: '5' }] }],
  },
  {
    id: 'w3',
    date: '2026-01-15T12:00:00.000Z',
    plan: 'gym',
    sess: 'push',
    name: 'Push',
    type: 'workout',
    slots: [{ slot: 'Flat chest press', kind: 'bar', done: true, force: false, sets: [{ w: '65', r: '6' }] }],
  },
];

const mockedUseWorkouts = vi.mocked(useWorkouts);

beforeEach(() => {
  mockedUseWorkouts.mockReset();
});

describe('ProgressView', () => {
  it('shows the PR, last top set, and delta for the picked exercise', () => {
    mockedUseWorkouts.mockReturnValue({ history: HISTORY, loading: false, error: null, refetch: vi.fn() });
    render(<ProgressView />);

    expect(screen.getByRole('option', { name: 'Flat chest press' })).toBeInTheDocument();
    expect(screen.getByText('70kg')).toBeInTheDocument(); // PR best
    expect(screen.getByText('65kg')).toBeInTheDocument(); // last top set
    expect(screen.getByText('-5kg')).toBeInTheDocument(); // vs last time (down from the 70kg PR)
    expect(screen.getByText('3 sessions · Jan 1 → Jan 15')).toBeInTheDocument();
  });

  it('shows an empty state when nothing weighted has been logged', () => {
    mockedUseWorkouts.mockReturnValue({ history: [], loading: false, error: null, refetch: vi.fn() });
    render(<ProgressView />);
    expect(screen.getByText(/No weight logged yet/)).toBeInTheDocument();
  });
});
