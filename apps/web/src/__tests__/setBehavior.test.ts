import { describe, it, expect } from 'vitest';
import { reducer, keyOf, type State, type LiveSlotState, type LiveSet } from '../state/AppState';

const K = keyOf('gym', 'push', 'Flat chest press');

function stateWith(slot: LiveSlotState): State {
  return {
    plan: 'gym',
    view: 'train',
    cur: 'push',
    live: { [K]: slot },
    pref: {},
    editingId: null,
    editingKey: null,
  };
}

const baseSlot: LiveSlotState = { kind: 'bar', done: false, force: false, sets: null };

// Simulate a real keystroke sequence into set 1's reps field: "2" then "24".
// This is exactly what broke before — the first keystroke filled the empty sets,
// then the second keystroke had nowhere to propagate.
function typeInto(state: State, index: number, field: 'w' | 'r', value: string): State {
  return reducer(state, { type: 'UPDATE_SET', key: K, index, field, value });
}

function reps(s: State): string[] {
  return (s.live[K].sets ?? []).map((x) => x.r);
}
function weights(s: State): string[] {
  return (s.live[K].sets ?? []).map((x) => x.w);
}

function threeEmpty(): LiveSet[] {
  return [
    { w: '', r: '', last: '' },
    { w: '', r: '', last: '' },
    { w: '', r: '', last: '' },
  ];
}

describe('linked-set mirroring (Leon multi-digit bug)', () => {
  it('multi-digit typing in set 1 reps re-applies the FULL value to linked sets', () => {
    let s = stateWith({ ...baseSlot, sets: threeEmpty() });
    s = typeInto(s, 0, 'r', '2'); // first keystroke
    expect(reps(s)).toEqual(['2', '2', '2']);
    s = typeInto(s, 0, 'r', '24'); // second keystroke — the case that broke
    expect(reps(s)).toEqual(['24', '24', '24']);
  });

  it('handles a long weight like 42.5 across keystrokes', () => {
    let s = stateWith({ ...baseSlot, sets: threeEmpty() });
    for (const v of ['4', '42', '42.', '42.5']) s = typeInto(s, 0, 'w', v);
    expect(weights(s)).toEqual(['42.5', '42.5', '42.5']);
  });

  it('editing a later set unlinks ONLY that set/field; set 1 no longer overwrites it', () => {
    let s = stateWith({ ...baseSlot, sets: threeEmpty() });
    s = typeInto(s, 0, 'r', '8'); // all → 8
    s = typeInto(s, 1, 'r', '5'); // set 2 customized → unlinked
    expect(reps(s)).toEqual(['8', '5', '8']);
    s = typeInto(s, 0, 'r', '10'); // set 1 changes again
    expect(reps(s)).toEqual(['10', '5', '10']); // set 2 keeps its own value
  });

  it('weight and reps unlink independently', () => {
    let s = stateWith({ ...baseSlot, sets: threeEmpty() });
    s = typeInto(s, 0, 'w', '40');
    s = typeInto(s, 0, 'r', '8');
    s = typeInto(s, 1, 'w', '45'); // set 2 weight unlinked, reps still linked
    expect(weights(s)).toEqual(['40', '45', '40']);
    s = typeInto(s, 0, 'r', '6'); // reps still propagate to set 2
    expect(reps(s)).toEqual(['6', '6', '6']);
  });

  it('clearing set 1 clears the linked sets too', () => {
    let s = stateWith({ ...baseSlot, sets: threeEmpty() });
    s = typeInto(s, 0, 'r', '8');
    s = typeInto(s, 0, 'r', ''); // backspaced empty
    expect(reps(s)).toEqual(['', '', '']);
  });
});

describe('ADD_SET copies set 1 and stays linked', () => {
  it('a new set mirrors set 1 and keeps following it', () => {
    let s = stateWith({ ...baseSlot, sets: [{ w: '20', r: '8', last: '' }] });
    s = reducer(s, { type: 'ADD_SET', key: K });
    expect(weights(s)).toEqual(['20', '20']);
    expect(reps(s)).toEqual(['8', '8']);
    // changing set 1 still updates the added set
    s = typeInto(s, 0, 'r', '10');
    expect(reps(s)).toEqual(['10', '10']);
  });

  it('first ever set is empty', () => {
    let s = stateWith({ ...baseSlot, sets: null });
    s = reducer(s, { type: 'ADD_SET', key: K });
    expect(s.live[K].sets).toEqual([{ w: '', r: '', last: '', wAuto: true, rAuto: true }]);
  });
});

describe('edited (saved) workouts do not mirror', () => {
  it('sets loaded with wAuto/rAuto=false keep their own values when set 1 changes', () => {
    let s = stateWith({
      ...baseSlot,
      sets: [
        { w: '40', r: '8', last: '', wAuto: false, rAuto: false },
        { w: '45', r: '6', last: '', wAuto: false, rAuto: false },
      ],
    });
    s = typeInto(s, 0, 'w', '50');
    expect(weights(s)).toEqual(['50', '45']); // set 2 untouched
  });
});
