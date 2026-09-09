import { describe, it, expect } from 'vitest';
import { ghostFor, effectiveValue } from '../lib/ghost';
import type { LiveSet } from '../state/AppState';

function s(w: string, r: string): LiveSet {
  return { w, r, last: '' };
}

describe('ghostFor — cascading placeholder from the nearest filled set above', () => {
  it('empty set shows the value of the set directly above', () => {
    const sets = [s('2', '2'), s('', '')];
    expect(ghostFor(sets, 1, 'w')).toBe('2');
    expect(ghostFor(sets, 1, 'r')).toBe('2');
  });

  it('cascades from the NEAREST filled set above, not always set 1 (Leon screenshot)', () => {
    // Set1: 2×2 (typed) · Set2: ghost · Set3: 3×2 (weight typed) · Set4: ghost
    const sets = [s('2', '2'), s('', ''), s('3', ''), s('', '')];
    // set 4 weight ghosts 3 (from set 3), NOT 2 (from set 1)
    expect(ghostFor(sets, 3, 'w')).toBe('3');
    // set 4 reps: set 3 reps empty → cascade further up to set 1's "2"
    expect(ghostFor(sets, 3, 'r')).toBe('2');
    // set 2 ghosts set 1
    expect(ghostFor(sets, 1, 'w')).toBe('2');
  });

  it('the first set never has a ghost', () => {
    const sets = [s('', ''), s('5', '5')];
    expect(ghostFor(sets, 0, 'w')).toBe('');
    expect(ghostFor(sets, 0, 'r')).toBe('');
  });

  it('a typed set does not affect its OWN ghost (ghost is only for display when empty)', () => {
    const sets = [s('10', '8'), s('12', '')];
    // set 2 reps is empty → ghosts set 1 reps (8)
    expect(ghostFor(sets, 1, 'r')).toBe('8');
  });
});

describe('effectiveValue — what actually gets saved', () => {
  it('uses the typed value when present', () => {
    const sets = [s('2', '2'), s('3', '')];
    expect(effectiveValue(sets, 1, 'w')).toBe('3'); // typed
    expect(effectiveValue(sets, 1, 'r')).toBe('2'); // ghost from set 1
  });

  it('multi-digit typing is never corrupted — the typed value is stored verbatim', () => {
    // The old bug: typing "24" left later sets at "2". Ghosts fix it because the
    // stored value is exactly what you typed; nothing propagates mid-keystroke.
    const sets = [s('', '24'), s('', ''), s('', '')];
    expect(effectiveValue(sets, 0, 'r')).toBe('24');
    expect(effectiveValue(sets, 1, 'r')).toBe('24'); // ghost of 24
    expect(effectiveValue(sets, 2, 'r')).toBe('24');
  });

  it('a fully empty column saves empty (nothing above to inherit)', () => {
    const sets = [s('', ''), s('', '')];
    expect(effectiveValue(sets, 1, 'w')).toBe('');
  });
});
