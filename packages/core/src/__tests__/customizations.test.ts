import { effectiveSession, effectivePlan, EMPTY_OVERLAY, type SessionOverlay } from '../supabase/customizations';
import { addableExercises } from '../logic/addable';
import type { Plan, Session, Slot } from '../types';

const base: Session = {
  name: 'Push day',
  emoji: '💪',
  group: 'broad',
  muscles: 'chest·shoulders·triceps',
  slots: [
    ['Flat chest press', '4 × 8–10', ''],
    ['Overhead press', '3 × 8–12', ''],
    ['Triceps pushdown', '3 × 10–12', ''],
  ] as Slot[],
};

describe('effectiveSession', () => {
  it('returns the base unchanged for an empty/absent overlay', () => {
    expect(effectiveSession(base, EMPTY_OVERLAY).slots).toEqual(base.slots);
    expect(effectiveSession(base, null).slots).toEqual(base.slots);
  });

  it('appends added exercises after base slots', () => {
    const ov: SessionOverlay = { added: [{ slot: 'Bicep curl', scheme: '3 × 12' }], hidden: [], ordering: [] };
    const s = effectiveSession(base, ov);
    expect(s.slots.map((x) => x[0])).toEqual([
      'Flat chest press',
      'Overhead press',
      'Triceps pushdown',
      'Bicep curl',
    ]);
    expect(s.slots[3]).toEqual(['Bicep curl', '3 × 12', '']);
  });

  it('defaults the scheme when an added slot omits it', () => {
    const ov: SessionOverlay = { added: [{ slot: 'Bicep curl', scheme: '' }], hidden: [], ordering: [] };
    expect(effectiveSession(base, ov).slots[3]).toEqual(['Bicep curl', '3 × 8–12', '']);
  });

  it('removes hidden base slots', () => {
    const ov: SessionOverlay = { added: [], hidden: ['Overhead press'], ordering: [] };
    expect(effectiveSession(base, ov).slots.map((x) => x[0])).toEqual(['Flat chest press', 'Triceps pushdown']);
  });

  it('applies explicit ordering, keeping unranked slots stable at the end', () => {
    const ov: SessionOverlay = {
      added: [{ slot: 'Bicep curl', scheme: '3 × 12' }],
      hidden: [],
      ordering: ['Bicep curl', 'Flat chest press'],
    };
    const names = effectiveSession(base, ov).slots.map((x) => x[0]);
    expect(names.slice(0, 2)).toEqual(['Bicep curl', 'Flat chest press']);
    // unranked keep their base relative order after the ranked ones
    expect(names.slice(2)).toEqual(['Overhead press', 'Triceps pushdown']);
  });

  it('does not mutate the base session', () => {
    const before = JSON.parse(JSON.stringify(base.slots));
    effectiveSession(base, { added: [{ slot: 'X', scheme: '3 × 5' }], hidden: ['Overhead press'], ordering: [] });
    expect(base.slots).toEqual(before);
  });
});

describe('effectivePlan', () => {
  const plan: Plan = {
    label: 'Gym',
    icon: '🏋️',
    sessions: { push: base },
    variations: {},
    cues: {},
  };
  it('applies each session overlay by key', () => {
    const merged = effectivePlan(plan, { push: { added: [{ slot: 'Fly', scheme: '3 × 15' }], hidden: [], ordering: [] } });
    expect(merged.sessions.push.slots.map((s) => s[0])).toContain('Fly');
    // original plan untouched
    expect(plan.sessions.push.slots.map((s) => s[0])).not.toContain('Fly');
  });
});

describe('addableExercises', () => {
  const plan: Plan = {
    label: 'Gym',
    icon: '🏋️',
    sessions: { push: base },
    variations: {
      'Flat chest press': { bar: { name: 'BB Bench', img: 'a', img2: 'b' } },
      'Bicep curl': { db: { name: 'DB Curl', img: 'c', img2: 'd' }, cable: { name: 'Cable Curl', img: 'e', img2: 'f' } },
      'Lateral raise': { db: { name: 'DB Lateral', img: 'g', img2: 'h' } },
    },
    cues: {},
  };

  it('lists variations not already in the session, alphabetical', () => {
    const out = addableExercises(plan, base);
    // "Flat chest press" is already in the session → excluded
    expect(out.map((x) => x.slot)).toEqual(['Bicep curl', 'Lateral raise']);
  });

  it('reports the equipment kinds and a preview variation', () => {
    const curl = addableExercises(plan, base).find((x) => x.slot === 'Bicep curl')!;
    expect(curl.kinds).toEqual(['db', 'cable']);
    expect(curl.preview?.name).toBe('DB Curl');
  });
});
