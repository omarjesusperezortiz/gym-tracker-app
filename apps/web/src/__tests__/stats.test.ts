import { describe, expect, it } from 'vitest';
import { catalog } from '@gym-tracker/core';
import { classifyMuscleGroup, muscleBalance, volumeSeries, workoutVolume } from '../lib/stats';
import type { LoggedWorkout } from '../lib/workouts';

// Every exercise slot the catalog can log, across all plans.
const CATALOG_SLOTS = Array.from(
  new Set(
    Object.values(catalog.plans).flatMap((plan) =>
      Object.values(plan.sessions).flatMap((session) => session.slots.map((slot) => slot[0]))
    )
  )
);

function workout(slot: string, sets: { w: string; r: string }[], date = '2026-01-01T12:00:00.000Z'): LoggedWorkout {
  return {
    id: slot + date,
    date,
    plan: 'gym',
    sess: 'push',
    name: 'Push',
    type: 'workout',
    slots: [{ slot, kind: 'bar', done: true, force: false, sets }],
  };
}

describe('classifyMuscleGroup', () => {
  it('classifies every catalog exercise into a real group', () => {
    const unclassified = CATALOG_SLOTS.filter((slot) => classifyMuscleGroup(slot) === 'other');
    expect(unclassified).toEqual([]);
  });

  it('gets the names that keyword matching easily trips over right', () => {
    // "fLAT chest press" must not match a bare "lat" and become a pull.
    expect(classifyMuscleGroup('Flat chest press')).toBe('push');
    // A press that isn't a press.
    expect(classifyMuscleGroup('Pallof Press (anti-rotation)')).toBe('core');
    // Legs, not a "leg raise".
    expect(classifyMuscleGroup('Calf raise')).toBe('legs');
    expect(classifyMuscleGroup('Hanging/Lying Leg Raise')).toBe('core');
    // Lat work is caught by "pull".
    expect(classifyMuscleGroup('Lat pullover / straight-arm')).toBe('pull');
    expect(classifyMuscleGroup('Vertical pull (lats)')).toBe('pull');
    // Pushdowns are triceps work, not pulls.
    expect(classifyMuscleGroup('Triceps pushdown/ext')).toBe('push');
  });
});

describe('muscleBalance', () => {
  it('counts logged sets per group and shares them out', () => {
    const balance = muscleBalance([
      workout('Flat chest press', [{ w: '60', r: '8' }, { w: '60', r: '8' }]),
      workout('Horizontal row', [{ w: '50', r: '10' }]),
      workout('Plank (core)', [{ w: '', r: '60' }]),
    ]);
    expect(balance.map((b) => [b.group, b.sets])).toEqual([
      ['push', 2],
      ['pull', 1],
      ['legs', 0],
      ['core', 1],
    ]);
    // Unweighted core sets still count towards the split.
    expect(balance.find((b) => b.group === 'push')!.share).toBeCloseTo(0.5);
  });

  it('ignores empty sets and rest days', () => {
    const balance = muscleBalance([
      workout('Squat', [{ w: '', r: '' }]),
      { id: 'r1', date: '2026-01-02T12:00:00.000Z', plan: 'gym', sess: null, name: 'Rest', type: 'rest', slots: [] },
    ]);
    expect(balance.every((b) => b.sets === 0)).toBe(true);
  });
});

describe('volume', () => {
  it('sums weight × reps and skips loadless sets', () => {
    expect(workoutVolume(workout('Flat chest press', [{ w: '60', r: '8' }, { w: '65', r: '5' }]))).toBe(805);
    // Timed/bodyweight work carries no tonnage.
    expect(workoutVolume(workout('Plank (core)', [{ w: '', r: '60' }]))).toBe(0);
  });

  it('gives one chronological point per workout that moved weight', () => {
    const series = volumeSeries([
      workout('Flat chest press', [{ w: '60', r: '8' }], '2026-01-08T12:00:00.000Z'),
      workout('Plank (core)', [{ w: '', r: '60' }], '2026-01-09T12:00:00.000Z'),
      workout('Horizontal row', [{ w: '50', r: '10' }], '2026-01-01T12:00:00.000Z'),
    ]);
    expect(series.map((p) => p.volume)).toEqual([500, 480]);
  });
});
