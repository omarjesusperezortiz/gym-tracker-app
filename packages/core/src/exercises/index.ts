import { exercises } from './exercises';
import type { Equipment, Exercise, ExerciseId, Kind } from './types';

export * from './types';
export { exercises };

/** The exercise for an id. Throws on an unknown id — ids come from our own data. */
export function exercise(id: ExerciseId): Exercise {
  const ex = exercises[id];
  if (!ex) throw new Error(`Unknown exercise id "${id}"`);
  return ex;
}

/** Non-throwing lookup, for ids that come from outside the catalog. */
export function findExercise(id: ExerciseId): Exercise | undefined {
  return exercises[id];
}

// Equipment each card tab stands for. Plans filter on this.
export const KIND_EQUIPMENT: Record<Kind, Equipment> = {
  bw: 'bodyweight',
  bar: 'barbell',
  db: 'dumbbell',
  cable: 'cable',
  machine: 'machine',
};

// Mirrored media lives at <base><id>.webp and <base>posters/<id>.jpg; the base
// differs per app (Vite base), so callers pass it in.

/** Paths of an exercise's demo files, relative to the media base. */
export function mediaFiles(id: ExerciseId): { demo: string; poster: string } {
  return { demo: `${id}.webp`, poster: `posters/${id}.jpg` };
}

/** Animated demo URL. */
export function exerciseDemoUrl(ex: Exercise, base: string): string {
  return base + mediaFiles(ex.id).demo;
}

/** Static first-frame poster URL — for lists where motion distracts. */
export function exercisePosterUrl(ex: Exercise, base: string): string {
  return base + mediaFiles(ex.id).poster;
}
