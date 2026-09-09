import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addableExercises, catalog, EMPTY_OVERLAY, type AddedSlot, type SessionOverlay } from '@gym-tracker/core';
import { AppStateProvider } from '../state/AppState';
import { ToastProvider } from '../components/Toast';
import { TrainView } from '../views/TrainView';
import { AddExerciseSheet } from '../views/AddExerciseSheet';
import { withQueryClient } from '../test/queryClient';

// TrainView opens the first session of the gym plan when nothing else is chosen.
const PLAN = catalog.plans.gym;
const SESS = Object.keys(PLAN.sessions)[0];
const SESSION = PLAN.sessions[SESS];
const BASE_SLOTS = SESSION.slots.map((s) => s[0]);

let overlay: SessionOverlay = EMPTY_OVERLAY;
const saveMutate = vi.fn();
const resetMutate = vi.fn();

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } }, loading: false, signOut: vi.fn() }),
}));

vi.mock('../lib/useWorkouts', () => ({
  useWorkouts: () => ({ history: [], loading: false, error: null, refetch: vi.fn() }),
}));

vi.mock('../lib/useCustomizations', () => ({
  useCustomizations: () => ({ overlays: [], loading: false, overlayFor: () => overlay }),
  useSaveCustomization: () => ({ mutate: saveMutate, isPending: false }),
  useResetCustomization: () => ({ mutate: resetMutate, isPending: false }),
}));

function renderTrain() {
  return render(
    withQueryClient(
      <AppStateProvider>
        <ToastProvider>
          <TrainView />
        </ToastProvider>
      </AppStateProvider>
    )
  );
}

/** Exercise names as rendered, in order. */
function renderedSlots(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('.ex .hname')).map((el) => el.firstChild?.textContent?.trim() ?? '');
}

beforeEach(() => {
  overlay = EMPTY_OVERLAY;
  saveMutate.mockClear();
  resetMutate.mockClear();
  localStorage.clear();
});

describe('TrainView with a session overlay', () => {
  it('trains the plain catalog session when there is no overlay', async () => {
    const { container } = renderTrain();
    await waitFor(() => expect(renderedSlots(container)).toEqual(BASE_SLOTS));
  });

  it('includes an added exercise, tagged as added', async () => {
    overlay = { ...EMPTY_OVERLAY, added: [{ slot: 'Chest dip', scheme: '3 × 8–12' }] };
    const { container } = renderTrain();

    await waitFor(() => expect(renderedSlots(container)).toContain('Chest dip'));
    // It sits after the catalog slots and carries the "added" tag.
    expect(renderedSlots(container)).toEqual([...BASE_SLOTS, 'Chest dip']);
    const card = Array.from(container.querySelectorAll('.ex')).find((el) => el.textContent?.includes('Chest dip'))!;
    expect(within(card as HTMLElement).getByText('added')).toBeInTheDocument();
    // And it's a real logging card: sets to fill in.
    expect(card.querySelectorAll('.setrow').length).toBeGreaterThan(0);
  });

  it('drops a hidden exercise and honours the saved order', async () => {
    overlay = { added: [], hidden: [BASE_SLOTS[0]], ordering: [BASE_SLOTS[2], BASE_SLOTS[1]] };
    const { container } = renderTrain();

    await waitFor(() => expect(renderedSlots(container)).not.toContain(BASE_SLOTS[0]));
    expect(renderedSlots(container).slice(0, 2)).toEqual([BASE_SLOTS[2], BASE_SLOTS[1]]);
  });

  it('renders a custom exercise with sets but no equipment tabs', async () => {
    overlay = { ...EMPTY_OVERLAY, added: [{ slot: 'Sled push', scheme: '3 × 8–12', custom: true }] };
    const { container } = renderTrain();

    await waitFor(() => expect(renderedSlots(container)).toContain('Sled push'));
    const card = Array.from(container.querySelectorAll('.ex')).find((el) => el.textContent?.includes('Sled push'))!;
    // No catalog variation → no equipment switcher and no demo images…
    expect(card.querySelector('.seg')).toBeNull();
    expect(card.querySelector('.imgs')).toBeNull();
    // …but it still logs weight × reps.
    expect(within(card as HTMLElement).getByLabelText('Set 1 weight')).toBeInTheDocument();
  });
});

