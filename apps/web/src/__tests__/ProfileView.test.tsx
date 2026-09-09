import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../components/Toast';
import { ProfileView } from '../views/ProfileView';
import { withQueryClient } from '../test/queryClient';

const signOut = vi.fn();

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } }, loading: false, signOut }),
}));

// Stateful stand-in for user_prefs: savePrefs persists, so the refetch that
// follows a mutation returns what was saved (like the real backend would).
let serverPrefs = { units: 'kg' as 'kg' | 'lb', defaultPlan: 'gym', restSeconds: 90 };

vi.mock('@gym-tracker/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gym-tracker/core')>();
  return {
    ...actual,
    fetchPrefs: vi.fn(async () => serverPrefs),
    fetchBodyweight: vi.fn(async () => [
      { id: 'b1', date: '2026-09-01', weightKg: 80, note: null },
      { id: 'b2', date: '2026-09-08', weightKg: 81.5, note: null },
    ]),
    fetchPersonalRecords: vi.fn(async () => [
      { slot: 'Flat chest press', bestWeight: 90, bestVolume: 2400 },
      { slot: 'Squat', bestWeight: 120, bestVolume: 3600 },
    ]),
    logBodyweight: vi.fn(async () => {}),
    savePrefs: vi.fn(async (patch: Record<string, unknown>) => {
      serverPrefs = { ...serverPrefs, ...patch };
    }),
  };
});

const core = await import('@gym-tracker/core');

function renderProfile() {
  return render(
    withQueryClient(
      <ToastProvider>
        <ProfileView />
      </ToastProvider>
    )
  );
}

beforeEach(() => {
  serverPrefs = { units: 'kg', defaultPlan: 'gym', restSeconds: 90 };
  vi.mocked(core.logBodyweight).mockClear();
  vi.mocked(core.savePrefs).mockClear();
  signOut.mockClear();
});

describe('ProfileView', () => {
  it('renders every section: bodyweight, preferences, records, account', async () => {
    renderProfile();

    // Bodyweight: latest weigh-in, its trend vs the previous one, and the form.
    expect(await screen.findByText('81.5')).toBeInTheDocument();
    expect(screen.getByText(/\+1\.5 kg/)).toBeInTheDocument();
    expect(screen.getByLabelText('Weight in kg')).toBeInTheDocument();

    // Preferences.
    expect(screen.getByText('Units')).toBeInTheDocument();
    expect(screen.getByText('Default plan')).toBeInTheDocument();
    expect(screen.getByText('Rest timer')).toBeInTheDocument();

    // Records, sorted heaviest first.
    const prSlots = screen.getAllByText(/Squat|Flat chest press/).map((el) => el.textContent);
    expect(prSlots[0]).toBe('Squat');
    expect(screen.getByText('120 kg')).toBeInTheDocument();

    // Account.
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('logs a weigh-in and signs out', async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.type(await screen.findByLabelText('Weight in kg'), '82.4');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => expect(core.logBodyweight).toHaveBeenCalledTimes(1));
    expect(vi.mocked(core.logBodyweight).mock.calls[0][1]).toBeCloseTo(82.4);

    await user.click(screen.getByText('Log out'));
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('persists a preference change', async () => {
    const user = userEvent.setup();
    renderProfile();

    // Wait for the loaded prefs (kg) before switching, as a user would.
    expect(await screen.findByText('81.5')).toBeInTheDocument();
    await user.click(screen.getByText('lb'));

    await waitFor(() => expect(core.savePrefs).toHaveBeenCalledTimes(1));
    // mutationFn also receives TanStack's context arg, so assert on the payload.
    expect(vi.mocked(core.savePrefs).mock.calls[0][0]).toEqual({ units: 'lb' });
    // 81.5 kg shown in lb — and it stays that way through the post-write refetch.
    expect(await screen.findByText('179.7')).toBeInTheDocument();
  });

  it('shows empty states with no weigh-ins or records', async () => {
    vi.mocked(core.fetchBodyweight).mockResolvedValueOnce([]);
    vi.mocked(core.fetchPersonalRecords).mockResolvedValueOnce([]);
    renderProfile();

    expect(await screen.findByText(/No weigh-ins yet/)).toBeInTheDocument();
    expect(await screen.findByText(/No records yet/)).toBeInTheDocument();
  });
});
