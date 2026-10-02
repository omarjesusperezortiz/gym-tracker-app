import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { catalog, variationMedia } from '@gym-tracker/core';
import type { Slot } from '@gym-tracker/core';
import { ExerciseDetailSheet } from '../components/ExerciseDetailSheet';
import { ExerciseCard } from '../views/ExerciseCard';
import { AppStateProvider, reducer, type LiveSlotState, type State } from '../state/AppState';
import { LS_ACTIVE_VARIANT } from '../lib/storage';

const TRAVEL = catalog.plans.travel;
const PUSHUP = TRAVEL.sessions.fullbody.slots.find((s) => s[0] === 'Push-up') as Slot;

function SheetHarness({ movement = 'Push-up', kind = 'bw' as const }) {
  const [active, setActive] = useState<Record<string, string>>({});
  return (
    <ExerciseDetailSheet
      movement={movement}
      kind={kind}
      activeVariants={active}
      onVariantChange={(name) => setActive({ [`${movement}|${kind}`]: name })}
      onClose={() => {}}
    />
  );
}

function hero(): HTMLImageElement {
  return document.querySelector('.lib-detail-media img') as HTMLImageElement;
}

describe('SET_ACTIVE_VARIANT', () => {
  it('stores the variant name under slot|kind', () => {
    const base = { activeVariant: {} } as unknown as State;
    const next = reducer(base, { type: 'SET_ACTIVE_VARIANT', slot: 'Push-up', kind: 'bw', name: 'Diamond Push-Up' });
    expect(next.activeVariant).toEqual({ 'Push-up|bw': 'Diamond Push-Up' });
    const again = reducer(next, { type: 'SET_ACTIVE_VARIANT', slot: 'Squat', kind: 'bw', name: 'Pistol Squat' });
    expect(again.activeVariant).toEqual({ 'Push-up|bw': 'Diamond Push-Up', 'Squat|bw': 'Pistol Squat' });
  });

  describe('persistence', () => {
    beforeEach(() => localStorage.clear());

    it('writes to and restores from localStorage', () => {
      localStorage.setItem(LS_ACTIVE_VARIANT, JSON.stringify({ 'Squat|bw': 'Pistol Squat' }));
      render(
        <AppStateProvider>
          <span />
        </AppStateProvider>,
      );
      expect(JSON.parse(localStorage.getItem(LS_ACTIVE_VARIANT)!)).toEqual({ 'Squat|bw': 'Pistol Squat' });
    });
  });
});

describe('ExerciseDetailSheet variant chips', () => {
  it('renders one chip per variant with the default active', () => {
    render(<SheetHarness />);
    const chips = Array.from(document.querySelectorAll('.vchip'));
    expect(chips.map((c) => c.textContent)).toEqual(['Standard', 'Diamond', 'Hindu', 'Archer', 'Plyo']);
    expect(screen.getByRole('button', { name: 'Standard' })).toHaveAttribute('aria-pressed', 'true');
    expect(hero().src).toContain('I4hDWkc.webp');
  });

  it('hides the chip row for slots without variants', () => {
    render(<SheetHarness movement="Bear Crawl" />);
    expect(screen.queryByRole('group', { name: 'Variants' })).toBeNull();
  });

  it('hides the chip row when no change handler is wired (library)', () => {
    render(<ExerciseDetailSheet movement="Push-up" kind="bw" onClose={() => {}} />);
    expect(screen.queryByRole('group', { name: 'Variants' })).toBeNull();
  });

  it('chip click swaps hero, title and how-to in the same render', async () => {
    const user = userEvent.setup();
    render(<SheetHarness />);
    await user.click(screen.getByRole('button', { name: 'Diamond' }));
    expect(hero().src).toContain('soIB2rj.webp');
    expect(screen.getByRole('heading', { name: 'Diamond Push-Up' })).toBeInTheDocument();
    expect(screen.getByText(variationMedia['Diamond Push-Up'].steps![0])).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Diamond' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('sits between the hero and the how-to steps', () => {
    render(<SheetHarness />);
    const row = screen.getByRole('group', { name: 'Variants' });
    const howTo = screen.getByText('How to');
    expect(hero().compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(row.compareDocumentPosition(howTo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('ExerciseCard uses the active variant', () => {
  const st: LiveSlotState = { kind: 'bw', done: false, force: false, sets: [{ w: '', r: '', last: '' }] };
  const noop = () => {};

  it('shows the chosen variant name and demo, keeps the slot name', () => {
    render(
      <ExerciseCard
        index={0}
        slotDef={PUSHUP}
        plan={TRAVEL}
        state={st}
        activeVariants={{ 'Push-up|bw': 'Archer Push-up' }}
        onToggleDone={noop}
        onToggleForce={noop}
        onKindChange={noop}
        onSetChange={noop}
        onAddSet={noop}
        onZoom={noop}
      />,
    );
    expect(screen.getByText('Push-up')).toBeInTheDocument();
    expect(screen.getByText('Archer Push-up')).toBeInTheDocument();
    expect((screen.getByAltText('Archer Push-up demonstration') as HTMLImageElement).src).toContain('A9qxk2F.webp');
  });
});
