import { describe, it, expect } from 'vitest';
import { catalog, addableByGroup, groupForMovement, muscleGroups, movementMuscleGroup } from '@gym-tracker/core';
import type { Plan } from '@gym-tracker/core';

// Validates the muscle-group layer (Option A): every catalog movement maps to a
// group, and the picker's grouped view buckets correctly.
describe('muscle-group layer', () => {
  const gym = catalog.plans.gym as unknown as Plan;

  it('every movement in variations has a muscle group', () => {
    const movements = Object.keys(gym.variations);
    const unmapped = movements.filter((m) => !(m in movementMuscleGroup));
    expect(unmapped).toEqual([]);
  });

  it('groupForMovement returns one of the 6 canonical groups', () => {
    const keys = new Set(muscleGroups.map((g) => g.key));
    for (const m of Object.keys(gym.variations)) {
      expect(keys.has(groupForMovement(m))).toBe(true);
    }
  });

  it('addableByGroup only returns non-empty groups, in canonical order', () => {
    const session = gym.sessions.pull;
    const grouped = addableByGroup(gym, session);
    // every returned group has exercises
    expect(grouped.every((g) => g.exercises.length > 0)).toBe(true);
    // canonical order preserved
    const order = muscleGroups.map((g) => g.key);
    const returnedOrder = grouped.map((g) => g.group.key);
    const sortedByCanonical = [...returnedOrder].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    expect(returnedOrder).toEqual(sortedByCanonical);
  });

  it('exercises already in the session are not offered', () => {
    const session = gym.sessions.pull;
    const grouped = addableByGroup(gym, session);
    const offered = grouped.flatMap((g) => g.exercises.map((e) => e.slot));
    const present = session.slots.map((s) => s[0]);
    for (const p of present) expect(offered).not.toContain(p);
  });
});
