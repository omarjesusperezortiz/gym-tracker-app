import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { onlineManager, type QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { catalog, type FinishedWorkout } from '@gym-tracker/core';

const finishWrite = vi.fn();
vi.mock('@gym-tracker/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gym-tracker/core')>();
  return { ...actual, finishWorkout: (v: FinishedWorkout) => finishWrite(v) };
});
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } }, loading: false, signOut: vi.fn() }),
}));
vi.mock('../lib/useCustomizations', () => ({
  useCustomizations: () => ({ overlays: [], loading: false, overlayFor: () => ({ added: [], hidden: [], ordering: [] }) }),
  useSaveCustomization: () => ({ mutate: vi.fn(), isPending: false }),
  useResetCustomization: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../lib/workouts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/workouts')>();
  return { ...actual, fetchWorkouts: vi.fn(async () => SERVER.slice()) };
});

import { AppStateProvider, keyOf, reducer, useAppState, type LiveMap, type State } from '../state/AppState';
import { ToastProvider } from '../components/Toast';
import { TrainView } from '../views/TrainView';
import { createTestQueryClient, withQueryClient } from '../test/queryClient';
import { autoSaveClientId, autoSaveSlots, localDateKey, msUntilNextMidnight } from '../lib/draftAutoSave';
import { useDraftAutoSave } from '../lib/useDraftAutoSave';
import { LS_DRAFT, LS_DRAFT_DATES, LS_ONEOFF } from '../lib/storage';
import type { LoggedWorkout } from '../lib/workouts';

// The "server": what fetchWorkouts returns. finishWrite appends to it, the way
// save_workout would (upserting on client_id).
let SERVER: LoggedWorkout[] = [];

// 13 Oct 2026, local time.
const DAY = (h: number, m = 0, s = 0) => new Date(2026, 9, 13, h, m, s);
const NEXT_DAY = (h: number) => new Date(2026, 9, 14, h);
const TODAY = '2026-10-13';
const YESTERDAY = '2026-10-12';

const SESSION_KEY = 'gym|push';
const PRESS = keyOf('gym', 'push', 'Flat chest press');
const DIP = keyOf('gym', 'push', 'Chest dip');
const FLY = keyOf('gym', 'push', 'Cable fly');
const DRAFT: LiveMap = {
  [PRESS]: {
    kind: 'bar',
    done: false,
    force: false,
    sets: [
      { w: '60', r: '8', last: '' },
      { w: '', r: '', last: '', done: true }, // ticked, shows set 1's ghost
      { w: '', r: '', last: '' }, // never touched
    ],
  },
  [DIP]: { kind: 'bw', done: false, force: false, sets: [{ w: '', r: '', last: '' }] }, // untouched card
};
const EMPTY_DRAFT: LiveMap = {
  [PRESS]: { kind: 'bar', done: false, force: false, sets: [{ w: '', r: '', last: '' }] },
};

function seed(live: LiveMap, dates?: Record<string, string>) {
  localStorage.setItem(LS_DRAFT, JSON.stringify(live));
  localStorage.setItem(LS_ONEOFF, JSON.stringify({ [SESSION_KEY]: [{ slot: 'Chest dip', scheme: '3 × 8–12' }] }));
  if (dates) localStorage.setItem(LS_DRAFT_DATES, JSON.stringify(dates));
}

let probe: State;
function Harness() {
  useDraftAutoSave();
  ({ state: probe } = useAppState());
  return null;
}
let client: QueryClient;
function renderApp(configure?: (c: QueryClient) => void) {
  client = createTestQueryClient();
  configure?.(client);
  return render(
    withQueryClient(
      <AppStateProvider>
        <Harness />
      </AppStateProvider>,
      client
    )
  );
}
const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? 'null');
const cachedHistory = () => client.getQueryData<LoggedWorkout[]>(['workouts', 'u1']) ?? [];

// React Query schedules its notifications with setTimeout, so with fake timers
// we drive the clock instead of waiting on it.
async function flush() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(50);
  });
}

