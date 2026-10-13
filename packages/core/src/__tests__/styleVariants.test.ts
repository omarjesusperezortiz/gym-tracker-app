import { existsSync } from 'fs';
import { join } from 'path';
import { catalog } from '../catalog';
import { exercises } from '../exercises';
import { getPlan } from '../plans';
import { resolveExercise } from '../resolver';
import { resolveVariant, shortLabel, styleVariants, variantsFor } from '../logic/styleVariants';

const MEDIA_DIR = join(__dirname, '../../../../apps/web/public/exercise-media');

describe('variantsFor', () => {
  it('returns the bodyweight push-up styles, default first', () => {
    expect(variantsFor('Push-up', 'bw')?.map((v) => v.name)).toEqual([
      'Pushups',
      'Diamond Push-Up',
      'Hindu Push-up',
      'Archer Push-up',
      'Plyo Push-up',
    ]);
  });

  it('returns squat and plank lists', () => {
    expect(variantsFor('Squat', 'bw')).toHaveLength(5);
    expect(variantsFor('Plank', 'bw')?.map((v) => v.id)).toEqual(['hCjGsRQ', 'CosupLu']);
  });

  it('returns null for an unknown slot or kind', () => {
    expect(variantsFor('Flat chest press', 'bar')).toBeNull();
    expect(variantsFor('Push-up', 'db')).toBeNull();
  });
});

describe('resolveVariant', () => {
  it('falls back to the first variant', () => {
    expect(resolveVariant('Push-up', 'bw', {})?.name).toBe('Pushups');
    expect(resolveVariant('Push-up', 'bw', undefined)?.name).toBe('Pushups');
  });

  it('uses the stored choice, ignoring stale names', () => {
    expect(resolveVariant('Push-up', 'bw', { 'Push-up|bw': 'Archer Push-up' })?.name).toBe('Archer Push-up');
    expect(resolveVariant('Push-up', 'bw', { 'Push-up|bw': 'Gone' })?.name).toBe('Pushups');
  });

  it('is null when the slot has no variants', () => {
    expect(resolveVariant('Bear Crawl', 'bw', {})).toBeNull();
  });
});

describe('shortLabel', () => {
  it.each([
    ['Pushups', 'Standard'],
    ['Diamond Push-Up', 'Diamond'],
    ['Hindu Push-up', 'Hindu'],
    ['Archer Push-up', 'Archer'],
    ['Plyo Push-up', 'Plyo'],
    ['Squat', 'Standard'],
    ['Split Squats', 'Split'],
    ['Pistol Squat', 'Pistol'],
    ['Curtsey Squat', 'Curtsey'],
    ['Plank with Twist', 'Twist'],
    ['Bodyweight Walking Lunge', 'Walking'],
    ['Side Bridge', 'Standard'],
    ['Self Assisted Inverse Leg Curl (Floor)', 'Nordic'],
    ['Upward Facing Dog', 'Up Dog'],
    ['Jack Burpee', 'Jack'],
    ['Something Else', 'Something Else'],
  ])('%s → %s', (name, label) => {
    expect(shortLabel(name)).toBe(label);
  });
});

describe('styleVariants data', () => {
  const all = Object.entries(styleVariants).flatMap(([slot, byKind]) =>
    Object.values(byKind).flatMap((list) => list.map((v) => ({ slot, v }))),
  );

  it.each(all.map(({ slot, v }) => [slot, v.name, v]))('%s / %s is an exercise with a demo on disk', (slot, _name, v) => {
    expect(exercises[v.id]).toBeDefined();
    expect(existsSync(join(MEDIA_DIR, `${v.id}.webp`))).toBe(true);
    expect(resolveExercise({ plan: getPlan('travel'), slotKey: slot, kind: 'bw', activeVariantPref: v.name }).id).toBe(v.id);
  });

  it.each(all.map(({ slot, v }) => [slot, v.name, v]))('%s / %s has a poster and is bodyweight', (_slot, _name, v) => {
    expect(existsSync(join(MEDIA_DIR, 'posters', `${v.id}.jpg`))).toBe(true);
    expect(exercises[v.id].equipment).toBe('bodyweight');
  });

  const travel = catalog.plans.travel;
  const lists = Object.entries(styleVariants).flatMap(([slot, byKind]) =>
    Object.entries(byKind).map(([kind, list]) => [slot, kind, list] as const),
  );

  it.each(lists)('%s / %s: travel slot with that kind, 2+ distinct chips', (slot, kind, list) => {
    expect(travel.variations[slot]?.[kind as keyof (typeof travel.variations)[string]]).toBeDefined();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(new Set(list.map((v) => v.name)).size).toBe(list.length);
    expect(new Set(list.map((v) => shortLabel(v.name))).size).toBe(list.length);
  });

  it('aliases share their family list', () => {
    expect(variantsFor('Walking Lunge', 'bw')).toBe(variantsFor('Lunge', 'bw'));
    expect(variantsFor('Cobra (Upward Dog)', 'bw')).toBe(variantsFor('Superman', 'bw'));
  });

  it('covers every travel slot that has variants', () => {
    expect(Object.keys(styleVariants).sort()).toEqual(
      [
        'Bicycle Crunch', 'Burpee', 'Cobra (Upward Dog)', 'Glute Bridge', 'Lunge', 'Plank', 'Push-up',
        'Reverse Crunch', 'Russian Twist', 'Side Plank', 'Single Leg Bridge', 'Squat', 'Standing Calf Raise',
        'Standing Single Leg Curl', 'Superman', 'Walking Lunge',
      ].sort(),
    );
  });
});
