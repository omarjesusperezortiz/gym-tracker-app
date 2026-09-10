import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { UserPrefs } from '@gym-tracker/core';
import { AppStateProvider } from '../state/AppState';
import { MealsView } from '../views/MealsView';
import { DEFAULT_PREFS } from '../lib/useProfileData';
import { withQueryClient } from '../test/queryClient';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } }, loading: false, signOut: vi.fn() }),
}));

let serverPrefs: UserPrefs = DEFAULT_PREFS;
let serverBodyweight: { id: string; date: string; weightKg: number; note: string | null }[] = [];

vi.mock('@gym-tracker/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gym-tracker/core')>();
  return {
    ...actual,
    fetchPrefs: vi.fn(async () => serverPrefs),
    fetchBodyweight: vi.fn(async () => serverBodyweight),
    fetchPersonalRecords: vi.fn(async () => []),
  };
});

function renderMeals() {
  return render(
    withQueryClient(
      <AppStateProvider>
        <MealsView />
      </AppStateProvider>
    )
  );
}

describe('MealsView', () => {
  it('derives a protein range + surplus from a build-muscle user with a weigh-in', async () => {
    serverPrefs = { ...DEFAULT_PREFS, goal: 'muscle', onboarded: true };
    serverBodyweight = [{ id: 'b1', date: '2026-09-08', weightKg: 80, note: null }];
    renderMeals();

    // 80 kg, muscle → 130–175 g protein, +250–350 kcal, 2.6 L water.
    expect(await screen.findByText('130–175')).toBeInTheDocument();
    expect(screen.getByText('+250–350 kcal')).toBeInTheDocument();
    expect(screen.getByText('2.6L')).toBeInTheDocument();
    expect(screen.getByText(/Build muscle with a small calorie surplus/)).toBeInTheDocument();
  });

  it('shows a deficit — never a surplus — for a lose-fat user', async () => {
    serverPrefs = { ...DEFAULT_PREFS, goal: 'fat_loss', onboarded: true };
    serverBodyweight = [{ id: 'b1', date: '2026-09-08', weightKg: 80, note: null }];
    renderMeals();

    expect(await screen.findByText('−300–500 kcal')).toBeInTheDocument();
    expect(screen.queryByText(/surplus/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Lose fat in a moderate deficit/)).toBeInTheDocument();
  });

  it('prompts for bodyweight instead of faking numbers when none is known', async () => {
    serverPrefs = { ...DEFAULT_PREFS, goal: 'muscle', goalWeightKg: null, onboarded: true };
    serverBodyweight = [];
    renderMeals();

    expect(await screen.findByText(/Add your bodyweight in/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument();
    // Calorie guidance is still shown (it's weight-independent).
    expect(screen.getByText('+250–350 kcal')).toBeInTheDocument();
  });

  it('has no skate/regional copy anywhere', async () => {
    serverPrefs = { ...DEFAULT_PREFS, goal: 'muscle', onboarded: true };
    serverBodyweight = [{ id: 'b1', date: '2026-09-08', weightKg: 80, note: null }];
    const { container } = renderMeals();

    await screen.findByText('130–175');
    const text = container.textContent ?? '';
    expect(text.toLowerCase()).not.toContain('skate');
    expect(text.toLowerCase()).not.toContain('pan con tomate');
    expect(text.toLowerCase()).not.toContain('legumbres');
    // Meal ideas are honestly labelled as an example, not a prescription.
    expect(screen.getByText('Example day')).toBeInTheDocument();
  });
});