beforeEach(() => {
  localStorage.clear();
  SERVER = [];
  finishWrite.mockReset();
  finishWrite.mockImplementation(async (v: FinishedWorkout) => {
    SERVER = SERVER.filter((w) => w.id !== `c${v.clientId}`);
    SERVER.push({ id: `c${v.clientId}`, date: v.date, plan: v.plan, sess: v.sess, name: v.name, type: 'workout', slots: v.slots, autoSaved: v.autoSaved });
    return `c${v.clientId}`;
  });
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
});
afterEach(() => {
  vi.useRealTimers();
  onlineManager.setOnline(true);
});

describe('helpers', () => {
  it('uses the local calendar date, not UTC', () => {
    expect(localDateKey(DAY(0, 30))).toBe(TODAY);
    expect(localDateKey(DAY(23, 59, 59))).toBe(TODAY);
  });

  it('counts down to the next local midnight', () => {
    expect(msUntilNextMidnight(DAY(23, 59))).toBe(60_000);
    expect(msUntilNextMidnight(DAY(0))).toBe(24 * 3600_000);
  });

  it('keeps only sets that were typed or ticked, and drops untouched exercises', () => {
    expect(autoSaveSlots(DRAFT, [PRESS, DIP])).toEqual([
      { slot: 'Flat chest press', kind: 'bar', done: false, force: false, sets: [{ w: '60', r: '8' }, { w: '60', r: '8' }] },
    ]);
  });

  it('keeps an exercise ticked done even with no set values', () => {
    const live: LiveMap = { [FLY]: { kind: 'cable', done: true, force: false, sets: [{ w: '', r: '', last: '' }] } };
    expect(autoSaveSlots(live, [FLY])).toEqual([{ slot: 'Cable fly', kind: 'cable', done: true, force: false, sets: [] }]);
  });

  it('gives each session-day one stable client id', () => {
    expect(autoSaveClientId(SESSION_KEY, TODAY)).toBe(autoSaveClientId(SESSION_KEY, TODAY));
    expect(autoSaveClientId(SESSION_KEY, TODAY)).not.toBe(autoSaveClientId(SESSION_KEY, YESTERDAY));
    expect(autoSaveClientId(SESSION_KEY, TODAY)).not.toBe(autoSaveClientId('gym|pull', TODAY));
    expect(Number.isSafeInteger(autoSaveClientId(SESSION_KEY, TODAY))).toBe(true);
  });
});

describe('stamping', () => {
  const base = { live: DRAFT, draftDates: {}, oneOff: {}, editingId: null, editingKey: null } as unknown as State;

  it('stamps the session with today when its first value is entered, and keeps that stamp', () => {
    vi.setSystemTime(DAY(10));
    const s1 = reducer(base, { type: 'UPDATE_SET', key: PRESS, index: 0, field: 'w', value: '62' });
    expect(s1.draftDates).toEqual({ [SESSION_KEY]: TODAY });

    vi.setSystemTime(NEXT_DAY(10));
    const s2 = reducer(s1, { type: 'TOGGLE_SET_DONE', key: PRESS, index: 0 });
    expect(s2.draftDates).toEqual({ [SESSION_KEY]: TODAY });
  });

  it('clearing a value does not stamp', () => {
    const cleared = reducer(base, { type: 'UPDATE_SET', key: PRESS, index: 0, field: 'w', value: '' });
    expect(cleared.draftDates).toEqual({});
  });
});

