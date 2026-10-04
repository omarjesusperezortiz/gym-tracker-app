import { exercises, KIND_EQUIPMENT } from '../exercises';
import type { Kind } from '../exercises/types';
import { getPlan, listPlans } from '../plans';
import { resolveExercise } from '../resolver';
import { kindsForSlot, slots } from '../slots';
import { styleVariants } from '../logic/styleVariants';

describe('slots', () => {
  const all = Object.entries(slots);

  it.each(all)('%s: keyed by its own key, every id is a known exercise', (key, s) => {
    expect(s.key).toBe(key);
    for (const ids of Object.values(s.variants)) {
      expect(ids!.length).toBeGreaterThan(0);
      for (const id of ids!) expect(exercises[id]).toBeDefined();
    }
  });

  it.each(all)('%s: default per kind is the first variant', (_key, s) => {
    expect(Object.keys(s.defaultVariant).sort()).toEqual(Object.keys(s.variants).sort());
    for (const [kind, id] of Object.entries(s.defaultVariant)) {
      expect(s.variants[kind as Kind]![0]).toBe(id);
    }
  });

  it('every style variant is one of its slot’s variants', () => {
    for (const [slotKey, byKind] of Object.entries(styleVariants)) {
      for (const [kind, list] of Object.entries(byKind)) {
        for (const v of list) expect(slots[slotKey].variants[kind as Kind]).toContain(v.id);
      }
    }
  });

  it('kindsForSlot lists the kinds with exercises', () => {
    expect(kindsForSlot('Flat chest press').sort()).toEqual(['bar', 'bw', 'cable', 'db', 'machine']);
  });
});

describe('plans', () => {
  it('lists gym, calisthenics and travel under their stored keys', () => {
    expect(listPlans().map((p) => p.key)).toEqual(['gym', 'cal', 'travel']);
    expect(() => getPlan('home' as never)).toThrow(/Unknown plan/);
  });

  it('calisthenics and travel are bodyweight-only', () => {
    expect(getPlan('cal').allowedEquipment).toEqual(['bodyweight']);
    expect(getPlan('travel').allowedEquipment).toEqual(['bodyweight']);
  });

  for (const plan of listPlans()) {
    const used = new Set<string>();
    for (const s of plan.sessions) {
      for (const [key] of s.slots) used.add(key);
      for (const lv of Object.values(s.levels ?? {})) for (const [key] of lv!.slots) used.add(key);
    }

    it(`${plan.key}: every session slot resolves under every tab the plan offers`, () => {
      expect(used.size).toBeGreaterThan(0);
      for (const key of used) {
        const kinds = plan.slotKinds[key];
        expect(kinds?.length).toBeGreaterThan(0);
        for (const kind of kinds) {
          expect(plan.allowedEquipment).toContain(KIND_EQUIPMENT[kind]);
          expect(() => resolveExercise({ plan, slotKey: key, kind })).not.toThrow();
        }
      }
    });

    it(`${plan.key}: every allowed kind of a single-equipment plan is covered`, () => {
      const allowedKinds = (Object.keys(KIND_EQUIPMENT) as Kind[]).filter((k) =>
        plan.allowedEquipment.includes(KIND_EQUIPMENT[k]),
      );
      if (allowedKinds.length !== 1) return;
      for (const key of used) expect(slots[key].variants[allowedKinds[0]]?.length).toBeGreaterThan(0);
    });

    it(`${plan.key}: pinned defaults are variants of their slot`, () => {
      for (const [key, byKind] of Object.entries(plan.slotDefaults ?? {})) {
        for (const [kind, id] of Object.entries(byKind)) expect(slots[key].variants[kind as Kind]).toContain(id);
      }
    });
  }
});
