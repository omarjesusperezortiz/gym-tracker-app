import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { catalog } from '@gym-tracker/core';
import { AppStateProvider, keyOf, reducer, useAppState, type LiveMap, type State } from '../state/AppState';
import { ToastProvider } from '../components/Toast';
import { TrainView } from '../views/TrainView';
import { withQueryClient } from '../test/queryClient';
import { localDateKey, msUntilNextMidnight } from '../lib/draftExpiry';
import { LS_DRAFT, LS_DRAFT_DATES, LS_ONEOFF } from '../lib/storage';

const finishMutate = vi.fn();

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } }, loading: false, signOut: vi.fn() }),
}));
vi.mock('../lib/useWorkouts', () => ({
  useWorkouts: () => ({ history: [], loading: false, error: null, refetch: vi.fn() }),
}));
vi.mock('../lib/useCustomizations', () => ({
  useCustomizations: () => ({ overlays: [], loading: false, overlayFor: () => ({ added: [], hidden: [], ordering: [] }) }),
  useSaveCustomization: () => ({ mutate: vi.fn(), isPending: false }),
  useResetCustomization: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../lib/useWorkoutMutations', () => ({
  useFinishWorkout: () => ({ mutate: finishMutate, isPending: false }),
  useUpdateWorkout: () => ({ mutate: vi.fn(), isPending: false }),
}));

// 13 Oct 2026, local time.
const DAY = (h: number, m = 0, s = 0) => new Date(2026, 9, 13, h, m, s);
const TODAY = '2026-10-13';
const YESTERDAY = '2026-10-12';

const SESSION_KEY = 'gym|push';
const LIVE_KEY = keyOf('gym', 'push', 'Flat chest press');
const DRAFT: LiveMap = {
  [LIVE_KEY]: { kind: 'bar', done: false, force: false, sets: [{ w: '60', r: '8', last: '' }] },
};

function seed(dates?: Record<string, string>) {
  localStorage.setItem(LS_DRAFT, JSON.stringify(DRAFT));
  localStorage.setItem(LS_ONEOFF, JSON.stringify({ [SESSION_KEY]: [{ slot: 'Chest dip', scheme: '3 × 8–12' }] }));
  if (dates) localStorage.setItem(LS_DRAFT_DATES, JSON.stringify(dates));
}

let probe: State;
let dispatch: ReturnType<typeof useAppState>['dispatch'];
function Probe() {
  ({ state: probe, dispatch } = useAppState());
  return null;
}
function renderProvider() {
  return render(
    <AppStateProvider>
      <Probe />
    </AppStateProvider>,
  );
}
const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? 'null');

beforeEach(() => {
  localStorage.clear();
  finishMutate.mockReset();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('date helpers', () => {
  it('uses the local calendar date, not UTC', () => {
    expect(localDateKey(DAY(0, 30))).toBe(TODAY);
    expect(localDateKey(DAY(23, 59, 59))).toBe(TODAY);
  });

  it('counts down to the next local midnight', () => {
    expect(msUntilNextMidnight(DAY(23, 59))).toBe(60_000);
    expect(msUntilNextMidnight(DAY(0))).toBe(24 * 3600_000);
  });
});

describe('stamping', () => {
  const base = { live: DRAFT, draftDates: {}, oneOff: {}, editingId: null, editingKey: null } as unknown as State;

  it('stamps the session with today when its first value is entered, and keeps that stamp', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(DAY(10));
    const s1 = reducer(base, { type: 'UPDATE_SET', key: LIVE_KEY, index: 0, field: 'w', value: '62' });
    expect(s1.draftDates).toEqual({ [SESSION_KEY]: TODAY });

    vi.setSystemTime(new Date(2026, 9, 14, 10));
    const s2 = reducer(s1, { type: 'TOGGLE_SET_DONE', key: LIVE_KEY, index: 0 });
    expect(s2.draftDates).toEqual({ [SESSION_KEY]: TODAY });
  });

  it('clearing a value or un-ticking does not stamp', () => {
    const cleared = reducer(base, { type: 'UPDATE_SET', key: LIVE_KEY, index: 0, field: 'w', value: '' });
    expect(cleared.draftDates).toEqual({});
  });

  it('ticking an exercise done stamps it', () => {
    const s = reducer(base, { type: 'TOGGLE_DONE', key: LIVE_KEY });
    expect(s.draftDates[SESSION_KEY]).toBe(localDateKey());
  });
});

describe('expiry on load', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(DAY(9));
  });

  it('keeps a draft started today', () => {
    seed({ [SESSION_KEY]: TODAY });
    renderProvider();
    expect(probe.live[LIVE_KEY]).toBeDefined();
    expect(probe.draftDates).toEqual({ [SESSION_KEY]: TODAY });
  });

  it('discards a draft started on an earlier day, with its one-off exercises', () => {
    seed({ [SESSION_KEY]: YESTERDAY });
    renderProvider();
    expect(probe.live).toEqual({});
    expect(probe.oneOff).toEqual({});
    expect(probe.draftDates).toEqual({});
    expect(stored(LS_DRAFT)).toEqual({});
  });

  it('stamps a legacy unstamped draft as today instead of deleting it', () => {
    seed();
    renderProvider();
    expect(probe.live[LIVE_KEY]).toEqual(DRAFT[LIVE_KEY]);
    expect(probe.draftDates).toEqual({ [SESSION_KEY]: TODAY });
    expect(stored(LS_DRAFT_DATES)).toEqual({ [SESSION_KEY]: TODAY });
  });
});

