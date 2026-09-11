// Muscle-group layer (Option A / Recommendation #1).
//
// Our catalog already models movements (slot names) and their equipment
// variations (bar/cable/machine/db → specific exercises). This file adds the
// one missing layer: a muscle GROUP tag on each movement, so the exercise
// picker can browse "by muscle group → specific movement/exercise" the way the
// Program → Movement → Exercise model describes.
//
// Code-controlled (no user-custom), matching the app's rule.

// Reuse the canonical MuscleGroup union already defined for user prefs / the
// muscle map, so there's one source of truth for the 6 groups. (Not re-exported
// here — it's already exported from ./supabase/prefs via the package index.)
import type { MuscleGroup } from '../supabase/prefs';

export interface MuscleGroupMeta {
  key: MuscleGroup;
  label: string;
  emoji: string;
}

export const muscleGroups: MuscleGroupMeta[] = [
  { key: 'chest', label: 'Chest', emoji: '🎯' },
  { key: 'back', label: 'Back', emoji: '🪃' },
  { key: 'shoulders', label: 'Shoulders', emoji: '🔺' },
  { key: 'arms', label: 'Arms', emoji: '💥' },
  { key: 'legs', label: 'Legs', emoji: '🦵' },
  { key: 'core', label: 'Core', emoji: '🧱' },
];

// Every movement (variations key / slot name) → its primary muscle group.
// Keys MUST match the catalog movement names exactly.
export const movementMuscleGroup: Record<string, MuscleGroup> = {
  // chest
  'Flat chest press': 'chest',
  'Incline press': 'chest',
  'Chest fly': 'chest',
  'Chest dip': 'chest',
  // back
  'Horizontal row': 'back',
  'Vertical pull (lats)': 'back',
  'Lat pullover / straight-arm': 'back',
  'Shrugs (traps)': 'back',
  // shoulders
  'Overhead press': 'shoulders',
  'Side lateral raise': 'shoulders',
  'Front raise': 'shoulders',
  'Upright row': 'shoulders',
  'Rear delts': 'shoulders',
  // arms
  'Biceps curl': 'arms',
  'Hammer curl': 'arms',
  'Triceps pushdown/ext': 'arms',
  'Overhead triceps': 'arms',
  'Forearm / wrist': 'arms',
  // legs
  Squat: 'legs',
  Lunge: 'legs',
  'Hamstring / RDL': 'legs',
  'Calf raise': 'legs',
  // core
  Plank: 'core',
  'Plank (core)': 'core',
  'Side Plank': 'core',
  'Leg raise (core)': 'core',
  'Hanging/Lying Leg Raise': 'core',
  'Reverse Crunch': 'core',
  'Bicycle Crunch': 'core',
  'Russian Twist': 'core',
  'Pallof Press (anti-rotation)': 'core',
};

/** The muscle group for a movement (defaults to 'core' if unmapped). */
export function groupForMovement(movement: string): MuscleGroup {
  return movementMuscleGroup[movement] ?? 'core';
}
