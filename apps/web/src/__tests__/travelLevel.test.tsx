import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { catalog, EMPTY_OVERLAY, exerciseId, isKnownExerciseId, type WorkoutEntry } from '@gym-tracker/core';
import { AppStateProvider, reducer, type State } from '../state/AppState';
import { ToastProvider } from '../components/Toast';
import { TrainView } from '../views/TrainView';
import { withQueryClient } from '../test/queryClient';
import { LS_PLAN, LS_TRAVEL_LEVEL } from '../lib/storage';
import { autoLevel, historyForSplit, resolveLevel, splitOf } from '../lib/travelLevel';

const TRAVEL = catalog.plans.travel.sessions;

let history: WorkoutEntry[] = [];

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } }, loading: false, signOut: vi.fn() }),
}));
vi.mock('../lib/useWorkouts', () => ({
  useWorkouts: () => ({ history, loading: false, error: null, refetch: vi.fn() }),
}));
vi.mock('../lib/useCustomizations', () => ({
  useCustomizations: () => ({ overlays: [], loading: false, overlayFor: () => EMPTY_OVERLAY }),
  useSaveCustomization: () => ({ mutate: vi.fn(), isPending: false }),
  useResetCustomization: () => ({ mutate: vi.fn(), isPending: false }),
}));

function entries(n: number, sess = 'fullbody', plan = 'travel'): WorkoutEntry[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `w${i}`,
    date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
    plan,
    sess,
    name: sess,
    type: 'workout',
    slots: [],
  }));
}

beforeEach(() => {
  history = [];
  localStorage.clear();
});

describe('travel catalog', () => {
  it('collapses to one session per split', () => {
    expect(Object.keys(TRAVEL)).toEqual(['fullbody', 'push', 'pull', 'legs', 'core', 'hiit', 'quick']);
  });

  it('exposes the expected levels per split', () => {
    const levels = (k: string) => Object.keys(TRAVEL[k].levels ?? {});
    expect(levels('fullbody')).toEqual(['easy', 'med', 'hard']);
    expect(levels('pull')).toEqual(['easy', 'med']);
    expect(levels('hiit')).toEqual(['med', 'hard']);
    expect(levels('quick')).toEqual(['easy']);
  });

  it('defaults session slots to medium, else the only level', () => {
    expect(TRAVEL.fullbody.slots).toEqual(TRAVEL.fullbody.levels!.med!.slots);
    expect(TRAVEL.quick.slots).toEqual(TRAVEL.quick.levels!.easy!.slots);
  });

  it('keeps every level exercise registered as a known catalog id', () => {
    for (const s of Object.values(TRAVEL)) {
      for (const lv of Object.values(s.levels ?? {})) {
        for (const slot of lv!.slots) expect(isKnownExerciseId(exerciseId(slot[0]))).toBe(true);
      }
    }
  });
});

describe('autoLevel', () => {
  const levels = TRAVEL.fullbody.levels;
  it.each([
    [0, 'easy'],
    [4, 'easy'],
    [5, 'med'],
    [14, 'med'],
    [15, 'hard'],
    [40, 'hard'],
  ])('%i completed sessions → %s', (n, want) => {
    expect(autoLevel(entries(n), levels)).toBe(want);
  });

  it('falls back to the nearest available level', () => {
    expect(autoLevel(entries(20, 'pull'), TRAVEL.pull.levels)).toBe('med');
    expect(autoLevel(entries(0, 'hiit'), TRAVEL.hiit.levels)).toBe('med');
    expect(autoLevel(entries(20, 'quick'), TRAVEL.quick.levels)).toBe('easy');
  });
});

describe('historyForSplit', () => {
  it('counts travel workouts of the split, including legacy level-suffixed keys', () => {
    const h = [
      ...entries(2, 'fullbody'),
      ...entries(3, 'fullbody_med'),
      ...entries(1, 'fullbody_hard'),
      ...entries(4, 'push'),
      ...entries(5, 'fullbody', 'gym'),
      { ...entries(1)[0], type: 'rest' as const },
    ];
    expect(historyForSplit(h, 'fullbody')).toHaveLength(6);
    expect(splitOf('hiit_hard')).toBe('hiit');
  });
});

