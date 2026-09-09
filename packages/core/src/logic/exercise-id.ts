import { catalog } from '../catalog';

// ── Exercise identity (Option C: catalog IDs, id-safe new writes) ─────────────
// Exercises have historically been keyed by their display NAME. This module adds
// a stable slug ID for every catalog exercise WITHOUT migrating old data:
//   • exerciseId(name)   → stable slug for a catalog name (or a slugified fallback)
//   • exerciseName(id)   → display name for an id (or the id itself if unknown)
//   • New writes store slot_id alongside slot (name); OLD rows have only the name.
//   • Lookups bridge both via these helpers, so nothing breaks and no backfill is
//     needed. A full DB backfill (Option B) becomes optional/low-stakes later.

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s/-]/g, '') // drop punctuation like ()., keep word chars, space, slash, hyphen
    .replace(/[\s/]+/g, '_') // spaces and slashes → underscore
    .replace(/-+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Build the stable name↔id maps once from the catalog (all plans' exercises).
function buildMaps(): { nameToId: Map<string, string>; idToName: Map<string, string> } {
  const nameToId = new Map<string, string>();
  const idToName = new Map<string, string>();
  const seen = new Set<string>();
  const add = (name: string) => {
    if (!name || nameToId.has(name)) return;
    let id = slugify(name);
    // Guard against collisions (two different names slugging to the same id).
    if (seen.has(id)) {
      let n = 2;
      while (seen.has(`${id}_${n}`)) n++;
      id = `${id}_${n}`;
    }
    seen.add(id);
    nameToId.set(name, id);
    idToName.set(id, name);
  };
  for (const plan of Object.values(catalog.plans)) {
    for (const name of Object.keys(plan.variations || {})) add(name);
    for (const sess of Object.values(plan.sessions || {})) {
      for (const slot of sess.slots) add(slot[0]);
    }
  }
  return { nameToId, idToName };
}

const { nameToId, idToName } = buildMaps();

// Stable id for an exercise name. Catalog names get their registered slug;
// anything unknown gets a deterministic slugified id so new writes are always
// id-tagged (never empty).
export function exerciseId(name: string): string {
  return nameToId.get(name) ?? slugify(name);
}

// Display name for an id. Known ids map back to their catalog name; unknown ids
// (e.g. from a future backfill or another client) are returned as-is.
export function exerciseName(id: string): string {
  return idToName.get(id) ?? id;
}

// True when the id belongs to a known catalog exercise.
export function isKnownExerciseId(id: string): boolean {
  return idToName.has(id);
}

// Resolve a logged row (which may have only a name, only an id, or both) to a
// canonical id — the bridge that lets id-based lookups work across old and new
// data without a migration.
export function resolveExerciseId(row: { slot?: string; slotId?: string | null }): string {
  if (row.slotId) return row.slotId;
  return exerciseId(row.slot ?? '');
}
