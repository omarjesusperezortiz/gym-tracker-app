import { describe, it, expect } from 'vitest';
import { reducer, keyOf, type State, type LiveSlotState } from '../state/AppState';

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

describe('ADD_SET copies the previous set', () => {
  it('new set inherits weight+reps from the last set', () => {
    const s0 = stateWith({ ...baseSlot, sets: [{ w: '20', r: '8', last: '' }] });
    const s1 = reducer(s0, { type: 'ADD_SET', key: K });
    expect(s1.live[K].sets).toEqual([
      { w: '20', r: '8', last: '' },
      { w: '20', r: '8', last: '' },
    ]);
  });

  it('first ever set is empty (nothing to copy)', () => {
    const s0 = stateWith({ ...baseSlot, sets: null });
    const s1 = reducer(s0, { type: 'ADD_SET', key: K });
    expect(s1.live[K].sets).toEqual([{ w: '', r: '', last: '' }]);
  });
});

describe('UPDATE_SET on the first set fills empty later sets', () => {
  it('typing weight in set 1 propagates to empty sets below', () => {
    const s0 = stateWith({
      ...baseSlot,
      sets: [
        { w: '', r: '', last: '' },
        { w: '', r: '', last: '' },
        { w: '', r: '', last: '' },
      ],
    });
    const s1 = reducer(s0, { type: 'UPDATE_SET', key: K, index: 0, field: 'w', value: '40' });
    expect(s1.live[K].sets!.map((x) => x.w)).toEqual(['40', '40', '40']);
  });

  it('does NOT overwrite a later set the user already customized', () => {
    const s0 = stateWith({
      ...baseSlot,
      sets: [
        { w: '', r: '', last: '' },
        { w: '50', r: '', last: '' },
      ],
    });
    const s1 = reducer(s0, { type: 'UPDATE_SET', key: K, index: 0, field: 'w', value: '40' });
    expect(s1.live[K].sets!.map((x) => x.w)).toEqual(['40', '50']);
  });

  it('editing a NON-first set does not propagate', () => {
    const s0 = stateWith({
      ...baseSlot,
      sets: [
        { w: '40', r: '', last: '' },
        { w: '', r: '', last: '' },
      ],
    });
    const s1 = reducer(s0, { type: 'UPDATE_SET', key: K, index: 1, field: 'w', value: '30' });
    expect(s1.live[K].sets!.map((x) => x.w)).toEqual(['40', '30']);
  });
});
