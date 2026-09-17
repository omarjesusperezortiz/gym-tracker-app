# Variation model — structure and rules

## Vocabulary

Three levels, from broadest to most specific:

| Level | Example | What identifies it |
|---|---|---|
| **Movement** | `"Biceps curl"` | A catalog slot name. Its own entry in a session's `slots[]` array; has its own history, progression, PR badge. |
| **Kind** | `db` / `cable` / `bar` / `machine` / `bw` | Equipment tab. Picks *which* variation to use inside the movement. |
| **Variation** | `Standing Curl` / `Incline Curl` / `Concentration Curl` | A specific form of a movement executed with one equipment kind. Same movement, small biomechanics tweak. |

## Rules (structure)

1. **A variation lives INSIDE `variations[movement][kind]`.** It never appears in a session's `slots[]`.
2. **A movement is either its own slot or a variation — never both.** If it already has a session slot, it does not also live under another movement's variations.
3. **Variations of the SAME kind share equipment but differ in form.** E.g. within `db`: Standing / Incline / Concentration are all dumbbell curls; they differ in seated vs standing, angle, bracing.
4. **Cross-kind variations already exist.** Barbell Curl → Dumbbell Curl → Cable Curl is the current model (`bar`/`db`/`cable` tabs). What we're ADDING now is multiple options *within* a kind.
5. **Every variation gets its own `exercise_id`** — that's the column we already added; the app already keys history per specific exercise. No schema change needed to store this.

## What tier-1 currently proposes vs the rules

| Movement (slot) | Kind | Proposed variation | Rule check |
|---|---|---|---|
| Biceps curl | db | Standing Curl | ✓ new, valid |
| Biceps curl | db | Incline Curl | ✓ new, valid |
| Biceps curl | db | Concentration Curl | ✓ new, valid |
| Biceps curl | db | **Hammer Curl** | ✗ **already a sibling movement — DROP** |
| Flat chest press | db | Flat DB Press | ✓ default form, valid |
| Flat chest press | db | Incline DB Press | ⚠ **there's a separate `Incline press` movement — could be duplicative** |
| Flat chest press | db | Decline DB Press | ✓ valid (no sibling) |
| Vertical pull (lats) | cable | Wide-Grip Pulldown | ✓ valid |
| Vertical pull (lats) | cable | Close-Grip Pulldown | ✓ valid |
| Vertical pull (lats) | cable | Underhand Pulldown | ✓ valid |
| Vertical pull (lats) | cable | Neutral-Grip Pulldown | ✓ valid |
| Horizontal row | db | Two-Arm DB Row | ✓ valid |
| Horizontal row | db | Single-Arm DB Row | ✓ valid |
| Horizontal row | db | Chest-Supported Row | ✓ valid |
| Squat | bar | Back Squat | ✓ default form, valid |
| Squat | bar | Front Squat | ✓ valid |
| Squat | bar | Goblet Squat | ⚠ Goblet is typically a **dumbbell** movement; wrong kind |
| Overhead press | db | Standing DB Press | ✓ default, valid |
| Overhead press | db | Seated DB Press | ✓ valid |
| Overhead press | db | Arnold Press | ✓ valid |
| Triceps pushdown/ext | cable | Rope Pushdown | ✓ valid |
| Triceps pushdown/ext | cable | Bar Pushdown | ✓ valid |
| Triceps pushdown/ext | cable | Overhead Rope | ⚠ **there's a separate `Overhead triceps` movement — DROP** |
| Hamstring / RDL | bar | Barbell RDL | ✓ default, valid |
| Hamstring / RDL | bar | Sumo Deadlift | ⚠ Sumo is a squat variant, not a hamstring/RDL movement |
| Hamstring / RDL | bar | Conventional Deadlift | ⚠ Same as above — deadlift ≠ RDL |
| Lunge | db | DB Walking Lunge | ✓ valid |
| Lunge | db | Static Lunge | ✓ valid |
| Lunge | db | Reverse Lunge | ✓ valid |
| Lunge | db | Bulgarian Split Squat | ✓ valid |
| Side lateral raise | cable | Single-Arm Cable Lateral | ✓ valid |
| Side lateral raise | cable | Bent-Over Lateral | ⚠ **Bent-over lateral targets REAR delts — that's `Rear delts` movement's job** |
| Side lateral raise | cable | Y-Raise | ✓ valid (front/side delt hybrid) |

## Recommended cuts before we ship

Drop these from tier-1:
- `Biceps curl · db · Hammer Curl` (has its own sibling movement)
- `Triceps pushdown/ext · cable · Overhead Rope` (Overhead triceps is its own sibling)
- `Side lateral raise · cable · Bent-Over Lateral` (Rear delts is its own sibling)
- `Squat · bar · Goblet Squat` (goblet is dumbbell, not barbell — kind mismatch)
- `Hamstring / RDL · bar · Sumo Deadlift` (sumo is a squat/DL movement pattern, not RDL)
- `Hamstring / RDL · bar · Conventional Deadlift` (a full deadlift is its own lift, not "RDL variation")
- Reconsider `Flat chest press · db · Incline DB Press` (there's a separate Incline press movement — keep only if you want inclined-only-in-DB users to find it here too)

That takes tier-1 from **33 → ~26 valid variations**, and removes the confusion.

## Then what we curate stays clean:

**Biceps curl (db)** → Standing · Incline · Concentration
**Flat chest press (db)** → Flat · Decline (drop Incline; it's a sibling)
**Vertical pull (cable)** → Wide-grip · Close-grip · Underhand · Neutral-grip
**Horizontal row (db)** → Two-arm · Single-arm · Chest-supported
**Squat (bar)** → Back · Front (drop Goblet — kind mismatch)
**Overhead press (db)** → Standing · Seated · Arnold
**Triceps pushdown/ext (cable)** → Rope · Bar (drop Overhead Rope — sibling)
**Hamstring / RDL (bar)** → Barbell RDL only for now (deadlifts belong on their own if you want them)
**Lunge (db)** → Walking · Static · Reverse · Bulgarian Split
**Side lateral raise (cable)** → Single-arm · Y-raise (drop Bent-over — rear delt sibling)

That's ~21 real variations across 10 movements — a cleaner, defensible tier-1.

## Follow-up if you want to add movements that are currently missing

If you want deadlift patterns in the catalog, they belong as **their own movement slot** in the plan (e.g. "Deadlift" with variations `conventional / sumo / trap-bar`), not as an RDL variation.

Same for kettlebell exercises, hip thrusts, calf raises, etc — add as siblings, don't force them into an unrelated movement.
