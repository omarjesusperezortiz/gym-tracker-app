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
export * from './logic/exerciseMedia';
export * from './logic/muscleGroups';
