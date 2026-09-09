import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserPrefs } from '@gym-tracker/core';
import { ToastProvider } from '../components/Toast';
import { ProfileView } from '../views/ProfileView';
import { DEFAULT_PREFS } from '../lib/useProfileData';
import { withQueryClient } from '../test/queryClient';

const signOut = vi.fn();

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } }, loading: false, signOut }),
}));

// Stateful stand-in for user_prefs: savePrefs persists, so the refetch that
// follows a mutation returns what was saved (like the real backend would).
// fetchPrefs always returns a complete row, so the fixture does too.
const BASE_PREFS: UserPrefs = {
  ...DEFAULT_PREFS,
  displayName: 'Sam',
  sex: 'male',
  birthYear: 1995,
  heightCm: 178,
  goalWeightKg: 84,
  goal: 'muscle',
  focusMuscles: ['chest'],
  onboarded: true,
};
let serverPrefs: UserPrefs = BASE_PREFS;

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
    savePrefs: vi.fn(async (patch: Partial<UserPrefs>) => {
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
  serverPrefs = BASE_PREFS;
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

  it('renders the onboarding fields, pre-filled from prefs', async () => {
    renderProfile();

    // About you — greeting uses the saved name, inputs hold the saved values.
    expect(await screen.findByText('Hey, Sam')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Sam');
    expect(screen.getByLabelText('Birth year')).toHaveValue(1995);
    expect(screen.getByLabelText('Height (cm)')).toHaveValue(178);
    expect(screen.getByLabelText('Goal weight (kg)')).toHaveValue(84);

    // Goal & focus, with the saved goal and focus chip switched on.
    expect(screen.getByRole('button', { name: /Build muscle/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Chest' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Legs' })).toHaveAttribute('aria-pressed', 'false');

    // Training.
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Days / week')).toBeInTheDocument();
    expect(screen.getByText('Equipment')).toBeInTheDocument();
  });

  it('saves a text field on blur, not on every keystroke', async () => {
    const user = userEvent.setup();
    renderProfile();

    // Wait for the prefs to land before editing, as a user would.
    expect(await screen.findByText('Hey, Sam')).toBeInTheDocument();
    const name = screen.getByLabelText('Name');
    await user.clear(name);
    await user.type(name, 'Sammy');
    // Typing five characters must not mean five writes.
    expect(core.savePrefs).not.toHaveBeenCalled();

    await user.tab();
    await waitFor(() => expect(core.savePrefs).toHaveBeenCalledTimes(1));
    expect(vi.mocked(core.savePrefs).mock.calls[0][0]).toEqual({ displayName: 'Sammy' });
  });

  it('commits a number field and parses it', async () => {
    const user = userEvent.setup();
    renderProfile();

    expect(await screen.findByText('Hey, Sam')).toBeInTheDocument();
    // number inputs don't support text selection in jsdom, so append a digit
    // rather than clearing: 178 → 1780.
    await user.type(screen.getByLabelText('Height (cm)'), '0');
    await user.tab();

    await waitFor(() => expect(core.savePrefs).toHaveBeenCalledTimes(1));
    expect(vi.mocked(core.savePrefs).mock.calls[0][0]).toEqual({ heightCm: 1780 });
  });

  it('toggles a focus muscle and saves the whole list', async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.click(await screen.findByRole('button', { name: 'Legs' }));

    await waitFor(() => expect(core.savePrefs).toHaveBeenCalledTimes(1));
    expect(vi.mocked(core.savePrefs).mock.calls[0][0]).toEqual({ focusMuscles: ['chest', 'legs'] });
  });

  it('picks a different goal', async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.click(await screen.findByRole('button', { name: /Get stronger/ }));

    await waitFor(() => expect(core.savePrefs).toHaveBeenCalledTimes(1));
    expect(vi.mocked(core.savePrefs).mock.calls[0][0]).toEqual({ goal: 'strength' });
  });

  it('sends you back through onboarding on request', async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.click(await screen.findByText('Redo onboarding'));

    await waitFor(() => expect(core.savePrefs).toHaveBeenCalledTimes(1));
    expect(vi.mocked(core.savePrefs).mock.calls[0][0]).toEqual({ onboarded: false });
  });
});
