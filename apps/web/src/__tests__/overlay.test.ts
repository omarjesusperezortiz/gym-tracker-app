import { describe, expect, it } from 'vitest';
import { EMPTY_OVERLAY, effectiveSession, type SessionOverlay } from '@gym-tracker/core';
import { catalog } from '@gym-tracker/core';
import { addSlot, hasCustomization, hideSlot, moveSlot, removeAdded, withOneOffs } from '../lib/overlay';

const PUSH = catalog.plans.gym.sessions.push;
const overlay = (patch: Partial<SessionOverlay> = {}): SessionOverlay => ({ ...EMPTY_OVERLAY, ...patch });

describe('hasCustomization', () => {
  it('is false for nothing and for an empty overlay', () => {
    expect(hasCustomization(null)).toBe(false);
    expect(hasCustomization(EMPTY_OVERLAY)).toBe(false);
  });

  it('is true as soon as anything is added, hidden or reordered', () => {
    expect(hasCustomization(overlay({ added: [{ slot: 'Chest dip', scheme: '3 × 8–12' }] }))).toBe(true);
    expect(hasCustomization(overlay({ hidden: ['Plank (core)'] }))).toBe(true);
    expect(hasCustomization(overlay({ ordering: ['Incline press'] }))).toBe(true);
  });
});

describe('addSlot', () => {
  it('appends and shows up in the merged session', () => {
    const next = addSlot(EMPTY_OVERLAY, { slot: 'Chest dip', scheme: '3 × 8–12' });
    expect(next.added).toHaveLength(1);
    expect(effectiveSession(PUSH, next).slots.map((s) => s[0])).toContain('Chest dip');
  });

  it('ignores a duplicate add', () => {
    const once = addSlot(EMPTY_OVERLAY, { slot: 'Chest dip', scheme: '3 × 8–12' });
    expect(addSlot(once, { slot: 'Chest dip', scheme: '4 × 6' }).added).toHaveLength(1);
  });

  it('un-hides a slot that was previously removed', () => {
    const hidden = hideSlot(EMPTY_OVERLAY, 'Chest dip');
    const next = addSlot(hidden, { slot: 'Chest dip', scheme: '3 × 8–12' });
    expect(next.hidden).not.toContain('Chest dip');
  });
});

describe('hideSlot / removeAdded', () => {
  it('hides a base slot so the merged session drops it', () => {
    const base = PUSH.slots[0][0];
    const next = hideSlot(EMPTY_OVERLAY, base);
    expect(next.hidden).toEqual([base]);
    expect(effectiveSession(PUSH, next).slots.map((s) => s[0])).not.toContain(base);
  });

  it('drops an added slot outright rather than hiding it', () => {
    const added = addSlot(EMPTY_OVERLAY, { slot: 'Chest dip', scheme: '3 × 8–12' });
    const next = removeAdded(added, 'Chest dip');
    expect(next.added).toEqual([]);
    expect(next.hidden).toEqual([]);
  });

  it('forgets a removed slot s position', () => {
    const withOrder = overlay({ ordering: ['a', 'Chest dip', 'b'], added: [{ slot: 'Chest dip', scheme: '3 × 8' }] });
    expect(removeAdded(withOrder, 'Chest dip').ordering).toEqual(['a', 'b']);
    expect(hideSlot(withOrder, 'b').ordering).toEqual(['a', 'Chest dip']);
  });
});

describe('moveSlot', () => {
  const order = ['one', 'two', 'three'];

  it('moves an exercise up and down', () => {
    expect(moveSlot(EMPTY_OVERLAY, order, 'two', -1).ordering).toEqual(['two', 'one', 'three']);
    expect(moveSlot(EMPTY_OVERLAY, order, 'two', 1).ordering).toEqual(['one', 'three', 'two']);
  });

  it('does nothing at the ends', () => {
    expect(moveSlot(EMPTY_OVERLAY, order, 'one', -1)).toBe(EMPTY_OVERLAY);
    expect(moveSlot(EMPTY_OVERLAY, order, 'three', 1)).toBe(EMPTY_OVERLAY);
  });

  it('keeps today-only exercises out of the persisted ordering', () => {
    // "two" is a one-off, so it must not be written into the saved order.
    const next = moveSlot(EMPTY_OVERLAY, order, 'three', -1, ['two']);
    expect(next.ordering).toEqual(['one', 'three']);
  });

  it('produces an ordering the merge actually applies', () => {
    const names = PUSH.slots.map((s) => s[0]);
    const next = moveSlot(EMPTY_OVERLAY, names, names[2], -1);
    expect(effectiveSession(PUSH, next).slots.map((s) => s[0])[1]).toBe(names[2]);
  });
});

describe('withOneOffs', () => {
  it('merges today-only slots on top of the stored overlay for rendering', () => {
    const stored = addSlot(EMPTY_OVERLAY, { slot: 'Chest dip', scheme: '3 × 8–12' });
    const merged = withOneOffs(stored, [{ slot: 'Sled push', scheme: '3 × 8–12' }]);
    expect(merged.added.map((a) => a.slot)).toEqual(['Chest dip', 'Sled push']);
    // The stored overlay is untouched — one-offs never get persisted.
    expect(stored.added.map((a) => a.slot)).toEqual(['Chest dip']);
  });

  it('returns the overlay unchanged when there are none', () => {
    const stored = overlay({ hidden: ['x'] });
    expect(withOneOffs(stored, [])).toBe(stored);
    expect(withOneOffs(null, [])).toBe(EMPTY_OVERLAY);
  });
});
