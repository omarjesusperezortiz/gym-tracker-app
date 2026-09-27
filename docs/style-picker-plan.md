# Exercise Style Picker — planned update

## The problem

Some catalog slots are one movement pattern with multiple **style** variations
that all use the same (or no) equipment. Current tabs show "Barbell / Cable /
Dumbbell", which is wrong for these — the axis of variation is **execution
style**, not equipment.

## Slots this affects

| Slot | Movement | Styles that make sense |
|---|---|---|
| Leg raise (core) | leg raise | Lying (bench), Hanging (bar), Captain's chair |
| Hanging/Lying Leg Raise | leg raise | same as above |
| Plank | plank hold | Forearm, High plank, Side plank, Weighted |
| Side Plank | side plank | Forearm, Straight-arm, With leg raise |
| Squat | squat | Bodyweight, Goblet, Barbell back, Front, Zercher |
| Push-up | push-up | Standard, Wide, Diamond, Decline, Incline |
| Chin-up | pull movement | Chin (supinated), Pull-up (pronated), Neutral, Weighted |
| Dip | dip | Bench dip, Parallel bar, Ring, Weighted |
| Calf raise | calf raise | Standing, Seated, Donkey, Smith machine |

## Proposed UX

- Detect these slots via a `styles?: StyleVariation[]` field on the catalog
  entry (new).
- Show a **"Style"** picker instead of the equipment tabs on those slots.
- Each style variation carries: display name, image id (webp), 4 how-to steps,
  optional `difficulty: 'easy'|'medium'|'hard'` badge.
- Selected style persists per slot (localStorage + Supabase profile).
- Default = the current entry (first style listed).

## Catalog data model

Add an optional field to variationMedia entries:

```ts
export interface StyleVariation {
  id: string;              // webp filename
  label: string;           // "Lying (bench)", "Hanging", ...
  difficulty?: 'easy' | 'medium' | 'hard';
  target?: string;         // usually same as parent, overridable
  secondary?: string[];
  steps?: string[];
}

export interface ExerciseMedia {
  id: string;
  target: string;
  // ...existing fields...
  styles?: StyleVariation[];  // when present, picker shows these instead of tabs
}
```

## First slot to migrate: Leg raise (core)

```ts
"Leg raise (core)": {
  id: "WhuFnR7",     // default = lying (easy)
  target: "abs",
  secondary: ["hip flexors"],
  equip: "body weight",
  styles: [
    { id: "WhuFnR7", label: "Lying (bench)", difficulty: "easy" },
    { id: "I3tsCnC", label: "Hanging",       difficulty: "medium" },
    { id: "weoDEpH", label: "Captain's chair", difficulty: "medium" },
    { id: "4Ml7QFO", label: "Hanging straight leg", difficulty: "hard" },
  ],
  steps: [ ... ],
}
```

## UI mock

- Below the exercise header, where equipment tabs live today: a horizontal
  scrollable style picker.
- Selected style has an accent-orange underline.
- Each chip shows label + tiny difficulty dot (green/yellow/red).

## Migration steps

1. Add `styles?: StyleVariation[]` to `ExerciseMedia` interface + tests.
2. Add `<StylePicker>` component (looks like the current tabs but data-driven).
3. In `ExerciseCard`, if `media.styles` present → render `<StylePicker>`,
   else fall back to the current equipment tabs.
4. Wire selected style into `variationMedia` lookup so the image + steps
   swap live.
5. Persist selection to `state.styleFor[slot]` and Supabase profile.
6. Migrate the ~9 affected slots from equipment tabs to styles.

## Deferred until this ships

- Right now (Sept 21) "Leg raise (core)" uses id `WhuFnR7` (lying) as the
  hard default. The three tabs still say Barbell / Cable / Dumbbell but the
  underlying variations are wrong for the movement — this is a known bug
  the style picker will fix.