describe('TrainView editing', () => {
  it('hides a catalog exercise permanently', async () => {
    const user = userEvent.setup();
    const { container } = renderTrain();
    await waitFor(() => expect(renderedSlots(container).length).toBe(BASE_SLOTS.length));

    await user.click(screen.getByLabelText('Edit session'));
    await user.click(screen.getByLabelText(`Remove ${BASE_SLOTS[0]}`));

    expect(saveMutate).toHaveBeenCalledTimes(1);
    expect(saveMutate.mock.calls[0][0]).toMatchObject({
      plan: 'gym',
      sess: SESS,
      overlay: { hidden: [BASE_SLOTS[0]] },
    });
  });

  it('saves a new order when an exercise moves up', async () => {
    const user = userEvent.setup();
    const { container } = renderTrain();
    await waitFor(() => expect(renderedSlots(container).length).toBe(BASE_SLOTS.length));

    await user.click(screen.getByLabelText('Edit session'));
    await user.click(screen.getByLabelText(`Move ${BASE_SLOTS[1]} up`));

    const saved = saveMutate.mock.calls[0][0].overlay as SessionOverlay;
    expect(saved.ordering.slice(0, 2)).toEqual([BASE_SLOTS[1], BASE_SLOTS[0]]);
  });

  it('only offers Reset once the session has been customised', async () => {
    const user = userEvent.setup();
    const { rerender } = renderTrain();

    await user.click(screen.getByLabelText('Edit session'));
    expect(screen.queryByText(/Reset .* to the default plan/)).not.toBeInTheDocument();

    overlay = { ...EMPTY_OVERLAY, hidden: [BASE_SLOTS[0]] };
    rerender(
      withQueryClient(
        <AppStateProvider>
          <ToastProvider>
            <TrainView />
          </ToastProvider>
        </AppStateProvider>
      )
    );

    // The toggle is still on across the rerender — its label flips when active.
    await user.click(await screen.findByText(/Reset .* to the default plan/));
    expect(resetMutate).toHaveBeenCalledTimes(1);
    expect(resetMutate.mock.calls[0][0]).toEqual({ plan: 'gym', sess: SESS });
  });
});

describe('TrainView one-off adds', () => {
  it('adds an exercise for today without touching the overlay', async () => {
    const user = userEvent.setup();
    const { container } = renderTrain();
    await waitFor(() => expect(renderedSlots(container).length).toBe(BASE_SLOTS.length));

    await user.click(screen.getByText('Add exercise'));
    // "Just today" is the default scope.
    await user.click(await screen.findByText('Chest dip'));

    await waitFor(() => expect(renderedSlots(container)).toContain('Chest dip'));
    const card = Array.from(container.querySelectorAll('.ex')).find((el) => el.textContent?.includes('Chest dip'))!;
    expect(within(card as HTMLElement).getByText('today')).toBeInTheDocument();
    expect(card.querySelectorAll('.setrow').length).toBeGreaterThan(0);
    // Nothing was persisted.
    expect(saveMutate).not.toHaveBeenCalled();
  });

  it('persists it instead when the scope is permanent', async () => {
    const user = userEvent.setup();
    renderTrain();

    await user.click(screen.getByText('Add exercise'));
    await user.click(await screen.findByText(/^Always in/));
    await user.click(screen.getByText('Chest dip'));

    expect(saveMutate).toHaveBeenCalledTimes(1);
    expect(saveMutate.mock.calls[0][0].overlay.added).toEqual([{ slot: 'Chest dip', scheme: '3 × 8–12' }]);
  });
});

describe('AddExerciseSheet', () => {
  const onAdd = vi.fn();
  const renderSheet = () =>
    render(
      <AddExerciseSheet open onClose={vi.fn()} plan={PLAN} session={SESSION} sessionName={SESSION.name} onAdd={onAdd} />
    );

  beforeEach(() => onAdd.mockClear());

  it('lists every addable exercise and nothing already in the session', () => {
    renderSheet();
    const addable = addableExercises(PLAN, SESSION);
    expect(addable.length).toBeGreaterThan(0);
    for (const a of addable) expect(screen.getByText(a.slot)).toBeInTheDocument();
    for (const inSession of BASE_SLOTS) expect(screen.queryByText(inSession)).not.toBeInTheDocument();
  });

  it('filters as you search', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.type(screen.getByLabelText('Search exercises'), 'dip');

    // The sheet is a Radix portal, so it lives outside the render container.
    const names = Array.from(document.querySelectorAll('.add-name')).map((el) => el.textContent);
    expect(names.every((n) => n?.toLowerCase().includes('dip'))).toBe(true);
    expect(names).toContain('Chest dip');
  });

  it('offers a name that is not in the catalog as a custom exercise', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.type(screen.getByLabelText('Search exercises'), 'Sled push');
    await user.click(screen.getByText(/as a custom exercise/));

    expect(onAdd).toHaveBeenCalledWith({ slot: 'Sled push', scheme: '3 × 8–12', custom: true }, 'today');
  });

  it('passes the chosen scope through', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByText(/^Always in/));
    await user.click(screen.getByText('Chest dip'));

    const [slot, scope] = onAdd.mock.calls[0] as [AddedSlot, string];
    expect(slot.slot).toBe('Chest dip');
    expect(scope).toBe('permanent');
  });
});
