import { slots } from './slots';
import type { Kind } from '../exercises/types';
import type { Slot, SlotKey } from './types';

export * from './types';
export { slots };

/** The slot for a key. Throws on an unknown key. */
export function slot(key: SlotKey): Slot {
  const s = slots[key];
  if (!s) throw new Error(`Unknown slot "${key}"`);
  return s;
}

/** Non-throwing lookup, for slot names that come from saved data. */
export function findSlot(key: SlotKey): Slot | undefined {
  return slots[key];
}

/** Every kind the slot has exercises for. */
export function kindsForSlot(key: SlotKey): Kind[] {
  return Object.keys(slot(key).variants) as Kind[];
}

/** The slot's default exercise id under a kind (undefined when it has none). */
export function defaultExerciseFor(s: Slot, kind: Kind): string | undefined {
  return s.defaultVariant[kind];
}
