import { getPlan } from '../plans';
import { resolveExercise } from '../resolver';
import { styleVariants } from '../logic/styleVariants';

const gym = getPlan('gym');
const cal = getPlan('cal');
const travel = getPlan('travel');

describe('resolveExercise', () => {
  it('resolves a slot + kind to its default exercise', () => {
    const ex = resolveExercise({ plan: gym, slotKey: 'Flat chest press', kind: 'bar' });
    expect(ex.id).toBe('EIeI8Vf');
    expect(ex.equipment).toBe('barbell');
  });

  it('throws when the plan does not allow the kind', () => {
    expect(() => resolveExercise({ plan: travel, slotKey: 'Squat', kind: 'bar' })).toThrow(
      /Plan "travel" does not allow kind "bar"/,
    );
  });

  it('throws when the slot has no exercise for the kind', () => {
    expect(() => resolveExercise({ plan: gym, slotKey: 'Plank', kind: 'bar' })).toThrow(/Slot "Plank" has no "bar" exercises/);
  });

  it('throws for an unknown slot', () => {
    expect(() => resolveExercise({ plan: gym, slotKey: 'Nope', kind: 'bw' })).toThrow(/Unknown slot "Nope"/);
  });

  it('a chosen style variant overrides the default', () => {
    const ex = resolveExercise({ plan: travel, slotKey: 'Push-up', kind: 'bw', activeVariantPref: 'Diamond Push-Up' });
    expect(ex.id).toBe('soIB2rj');
  });

  it('falls back to the default for a stale or missing choice', () => {
    expect(resolveExercise({ plan: travel, slotKey: 'Push-up', kind: 'bw', activeVariantPref: 'Gone' }).id).toBe('I4hDWkc');
    expect(resolveExercise({ plan: travel, slotKey: 'Push-up', kind: 'bw' }).id).toBe('I4hDWkc');
  });

  it('warns and uses the default when a style variant is not one of the slot’s variants', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    styleVariants['Flat chest press'] = { bw: [{ id: 'EIeI8Vf', name: 'Barbell Bench', difficulty: 'easy' }] };
    try {
      const ex = resolveExercise({ plan: gym, slotKey: 'Flat chest press', kind: 'bw', activeVariantPref: 'Barbell Bench' });
      expect(ex.id).toBe('I4hDWkc');
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('not a "bw" variant of slot "Flat chest press"'));
    } finally {
      delete styleVariants['Flat chest press'];
      warn.mockRestore();
    }
  });

  it('a plan can pin its own default', () => {
    expect(resolveExercise({ plan: gym, slotKey: 'Chest dip', kind: 'bw' }).name).toBe('Dips - Chest Version');
    expect(resolveExercise({ plan: cal, slotKey: 'Chest dip', kind: 'bw' }).name).toBe('Bench Dips');
  });

  // The bugs this model replaces.
  it('travel Lunge is the bodyweight lunge, not the dumbbell one', () => {
    expect(resolveExercise({ plan: travel, slotKey: 'Lunge', kind: 'bw' }).equipment).toBe('bodyweight');
  });

  it('the standard Plank chip is the plain plank with plank steps', () => {
    const plank = resolveExercise({ plan: travel, slotKey: 'Plank', kind: 'bw', activeVariantPref: 'Plank' });
    expect(plank.id).toBe('hCjGsRQ');
    expect(plank.steps.join(' ')).not.toMatch(/rotate|twist/i);
    const twist = resolveExercise({ plan: travel, slotKey: 'Plank', kind: 'bw', activeVariantPref: 'Plank with Twist' });
    expect(twist.id).toBe('CosupLu');
  });

  it('calisthenics never resolves a barbell or dumbbell exercise', () => {
    for (const s of cal.sessions) {
      for (const [slotKey] of s.slots) {
        const ex = resolveExercise({ plan: cal, slotKey, kind: 'bw' });
        expect(['barbell', 'dumbbell', 'cable', 'machine', 'smith']).not.toContain(ex.equipment);
      }
    }
  });
});
