-- Gym Trainer — Supabase schema + Row-Level Security
-- Run this in Supabase → SQL Editor → New query → paste → Run.

-- ─────────────────────────────────────────────────────────────
-- WORKOUTS: one row per logged workout / skate / rest day
-- ─────────────────────────────────────────────────────────────
create table if not exists public.workouts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  client_id    bigint,                       -- original app-side numeric id (for migration/dedupe)
  date         timestamptz not null,
  plan         text not null default 'gym',  -- gym | cal | travel
  sess         text,                          -- session key (push, pull, chest, core…)
  name         text,
  type         text not null default 'workout', -- workout | skate | rest
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists workouts_user_date_idx on public.workouts (user_id, date desc);
create unique index if not exists workouts_user_client_idx
  on public.workouts (user_id, client_id) where client_id is not null;

-- ─────────────────────────────────────────────────────────────
-- WORKOUT_SLOTS: exercises within a workout (ordered)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.workout_slots (
  id          uuid primary key default gen_random_uuid(),
  workout_id  uuid not null references public.workouts(id) on delete cascade,
  position    int  not null default 0,
  slot        text not null,                 -- exercise slot name (e.g. "Flat chest press")
  kind        text not null default 'bw',    -- bar | cable | machine | db | bw
  done        boolean not null default false,
  force       boolean not null default false
);
create index if not exists slots_workout_idx on public.workout_slots (workout_id, position);

-- ─────────────────────────────────────────────────────────────
-- WORKOUT_SETS: individual sets within a slot (ordered)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.workout_sets (
  id        uuid primary key default gen_random_uuid(),
  slot_id   uuid not null references public.workout_slots(id) on delete cascade,
  position  int  not null default 0,
  weight    text default '',                 -- kept as text (matches app; "" for bodyweight)
  reps      text default ''
);
create index if not exists sets_slot_idx on public.workout_sets (slot_id, position);

-- ─────────────────────────────────────────────────────────────
-- RECOMMENDATION: the daily "Today" suggestion (one current row per user)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.recommendations (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  date         date not null,
  type         text not null default 'train',
  plan         text not null default 'gym',
  session      text,
  session_name text,
  emoji        text,
  title        text,
  reason       text,
  exercises    jsonb not null default '[]'::jsonb,
  stats        jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — every row scoped to its owner
-- ─────────────────────────────────────────────────────────────
alter table public.workouts       enable row level security;
alter table public.workout_slots  enable row level security;
alter table public.workout_sets   enable row level security;
alter table public.recommendations enable row level security;

-- workouts: owner-only
create policy "own workouts" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- slots: owner via parent workout
create policy "own slots" on public.workout_slots
  for all using (exists (select 1 from public.workouts w
                         where w.id = workout_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workouts w
                      where w.id = workout_id and w.user_id = auth.uid()));

-- sets: owner via parent slot → workout
create policy "own sets" on public.workout_sets
  for all using (exists (select 1 from public.workout_slots s
                         join public.workouts w on w.id = s.workout_id
                         where s.id = slot_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_slots s
                      join public.workouts w on w.id = s.workout_id
                      where s.id = slot_id and w.user_id = auth.uid()));

-- recommendations: owner-only
create policy "own reco" on public.recommendations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- keep updated_at fresh on workouts
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists workouts_touch on public.workouts;
create trigger workouts_touch before update on public.workouts
  for each row execute function public.touch_updated_at();
