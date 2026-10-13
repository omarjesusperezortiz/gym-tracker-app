import type { PlanKey } from '../types';
import { calisthenics } from './calisthenics';
import { gym } from './gym';
import { travel } from './travel';
import type { Plan } from './types';

export * from './types';

const PLANS: Record<PlanKey, Plan> = { gym, cal: calisthenics, travel };

/** The plan for a key (the same keys the catalog and saved workouts use). */
export function getPlan(key: PlanKey): Plan {
  const p = PLANS[key];
  if (!p) throw new Error(`Unknown plan "${key}"`);
  return p;
}

export function listPlans(): Plan[] {
  return Object.values(PLANS);
}
