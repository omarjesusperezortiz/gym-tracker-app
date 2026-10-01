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
};

export function shortLabel(name: string): string {
  if (SHORT_LABEL[name]) return SHORT_LABEL[name];
  const stripped = name.replace(/\s+(push-?ups?|squats?|planks?)$/i, '').trim();
  return stripped || name;
}
