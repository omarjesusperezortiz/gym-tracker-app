import { slugify, exerciseId, exerciseName, isKnownExerciseId, resolveExerciseId } from '../logic/exercise-id';

describe('slugify', () => {
  it('lowercases, strips punctuation, and underscores spaces/slashes', () => {
    expect(slugify('Flat chest press')).toBe('flat_chest_press');
    expect(slugify('Hamstring / RDL')).toBe('hamstring_rdl');
    expect(slugify('Plank (core)')).toBe('plank_core');
    expect(slugify('Triceps pushdown/ext')).toBe('triceps_pushdown_ext');
  });
});

describe('exerciseId / exerciseName round-trip for catalog exercises', () => {
  it('maps a known catalog name to a stable id and back', () => {
    const id = exerciseId('Flat chest press');
    expect(id).toBe('flat_chest_press');
    expect(exerciseName(id)).toBe('Flat chest press');
    expect(isKnownExerciseId(id)).toBe(true);
  });

  it('is stable across calls', () => {
    expect(exerciseId('Overhead press')).toBe(exerciseId('Overhead press'));
  });

  it('slugifies unknown names deterministically (id-tags new writes)', () => {
    expect(exerciseId('Totally Made Up Move')).toBe('totally_made_up_move');
    expect(isKnownExerciseId('totally_made_up_move')).toBe(false);
  });

  it('returns the id itself for an unknown id lookup', () => {
    expect(exerciseName('some_unknown_id')).toBe('some_unknown_id');
  });
});

describe('resolveExerciseId — bridges old and new rows', () => {
  it('prefers an explicit slotId (new id-tagged rows)', () => {
    expect(resolveExerciseId({ slot: 'Flat chest press', slotId: 'flat_chest_press' })).toBe('flat_chest_press');
  });

  it('derives the id from the name for legacy rows with no slotId', () => {
    expect(resolveExerciseId({ slot: 'Flat chest press', slotId: null })).toBe('flat_chest_press');
    expect(resolveExerciseId({ slot: 'Overhead press' })).toBe('overhead_press');
  });

  it('a legacy row and a new row for the same exercise resolve to the SAME id', () => {
    const legacy = resolveExerciseId({ slot: 'Flat chest press' });
    const modern = resolveExerciseId({ slot: 'Flat chest press', slotId: 'flat_chest_press' });
    expect(legacy).toBe(modern);
  });
});
