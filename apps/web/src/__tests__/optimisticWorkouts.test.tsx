// Proves the optimistic path: logging a rest day paints in the Calendar BEFORE
// the write promise settles, and rolls back if that promise rejects.
// Unlike the other view tests, this one uses the REAL useWorkouts so the view
// renders straight off the TanStack Query cache the mutation patches.
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppStateProvider } from '../state/AppState';
import { ToastProvider } from '../components/Toast';
import { CalendarView } from '../views/CalendarView';
import { useFinishWorkout } from '../lib/useWorkoutMutations';
import { createTestQueryClient, withQueryClient } from '../test/queryClient';
import type { LoggedWorkout } from '../lib/workouts';

const TODAY_ENTRY: LoggedWorkout = {
  id: 'w1',
  date: new Date().toISOString(),
  plan: 'gym',
  sess: 'push',
  name: 'Push',
  type: 'workout',
  slots: [{ slot: 'Flat chest press', kind: 'bar', done: true, force: false, sets: [{ w: '60', r: '8' }] }],
};

// A promise whose settlement this test controls, so we can inspect the DOM
// while the "network call" is still in flight.
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  let settled = false;
  void promise.then(
    () => (settled = true),
    () => (settled = true)
  );
  return { promise, resolve, reject, isSettled: () => settled };
}

let restWrite: ReturnType<typeof deferred<void>>;
let finishWrite: ReturnType<typeof deferred<string>>;

vi.mock('@gym-tracker/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gym-tracker/core')>();
  return { ...actual, finishWorkout: vi.fn(() => finishWrite.promise) };
});

vi.mock('../lib/workouts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/workouts')>();
  return {
    ...actual,
    fetchWorkouts: vi.fn(async () => [TODAY_ENTRY]),
    logDayMarker: vi.fn(() => restWrite.promise),
    removeWorkout: vi.fn(async () => {}),
  };
});

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } }, loading: false, signOut: vi.fn() }),
}));

const { fetchWorkouts, logDayMarker } = await import('../lib/workouts');

function statValue(container: HTMLElement, label: string): string {
  const stat = Array.from(container.querySelectorAll('.stat')).find(
    (el) => el.querySelector('.sl')?.textContent === label
  );
  return stat?.querySelector('.sv')?.textContent ?? '';
}

// The day sheet is a Radix Dialog portal, so it lives outside `container`.
function restButton(): HTMLElement {
  return screen.getByText(/Rest day/).closest('button')!;
}

function renderCalendar() {
  return render(
    withQueryClient(
      <AppStateProvider>
        <ToastProvider>
          <CalendarView />
        </ToastProvider>
      </AppStateProvider>
    )
  );
}

// Loads history, opens today's sheet, clicks "Rest day".
async function logRestDayOnToday(container: HTMLElement) {
  const user = userEvent.setup();
  await waitFor(() => expect(statValue(container, 'total')).toBe('1'));

  await user.click(container.querySelector('.cell.today')!);
  expect(await screen.findByText(/Rest day/)).toBeInTheDocument();
  expect(restButton()).not.toHaveClass('on');

  await user.click(restButton());
}

beforeEach(() => {
  restWrite = deferred<void>();
  finishWrite = deferred<string>();
  vi.mocked(fetchWorkouts).mockClear();
  vi.mocked(logDayMarker).mockClear();
});

describe('optimistic rest-day logging', () => {
  it('renders the rest day before the write promise resolves', async () => {
    const { container } = renderCalendar();
    await logRestDayOnToday(container);

    // The write has been issued but NOT settled...
    expect(logDayMarker).toHaveBeenCalledTimes(1);
    expect(restWrite.isSettled()).toBe(false);

    // ...and the Calendar already shows the rest day: the quick-log button is on,
    // the day sheet says "rest", and the total went 1 → 2.
    await waitFor(() => expect(restButton()).toHaveClass('on'));
    expect(screen.getByText(/· rest/)).toBeInTheDocument();
    expect(statValue(container, 'total')).toBe('2');

    // Still exactly one fetch — this render came from the cache patch, not the server.
    expect(restWrite.isSettled()).toBe(false);
    expect(fetchWorkouts).toHaveBeenCalledTimes(1);

    // Settling it reconciles against the server.
    restWrite.resolve();
    await waitFor(() => expect(fetchWorkouts).toHaveBeenCalledTimes(2));
  });

  it('rolls back and toasts when the write fails', async () => {
    const { container } = renderCalendar();
    await logRestDayOnToday(container);

    await waitFor(() => expect(restButton()).toHaveClass('on'));
    expect(statValue(container, 'total')).toBe('2');

    restWrite.reject(new Error('offline'));

    await waitFor(() => expect(restButton()).not.toHaveClass('on'));
    expect(statValue(container, 'total')).toBe('1');
    expect(await screen.findByText('offline')).toBeInTheDocument();
  });
});

describe('optimistic finish', () => {
  const KEY = ['workouts', 'u1'];

  it('puts the finished workout in the shared cache before the RPC resolves', async () => {
    const client = createTestQueryClient();
    client.setQueryData<LoggedWorkout[]>(KEY, [TODAY_ENTRY]);

    const { result } = renderHook(() => useFinishWorkout(), {
      wrapper: ({ children }) => withQueryClient(children, client),
    });

    act(() =>
      result.current.mutate({
        date: new Date().toISOString(),
        plan: 'gym',
        sess: 'pull',
        name: 'Pull',
        slots: [{ slot: 'Horizontal row', kind: 'cable', done: true, force: false, sets: [{ w: '40', r: '10' }] }],
      })
    );

    // Every view reading ['workouts', …] sees it immediately — the RPC is still pending.
    await waitFor(() => expect(client.getQueryData<LoggedWorkout[]>(KEY)).toHaveLength(2));
    expect(client.getQueryData<LoggedWorkout[]>(KEY)![0].name).toBe('Pull');
    expect(finishWrite.isSettled()).toBe(false);

    finishWrite.resolve('server-id');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
