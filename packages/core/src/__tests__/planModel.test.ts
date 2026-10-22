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

// Omar's rule for the bodyweight plans: calisthenics may use a pull-up bar or
// a bench, travel at most a bench/chair. Checked on what the resolver actually
// shows — each tab's default plus every style chip — not on slot names.
describe('calisthenics / travel equipment', () => {
  const FORBIDDEN = ['band', 'dumbbell', 'cable', 'machine'];

  const shown = (key: 'cal' | 'travel') => {
    const plan = getPlan(key);
    const used = new Set<string>();
    for (const s of plan.sessions) {
      for (const [k] of s.slots) used.add(k);
      for (const lv of Object.values(s.levels ?? {})) for (const [k] of lv!.slots) used.add(k);
    }
    const rows: { slot: string; id: string }[] = [];
    for (const slot of used) {
      for (const kind of plan.slotKinds[slot]) {
        rows.push({ slot, id: resolveExercise({ plan, slotKey: slot, kind }).id });
        for (const v of styleVariants[slot]?.[kind] ?? []) {
          rows.push({ slot, id: resolveExercise({ plan, slotKey: slot, kind, activeVariantPref: v.name }).id });
        }
      }
    }
    return rows;
  };

  it.each(['cal', 'travel'] as const)('%s never shows a band, dumbbell, cable or machine exercise', (key) => {
    const bad = shown(key).filter((r) => exercises[r.id].equipment !== 'bodyweight');
    expect(bad.map((r) => `${r.slot}: ${r.id} ${exercises[r.id].name} (${exercises[r.id].equipment})`)).toEqual([]);
    for (const r of shown(key)) expect(FORBIDDEN).not.toContain(exercises[r.id].equipment);
  });

  it('travel never shows an exercise that needs a bar', () => {
    const bad = shown('travel').filter((r) => exercises[r.id].needsBar);
    expect(bad.map((r) => `${r.slot}: ${r.id} ${exercises[r.id].name}`)).toEqual([]);
  });

  it('every bar exercise is marked needsBar', () => {
    const BAR = /pull-?ups?\b|chin-?ups?\b|hanging|inverted row|muscle-?up|dips - chest/i;
    for (const ex of Object.values(exercises)) {
      if (ex.equipment === 'bodyweight' && BAR.test(ex.name)) expect([ex.id, ex.needsBar]).toEqual([ex.id, true]);
    }
  });

  // One exercise on two slots is only fine when both slots are the same
  // movement. Chest dip + Triceps (RrLske5, bench dips) and the plank slots
  // are Omar's call and left as they are.
  const SAME_MOVEMENT: Record<string, string[]> = {
    cal: ['Chest dip|Triceps pushdown/ext', 'Hanging/Lying Leg Raise|Leg raise (core)', 'Plank|Plank (core)'],
    travel: ['Lower Back Curl|Superman', 'Plank|Plank (postural)|Plank with Twist'],
  };
  it.each(['cal', 'travel'] as const)('%s: an exercise is shown by one slot, bar the same-movement pairs', (key) => {
    const slotsOf = new Map<string, Set<string>>();
    for (const r of shown(key)) slotsOf.set(r.id, (slotsOf.get(r.id) ?? new Set()).add(r.slot));
    const shared = [...slotsOf.values()].filter((s) => s.size > 1).map((s) => [...s].sort().join('|'));
    expect(shared.sort()).toEqual([...SAME_MOVEMENT[key]].sort());
  });
});
