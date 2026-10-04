// Sessions still live in catalog.ts (the UI reads them from there); plans are
// built from it so the two can't drift. What a plan adds is the equipment rule
// and any per-plan default exercise.

import { catalog } from '../catalog';
import type { Kind, LevelKey, PlanKey, Slot as CatalogSlot } from '../types';
import type { Plan, Session, SessionSlot } from './types';

const toSlots = (slots: CatalogSlot[]): SessionSlot[] => slots.map(([key, reps, tag]) => [key, reps, tag]);

export function planFromCatalog(key: PlanKey, rule: Pick<Plan, 'allowedEquipment' | 'slotDefaults'>): Plan {
  const src = catalog.plans[key];
  const sessions: Session[] = Object.entries(src.sessions).map(([sessKey, s]) => ({
    key: sessKey,
    name: s.name,
    emoji: s.emoji,
    group: s.group,
    muscles: s.muscles,
    slots: toSlots(s.slots),
    levels: s.levels
      ? Object.fromEntries(
          Object.entries(s.levels).map(([lv, l]) => [lv as LevelKey, { muscles: l?.muscles, slots: toSlots(l?.slots ?? []) }]),
        )
      : undefined,
  }));
  const slotKinds = Object.fromEntries(
    Object.entries(src.variations).map(([slotKey, byKind]) => [slotKey, Object.keys(byKind) as Kind[]]),
  );
  return { key, label: src.label, icon: src.icon, sessions, slotKinds, ...rule };
}
