// The controls used to edit the profile/onboarding prefs. Shared so the
// onboarding wizard and the Profile screen offer exactly the same choices.
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import type { Equipment, Experience, Goal, MuscleGroup } from '@gym-tracker/core';

export const GOALS: { value: Goal; label: string; blurb: string; emoji: string }[] = [
  { value: 'muscle', label: 'Build muscle', blurb: 'Hypertrophy work, 8–12 reps', emoji: '💪' },
  { value: 'strength', label: 'Get stronger', blurb: 'Heavy sets, low reps', emoji: '🏋️' },
  { value: 'fat_loss', label: 'Lose fat', blurb: 'Keep the muscle, short rests', emoji: '🔥' },
  { value: 'endurance', label: 'Endurance', blurb: 'Higher reps, less rest', emoji: '🏃' },
  { value: 'maintain', label: 'Maintain', blurb: 'Stay strong and consistent', emoji: '⚖️' },
];

export const MUSCLES: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'arms', label: 'Arms' },
  { value: 'core', label: 'Core' },
  { value: 'legs', label: 'Legs' },
];

export const EXPERIENCES: { value: Experience; label: string }[] = [
  { value: 'beginner', label: 'New' },
  { value: 'intermediate', label: 'Some' },
  { value: 'advanced', label: 'Lots' },
];

export const EQUIPMENT: { value: Equipment; label: string }[] = [
  { value: 'full_gym', label: 'Full gym' },
  { value: 'home', label: 'Home' },
  { value: 'bodyweight', label: 'Bodyweight' },
];

export const DAYS_OPTIONS = [2, 3, 4, 5, 6];
export const SESSION_OPTIONS = [30, 45, 60, 90];
export const SEXES = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// Same look as the Train screen's equipment switcher (.seg), on Radix
// ToggleGroup for keyboard/aria support.
export function Segmented({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      className="seg seg-inline"
      value={value}
      aria-label={ariaLabel}
      // Single-select deselects when you tap the active item; a setting always
      // has exactly one value, so an empty change is ignored.
      onValueChange={(next) => next && onChange(next)}
    >
      {options.map((o) => (
        <ToggleGroup.Item key={o.value} value={o.value} className={`segi${o.value === value ? ' active' : ''}`}>
          {o.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

export function GoalPicker({ value, onChange }: { value: Goal; onChange: (goal: Goal) => void }) {
  return (
    <div className="goal-grid">
      {GOALS.map((g) => (
        <button
          key={g.value}
          type="button"
          className={`goal-card${g.value === value ? ' active' : ''}`}
          aria-pressed={g.value === value}
          onClick={() => onChange(g.value)}
        >
          <span className="goal-emoji">{g.emoji}</span>
          <span className="goal-text">
            <span className="goal-label">{g.label}</span>
            <span className="goal-blurb">{g.blurb}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function MuscleChips({
  value,
  onChange,
}: {
  value: MuscleGroup[];
  onChange: (muscles: MuscleGroup[]) => void;
}) {
  const toggle = (m: MuscleGroup) =>
    onChange(value.includes(m) ? value.filter((x) => x !== m) : [...value, m]);
  return (
    <div className="chip-grid">
      {MUSCLES.map((m) => {
        const on = value.includes(m.value);
        return (
          <button
            key={m.value}
            type="button"
            className={`mchip${on ? ' on' : ''}`}
            aria-pressed={on}
            onClick={() => toggle(m.value)}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
