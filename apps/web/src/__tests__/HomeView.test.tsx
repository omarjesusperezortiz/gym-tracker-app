import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { catalog } from '@gym-tracker/core';
import { AppStateProvider } from '../state/AppState';
import { HomeView } from '../views/HomeView';

vi.mock('../lib/useWorkouts', () => ({
  useWorkouts: () => ({ history: [], loading: false, error: null, refetch: vi.fn() }),
}));

describe('HomeView', () => {
  it('lists the gym plan sessions from the catalog, grouped broad vs focused', () => {
    render(
      <AppStateProvider>
        <HomeView />
      </AppStateProvider>
    );

    const gymSessions = Object.values(catalog.plans.gym.sessions);
    for (const session of gymSessions) {
      expect(screen.getByText(session.name)).toBeInTheDocument();
    }
    expect(screen.getByText('Quick picks')).toBeInTheDocument();
    expect(screen.getByText('Focused')).toBeInTheDocument();
  });

  it('greets the user and shows the active mode plus the glass stat tiles', () => {
    const { container } = render(
      <AppStateProvider>
        <HomeView />
      </AppStateProvider>
    );

    expect(screen.getByText(/^Good (morning|afternoon|evening)$/)).toBeInTheDocument();
    expect(screen.getByText(/mode · pick today's session below\./)).toBeInTheDocument();
    // Weekly stats now live in the WeeklyRecap card (the duplicate .cal-stats
    // tile row was removed); the empty-state recap shows a "this week" prompt.
    expect(container.querySelectorAll('.cal-stats .stat')).toHaveLength(0);
  });

  it('shows the plan picker for every plan in the catalog', () => {
    render(
      <AppStateProvider>
        <HomeView />
      </AppStateProvider>
    );
    for (const plan of Object.values(catalog.plans)) {
      expect(screen.getByText(plan.label)).toBeInTheDocument();
    }
  });
});
