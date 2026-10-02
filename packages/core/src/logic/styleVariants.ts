// Style variants: different movement styles of the SAME slot under the SAME
// equipment kind (e.g. bodyweight Push-up → Standard / Diamond / Archer …).
// Distinct from equipment variations (plan.variations), which swap the kind.
// Every id here is a mirrored EDB demo on disk and every name is a
// variationMedia key: steps/muscles come from variationMedia[name], the demo
// image from the variant's own id (see variantMedia).

import { mediaForExercise, type ExerciseMedia } from './exerciseMedia';

export type VariantDifficulty = 'easy' | 'med' | 'hard';

export interface StyleVariant {
  /** EDB id (must exist on disk). */
  id: string;
  /** Display name — matches the variationMedia key. */
  name: string;
  difficulty: VariantDifficulty;
}

// Shared by alias slots (same movement family under another catalog name).
const LUNGE_BW: StyleVariant[] = [
  { id: 'IZVHb27', name: 'Bodyweight Walking Lunge', difficulty: 'easy' },
  { id: 'kMzUs9Y', name: 'Forward Lunge', difficulty: 'easy' },
  { id: 'K9VL0Jq', name: 'Lunge with Twist', difficulty: 'med' },
  { id: 'J9zIWig', name: 'Walking High Knees Lunge', difficulty: 'med' },
  { id: 'PM1PZjg', name: 'Lunge with Jump', difficulty: 'hard' },
];

const BACK_EXTENSION_BW: StyleVariant[] = [
  { id: '01qpYSe', name: 'Upward Facing Dog', difficulty: 'easy' },
  { id: 'DIVyqrU', name: 'Sphinx', difficulty: 'easy' },
  { id: 'ANbbry2', name: 'Lower Back Curl', difficulty: 'med' },
  { id: 'XPUDTt7', name: 'Pike-to-Cobra Push-up', difficulty: 'hard' },
];

/**
 * Map: slot name → list of style variants under the SAME equipment kind.
 * First entry is the default. Only slots with 2+ variants need an entry.
 */
export const styleVariants: Record<string, Record<string /* kind */, StyleVariant[]>> = {
  'Push-up': {
    bw: [
      { id: 'I4hDWkc', name: 'Pushups', difficulty: 'easy' },
      { id: 'soIB2rj', name: 'Diamond Push-Up', difficulty: 'med' },
      { id: 'epOSYUZ', name: 'Hindu Push-up', difficulty: 'med' },
      { id: 'A9qxk2F', name: 'Archer Push-up', difficulty: 'hard' },
      { id: 'Snj1wSv', name: 'Plyo Push-up', difficulty: 'hard' },
    ],
  },
  Squat: {
    bw: [
      { id: 'QChZi3x', name: 'Squat', difficulty: 'easy' },
      { id: '9E25EOx', name: 'Split Squats', difficulty: 'med' },
      { id: 'gUjqdei', name: 'Curtsey Squat', difficulty: 'med' },
      { id: 'nqs5HGV', name: 'Pistol Squat', difficulty: 'hard' },
      { id: 'xdYPUtE', name: 'Sissy Squat', difficulty: 'hard' },
    ],
  },
  Plank: {
    bw: [
      { id: 'hCjGsRQ', name: 'Plank', difficulty: 'easy' },
      { id: 'CosupLu', name: 'Plank with Twist', difficulty: 'med' },
    ],
  },
  Lunge: { bw: LUNGE_BW },
  'Walking Lunge': { bw: LUNGE_BW },
  'Glute Bridge': {
    bw: [
      { id: 'u0cNiij', name: 'Low Glute Bridge', difficulty: 'easy' },
      { id: '196HJGw', name: 'Hip Raise Bent Knee', difficulty: 'easy' },
      { id: 'GibBPPg', name: 'Glute Bridge March', difficulty: 'med' },
      { id: 'D9qe7CM', name: 'Pelvic Tilt into Bridge', difficulty: 'med' },
      { id: 'rmEukuS', name: 'Single Leg Bridge', difficulty: 'hard' },
    ],
  },
  'Single Leg Bridge': {
    bw: [
      { id: 'rmEukuS', name: 'Single Leg Bridge', difficulty: 'med' },
      { id: 'GibBPPg', name: 'Glute Bridge March', difficulty: 'easy' },
    ],
  },
  // Incline + adduction use a chair/bed edge — fine for travel.
  'Side Plank': {
    bw: [
      { id: 'RKjH6Lt', name: 'Side Bridge', difficulty: 'easy' },
      { id: '5VXmnV5', name: 'Incline Side Plank', difficulty: 'med' },
      { id: 'WL4EmxJ', name: 'Side Bridge Hip Abduction', difficulty: 'hard' },
      { id: 'VO2qeJg', name: 'Side Plank Hip Adduction', difficulty: 'hard' },
    ],
  },
  // Donkey Calf Raise (u5ESqzH) left out: its demo needs a step + bench.
  'Standing Calf Raise': {
    bw: [
      { id: 'bJYHBIN', name: 'Bodyweight Standing Calf Raise', difficulty: 'easy' },
      { id: '0jp9Rlz', name: 'One Leg Floor Calf Raise', difficulty: 'med' },
      { id: 'A2upspL', name: 'One Leg Donkey Calf Raise', difficulty: 'hard' },
    ],
  },
  // The non-floor inverse curl (E4PwJqI) is left out: it needs a step + ankle strap.
  'Standing Single Leg Curl': {
    bw: [
      { id: 'C5jncD2', name: 'Standing Single Leg Curl', difficulty: 'easy' },
      { id: 'ZSY3MsL', name: 'Self Assisted Inverse Leg Curl (Floor)', difficulty: 'hard' },
    ],
  },
  'Bicycle Crunch': {
    bw: [
      { id: '1ZFqTDN', name: 'Air Bike', difficulty: 'easy' },
      { id: 'TFqbd8t', name: 'Crunch Floor', difficulty: 'easy' },
      { id: 'rbu5UUb', name: 'Cross Body Crunch', difficulty: 'med' },
      { id: 'dTg95eZ', name: 'Knee Touch Crunch', difficulty: 'med' },
    ],
  },
  // Seated Leg Raise (Hgs6Nl1) left out: its demo is on a bench.
  'Reverse Crunch': {
    bw: [
      { id: 'nCU1Ekp', name: 'Reverse Crunch', difficulty: 'easy' },
      { id: 'tFToB7l', name: 'Reverse Plank with Leg Lift', difficulty: 'med' },
    ],
  },
  'Russian Twist': {
    bw: [
      { id: 'XVDdcoj', name: 'Russian Twist', difficulty: 'easy' },
      { id: '6sYyrRX', name: 'Bent Knee Lying Twist', difficulty: 'easy' },
      { id: 'CosupLu', name: 'Plank with Twist', difficulty: 'med' },
      { id: 'xgsGFVM', name: 'Crab Twist Toe Touch', difficulty: 'hard' },
    ],
  },
  Superman: { bw: BACK_EXTENSION_BW },
  'Cobra (Upward Dog)': { bw: BACK_EXTENSION_BW },
  Burpee: {
    bw: [
      { id: 'dK9394r', name: 'Burpee', difficulty: 'med' },
      { id: 'mr7pkqP', name: 'Jack Burpee', difficulty: 'hard' },
    ],
  },
};

