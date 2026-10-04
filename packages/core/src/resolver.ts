// (plan, slot, kind[, chosen style]) → the one Exercise to show.
//
// No fallbacks to another kind or slot: if a plan can't resolve a slot under a
// kind, the catalog is misconfigured and we throw — tests keep every catalog
// combination resolvable, so this only fires on bad data, never on the user.

import { exercise, KIND_EQUIPMENT, type Exercise, type Kind } from './exercises';
import { variantsFor } from './logic/styleVariants';
import type { Plan } from './plans/types';
import { findSlot } from './slots';

export interface ResolveArgs {
  plan: Plan;
  slotKey: string;
  kind: Kind;
  /** Chosen style variant name (AppState.activeVariant[`${slot}|${kind}`]). */
  activeVariantPref?: string;
}

function resolvedId({ plan, slotKey, kind, activeVariantPref }: ResolveArgs): string {
  const equipment = KIND_EQUIPMENT[kind];
  if (!equipment || !plan.allowedEquipment.includes(equipment)) {
    throw new Error(`Plan "${plan.key}" does not allow kind "${kind}" (${equipment ?? 'unknown equipment'})`);
  }
  const s = findSlot(slotKey);
  if (!s) throw new Error(`Unknown slot "${slotKey}" (plan "${plan.key}")`);
  const ids = s.variants[kind];
  if (!ids || ids.length === 0) throw new Error(`Slot "${slotKey}" has no "${kind}" exercises (plan "${plan.key}")`);

  if (activeVariantPref) {
    const chosen = variantsFor(slotKey, kind)?.find((v) => v.name === activeVariantPref);
    if (chosen) {
      if (ids.includes(chosen.id)) return chosen.id;
      console.warn(`Style variant "${chosen.name}" (${chosen.id}) is not a "${kind}" variant of slot "${slotKey}"; using the default`);
    }
  }

  const id = plan.slotDefaults?.[slotKey]?.[kind] ?? s.defaultVariant[kind];
  if (!id) throw new Error(`Slot "${slotKey}" has no default "${kind}" exercise (plan "${plan.key}")`);
  return id;
}

/**
 * Resolve a (plan, slot, kind) to a single Exercise:
 * 1. kind's equipment must be in plan.allowedEquipment;
 * 2. the slot must have exercises for that kind;
 * 3. a chosen style variant wins when it's one of them;
 * 4. else the plan's pinned default, else the slot's default.
 */
export function resolveExercise(args: ResolveArgs): Exercise {
  return exercise(resolvedId(args));
}
