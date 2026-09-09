-- Gym Trainer — Schema v3: onboarding / personalization profile
-- Additive & idempotent. Extends user_prefs with body + goal + focus data.

alter table public.user_prefs add column if not exists display_name  text;
alter table public.user_prefs add column if not exists sex           text;      -- 'male'|'female'|'other'|null
alter table public.user_prefs add column if not exists birth_year    int;
alter table public.user_prefs add column if not exists height_cm     numeric(5,1);
alter table public.user_prefs add column if not exists goal_weight_kg numeric(5,2);
alter table public.user_prefs add column if not exists goal          text default 'muscle';  -- muscle|fat_loss|strength|maintain|endurance
alter table public.user_prefs add column if not exists focus_muscles text[] default '{}';    -- chest,back,shoulders,arms,core,legs
alter table public.user_prefs add column if not exists experience    text default 'intermediate'; -- beginner|intermediate|advanced
alter table public.user_prefs add column if not exists days_per_week int  default 4;
alter table public.user_prefs add column if not exists session_min   int  default 60;
alter table public.user_prefs add column if not exists equipment     text default 'full_gym'; -- full_gym|home|bodyweight
alter table public.user_prefs add column if not exists onboarded     boolean default false;
