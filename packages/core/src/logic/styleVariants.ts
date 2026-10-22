// Style variants: different movement styles of the SAME slot under the SAME
// equipment kind (e.g. bodyweight Push-up → Standard / Diamond / Archer …).
// Distinct from equipment variations (plan.variations), which swap the kind.
// Every id here is an exercise id (../exercises) and one of its slot's variants
// for that kind; resolveExercise turns a chosen name into that exercise.

export type VariantDifficulty = 'easy' | 'med' | 'hard';

export interface StyleVariant {
  /** Exercise id (../exercises) — must be in the slot's variants for this kind. */
  id: string;
  /** Chip name — what AppState.activeVariant stores. */
  name: string;
  difficulty: VariantDifficulty;
}

/**
 * Map: slot name → list of style variants under the SAME equipment kind.
 * First entry is the default. Only slots with 2+ variants need an entry.
 * A chip is never an exercise that has its own slot in the plan (e.g. no
 * Diamond chip under Push-up — Diamond Push-up is a slot of its own).
 */
export const styleVariants: Record<string, Record<string /* kind */, StyleVariant[]>> = {
  'Push-up': {
    bw: [
      { id: 'I4hDWkc', name: 'Pushups', difficulty: 'easy' },
      { id: 'ZOuKWir', name: 'Kneeling Push-up', difficulty: 'easy' },
      { id: 'B1EVP9F', name: 'Incline Push-up', difficulty: 'easy' },
      { id: 'JmMVpR3', name: 'Wide Hand Push-up', difficulty: 'med' },
      { id: 'qEse6fe', name: 'Shoulder Tap Push-up', difficulty: 'med' },
    ],
  },
  Squat: {
    bw: [
      { id: '75Bgtjy', name: 'Squat', difficulty: 'easy' },
      { id: 'QChZi3x', name: 'Squat to Overhead Reach', difficulty: 'easy' },
      { id: 'LIlE5Tn', name: 'Jump Squat', difficulty: 'hard' },
    ],
  },
  Plank: {
    bw: [
      { id: 'hCjGsRQ', name: 'Plank', difficulty: 'easy' },
      { id: 'CosupLu', name: 'Plank with Twist', difficulty: 'med' },
    ],
  },
  Lunge: {
    bw: [
      { id: 'kMzUs9Y', name: 'Forward Lunge', difficulty: 'easy' },
      { id: 'K9VL0Jq', name: 'Lunge with Twist', difficulty: 'med' },
      { id: 'PM1PZjg', name: 'Lunge with Jump', difficulty: 'hard' },
    ],
  },
  'Walking Lunge': {
    bw: [
      { id: 'IZVHb27', name: 'Bodyweight Walking Lunge', difficulty: 'easy' },
      { id: 'J9zIWig', name: 'Walking High Knees Lunge', difficulty: 'med' },
    ],
  },
  'Glute Bridge': {
    bw: [
      { id: 'u0cNiij', name: 'Low Glute Bridge', difficulty: 'easy' },
      { id: 'GibBPPg', name: 'Glute Bridge March', difficulty: 'med' },
      { id: 'D9qe7CM', name: 'Pelvic Tilt into Bridge', difficulty: 'med' },
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
      { id: 'rbu5UUb', name: 'Cross Body Crunch', difficulty: 'med' },
    ],
  },
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

// Chip labels: the default variant reads "Standard"; the rest drop the
// movement word ("Diamond Push-Up" → "Diamond", "Pistol Squat" → "Pistol").
const SHORT_LABEL: Record<string, string> = {
  Pushups: 'Standard',
  Squat: 'Standard',
  'Squat to Overhead Reach': 'Overhead Reach',
  Plank: 'Standard',
  'Plank with Twist': 'Twist',
  'Bodyweight Walking Lunge': 'Walking',
  'Forward Lunge': 'Forward',
  'Lunge with Twist': 'Twist',
  'Walking High Knees Lunge': 'High Knees',
  'Lunge with Jump': 'Jump',
  'Low Glute Bridge': 'Low',
  'Glute Bridge March': 'March',
  'Pelvic Tilt into Bridge': 'Pelvic Tilt',
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
  'Cross Body Crunch': 'Cross Body',
  Burpee: 'Standard',
  'Jack Burpee': 'Jack',
};

export function shortLabel(name: string): string {
  if (SHORT_LABEL[name]) return SHORT_LABEL[name];
  const stripped = name.replace(/\s+(push-?ups?|squats?|planks?)$/i, '').trim();
  return stripped || name;
}
