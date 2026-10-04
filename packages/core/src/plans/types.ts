import type { Equipment, ExerciseId, Kind } from '../exercises/types';
import type { LevelKey, PlanKey } from '../types';
import type { SlotKey } from '../slots/types';

/** [slotKey, reps/scheme, strength tag] — same tuple the catalog uses. */
export type SessionSlot = [slotKey: SlotKey, reps: string, tag?: string];

export interface Session {
  key: string;
  name: string;
  emoji?: string;
  level?: LevelKey;
  group?: 'broad' | 'focused';
  muscles?: string;
  slots: SessionSlot[];
  /** Difficulty variants (travel). Absent = single fixed session. */
  levels?: Partial<Record<LevelKey, { muscles?: string; slots: SessionSlot[] }>>;
}

export interface Plan {
  key: PlanKey;
  label: string;
  icon: string;
  /** The filter rule: a kind is usable in this plan only if its equipment is listed. */
  allowedEquipment: Equipment[];
  sessions: Session[];
  /** slot → the equipment tabs this plan offers for it (first = default tab). */
  slotKinds: Record<SlotKey, Kind[]>;
  /** Per-plan default exercise where it differs from the slot's own default. */
  slotDefaults?: Record<SlotKey, Partial<Record<Kind, ExerciseId>>>;
}
