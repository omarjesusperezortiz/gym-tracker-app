// Anatomical muscle mapping — turns logged workout history into per-muscle set
// counts and training intensity, for the Progress-screen body map.
//
// Kept framework-agnostic: it consumes a structural subset of a workout (date,
// slots, sets) so both the web `LoggedWorkout` and core `WorkoutEntry` satisfy
// it without an import.

export type Muscle =
  | 'chest'
  | 'delts'
  | 'back'
  | 'biceps'
  | 'triceps'
  | 'abs'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves';

// Ordered head-to-toe so the legend and chips read naturally.
export const MUSCLES: Muscle[] = [
  'chest',
  'delts',
  'back',
  'biceps',
  'triceps',
  'abs',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
];

export const MUSCLE_LABEL: Record<Muscle, string> = {
  chest: 'Chest',
  delts: 'Shoulders',
  back: 'Back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  abs: 'Core',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
};

// Structural input — anything with a date and slots-of-sets. `type` is optional
// so a bare `{ date, slots }` works; rest-day markers are ignored.
export interface MuscleHistoryEntry {
  date: string;
  type?: string;
  slots: ReadonlyArray<{ slot: string; sets: ReadonlyArray<{ w: string; r: string }> }>;
}

// A logged set is one the user actually touched — any weight OR reps entered.
// Matches the web muscle-balance convention (planks/pull-ups count).
export function isLoggedSet(set: { w: string; r: string }): boolean {
  return set.w !== '' || set.r !== '';
}

// Map an exercise/slot name to the muscle groups it trains. Keyword rules,
// ordered so the pickier patterns win. Covers every canonical session slot (see
// muscleMap.test.ts) and degrades sensibly on the variation names. A slot can
// train several muscles — a chest press hits chest + triceps, a squat hits
// quads + glutes.
export function classifyMuscles(slot: string): Muscle[] {
  const s = slot.toLowerCase();
  const out = new Set<Muscle>();

  // Core / abs — anti-rotation "presses" (Pallof) must not read as chest.
  if (/plank|crunch|russian twist|leg raise|pallof|sit.?up|ab wheel|hollow|bicycle|\bcore\b/.test(s)) {
    out.add('abs');
  }

  // Calves.
  if (/calf|calves/.test(s)) out.add('calves');

  // Posterior chain — hamstrings & glutes travel together on hinges.
  if (/hamstring|\brdl\b|romanian|deadlift|leg curl|stiff.?leg/.test(s)) {
    out.add('hamstrings');
    out.add('glutes');
  }
  if (/glute|hip thrust|bridge|butt lift/.test(s)) out.add('glutes');

  // Quads — squats/lunges/presses also drive the glutes.
  if (/squat|lunge|leg press|step.?up|leg extension/.test(s)) {
    out.add('quads');
    out.add('glutes');
  }

  // Back — rows, pulldowns/pull-ups, lats, traps/shrugs, face pulls. Note: no
  // bare "lat " keyword — it would make "fLAT chest press" a back movement.
  if (/\brow\b|row\b|pull|\blats\b|pulldown|pullover|chin|shrug|trap|face pull/.test(s)) {
    out.add('back');
  }

  // Biceps — curls (not the leg/wrist kind), and the pulling movements that
  // recruit them.
  if (/curl/.test(s) && !/leg curl|wrist curl/.test(s)) out.add('biceps');
  if (/chin|underhand|horizontal row|inverted row|one-arm|bent over|seated cable row/.test(s)) {
    out.add('biceps');
  }

  // Triceps — extensions/pushdowns/dips and the compound presses.
  if (/triceps|pushdown|\bdip\b|chest press|bench press|incline press|overhead press|close.?grip|skull|lying triceps/.test(s)) {
    out.add('triceps');
  }

  // Shoulders / delts.
  if (/overhead press|shoulder press|military|lateral raise|front raise|front dumbbell|front plate|front cable|rear delt|\bdelt|upright row|arnold|incline press/.test(s)) {
    out.add('delts');
  }

  // Chest — never trigger on a bare "press" (that's why the keywords are
  // explicit), so Pallof/overhead work stays out.
  if (/chest|bench press|\bfly\b|flye|crossover|butterfly|push.?up|pushup|incline press|decline press|dumbbell bench|machine bench/.test(s)) {
    out.add('chest');
  }

  return MUSCLES.filter((m) => out.has(m));
}

export interface MuscleVolume {
  muscle: Muscle;
  sets: number;
  lastTrained: string | null; // ISO date of the most recent session hitting it
}

// Per-muscle set counts across all history, plus the most recent date each
// muscle was worked. Every muscle is returned (0 sets, null date if untouched)
// so the body map always has a complete legend.
export function muscleSetCounts(history: ReadonlyArray<MuscleHistoryEntry>): MuscleVolume[] {
  const sets: Record<Muscle, number> = blank(0);
  const last: Record<Muscle, string | null> = blank(null) as Record<Muscle, string | null>;

  for (const w of history) {
    if (w.type && w.type !== 'workout') continue;
    for (const slot of w.slots) {
      const logged = slot.sets.filter(isLoggedSet).length;
      if (!logged) continue;
      for (const m of classifyMuscles(slot.slot)) {
        sets[m] += logged;
        if (!last[m] || new Date(w.date).getTime() > new Date(last[m] as string).getTime()) {
          last[m] = w.date;
        }
      }
    }
  }

  return MUSCLES.map((muscle) => ({ muscle, sets: sets[muscle], lastTrained: last[muscle] }));
}

export type MuscleIntensity = 'heavy' | 'light' | 'none';

// Classify each muscle's training load relative to the hardest-trained muscle,
// so the map is about *balance* rather than absolute set counts. heavy ≥ half
// the top muscle's sets, light = anything above zero below that, none = 0.
export function muscleIntensities(volumes: ReadonlyArray<MuscleVolume>): Record<Muscle, MuscleIntensity> {
  const max = Math.max(0, ...volumes.map((v) => v.sets));
  const out = blank<MuscleIntensity>('none');
  for (const v of volumes) {
    if (v.sets <= 0) out[v.muscle] = 'none';
    else if (max > 0 && v.sets >= max * 0.5) out[v.muscle] = 'heavy';
    else out[v.muscle] = 'light';
  }
  return out;
}

function blank<T>(value: T): Record<Muscle, T> {
  return MUSCLES.reduce((acc, m) => {
    acc[m] = value;
    return acc;
  }, {} as Record<Muscle, T>);
}
