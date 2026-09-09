// Pure edits to a SessionOverlay. The overlay only ever stores deltas from the
// catalog session, so every one of these returns a new overlay for
// saveCustomization to persist — nothing here talks to the network.
import { EMPTY_OVERLAY, type AddedSlot, type SessionOverlay } from '@gym-tracker/core';

export function hasCustomization(overlay: SessionOverlay | null | undefined): boolean {
  if (!overlay) return false;
  return overlay.added.length > 0 || overlay.hidden.length > 0 || overlay.ordering.length > 0;
}

export function addSlot(overlay: SessionOverlay, added: AddedSlot): SessionOverlay {
  if (overlay.added.some((a) => a.slot === added.slot)) return overlay;
  return {
    ...overlay,
    added: [...overlay.added, added],
    // Adding back something previously hidden should un-hide it rather than
    // leave a contradictory overlay.
    hidden: overlay.hidden.filter((h) => h !== added.slot),
  };
}

// Removing a BASE slot means hiding it; the catalog session itself is shared and
// never edited.
export function hideSlot(overlay: SessionOverlay, slot: string): SessionOverlay {
  return {
    ...overlay,
    hidden: overlay.hidden.includes(slot) ? overlay.hidden : [...overlay.hidden, slot],
    ordering: overlay.ordering.filter((s) => s !== slot),
  };
}

// Removing an ADDED slot drops it outright — there's no base row to hide.
export function removeAdded(overlay: SessionOverlay, slot: string): SessionOverlay {
  return {
    ...overlay,
    added: overlay.added.filter((a) => a.slot !== slot),
    ordering: overlay.ordering.filter((s) => s !== slot),
  };
}

// Moves `slot` one place up (-1) or down (+1) within the session's current order
// and stores the result as the explicit ordering. `transient` names (slots added
// just for today) are dropped from what gets persisted — they don't exist for
// any future session, so storing them would only leave junk behind.
export function moveSlot(
  overlay: SessionOverlay,
  order: string[],
  slot: string,
  direction: -1 | 1,
  transient: string[] = []
): SessionOverlay {
  const from = order.indexOf(slot);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= order.length) return overlay;
  const next = order.slice();
  [next[from], next[to]] = [next[to], next[from]];
  return { ...overlay, ordering: next.filter((s) => !transient.includes(s)) };
}

// One-off slots live in AppState, not the overlay, but they still have to show
// up in the session being trained — so they're merged in only for rendering.
export function withOneOffs(overlay: SessionOverlay | null | undefined, oneOffs: AddedSlot[]): SessionOverlay {
  const base = overlay ?? EMPTY_OVERLAY;
  if (!oneOffs.length) return base;
  return { ...base, added: [...base.added, ...oneOffs] };
}
