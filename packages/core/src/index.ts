// @gym-tracker/core — shared, framework-agnostic logic + types used by both
// the web (React/Vite) and mobile (React Native/Expo) apps.

export * from './types';
export { catalog } from './catalog';
export * from './logic/scheme';
export * from './logic/nutrition';
export * from './supabase/client';
export * from './supabase/history';
export * from './supabase/prefs';
export * from './supabase/customizations';
export * from './logic/addable';
export * from './logic/exercise-id';
export * from './logic/muscleMap';
export * from './logic/oneRM';
export * from './logic/volume';
export * from './logic/plateau';
export * from './logic/muscleGroups';
export * from './logic/avatars';
export * from './logic/styleVariants';

// Plan + Slot + Exercise model. Plan/Session/Slot/Equipment are aliased: the
// catalog's shapes (./types) and user prefs already own those names.
export { exercises, exercise, findExercise, KIND_EQUIPMENT, mediaFiles, exerciseDemoUrl, exercisePosterUrl } from './exercises';
export type { Exercise, ExerciseId, Difficulty, Equipment as ExerciseEquipment } from './exercises';
export { slots, slot, findSlot, kindsForSlot, defaultExerciseFor } from './slots';
export type { Slot as SlotDef, SlotKey } from './slots';
export { getPlan, listPlans } from './plans';
export type { Plan as PlanDef, Session as SessionDef, SessionSlot } from './plans';
export { resolveExercise, type ResolveArgs } from './resolver';
