import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { exerciseMedia } from '@gym-tracker/core';

// Validates the exercise-media map: every mapped movement must have a real
// mirrored gif + poster on disk, plus complete metadata. Guards against broken
// images (the #1 thing that makes the exercise UI look terrible).
const PUBLIC = join(__dirname, '..', '..', 'public', 'exercise-media');

describe('exercise media integrity', () => {
  const entries = Object.entries(exerciseMedia);

  it('has at least the upper-body catalog mapped', () => {
    expect(entries.length).toBeGreaterThanOrEqual(12);
  });

  for (const [name, media] of entries) {
    describe(name, () => {
      it('gif file exists on disk', () => {
        expect(existsSync(join(PUBLIC, `${media.id}.gif`))).toBe(true);
      });
      it('poster image exists on disk', () => {
        expect(existsSync(join(PUBLIC, 'posters', `${media.id}.jpg`))).toBe(true);
      });
      it('has a target muscle and equipment', () => {
        expect(media.target.length).toBeGreaterThan(0);
        expect(media.equip.length).toBeGreaterThan(0);
      });
      it('has how-to steps', () => {
        expect(media.steps && media.steps.length).toBeGreaterThan(0);
      });
    });
  }

  it('no accidental duplicate gif ids (aliases allowed)', () => {
    // "Plank" and "Plank (core)" are the same movement and deliberately share a
    // gif. Any other id appearing twice would be an accidental mismapping.
    const KNOWN_ALIASES = new Set(['Plank (core)', 'Leg raise (core)']);
    const seen = new Map<string, string>();
    for (const [name, m] of entries) {
      if (KNOWN_ALIASES.has(name)) continue;
      expect(seen.has(m.id), `${name} reuses gif id already used by ${seen.get(m.id)}`).toBe(false);
      seen.set(m.id, name);
    }
  });
});
