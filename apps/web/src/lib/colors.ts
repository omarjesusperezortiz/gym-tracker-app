import { catalog } from '@gym-tracker/core';
import type { PlanKey } from '@gym-tracker/core';

const DAY_COLORS = [
  '#ff9f4d',
  'var(--push)',
  'var(--pull)',
  '#5ad6c4',
  '#ff6b9d',
  '#7c9dff',
  'var(--warn)',
  'var(--full)',
  'var(--violet)',
];

export function dayColor(planKey: PlanKey, dayKey: string): string {
  const keys = Object.keys(catalog.plans[planKey].sessions);
  const i = keys.indexOf(dayKey);
  return DAY_COLORS[(i >= 0 ? i : 0) % DAY_COLORS.length];
}

export interface HuedEntry {
  plan?: string;
  sess?: string | null;
}

export function hueOf(e: HuedEntry | null | undefined): string {
  if (e && e.plan && e.sess && (catalog.plans as Record<string, unknown>)[e.plan]) {
    return dayColor(e.plan as PlanKey, e.sess);
  }
  return 'var(--acc)';
}

export function dotColor(type: string | undefined, e: HuedEntry): string {
  if (type === 'skate') return 'var(--blue)';
  if (type === 'rest') return 'var(--mut2)';
  return hueOf(e);
}