describe('resolveLevel', () => {
  it('prefers a stored override the session offers, else auto', () => {
    const h = entries(6);
    expect(resolveLevel(TRAVEL.fullbody, h, 'fullbody', 'hard')).toMatchObject({ level: 'hard', isAuto: false });
    expect(resolveLevel(TRAVEL.fullbody, h, 'fullbody', undefined)).toMatchObject({ level: 'med', isAuto: true });
    // Pull has no hard — an impossible override falls back to auto.
    expect(resolveLevel(TRAVEL.pull, h, 'pull', 'hard')).toMatchObject({ level: 'easy', isAuto: true });
    expect(resolveLevel(TRAVEL.fullbody, h, 'fullbody', 'easy').slots).toEqual(TRAVEL.fullbody.levels!.easy!.slots);
  });

  it('passes sessions without levels straight through', () => {
    const gym = catalog.plans.gym.sessions.push;
    expect(resolveLevel(gym, [], 'push', undefined)).toEqual({ level: null, isAuto: false, slots: gym.slots, muscles: gym.muscles });
  });
});

describe('SET_TRAVEL_LEVEL', () => {
  const base = { travelLevel: {} } as unknown as State;

  it('stores and clears a per-split override', () => {
    const set = reducer(base, { type: 'SET_TRAVEL_LEVEL', split: 'push', level: 'hard' });
    expect(set.travelLevel).toEqual({ push: 'hard' });
    const cleared = reducer(set, { type: 'SET_TRAVEL_LEVEL', split: 'push', level: null });
    expect(cleared.travelLevel).toEqual({});
  });
});

describe('TrainView level picker', () => {
  function renderTravel() {
    localStorage.setItem(LS_PLAN, JSON.stringify('travel'));
    return render(
      withQueryClient(
        <AppStateProvider>
          <ToastProvider>
            <TrainView />
          </ToastProvider>
        </AppStateProvider>
      )
    ).container;
  }
  const names = (c: HTMLElement) =>
    Array.from(c.querySelectorAll('.ex .hname')).map((el) => el.firstChild?.textContent?.trim() ?? '');
  const slotNames = (lv: 'easy' | 'med' | 'hard') => TRAVEL.fullbody.levels![lv]!.slots.map((s) => s[0]);

  it('auto-picks from history and persists a tapped override', async () => {
    history = entries(5);
    const c = renderTravel();
    const med = await screen.findByRole('radio', { name: /Medium/ });
    expect(med).toHaveAttribute('aria-checked', 'true');
    expect(med).toHaveTextContent('Auto');
    await waitFor(() => expect(names(c)).toEqual(slotNames('med')));

    await userEvent.click(screen.getByRole('radio', { name: /Hard/ }));
    await waitFor(() => expect(names(c)).toEqual(slotNames('hard')));
    expect(screen.getByRole('radio', { name: /Hard/ })).not.toHaveTextContent('Auto');
    expect(JSON.parse(localStorage.getItem(LS_TRAVEL_LEVEL) ?? '{}')).toEqual({ fullbody: 'hard' });

    await userEvent.click(screen.getByRole('button', { name: 'Back to auto level' }));
    await waitFor(() => expect(names(c)).toEqual(slotNames('med')));
    expect(JSON.parse(localStorage.getItem(LS_TRAVEL_LEVEL) ?? '{}')).toEqual({});
  });

  it('restores a persisted override on load', async () => {
    localStorage.setItem(LS_TRAVEL_LEVEL, JSON.stringify({ fullbody: 'easy' }));
    const c = renderTravel();
    await waitFor(() => expect(names(c)).toEqual(slotNames('easy')));
    expect(screen.getByRole('radio', { name: /Easy/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('shows no picker outside travel', () => {
    render(
      withQueryClient(
        <AppStateProvider>
          <ToastProvider>
            <TrainView />
          </ToastProvider>
        </AppStateProvider>
      )
    );
    expect(screen.queryByRole('radiogroup', { name: 'Difficulty level' })).toBeNull();
  });
});
