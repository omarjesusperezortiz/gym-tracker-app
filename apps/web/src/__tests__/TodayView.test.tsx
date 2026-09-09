import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppStateProvider, useAppState } from '../state/AppState';
import { TodayView } from '../views/TodayView';
import type { FetchedRecommendation } from '../lib/reco';

vi.mock('../lib/useWorkouts', () => ({
  useWorkouts: () => ({ history: [], loading: false, error: null, refetch: vi.fn() }),
}));

const RECO: FetchedRecommendation = {
  date: new Date().toISOString().slice(0, 10),
  generatedAt: null,
  type: 'train',
  plan: 'gym',
  session: 'push',
  sessionName: 'Push',
  emoji: '🔴',
  title: 'Today: Push 🔴',
  reason: 'Push was your least-recently trained session.',
  exercises: ['Flat chest press', 'Overhead press'],
  stats: {},
};

vi.mock('../lib/reco', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/reco')>();
  return {
    ...actual,
    fetchRecommendation: vi.fn(async () => RECO),
  };
});

function ViewProbe() {
  const { state } = useAppState();
  return <div data-testid="view">{state.view}</div>;
}

describe('TodayView', () => {
  it('renders the recommended session, reason, and exercise list', async () => {
    render(
      <AppStateProvider>
        <TodayView />
        <ViewProbe />
      </AppStateProvider>
    );

    expect(await screen.findByText('Today: Push 🔴')).toBeInTheDocument();
    expect(screen.getByText('Push was your least-recently trained session.')).toBeInTheDocument();
    expect(screen.getByText('Flat chest press')).toBeInTheDocument();
    expect(screen.getByText('Overhead press')).toBeInTheDocument();
  });

  it('starting the workout opens Train for the recommended plan+session', async () => {
    const user = userEvent.setup();
    render(
      <AppStateProvider>
        <TodayView />
        <ViewProbe />
      </AppStateProvider>
    );

    const startBtn = await screen.findByText('Start this workout');
    await user.click(startBtn);

    expect(screen.getByTestId('view')).toHaveTextContent('train');
  });
});
