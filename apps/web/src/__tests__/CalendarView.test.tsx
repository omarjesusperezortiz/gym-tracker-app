import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppStateProvider, useAppState } from '../state/AppState';
import { ToastProvider } from '../components/Toast';
import { CalendarView } from '../views/CalendarView';
import { withQueryClient } from '../test/queryClient';
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

vi.mock('../lib/useWorkouts', () => ({
  useWorkouts: () => ({ history: [TODAY_ENTRY], loading: false, error: null, refetch: vi.fn() }),
}));

vi.mock('../lib/workouts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/workouts')>();
  return {
    ...actual,
    logDayMarker: vi.fn(async () => {}),
    removeWorkout: vi.fn(async () => {}),
  };
});

function ViewProbe() {
  const { state } = useAppState();
  return (
    <div data-testid="probe">
      {state.view}|{state.plan}|{state.cur}
    </div>
  );
}

function renderCalendar() {
  return render(
    withQueryClient(
      <AppStateProvider>
        <ToastProvider>
          <CalendarView />
          <ViewProbe />
        </ToastProvider>
      </AppStateProvider>
    )
  );
}

describe('CalendarView', () => {
  it("marks today's cell with a workout dot and counts it in the stats", () => {
    const { container } = renderCalendar();
    const todayCell = container.querySelector('.cell.today');
    expect(todayCell).not.toBeNull();
    expect(todayCell).toHaveClass('has');
    expect(screen.getByText('this month')).toBeInTheDocument();
  });

  it('opens the day sheet and continues/edits the workout into Train', async () => {
    const user = userEvent.setup();
    const { container } = renderCalendar();

    const todayCell = container.querySelector('.cell.today');
    expect(todayCell).not.toBeNull();
    await user.click(todayCell!);

    expect(await screen.findByText(/Flat chest press/)).toBeInTheDocument();
    const editBtn = screen.getByText(/Continue \/ edit this workout/);
    await user.click(editBtn);

    expect(screen.getByTestId('probe')).toHaveTextContent('train|gym|push');
  });
});
