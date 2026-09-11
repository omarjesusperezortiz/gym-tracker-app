# Fitness / Workout Tracker App — Screen Design Benchmark

**Purpose:** Benchmark a React PWA gym tracker (dark theme, lime accent, bottom nav: Today / Home / Calendar / Progress / Nutrition / Profile) against how the leading apps design their key screens.
**Apps studied:** Hevy, Strong, Fitbod, Jefit, Whoop, Apple Fitness.
**Focus screen:** Profile (deep-dive first), then Home, Progress, Nutrition, Calendar/History.

---

## Cross-cutting principles (apply to every screen)

These are the traits that separate *clean/professional* fitness apps from *messy/cluttered* ones. They recur across all six apps and the cited UX literature.

- **Layered disclosure, not flat dumps.** Strong keeps its primary interface uncluttered and reveals PRs, charts, and animated instructions only on a single tap into an exercise detail screen ([ScreensDesign — Strong](https://screensdesign.com/showcase/strong-workout-tracker-gym-log)). Hevy is praised for "powerful features for serious lifters without overwhelming the interface" ([ScreensDesign — Hevy](https://screensdesign.com/showcase/hevy-workout-tracker-gym-log)). **Show a summary; tap for depth.**
- **One primary action per screen.** Home = "Start Workout." Progress = "look at my trend." Don't dilute with five competing CTAs.
- **2D, length-based charts only.** NN/g: angle-based gauges and 3D charts "consume a lot of precious space" and are "harder to interpret than linear graphs"; prefer 2D bars, lines, and bullet charts where length (a strong pre-attentive variable) encodes the value ([NN/g — Dashboards](https://www.nngroup.com/articles/dashboards-preattentive/)).
- **Card-based grouping with generous whitespace.** Related metrics live in one card; unrelated metrics get their own. Whitespace is the cheapest way to read as "premium" (Whoop and Apple Fitness are the reference points here).
- **Restrained accent color.** A single accent (your lime) should mark the *primary action and live/positive data only* — not every element. Overusing the accent is the #1 way a dark UI reads as "gamer/cluttered" rather than "professional." Apple Fitness uses each ring color for exactly one meaning.
- **Bottom-nav discipline (NN/g).** 1–2 word labels, sentence/title case (never ALL CAPS — hurts legibility), descriptive labels with strong "information scent," and 4–5 destinations visible at once ([NN/g — Tabs, Used Right](https://www.nngroup.com/articles/tabs-used-right/); [NN/g — Basic Patterns for Mobile Navigation](https://www.nngroup.com/articles/mobile-navigation-patterns/)). **Your 6 tabs is one over the comfortable ceiling — see the note at the end.**

---

## 1. PROFILE screen  ⭐ (primary focus)

The Profile in a serious gym tracker is **identity + lifetime achievement + the door to settings/data** — NOT a settings dump and NOT a second dashboard. Hevy/Strong treat it as a "trophy case + account gateway."

### Common layout pattern (top → bottom)
1. **Identity header** — avatar, display name/@username, optional short bio, and (Hevy) a **Follow / Edit Profile** button. Often a subtle banner/background.
2. **Lifetime headline stats — a 3-up row.** The near-universal trio: **Workouts · Total Volume/Hours · Followers (or Streak)**. Big number on top, small caption below. This is the single most recognizable Profile pattern across Hevy and Strong.
3. **Dashboard / activity graphic** — a workouts-per-week bar chart or a GitHub-style contribution heatmap of training frequency. Read-only glance; tap → Progress.
4. **Personal Records / Achievements** — a compact, scrollable list or badge grid. Preview a few; "See all" to expand.
5. **Content sections** — Routines, Saved workouts, Exercises (for logging-first apps).
6. **Settings & account** — usually a **gear icon in the top-right corner** opening a *separate* settings screen, OR a grouped list at the bottom. Account, Units, Notifications, Privacy, Integrations (Apple Health/Google Fit), Subscription, **Export data**, Log out.

### DO's
- **Lead with identity, then the 3-stat headline row.** It orients the user in <1 second and is the pattern users already expect from Hevy/Strong.
- **Separate "settings" from "profile."** Push preferences behind a gear icon or a clearly divided lower section. Profile = who I am + what I've achieved; Settings = knobs.
- **Group settings into labeled sections** with dividers: *Account*, *Preferences*, *Integrations*, *Data & Privacy*, *About*. Chunking beats one long undifferentiated list.
- **Make PRs and measurements skimmable** — a few highlighted items with a "See all," not the full table inline.
- **Give data control real estate.** "Export your data any time" is a headline Strong feature ([strong.app](https://www.strong.app/)); a visible **Export / Import** and account-deletion path reads as trustworthy and professional.
- **Right-align or icon-lead every settings row** with a chevron so it's obviously tappable.

### DON'Ts / anti-patterns
- **Don't turn Profile into a second dashboard** with live charts everywhere — that's the Progress tab's job. Duplication is the fastest route to "cluttered."
- **Don't dump 20 flat settings rows** with no grouping or hierarchy.
- **Don't scatter account/danger actions** (log out, delete account) in random spots — group them at the very bottom, visually de-emphasized.
- **Don't hide measurements/PRs so deep** they feel absent — surface a preview.
- **Don't over-paint with the accent color.** On Profile, reserve lime for the primary button (Edit Profile) and positive stat deltas only.
- **Don't show empty scaffolding** (blank avatar + zeroed stats) with no guidance — give a friendly empty state with a CTA.

### 5 concrete design principles for Profile
1. **Identity → Achievement → Account, in that vertical order.** Never bury who-you-are under settings.
2. **The 3-stat headline row is table stakes** — pick the three that matter (Workouts, Volume/Hours, Streak or Followers) and make them the biggest type on the screen.
3. **Settings belong behind a gear or in a grouped, divided list** — chunk into 4–6 labeled sections; one action per row + chevron.
4. **Preview, don't inline.** PRs, achievements, and measurements show 3–5 items + "See all," never the full dataset.
5. **Elevate data ownership** — Export/Import, integrations, and account deletion are visible and grouped; this single move is what makes the app feel professional and trustworthy.

---

## 2. HOME / DASHBOARD (your "Today"/"Home")

### Common layout pattern
- **Hero = today's plan or single primary CTA.** Fitbod opens on a recommended workout ("Start Workout"); Whoop and Apple Fitness open on today's readiness/rings. One dominant hero, one primary button.
- **Quick-start row** — "Start Empty Workout" + your routine chips/cards directly below the hero (Hevy/Strong pattern: routines are one tap from home).
- **Recent activity feed** — last workout(s) as compact cards (date, name, key stat like volume or duration).
- **Lightweight stat surfacing** — this week's workout count / weekly goal ring. Glanceable only; deep stats live in Progress.

### DO's
- Make **"Start Workout" unmistakably the primary action** (accent-filled, full-width or prominent).
- Surface **routines as one-tap cards** — the core job of a gym app is "start today's session fast."
- Keep home a **launchpad**: 3–4 zones max (hero, quick-start, this-week glance, recent).
- Use a **time-/context-aware greeting or readiness metric** (Whoop recovery %, Apple rings) to make it feel personal.

### DON'Ts
- Don't crowd home with every chart, streak, and social post — that's Progress/Calendar territory.
- Don't bury "Start Workout" below the fold or among equal-weight buttons.
- Don't show a wall of empty widgets to new users — progressive empty states with a single CTA.
- Don't mix six card styles; one card system, repeated.

### Principles
1. **Home is a launchpad, not a report** — its job is to start the next workout in ≤2 taps.
2. **One hero, one primary CTA**, everything else secondary.
3. **Routines/quick-start above recent history** (act before you reflect).
4. **Glanceable weekly progress**, not full analytics.
5. **Progressive disclosure for new vs. power users** — empty states guide; loaded states inform.

---

## 3. PROGRESS / STATS

### Common layout pattern
- **Segmented top control** (Overview / Exercises / Measurements) or a scrollable set of stat cards.
- **PRs surfaced prominently** — Strong exposes best set, estimated 1RM, and per-exercise performance charts on tap ([ScreensDesign — Strong](https://screensdesign.com/showcase/strong-workout-tracker-gym-log)); Strong PRO tracks "best sets, max 1RM, body fat percentage" ([strong.app](https://www.strong.app/)).
- **Volume / frequency over time** as line or bar charts with selectable ranges (1M/3M/1Y/All).
- **Body measurements** — weight, body fat %, per-body-part — as their own trend charts.
- **Streaks / consistency** — heatmap or weekly-goal ring.

### DO's
- **2D line/bar/bullet charts with clear axes and a range selector.** Length encodes value (NN/g pre-attentive).
- **One metric per card**, labeled, with the current value + trend delta.
- **Celebrate PRs** with a distinct badge/color (a legitimate, meaningful use of the lime accent).
- **Let users pick the time range** and the exercise/measurement to chart.

### DON'Ts (straight from NN/g Dashboards)
- **No 3D charts** — 3D "distorts and skews the shapes that represent the data," making values harder to read.
- **No radial/analog gauges** — they "consume a lot of precious space" and rely on angle, a poor pre-attentive channel; use linear bullet charts instead.
- **No treemaps** for simple actionable stats.
- Don't cram multiple unrelated series into one chart; don't hide the scale/range.

### Principles
1. **Length beats angle** — bars/lines over gauges and pies ([NN/g](https://www.nngroup.com/articles/dashboards-preattentive/)).
2. **PRs are the emotional payload** — give them prime, celebrated placement.
3. **One card = one metric = one trend.**
4. **User-selectable range + subject** on every chart.
5. **Flat 2D, honest scales, minimal chartjunk** — this is what makes stats look "pro."

---

## 4. NUTRITION / MEALS

*Note: Hevy, Strong, Jefit are workout-first — nutrition is minimal or absent; Whoop/Apple surface it via integrations. Treat Nutrition as a lighter, optional tab, not a full MyFitnessPal.*

### Common layout pattern
- **Daily calorie ring/bar at top** (consumed vs. goal) + macro breakdown (P/C/F) as three bars.
- **Meal sections** (Breakfast/Lunch/Dinner/Snacks) each showing logged items + a "+ Add" affordance.
- **Water/hydration** as a simple counter.
- **Quick-add / recent foods / barcode scan** as the primary logging path.

### DO's
- Lead with the **calorie + macro summary ring** — the one number people came for.
- Make **logging ≤2 taps** (recent, favorites, barcode).
- Use **three consistent macro bars**, color-coded once and reused everywhere.

### DON'Ts
- Don't build a bloated food-database clone if nutrition is secondary — scope it to summary + quick log.
- Don't fragment macros into different visual styles per screen.
- Don't force manual entry when recents/favorites cover 80% of logging.

### Principles
1. **Summary-first** (calories + macros at a glance).
2. **Logging speed is the whole game** — recents/favorites/barcode.
3. **Consistent macro color language** app-wide.
4. **Scope to the app's ambition** — a companion nutrition tab, not a rival to dedicated apps.

---

## 5. CALENDAR / HISTORY

### Common layout pattern
- **Two modes:** a **month calendar** with dots/heatmap on trained days, and a **reverse-chronological list** of workout cards. Best apps offer both (toggle).
- **Each history entry = a card:** date, workout name, duration, total volume, PR flags, and a mini muscle-group or set summary.
- **Tap a day/card → full workout detail** (every exercise, set, rep, weight) — layered disclosure again.
- **Consistency signal** — streak count or a contribution-style heatmap ("don't break the chain").

### DO's
- **Calendar as motivation** — filled/dotted days visualize consistency at a glance.
- **Rich but scannable cards** — 3–4 key stats, not the full set table inline.
- **Fast path to repeat/duplicate** a past workout from history.
- **Group by month** with sticky headers in list mode.

### DON'Ts
- Don't show a bare calendar with no per-day summary on tap.
- Don't inline every set of every historical workout — preview, then drill in.
- Don't make users hunt for "repeat this workout."
- Don't use ALL-CAPS date/section headers ([NN/g](https://www.nngroup.com/articles/tabs-used-right/)).

### Principles
1. **Dual view** (calendar heatmap + chronological list).
2. **Consistency is the story** — visualize the streak.
3. **Card = summary, tap = detail** (progressive disclosure).
4. **One-tap "repeat workout"** from any history entry.
5. **Month-grouped, sticky-headed** list for long histories.

---

## Direct note on YOUR nav (Today / Home / Calendar / Progress / Nutrition / Profile)

- **6 tabs exceeds NN/g's comfortable 4–5 visible destinations** ([NN/g — Mobile Navigation](https://www.nngroup.com/articles/mobile-navigation-patterns/)). Cramped tabs get tiny labels and weak tap targets.
- **"Today" and "Home" likely overlap** — users won't have strong "information scent" distinguishing them, exactly the failure NN/g warns about. **Recommend merging into one "Home/Today"** → drops you to a clean 5 tabs (Home · Calendar · Progress · Nutrition · Profile).
- **Keep labels 1–2 words, title/sentence case, never ALL CAPS.**
- **Reserve lime for the active tab + primary CTAs only.**

---

## Source list (citable)
- **ScreensDesign — Hevy breakdown** — layered disclosure, micro-interactions, "power without overwhelming": https://screensdesign.com/showcase/hevy-workout-tracker-gym-log
- **ScreensDesign — Strong breakdown** — tap-to-reveal detail (PRs, 1RM, charts), uncluttered primary UI, template folders: https://screensdesign.com/showcase/strong-workout-tracker-gym-log
- **Strong official** — PRO tracks best sets, max 1RM, body fat %; export data anytime: https://www.strong.app/
- **Hevy features** — routines, analytics, PRs, social feed: https://www.hevyapp.com/features/
- **NN/g — Dashboards: Making Charts Easier to Understand** — no 3D, no gauges/treemaps; use 2D length-based charts: https://www.nngroup.com/articles/dashboards-preattentive/
- **NN/g — Tabs, Used Right** — short descriptive labels, no ALL CAPS, strong information scent: https://www.nngroup.com/articles/tabs-used-right/
- **NN/g — Basic Patterns for Mobile Navigation** — 4–5 visible destinations, chrome discipline: https://www.nngroup.com/articles/mobile-navigation-patterns/
- **Reference apps for premium/clean feel:** Whoop (recovery-first dashboard, restrained palette), Apple Fitness (activity rings, one-color-one-meaning), Fitbod (recommended-workout hero), Jefit (routine/PR-centric).
