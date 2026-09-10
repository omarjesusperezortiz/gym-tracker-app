import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserPrefs } from '@gym-tracker/core';
import { AppStateProvider } from '../state/AppState';
import { ToastProvider } from '../components/Toast';
import { Onboarding } from '../onboarding/Onboarding';
import { OnboardingGate } from '../onboarding/OnboardingGate';
import { DEFAULT_PREFS } from '../lib/useProfileData';
import { withQueryClient } from '../test/queryClient';

// The prefs row as the "server" holds it; savePrefs writes into it so the
// refetch after a mutation returns what was saved.
let serverPrefs: UserPrefs | null = null;

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } }, loading: false, signOut: vi.fn() }),
}));

vi.mock('@gym-tracker/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gym-tracker/core')>();
  return {
    ...actual,
    fetchPrefs: vi.fn(async () => serverPrefs),
    savePrefs: vi.fn(async (patch: Partial<UserPrefs>) => {
      serverPrefs = { ...(serverPrefs ?? DEFAULT_PREFS), ...patch };
    }),
    fetchBodyweight: vi.fn(async () => []),
    logBodyweight: vi.fn(async () => {}),
    fetchPersonalRecords: vi.fn(async () => []),
  };
});

const core = await import('@gym-tracker/core');

// The loader auto-finishes after ~1.5s, so async assertions get extra headroom.
const FINISH_TIMEOUT = { timeout: 4000 };

function renderWizard() {
  return render(
    withQueryClient(
      <AppStateProvider>
        <ToastProvider>
          <Onboarding />
        </ToastProvider>
      </AppStateProvider>
    )
  );
}

function renderGate() {
  return render(
    withQueryClient(
      <AppStateProvider>
        <ToastProvider>
          <OnboardingGate>
            <div>The app</div>
          </OnboardingGate>
        </ToastProvider>
      </AppStateProvider>
    )
  );
}

// Walks the five screens (Goal → Body → Height → Weight → Loading), filling in
// what each test cares about. The loader finishes on its own.
async function completeWizard(user: ReturnType<typeof userEvent.setup>, opts: { weight?: string } = {}) {
  // 1: Goal
  await user.click(screen.getByRole('button', { name: /Get Stronger/ }));
  await user.click(screen.getByRole('button', { name: /Continue/ }));

  // 2: Body
  await user.type(screen.getByLabelText('Name'), 'Sam');
  await user.click(screen.getByRole('button', { name: /Continue/ }));

  // 3: Height
  await user.type(screen.getByLabelText('Height in cm'), '178');
  await user.click(screen.getByRole('button', { name: /Continue/ }));

  // 4: Weight
  if (opts.weight) await user.type(screen.getByLabelText('Current weight in kg'), opts.weight);
  await user.click(screen.getByRole('button', { name: /Finish Setup/ }));
  // 5: Loading — auto-finishes.
}

beforeEach(() => {
  serverPrefs = null;
  vi.mocked(core.savePrefs).mockClear();
  vi.mocked(core.logBodyweight).mockClear();
});

describe('Onboarding gating', () => {
  it('shows the wizard when the user has no prefs row yet', async () => {
    renderGate();
    expect(await screen.findByText("What's Your Fitness Goal?")).toBeInTheDocument();
    expect(screen.queryByText('The app')).not.toBeInTheDocument();
  });

  it('shows the wizard when prefs exist but onboarded is false', async () => {
    serverPrefs = { ...DEFAULT_PREFS, displayName: 'Sam', onboarded: false };
    renderGate();
    expect(await screen.findByText("What's Your Fitness Goal?")).toBeInTheDocument();
  });

  it('shows the app once onboarded is true', async () => {
    serverPrefs = { ...DEFAULT_PREFS, onboarded: true };
    renderGate();
    expect(await screen.findByText('The app')).toBeInTheDocument();
    expect(screen.queryByText("What's Your Fitness Goal?")).not.toBeInTheDocument();
  });

  it('lets the user in rather than trapping them when prefs fail to load', async () => {
    vi.mocked(core.fetchPrefs).mockRejectedValueOnce(new Error('offline'));
    renderGate();
    expect(await screen.findByText('The app')).toBeInTheDocument();
  });

  it('swaps to the app after the wizard finishes', async () => {
    const user = userEvent.setup();
    renderGate();
    await screen.findByText("What's Your Fitness Goal?");

    await completeWizard(user);

    expect(await screen.findByText('The app', undefined, FINISH_TIMEOUT)).toBeInTheDocument();
  });
});

describe('Onboarding wizard', () => {
  it('starts on the goal step and advances through the screens', async () => {
    const user = userEvent.setup();
    renderWizard();

    expect(screen.getByText("What's Your Fitness Goal?")).toBeInTheDocument();
    // No way back from the first step.
    expect(screen.queryByRole('button', { name: 'Previous step' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Continue/ }));
    expect(screen.getByText('Tell Us About Your Body')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Continue/ }));
    expect(screen.getByText("What's Your Height?")).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous step' }));
    expect(screen.getByText('Tell Us About Your Body')).toBeInTheDocument();
  });

  it('Skip for now finishes onboarding with defaults so the wizard never reappears', async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.click(screen.getByRole('button', { name: 'Skip for now' }));

    await waitFor(() => expect(core.savePrefs).toHaveBeenCalledTimes(1));
    expect(vi.mocked(core.savePrefs).mock.calls[0][0]).toMatchObject({ onboarded: true });
  });

  it('saves every answer with onboarded:true on Finish', async () => {
    const user = userEvent.setup();
    renderWizard();

    await completeWizard(user, { weight: '82' });

    await waitFor(() => expect(core.savePrefs).toHaveBeenCalledTimes(1), FINISH_TIMEOUT);
    expect(vi.mocked(core.savePrefs).mock.calls[0][0]).toMatchObject({
      displayName: 'Sam',
      heightCm: 178,
      goal: 'strength',
      onboarded: true,
    });
  });

  it('logs the starting weight as the first weigh-in', async () => {
    const user = userEvent.setup();
    renderWizard();

    await completeWizard(user, { weight: '82' });

    await waitFor(() => expect(core.logBodyweight).toHaveBeenCalledTimes(1), FINISH_TIMEOUT);
    expect(vi.mocked(core.logBodyweight).mock.calls[0][1]).toBe(82);
  });

  it('skips the weigh-in when no weight was given', async () => {
    const user = userEvent.setup();
    renderWizard();

    await completeWizard(user);

    await waitFor(() => expect(core.savePrefs).toHaveBeenCalledTimes(1), FINISH_TIMEOUT);
    expect(core.logBodyweight).not.toHaveBeenCalled();
  });
});
