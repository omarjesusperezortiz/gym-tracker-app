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
      'Kneeling Push-up',
      'Incline Push-up',
      'Wide Hand Push-up',
      'Shoulder Tap Push-up',
    ]);
  });

  it('returns squat and plank lists', () => {
    expect(variantsFor('Squat', 'bw')).toHaveLength(3);
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
    expect(resolveVariant('Push-up', 'bw', { 'Push-up|bw': 'Wide Hand Push-up' })?.name).toBe('Wide Hand Push-up');
    // A chip that was removed (Archer Push-up is its own slot now) falls back too.
    expect(resolveVariant('Push-up', 'bw', { 'Push-up|bw': 'Archer Push-up' })?.name).toBe('Pushups');
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
    ['Squat to Overhead Reach', 'Overhead Reach'],
    ['Jump Squat', 'Jump'],
    ['Wide Hand Push-up', 'Wide Hand'],
    ['Split Squats', 'Split'],
    ['Pistol Squat', 'Pistol'],
    ['Curtsey Squat', 'Curtsey'],
    ['Plank with Twist', 'Twist'],
    ['Bodyweight Walking Lunge', 'Walking'],
    ['Side Bridge', 'Standard'],
    ['Self Assisted Inverse Leg Curl (Floor)', 'Nordic'],
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

  // The highlighted chip (first entry when nothing is chosen) and the exercise
  // the resolver shows must agree, or the card/hero drift from the chip row.
  it.each(lists)('%s / %s: resolver default is the first chip', (slot, kind, list) => {
    expect(resolveExercise({ plan: getPlan('travel'), slotKey: slot, kind: kind as 'bw' }).id).toBe(list[0].id);
  });

  it.each([
    ['Glute Bridge', 'u0cNiij'], // Low Glute Bridge
    ['Squat', '75Bgtjy'], // Bodyweight Squat
    ['Lunge', 'kMzUs9Y'], // Forward Lunge
    ['Walking Lunge', 'IZVHb27'], // Bodyweight Walking Lunge
    ['Superman', 'ANbbry2'], // Lower Back Curl (EDB has no superman)
    ['Cobra (Upward Dog)', '01qpYSe'], // Upward Facing Dog
  ])('%s defaults to %s', (slot, id) => {
    expect(resolveExercise({ plan: getPlan('travel'), slotKey: slot, kind: 'bw' }).id).toBe(id);
  });

  it('Lunge and Walking Lunge do not share chips', () => {
    const lunge = variantsFor('Lunge', 'bw')!.map((v) => v.id);
    for (const v of variantsFor('Walking Lunge', 'bw')!) expect(lunge).not.toContain(v.id);
  });

  // A chip that is another slot's exercise shows the same thing twice when
  // both slots are in one session (Squat + Split Squats, Push-up + Diamond).
  // Plank chips are left to Omar.
  it.each(['cal', 'travel'] as const)('%s: no chip is the exercise of another slot in the plan', (key) => {
    const plan = getPlan(key);
    const used = new Set<string>();
    for (const s of plan.sessions) {
      for (const [k] of s.slots) used.add(k);
      for (const lv of Object.values(s.levels ?? {})) for (const [k] of lv!.slots) used.add(k);
    }
    const shownBy = new Map<string, string>();
    for (const k of used) shownBy.set(resolveExercise({ plan, slotKey: k, kind: 'bw' }).id, k);
    for (const k of used) {
      if (/^Plank/.test(k)) continue;
      for (const v of variantsFor(k, 'bw') ?? []) {
        const other = shownBy.get(v.id);
        if (other && other !== k && !/^Plank/.test(other)) throw new Error(`${k} chip ${v.name} is the ${other} slot`);
      }
    }
  });

  it('covers every travel slot that has variants', () => {
    expect(Object.keys(styleVariants).sort()).toEqual(
      [
        'Bicycle Crunch', 'Burpee', 'Glute Bridge', 'Lunge', 'Plank', 'Push-up',
        'Side Plank', 'Squat', 'Standing Calf Raise',
        'Standing Single Leg Curl', 'Walking Lunge',
      ].sort(),
    );
  });
});
