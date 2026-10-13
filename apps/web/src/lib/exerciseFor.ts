import { findSlot, getPlan, resolveExercise, variantKey, type Exercise, type Kind, type PlanKey } from '@gym-tracker/core';

/**
 * The exercise to show for a slot in a plan: `kind` defaults to the plan's
 * first tab for the slot, and a chosen style variant (AppState.activeVariant)
 * applies. Null only for slots outside the catalog (no demo to show); catalog
 * slots always resolve, or the resolver throws on misconfigured data.
 */
export function exerciseFor(
  planKey: PlanKey,
  slotKey: string,
  kind?: Kind | null,
  activeVariants?: Record<string, string>,
): Exercise | null {
  const plan = getPlan(planKey);
  const k = kind ?? plan.slotKinds[slotKey]?.[0];
  if (!k || !findSlot(slotKey)) return null;
  return resolveExercise({ plan, slotKey, kind: k, activeVariantPref: activeVariants?.[variantKey(slotKey, k)] });
}
