import { existsSync } from 'fs';
import { join } from 'path';
import { exercises, KIND_EQUIPMENT, mediaFiles } from '..';
import { slots } from '../../slots';
import type { Kind } from '../types';

const MEDIA_DIR = join(__dirname, '../../../../../apps/web/public/exercise-media');

describe('exercise map', () => {
  const all = Object.entries(exercises);

  it('has every migrated exercise', () => {
    expect(all.length).toBeGreaterThanOrEqual(148);
  });

  it.each(all)('%s: keyed by its own id', (key, ex) => {
    expect(ex.id).toBe(key);
  });

  it.each(all)('%s: demo webp + poster jpg exist on disk', (id) => {
    const files = mediaFiles(id);
    expect(existsSync(join(MEDIA_DIR, files.demo))).toBe(true);
    expect(existsSync(join(MEDIA_DIR, files.poster))).toBe(true);
  });

  it.each(all)('%s: has a name, target muscle and how-to steps', (_id, ex) => {
    expect(ex.name.length).toBeGreaterThan(0);
    expect(ex.target.length).toBeGreaterThan(0);
    expect(ex.steps.length).toBeGreaterThan(0);
  });
});

// Each card tab stands for one kind of equipment. These slot entries file an
// exercise under a tab whose equipment it doesn't use — inherited catalog
// choices (e.g. pull-ups under Barbell). Listed so new ones fail and fixed
// ones get pruned.
const KNOWN_MISMATCHES = [
  'Hanging/Lying Leg Raise|bar|I3tsCnC',
  'Leg raise (core)|bar|I3tsCnC',
  'Pallof Press (anti-rotation)|cable|9pa4H5m',
  'Plank (core)|db|CosupLu',
  'Russian Twist|db|XVDdcoj',
  'Upright row|machine|1DN3iz4',
  'Vertical pull (lats)|bar|0V2YQjW',
];

describe('exercise equipment matches the slot kind it is filed under', () => {
  it('only the known mismatches remain', () => {
    const mismatches: string[] = [];
    for (const [key, s] of Object.entries(slots)) {
      for (const [kind, ids] of Object.entries(s.variants)) {
        for (const id of ids ?? []) {
          if (exercises[id].equipment !== KIND_EQUIPMENT[kind as Kind]) mismatches.push(`${key}|${kind}|${id}`);
        }
      }
    }
    expect(mismatches.sort()).toEqual([...KNOWN_MISMATCHES].sort());
  });
});