describe('auto-save on load', () => {
  beforeEach(() => vi.setSystemTime(DAY(9)));

  it('saves a draft from an earlier day to history, dated the day it was started', async () => {
    seed(DRAFT, { [SESSION_KEY]: YESTERDAY });
    renderApp();
    await flush();

    expect(finishWrite).toHaveBeenCalledTimes(1);
    const entry: FinishedWorkout = finishWrite.mock.calls[0][0];
    expect(entry).toMatchObject({ plan: 'gym', sess: 'push', name: catalog.plans.gym.sessions.push.name, autoSaved: true });
    expect(entry.clientId).toBe(autoSaveClientId(SESSION_KEY, YESTERDAY));
    expect(localDateKey(new Date(entry.date))).toBe(YESTERDAY);
    expect(entry.slots).toEqual([
      { slot: 'Flat chest press', kind: 'bar', done: false, force: false, sets: [{ w: '60', r: '8' }, { w: '60', r: '8' }] },
    ]);

    // Draft, stamp and its one-off exercises are gone; the row is in history.
    expect(probe.live).toEqual({});
    expect(probe.oneOff).toEqual({});
    expect(stored(LS_DRAFT_DATES)).toEqual({});
    expect(cachedHistory()).toEqual([expect.objectContaining({ sess: 'push', autoSaved: true })]);
  });

  it('clears an untouched draft from an earlier day without saving anything', async () => {
    seed(EMPTY_DRAFT, { [SESSION_KEY]: YESTERDAY });
    renderApp();
    await flush();
    expect(finishWrite).not.toHaveBeenCalled();
    expect(probe.live).toEqual({});
    expect(probe.draftDates).toEqual({});
  });

  it("keeps today's draft as it is", async () => {
    seed(DRAFT, { [SESSION_KEY]: TODAY });
    renderApp();
    await flush();
    expect(finishWrite).not.toHaveBeenCalled();
    expect(probe.live).toEqual(DRAFT);
    expect(probe.draftDates).toEqual({ [SESSION_KEY]: TODAY });
  });

  it('stamps a legacy unstamped draft as today instead of saving it now, then saves it tomorrow', async () => {
    seed(DRAFT);
    renderApp();
    await flush();
    expect(finishWrite).not.toHaveBeenCalled();
    expect(probe.live).toEqual(DRAFT);
    expect(stored(LS_DRAFT_DATES)).toEqual({ [SESSION_KEY]: TODAY });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(msUntilNextMidnight() + 1_500);
    });
    await flush();
    expect(finishWrite).toHaveBeenCalledTimes(1);
    expect(localDateKey(new Date(finishWrite.mock.calls[0][0].date))).toBe(TODAY);
  });

  it('does not save again when that session is already in history for that day', async () => {
    SERVER = [
      { id: 'w1', date: new Date(2026, 9, 12, 19).toISOString(), plan: 'gym', sess: 'push', name: 'Push', type: 'workout', slots: [] },
    ];
    seed(DRAFT, { [SESSION_KEY]: YESTERDAY });
    renderApp();
    await flush();
    expect(finishWrite).not.toHaveBeenCalled();
    expect(probe.live).toEqual({});
    expect(cachedHistory()).toHaveLength(1);
  });
});

describe('auto-save while the app stays open', () => {
  it('saves the draft at the next local midnight, dated the day before', async () => {
    vi.setSystemTime(DAY(23, 59));
    seed(DRAFT, { [SESSION_KEY]: TODAY });
    renderApp();
    await flush();
    expect(finishWrite).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(62_000);
    });
    await flush();
    expect(finishWrite).toHaveBeenCalledTimes(1);
    expect(localDateKey(new Date(finishWrite.mock.calls[0][0].date))).toBe(TODAY);
    expect(probe.live).toEqual({});
  });

  it('saves it when the app is resumed on a later day (background timers paused)', async () => {
    vi.setSystemTime(DAY(22));
    seed(DRAFT, { [SESSION_KEY]: TODAY });
    renderApp();
    await flush();

    // Phone sleeps overnight: the clock moves but the timer never fires.
    vi.setSystemTime(NEXT_DAY(7));
    expect(finishWrite).not.toHaveBeenCalled();
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await flush();
    expect(finishWrite).toHaveBeenCalledTimes(1);
    expect(localDateKey(new Date(finishWrite.mock.calls[0][0].date))).toBe(TODAY);
    expect(probe.live).toEqual({});
  });

  it('resuming on the same day keeps the draft', async () => {
    vi.setSystemTime(DAY(10));
    seed(DRAFT, { [SESSION_KEY]: TODAY });
    renderApp();
    vi.setSystemTime(DAY(18));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('focus'));
    });
    await flush();
    expect(finishWrite).not.toHaveBeenCalled();
    expect(probe.live).toEqual(DRAFT);
  });
});

