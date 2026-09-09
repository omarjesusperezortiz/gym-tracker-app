-- Gym Trainer — Schema v4: per-user session customizations (base + overlay)
-- Additive & idempotent. Base sessions stay in code (catalog.ts); this table
-- stores only the DELTAS a user applies to a base session. One row per
-- (user, plan, sess). An absent/empty row means "pure base".

create table if not exists public.session_customizations (
  user_id  uuid not null references auth.users(id) on delete cascade,
  plan     text not null,
  sess     text not null,
  -- exercises the user ADDED. Each: {slot, scheme, force?, custom?}
  --   slot   = catalog variations key (gets images/cues/equipment) OR a custom name
  --   scheme = e.g. "3 × 8–12"
  --   force  = optional heavy-scheme label (usually "")
  --   custom = true when it's a free-typed name with no catalog variation
  added    jsonb   not null default '[]'::jsonb,
  -- base slot names the user HID/removed from this session
  hidden   text[]  not null default '{}',
  -- optional explicit ordering of slot names (base + added). Empty = natural order.
  ordering text[]  not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, plan, sess)
);

alter table public.session_customizations enable row level security;

do $$ begin
  create policy sc_select on public.session_customizations for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy sc_insert on public.session_customizations for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy sc_update on public.session_customizations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy sc_delete on public.session_customizations for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
