import {
  calorieGuidance,
  goalNote,
  nutritionTargets,
  proteinTarget,
  waterLitres,
} from '../logic/nutrition';
import type { Goal } from '../supabase/prefs';

const GOALS: Goal[] = ['muscle', 'strength', 'fat_loss', 'endurance', 'maintain'];

describe('proteinTarget', () => {
  it('derives a g/day range from bodyweight, rounded to 5 g', () => {
    // 80 kg, muscle: 1.6–2.2 g/kg = 128–176 → rounded to 130–175.
    expect(proteinTarget('muscle', 80)).toEqual({ minG: 130, maxG: 175 });
  });

  it('gives fat-loss a slightly higher floor to protect lean mass', () => {
    // 80 kg, fat_loss: 1.8–2.2 g/kg = 144–176 → 145–175.
    expect(proteinTarget('fat_loss', 80)).toEqual({ minG: 145, maxG: 175 });
  });

  it('returns null when bodyweight is unknown or invalid', () => {
    expect(proteinTarget('muscle', null)).toBeNull();
    expect(proteinTarget('muscle', 0)).toBeNull();
    expect(proteinTarget('muscle', -5)).toBeNull();
  });

  it('keeps min ≤ max for every goal', () => {
    for (const g of GOALS) {
      const t = proteinTarget(g, 75)!;
      expect(t.minG).toBeLessThanOrEqual(t.maxG);
    }
  });
});

describe('calorieGuidance', () => {
  it('prescribes a surplus for building muscle and getting stronger', () => {
    expect(calorieGuidance('muscle').direction).toBe('surplus');
    expect(calorieGuidance('strength').direction).toBe('surplus');
  });

  it('prescribes a deficit for fat loss — never a surplus', () => {
    expect(calorieGuidance('fat_loss').direction).toBe('deficit');
  });

  it('sits at maintenance for endurance and maintain', () => {
    expect(calorieGuidance('endurance').direction).toBe('maintenance');
    expect(calorieGuidance('maintain').direction).toBe('maintenance');
  });

  it('provides a non-empty label for every goal', () => {
    for (const g of GOALS) {
      expect(calorieGuidance(g).label.length).toBeGreaterThan(0);
    }
  });
});

describe('waterLitres', () => {
  it('estimates ~33 ml/kg, rounded to 0.1 L', () => {
    // 80 kg × 0.033 = 2.64 → 2.6 L.
    expect(waterLitres(80)).toBe(2.6);
  });

  it('returns null when bodyweight is unknown', () => {
    expect(waterLitres(null)).toBeNull();
    expect(waterLitres(0)).toBeNull();
  });
});

describe('goalNote', () => {
  it('has neutral, general-audience copy for every goal — no skate/regional jargon', () => {
    for (const g of GOALS) {
      const note = goalNote(g);
      expect(note.length).toBeGreaterThan(0);
      expect(note.toLowerCase()).not.toContain('skate');
    }
  });
});

describe('nutritionTargets', () => {
  it('bundles protein, calories, water and note together', () => {
    const t = nutritionTargets('muscle', 80);
    expect(t.protein).toEqual({ minG: 130, maxG: 175 });
    expect(t.calories.direction).toBe('surplus');
    expect(t.waterLitres).toBe(2.6);
    expect(t.note).toBe(goalNote('muscle'));
  });

  it('nulls the weight-dependent fields when bodyweight is missing, but still gives calorie guidance + note', () => {
    const t = nutritionTargets('fat_loss', null);
    expect(t.protein).toBeNull();
    expect(t.waterLitres).toBeNull();
    expect(t.calories.direction).toBe('deficit');
    expect(t.note).toBe(goalNote('fat_loss'));
  });
});
