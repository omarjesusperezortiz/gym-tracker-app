import type { LiveSet } from '../state/AppState';

// Hevy-style "ghost" placeholder: an empty set shows, in gray, the value from
// the nearest filled set ABOVE it (cascading). The value is NOT stored — it's a
// display hint until the user types their own, and it's what gets written on save.
//
//   Set 1: 2   (typed)        → shows 2 (white)
//   Set 2:     (empty)        → ghost "2" (from set 1)
//   Set 3: 3   (typed)        → shows 3 (white)
//   Set 4:     (empty)        → ghost "3" (from set 3, the nearest above)
export function ghostFor(sets: LiveSet[], index: number, field: 'w' | 'r'): string {
  for (let i = index - 1; i >= 0; i--) {
    const v = sets[i][field];
    if (v !== '') return v;
  }
  return '';
}

// Resolve a set's effective value for a field: the typed value if present,
// otherwise its cascading ghost. Used on save so ghosted sets persist what the
// user visually saw.
export function effectiveValue(sets: LiveSet[], index: number, field: 'w' | 'r'): string {
  const own = sets[index][field];
  return own !== '' ? own : ghostFor(sets, index, field);
}
