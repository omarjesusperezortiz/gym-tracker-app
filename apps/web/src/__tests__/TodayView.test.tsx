import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppStateProvider, useAppState } from '../state/AppState';
import { TodayView } from '../views/TodayView';
import { DEFAULT_PREFS } from '../lib/useProfileData';
import { withQueryClient } from '../test/queryClient';
import type { FetchedRecommendation } from '../lib/reco';

vi.mock('../lib/useWorkouts', () => ({
  useWorkouts: () => ({ history: [], loading: false, error: null, refetch: vi.fn() }),
}));

// TodayView reads prefs so the local fallback can bias toward focus muscles.
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } }, loading: false, signOut: vi.fn() }),
}));

vi.mock('@gym-tracker/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gym-tracker/core')>();
  return {
    ...actual,
    fetchPrefs: vi.fn(async () => ({ ...DEFAULT_PREFS, goal: 'strength' as const, focusMuscles: ['chest' as const], onboarded: true })),
  };
});

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

function renderToday() {
  return render(
    withQueryClient(
      <AppStateProvider>
        <TodayView />
        <ViewProbe />
      </AppStateProvider>
    )
  );
}

describe('TodayView', () => {
  it('renders the recommended session, reason, and exercise list', async () => {
    renderToday();

    expect(await screen.findByText('Push')).toBeInTheDocument();
    expect(screen.getByText('Day.')).toBeInTheDocument();
    expect(screen.getByText('Push was your least-recently trained session.')).toBeInTheDocument();
    expect(screen.getByText('Flat chest press')).toBeInTheDocument();
    expect(screen.getByText('Overhead press')).toBeInTheDocument();
  });

  it('starting the workout opens Train for the recommended plan+session', async () => {
    const user = userEvent.setup();
    renderToday();

    const startBtn = await screen.findByText('Start this workout');
    await user.click(startBtn);

    expect(screen.getByTestId('view')).toHaveTextContent('train');
  });

  it('personalises the local fallback with the user s focus and goal', async () => {
    // No server recommendation → the local fallback runs, and it should have
    // received the prefs this view reads (focus: chest, goal: strength).
    const reco = await import('../lib/reco');
    vi.mocked(reco.fetchRecommendation).mockResolvedValueOnce(null);

    renderToday();

    expect(await screen.findByText(/Hits your focus: chest\./)).toBeInTheDocument();
    expect(screen.getByText(/heavy — low reps/)).toBeInTheDocument();
  });
});
