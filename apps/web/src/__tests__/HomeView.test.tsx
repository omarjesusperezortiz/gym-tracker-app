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
    expect(screen.getByText('⚡ Quick picks — broad sessions')).toBeInTheDocument();
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