export function variantsFor(slot: string, kind: string): StyleVariant[] | null {
  return styleVariants[slot]?.[kind] ?? null;
}

/** Key for the per-(slot, kind) active-variant map in app state. */
export function variantKey(slot: string, kind: string): string {
  return `${slot}|${kind}`;
}

/**
 * The variant currently in effect for a slot+kind: the stored choice when it
 * is still in the list, else the default (first). Null when the slot has no
 * style variants.
 */
export function resolveVariant(
  slot: string,
  kind: string,
  active: Record<string, string> | undefined,
): StyleVariant | null {
  const list = variantsFor(slot, kind);
  if (!list || list.length === 0) return null;
  const chosen = active?.[variantKey(slot, kind)];
  return list.find((v) => v.name === chosen) ?? list[0];
}

/**
 * Media for a style variant: variationMedia[name] (steps, muscles) with the
 * demo pinned to the variant's own EDB id — some names share a media entry
 * (e.g. "Plank" and "Plank with Twist"), and the chip must still swap the hero.
 */
export function variantMedia(variant: StyleVariant, slot: string): ExerciseMedia | null {
  const media = mediaForExercise(variant.name, slot);
  return media ? { ...media, id: variant.id, imgOverride: undefined } : null;
}

// Chip labels: the default variant reads "Standard"; the rest drop the
// movement word ("Diamond Push-Up" → "Diamond", "Pistol Squat" → "Pistol").
const SHORT_LABEL: Record<string, string> = {
  Pushups: 'Standard',
  Squat: 'Standard',
  Plank: 'Standard',
  'Split Squats': 'Split',
  'Plank with Twist': 'Twist',
  'Bodyweight Walking Lunge': 'Walking',
  'Forward Lunge': 'Forward',
  'Lunge with Twist': 'Twist',
  'Walking High Knees Lunge': 'High Knees',
  'Lunge with Jump': 'Jump',
  'Low Glute Bridge': 'Low',
  'Hip Raise Bent Knee': 'Hip Raise',
  'Glute Bridge March': 'March',
  'Pelvic Tilt into Bridge': 'Pelvic Tilt',
  'Single Leg Bridge': 'Single Leg',
  'Side Bridge': 'Standard',
  'Incline Side Plank': 'Incline',
  'Side Bridge Hip Abduction': 'Abduction',
  'Side Plank Hip Adduction': 'Adduction',
  'Bodyweight Standing Calf Raise': 'Standard',
  'One Leg Floor Calf Raise': 'One Leg',
  'One Leg Donkey Calf Raise': 'One Leg Donkey',
  'Standing Single Leg Curl': 'Standing',
  'Self Assisted Inverse Leg Curl (Floor)': 'Nordic',
  'Air Bike': 'Bicycle',
  'Crunch Floor': 'Crunch',
  'Cross Body Crunch': 'Cross Body',
  'Knee Touch Crunch': 'Knee Touch',
  'Reverse Crunch': 'Standard',
  'Reverse Plank with Leg Lift': 'Reverse Plank',
  'Russian Twist': 'Standard',
  'Bent Knee Lying Twist': 'Lying Twist',
  'Crab Twist Toe Touch': 'Crab Twist',
  'Upward Facing Dog': 'Up Dog',
  Sphinx: 'Sphinx',
  'Lower Back Curl': 'Back Curl',
  'Pike-to-Cobra Push-up': 'Pike to Cobra',
  Burpee: 'Standard',
  'Jack Burpee': 'Jack',
};

export function shortLabel(name: string): string {
  if (SHORT_LABEL[name]) return SHORT_LABEL[name];
  const stripped = name.replace(/\s+(push-?ups?|squats?|planks?)$/i, '').trim();
  return stripped || name;
}
