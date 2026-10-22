// Dump every (plan, slot, bodyweight tab, exercise) that calisthenics and travel
// can show — the resolved default plus every style-variant chip — as JSON on stdout.
// Run from the repo root:
//   esbuild scripts/vision-audit/dump_cal_travel_matrix.ts --bundle --platform=node --format=esm \
//     --alias:@supabase/supabase-js=<stub exporting createClient> --outfile=/tmp/d.mjs && node /tmp/d.mjs
import { getPlan, resolveExercise, catalog, exercises } from '../../packages/core/src/index';
import { slots } from '../../packages/core/src/slots';
import { variantsFor } from '../../packages/core/src/logic/styleVariants';

const rows: any[] = [];
for (const key of ['cal', 'travel'] as const) {
  const plan = getPlan(key);
  const cat: any = (catalog as any).plans[key];
  const used = new Set<string>();
  for (const s of plan.sessions) {
    for (const [k] of s.slots) used.add(k);
    for (const l of Object.values(s.levels ?? {})) for (const [k] of (l as any).slots) used.add(k);
  }
  for (const slotKey of used) {
    const s: any = (slots as any)[slotKey];
    const kinds = plan.slotKinds[slotKey] ?? [];
    for (const kind of kinds) {
      let def: string | null = null;
      try { def = resolveExercise({ plan, slotKey, kind: kind as any }).id; } catch (e: any) { rows.push({ plan: key, slot: slotKey, kind, error: e.message }); continue; }
      const chips = variantsFor(slotKey, kind) ?? [];
      for (const id of new Set<string>([def!, ...chips.map((c) => c.id), ...(s.variants[kind] ?? [])])) {
        const ex: any = (exercises as any)[id];
        rows.push({ plan: key, slot: slotKey, kind, id, isDefault: id === def, chip: chips.find((c) => c.id === id)?.name ?? null,
          reachable: id === def || chips.some((c) => c.id === id), title: cat.variations[slotKey]?.[kind]?.name ?? null,
          name: ex.name, equipment: ex.equipment, target: ex.target });
      }
    }
  }
}
console.log(JSON.stringify(rows));