describe('expiry while the app stays open', () => {
  it('discards the draft at the next local midnight', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(DAY(23, 59));
    seed({ [SESSION_KEY]: TODAY });
    renderProvider();
    expect(probe.live[LIVE_KEY]).toBeDefined();

    act(() => vi.advanceTimersByTime(59_000));
    expect(probe.live[LIVE_KEY]).toBeDefined();

    act(() => vi.advanceTimersByTime(2_000));
    expect(probe.live).toEqual({});
    expect(stored(LS_DRAFT_DATES)).toEqual({});
  });

  it('keeps expiring on later midnights (timer reschedules)', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(DAY(23, 59));
    renderProvider();
    act(() => vi.advanceTimersByTime(2 * 60_000)); // first midnight passes, nothing to expire

    const key = keyOf('gym', 'pull', 'Horizontal row');
    act(() => {
      dispatch({ type: 'ENSURE_SLOT', key, slot: { kind: 'bar', done: false, force: false, sets: [{ w: '', r: '', last: '' }] } });
      dispatch({ type: 'UPDATE_SET', key, index: 0, field: 'w', value: '40' });
    });
    expect(probe.draftDates).toEqual({ 'gym|pull': '2026-10-14' });

    act(() => vi.advanceTimersByTime(msUntilNextMidnight() + 1_500));
    expect(probe.live).toEqual({});
  });

  it('discards the draft when the app is resumed on a later day (background timers paused)', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(DAY(22));
    seed({ [SESSION_KEY]: TODAY });
    renderProvider();

    // Phone sleeps overnight: the clock moves but the timer never fires.
    vi.setSystemTime(new Date(2026, 9, 14, 7));
    expect(probe.live[LIVE_KEY]).toBeDefined();

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(probe.live).toEqual({});
  });

  it('a window focus on a later day also expires it', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(DAY(22));
    seed({ [SESSION_KEY]: TODAY });
    renderProvider();
    vi.setSystemTime(new Date(2026, 9, 14, 7));
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(probe.live).toEqual({});
  });

  it('resuming on the same day keeps the draft', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(DAY(10));
    seed({ [SESSION_KEY]: TODAY });
    renderProvider();
    vi.setSystemTime(DAY(18));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('focus'));
    });
    expect(probe.live[LIVE_KEY]).toEqual(DRAFT[LIVE_KEY]);
  });
});

describe('finishing a workout', () => {
  it('still writes the workout to history, then clears the draft and its stamp', async () => {
    const PLAN = catalog.plans.gym;
    const sess = Object.keys(PLAN.sessions)[0];
    const firstSlot = PLAN.sessions[sess].slots[0][0];
    render(
      withQueryClient(
        <AppStateProvider>
          <ToastProvider>
            <TrainView />
          </ToastProvider>
        </AppStateProvider>,
      ),
    );
    const weight = (await screen.findAllByLabelText('Set 1 weight'))[0];
    await userEvent.type(weight, '50');
    await waitFor(() => expect(stored(LS_DRAFT_DATES)).toEqual({ [`gym|${sess}`]: localDateKey() }));

    await userEvent.click(screen.getByRole('button', { name: /finish/i }));
    expect(finishMutate).toHaveBeenCalledTimes(1);
    const [payload, opts] = finishMutate.mock.calls[0];
    expect(payload).toMatchObject({ plan: 'gym', sess });
    expect(payload.slots[0]).toMatchObject({ slot: firstSlot, sets: expect.arrayContaining([expect.objectContaining({ w: '50' })]) });

    act(() => opts.onSuccess());
    await waitFor(() => expect(stored(LS_DRAFT_DATES)).toEqual({}));
    // The still-open Train view re-creates blank cards; nothing logged survives.
    const left = Object.entries(stored(LS_DRAFT) as LiveMap).filter(([k]) => k.startsWith(`gym|${sess}|`));
    for (const [, st] of left) {
      expect(st.done).toBe(false);
      expect(st.sets?.every((x) => !x.w && !x.r)).toBe(true);
    }
  });
});

