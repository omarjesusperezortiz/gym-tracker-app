import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgressView } from '../views/ProgressView';
import { useWorkouts } from '../lib/useWorkouts';
import { withQueryClient } from '../test/queryClient';
import type { LoggedWorkout } from '../lib/workouts';

vi.mock('../lib/useWorkouts', () => ({ useWorkouts: vi.fn() }));

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'u1' } }, loading: false, signOut: vi.fn() }),
}));

vi.mock('@gym-tracker/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@gym-tracker/core')>();
  return {
    ...actual,
    fetchPersonalRecords: vi.fn(async () => [
      { slot: 'Flat chest press', bestWeight: 70, bestVolume: 1680 },
      { slot: 'Squat', bestWeight: 100, bestVolume: 3000 },
    ]),
  };
});

function workout(id: string, date: string, slot: string, sets: { w: string; r: string }[]): LoggedWorkout {
  return {
    id,
    date,
    plan: 'gym',
    sess: 'push',
    name: 'Push',
    type: 'workout',
    slots: [{ slot, kind: 'bar', done: true, force: false, sets }],
  };
}

// Chest press climbing 60 → 70 then backing off to 65, plus a row and a plank so
// the muscle-balance split has more than one group in it.
const HISTORY: LoggedWorkout[] = [
  workout('w1', '2026-01-01T12:00:00.000Z', 'Flat chest press', [{ w: '60', r: '8' }]),
  workout('w2', '2026-01-08T12:00:00.000Z', 'Flat chest press', [{ w: '70', r: '5' }]),
  workout('w3', '2026-01-15T12:00:00.000Z', 'Flat chest press', [{ w: '65', r: '6' }]),
  workout('w4', '2026-01-16T12:00:00.000Z', 'Horizontal row', [{ w: '50', r: '10' }]),
  workout('w5', '2026-01-17T12:00:00.000Z', 'Plank (core)', [{ w: '', r: '60' }]),
];

const mockedUseWorkouts = vi.mocked(useWorkouts);

function renderProgress(history: LoggedWorkout[]) {
  mockedUseWorkouts.mockReturnValue({ history, loading: false, error: null, refetch: vi.fn() });
  return render(withQueryClient(<ProgressView />));
}

beforeEach(() => {
  mockedUseWorkouts.mockReset();
});

describe('ProgressView dashboard', () => {
  it('shows the PR board from the personal_records view', async () => {
    renderProgress(HISTORY);
    // Heaviest first, and the card shows the lift it belongs to.
    expect(await screen.findByText('100')).toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
  });

  it('shows training volume totals and a trend chart', () => {
    const { container } = renderProgress(HISTORY);

    // 60×8 + 70×5 + 65×6 + 50×10 = 1720kg of logged tonnage; the plank adds none.
    expect(screen.getByText('lifted total')).toBeInTheDocument();
    expect(screen.getByText('1.7t')).toBeInTheDocument();
    expect(screen.getByText('per session')).toBeInTheDocument();
    expect(container.querySelector('svg[aria-label="Training volume per session"]')).not.toBeNull();
  });

  it('splits sets across push / pull / legs / core', () => {
    const { container } = renderProgress(HISTORY);

    const rows = Array.from(container.querySelectorAll('.mb-row')).map((r) => [
      r.querySelector('.mb-name')?.textContent,
      r.querySelector('.mb-val')?.textContent,
    ]);
    expect(rows).toEqual([
      ['Push', '3'], // three chest-press sessions
      ['Pull', '1'], // the row
      ['Legs', '0'],
      ['Core', '1'], // the plank counts even with no weight
    ]);
  });

  it('keeps a declining exercise neutral: accent line, red only on the delta stat', () => {
    const { container } = renderProgress(HISTORY);

    expect(screen.getByRole('option', { name: 'Flat chest press' })).toBeInTheDocument();
    expect(screen.getByText('70kg')).toBeInTheDocument(); // best set
    expect(screen.getByText('65kg')).toBeInTheDocument(); // last top set
    // The drop is only flagged on the small stat…
    const delta = screen.getByText('-5kg');
    expect(delta).toHaveClass('down');
    // …while the chart itself is drawn in the lime accent, with nothing red in it.
    const chart = container.querySelector('svg[aria-label="Flat chest press top set progress"]')!;
    expect(chart.querySelector('path[stroke="var(--acc)"]')).not.toBeNull();
    expect(chart.innerHTML).not.toContain('--danger');
  });

  it('shows an empty state when nothing has been logged', () => {
    renderProgress([]);
    expect(screen.getByText(/Nothing to chart yet/)).toBeInTheDocument();
  });
});
