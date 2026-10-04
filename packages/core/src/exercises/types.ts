// Exercise model: one entry per real exercise, keyed by its ExerciseDB id.
// The id doubles as the mirrored demo filename (<id>.webp + posters/<id>.jpg).

import type { Kind } from '../types';

export type { Kind };

/** EDB id — unique, matches the webp/jpg filename. */
export type ExerciseId = string;

/** Primary/secondary muscle as written by EDB (e.g. "pectorals", "upper back"). */
export type Muscle = string;

/** What the exercise is actually performed with. */
export type Equipment =
  | 'bodyweight'
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'band'
  | 'kettlebell'
  | 'smith'
  | 'weighted';

export type Difficulty = 'easy' | 'med' | 'hard';

export interface Exercise {
  id: ExerciseId;
  /** EDB-style exercise name, e.g. "Squat to Overhead Reach". */
  name: string;
  equipment: Equipment;
  target: Muscle;
  secondary: Muscle[];
  /** Set only where we have a source for it (the style-variant chips). */
  difficulty?: Difficulty;
  steps: string[];
  /** Optional 1-line tip. */
  cue?: string;
}