describe('no duplicates', () => {
  it('fires one write while it is in flight, however often the app wakes up', async () => {
    vi.setSystemTime(DAY(9));
    let resolve!: (id: string) => void;
    finishWrite.mockImplementation(() => new Promise<string>((r) => (resolve = r)));
    seed(DRAFT, { [SESSION_KEY]: YESTERDAY });
    renderApp();
    await flush();
    act(() => {
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await flush();
    expect(finishWrite).toHaveBeenCalledTimes(1);
    // The optimistic row doesn't count as saved: the draft stays until the write lands.
    expect(probe.live).toEqual(DRAFT);

    SERVER = [{ id: 'real', date: new Date(2026, 9, 12, 12).toISOString(), plan: 'gym', sess: 'push', name: 'Push', type: 'workout', slots: [], autoSaved: true }];
    await act(async () => resolve('real'));
    await flush();
    expect(finishWrite).toHaveBeenCalledTimes(1);
    expect(probe.live).toEqual({});
    expect(cachedHistory()).toHaveLength(1);
  });

  it('offline: queues one write and replays it once on reconnect', async () => {
    vi.setSystemTime(DAY(9));
    seed(DRAFT, { [SESSION_KEY]: YESTERDAY });
    // Offline, with the app's real mutation mode: pause (queue) while offline.
    renderApp((c) => {
      onlineManager.setOnline(false);
      c.setDefaultOptions({ ...c.getDefaultOptions(), mutations: { retry: false, networkMode: 'online' } });
    });
    await flush();
    act(() => {
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await flush();

    expect(finishWrite).not.toHaveBeenCalled();
    const queued = client.getMutationCache().getAll().filter((m) => m.state.isPaused);
    expect(queued).toHaveLength(1);
    expect(probe.live).toEqual(DRAFT); // kept until the save actually lands

    act(() => onlineManager.setOnline(true));
    await flush();
    await flush();
    expect(finishWrite).toHaveBeenCalledTimes(1);
    expect(probe.live).toEqual({});
    expect(cachedHistory().filter((w) => w.sess === 'push')).toHaveLength(1);
  });
});

describe('finishing a workout normally', () => {
  it('is unchanged: saves today, not flagged auto-saved, then clears the draft and its stamp', async () => {
    vi.useRealTimers();
    const PLAN = catalog.plans.gym;
    const sess = Object.keys(PLAN.sessions)[0];
    const firstSlot = PLAN.sessions[sess].slots[0][0];
    render(
      withQueryClient(
        <AppStateProvider>
          <ToastProvider>
            <Harness />
            <TrainView />
          </ToastProvider>
        </AppStateProvider>
      )
    );
    const weight = (await screen.findAllByLabelText('Set 1 weight'))[0];
    await userEvent.type(weight, '50');
    await waitFor(() => expect(stored(LS_DRAFT_DATES)).toEqual({ [`gym|${sess}`]: localDateKey() }));

    await userEvent.click(screen.getByRole('button', { name: /finish/i }));
    await waitFor(() => expect(finishWrite).toHaveBeenCalledTimes(1));
    const payload: FinishedWorkout = finishWrite.mock.calls[0][0];
    expect(payload).toMatchObject({ plan: 'gym', sess });
    expect(payload.autoSaved).toBeUndefined();
    expect(payload.clientId).toBeUndefined();
    expect(localDateKey(new Date(payload.date))).toBe(localDateKey());
    expect(payload.slots[0]).toMatchObject({ slot: firstSlot, sets: expect.arrayContaining([expect.objectContaining({ w: '50' })]) });

    await waitFor(() => expect(stored(LS_DRAFT_DATES)).toEqual({}));
    expect(finishWrite).toHaveBeenCalledTimes(1);
  });
});
