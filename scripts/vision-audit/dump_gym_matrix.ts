// Dump every (slot, tab, exercise) the gym plan can show — plus the other
// kinds filed on the same shared slots — to /tmp/gt-audit-work/gym-matrix.json.
// Run from the repo root:
//   esbuild scripts/vision-audit/dump_gym_matrix.ts --bundle --platform=node --format=esm \
//     --alias:@supabase/supabase-js=<stub exporting createClient> --outfile=/tmp/d.mjs && node /tmp/d.mjs
import { getPlan, resolveExercise, catalog, exercises } from '../../packages/core/src/index';
import { slots } from '../../packages/core/src/slots';
import { variantsFor } from '../../packages/core/src/logic/styleVariants';
import { mkdirSync, writeFileSync } from 'fs';

const plan = getPlan('gym');
const cat: any = catalog.plans.gym;
const rows: any[] = [];
let n = 0;
const push = (r: any) => {
  const ex: any = (exercises as any)[r.id];
  const title = r.chip ?? r.catalogLabel ?? null;
  rows.push({ n: ++n, ...r, title, titleCue: title ? (cat.cues?.[title] ?? '') : '', name: ex.name, equipment: ex.equipment,
    target: ex.target, secondary: ex.secondary, steps: ex.steps, exCue: ex.cue ?? '' });
};
for (const [slotKey, gymKinds] of Object.entries(plan.slotKinds)) {
  const s: any = (slots as any)[slotKey];
  const allKinds = [...gymKinds, ...Object.keys(s.variants).filter((k) => !gymKinds.includes(k as any))];
  for (const kind of allKinds) {
    const inGym = gymKinds.includes(kind as any);
    const def = inGym ? resolveExercise({ plan, slotKey, kind: kind as any }).id : s.defaultVariant[kind];
    const chips = variantsFor(slotKey, kind) ?? [];
    const owners = Object.entries((catalog as any).plans).filter(([, p]: any) => p.variations[slotKey]?.[kind]).map(([k, p]: any) => `${k}:${p.variations[slotKey][kind].name}`);
    for (const id of new Set<string>([def, ...chips.map((c) => c.id), ...(s.variants[kind] ?? [])]))
      push({ slot: slotKey, kind, inGymTabs: inGym, owners, id, isDefault: id === def,
        chip: chips.find((c) => c.id === id)?.name ?? null, reachable: id === def || chips.some((c) => c.id === id),
        catalogLabel: cat.variations[slotKey]?.[kind]?.name ?? null });
  }
}
mkdirSync('/tmp/gt-audit-work', { recursive: true });
writeFileSync('/tmp/gt-audit-work/gym-matrix.json', JSON.stringify({ rows }, null, 1));
console.log('rows', rows.length, 'gym-visible', rows.filter((r) => r.inGymTabs).length);
