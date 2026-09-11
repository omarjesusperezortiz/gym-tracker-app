import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { catalog } from '@gym-tracker/core';
import { AppStateProvider } from '../state/AppState';
import { HomeView } from '../views/HomeView';

vi.mock('../lib/useWorkouts', () => ({
  useWorkouts: () => ({ history: [], loading: false, error: null, refetch: vi.fn() }),
}));

vi.mock('../lib/useProfileData', () => ({
  usePrefs: () => ({ data: { displayName: 'Omar', avatar: 'lime' } }),
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
    // Group labels are now prefixed with the plan name, e.g. "Gym · Quick picks".
    expect(screen.getByText(/· Quick picks$/)).toBeInTheDocument();
    expect(screen.getByText(/· Focused$/)).toBeInTheDocument();
  });

  it('shows the welcome hero, the this-week stat strip, and mode cards', () => {
    const { container } = render(
      <AppStateProvider>
        <HomeView />
      </AppStateProvider>
    );

    // The hero badge greets by time of day (or "Welcome" on first run).
    expect(screen.getAllByText(/^(Good (morning|afternoon|evening)|Welcome)$/).length).toBeGreaterThan(0);
    // "Mode" section + the 3-stat this-week strip.
    expect(screen.getByText('Mode')).toBeInTheDocument();
    expect(screen.getByText('This week')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Day streak')).toBeInTheDocument();
    // Three mode cards.
    expect(container.querySelectorAll('.mode-card')).toHaveLength(Object.keys(catalog.plans).length);
  });

  it('shows a mode card for every plan in the catalog', () => {
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
