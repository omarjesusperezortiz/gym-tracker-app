import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { catalog, listPlans, mediaFiles, type Kind } from '@gym-tracker/core';
import { exerciseFor } from '../lib/exerciseFor';

// Every exercise the app can show for a plan's slots must have its mirrored
// demo + poster on disk — a broken image is the #1 thing that makes the
// exercise UI look terrible.
const PUBLIC = join(__dirname, '..', '..', 'public', 'exercise-media');

describe('exerciseFor', () => {
  for (const plan of listPlans()) {
    const variations = catalog.plans[plan.key].variations;
    for (const [slot, byKind] of Object.entries(variations)) {
      it(`${plan.key} / ${slot}: every tab has a demo + poster on disk`, () => {
        for (const kind of Object.keys(byKind) as Kind[]) {
          const ex = exerciseFor(plan.key, slot, kind);
          expect(ex, `${slot} ${kind}`).not.toBeNull();
          const files = mediaFiles(ex!.id);
          expect(existsSync(join(PUBLIC, files.demo))).toBe(true);
          expect(existsSync(join(PUBLIC, files.poster))).toBe(true);
        }
      });
    }
  }

  it('defaults to the plan’s first tab for the slot', () => {
    expect(exerciseFor('gym', 'Flat chest press')?.equipment).toBe('barbell');
    expect(exerciseFor('cal', 'Flat chest press')?.equipment).toBe('bodyweight');
  });

  it('applies a chosen style variant', () => {
    expect(exerciseFor('travel', 'Push-up', 'bw', { 'Push-up|bw': 'Wide Hand Push-up' })?.id).toBe('JmMVpR3');
  });

  it('is null for a slot outside the catalog', () => {
    expect(exerciseFor('gym', 'My custom move')).toBeNull();
  });
});
