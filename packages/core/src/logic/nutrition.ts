// Nutrition guidance — pure, framework-agnostic estimates derived from the
// user's goal and bodyweight. These are *guidance estimates* (round numbers,
// not clinical targets); the UI labels them as such. No personal/regional data
// lives here — copy is neutral and general-audience.
import type { Goal } from '../supabase/prefs';

export interface ProteinTarget {
  /** Lower bound, grams/day, rounded to the nearest 5 g. */
  minG: number;
  /** Upper bound, grams/day, rounded to the nearest 5 g. */
  maxG: number;
}

export type CalorieDirection = 'surplus' | 'deficit' | 'maintenance';

export interface CalorieGuidance {
  direction: CalorieDirection;
  /** Human label, e.g. "+250–350 kcal" or "≈ maintenance". */
  label: string;
}

export interface NutritionTargets {
  /** Null when bodyweight is unknown — the UI prompts for it instead of faking a number. */
  protein: ProteinTarget | null;
  calories: CalorieGuidance;
  /** Litres/day, rounded to 0.1; null when bodyweight is unknown. */
  waterLitres: number | null;
  /** Per-goal, neutral one-liner shown under the target tiles. */
  note: string;
}

// Protein per kg of bodyweight, by goal. Ranges follow common evidence-based
// guidance (~1.6–2.2 g/kg for trainees), with a touch more in a deficit to
// protect lean mass and a touch less for endurance-focused athletes.
const PROTEIN_PER_KG: Record<Goal, [min: number, max: number]> = {
  muscle: [1.6, 2.2],
  strength: [1.6, 2.2],
  fat_loss: [1.8, 2.2],
  endurance: [1.4, 1.8],
  maintain: [1.6, 2.0],
};

// Calorie direction + a plain label, by goal. Building muscle / getting
// stronger want a modest surplus; losing fat wants a moderate deficit;
// everything else sits around maintenance.
const CALORIE_GUIDANCE: Record<Goal, CalorieGuidance> = {
  muscle: { direction: 'surplus', label: '+250–350 kcal' },
  strength: { direction: 'surplus', label: '+150–250 kcal' },
  fat_loss: { direction: 'deficit', label: '−300–500 kcal' },
  endurance: { direction: 'maintenance', label: '≈ maintenance' },
  maintain: { direction: 'maintenance', label: '≈ maintenance' },
};

// Neutral, general-audience copy — no jargon, no sport- or region-specific
// wording. One line per goal.
const GOAL_NOTE: Record<Goal, string> = {
  muscle: 'Build muscle with a small calorie surplus and plenty of protein.',
  strength: 'Fuel strength work with a slight surplus and protein at every meal.',
  fat_loss: 'Lose fat in a moderate deficit while keeping protein high to protect muscle.',
  endurance: 'Support endurance training by eating around maintenance with enough carbs to fuel sessions.',
  maintain: 'Hold your weight around maintenance and keep protein steady.',
};

function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

/** Protein range in g/day for a goal + bodyweight, or null if weight is unknown. */
export function proteinTarget(goal: Goal, bodyweightKg: number | null): ProteinTarget | null {
  if (!bodyweightKg || bodyweightKg <= 0) return null;
  const [min, max] = PROTEIN_PER_KG[goal];
  return { minG: round5(bodyweightKg * min), maxG: round5(bodyweightKg * max) };
}

/** Calorie direction + label for a goal (independent of bodyweight). */
export function calorieGuidance(goal: Goal): CalorieGuidance {
  return CALORIE_GUIDANCE[goal];
}

/** A rough daily water target (~33 ml/kg), rounded to 0.1 L, or null if weight is unknown. */
export function waterLitres(bodyweightKg: number | null): number | null {
  if (!bodyweightKg || bodyweightKg <= 0) return null;
  return Math.round(bodyweightKg * 0.033 * 10) / 10;
}

/** Neutral one-line note for a goal. */
export function goalNote(goal: Goal): string {
  return GOAL_NOTE[goal];
}

/** Everything the Meals tab needs, derived from the user's goal + bodyweight. */
export function nutritionTargets(goal: Goal, bodyweightKg: number | null): NutritionTargets {
  return {
    protein: proteinTarget(goal, bodyweightKg),
    calories: calorieGuidance(goal),
    waterLitres: waterLitres(bodyweightKg),
    note: goalNote(goal),
  };
}
