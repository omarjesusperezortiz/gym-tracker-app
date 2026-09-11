-- Gym Trainer — Schema v7: user avatar preset
-- Additive & idempotent. Stores the chosen avatar preset key (emoji + color,
-- e.g. "lime-muscle") on user_prefs. Null = default avatar. No backfill needed.

alter table public.user_prefs add column if not exists avatar text;
