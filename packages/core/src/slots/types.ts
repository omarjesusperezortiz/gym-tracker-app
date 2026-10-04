import type { ExerciseId, Kind } from '../exercises/types';

/** Catalog slot name, e.g. "Squat", "Flat chest press". */
export type SlotKey = string;

/**
 * A conceptual movement a session asks for. It names which exercises can fill
 * it under each equipment kind (the card's tabs); the exercises themselves live
 * in the exercise map.
 */
export interface Slot {
  key: SlotKey;
  /** kind → every exercise that can fill this slot under that kind (default first). */
  variants: Partial<Record<Kind, ExerciseId[]>>;
  /** kind → the exercise shown when nothing else is chosen. */
  defaultVariant: Partial<Record<Kind, ExerciseId>>;
}
