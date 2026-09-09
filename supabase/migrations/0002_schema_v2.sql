-- Gym Trainer — Schema v2
-- Additive & idempotent. Safe to run on the live DB (no data loss).
-- Adds: user prefs, bodyweight log, RPE on sets, updated_at triggers,
--       a PR view, and a batched save_workout() RPC (1 call instead of N+1).

-- ── 1. shared updated_at trigger fn (already exists from v1, keep idempotent) ──
create or replace function public.touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

-- ── 2. RPE (rate of perceived exertion) on sets — optional, 1-10 ──
alter table public.workout_sets add column if not exists rpe smallint;

-- ── 3. USER PREFERENCES (units, default rest, default plan) ──
create table if not exists public.user_prefs (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  units         text not null default 'kg',       -- 'kg' | 'lb'
  default_plan  text not null default 'gym',
  rest_seconds  int  not null default 90,
  updated_at    timestamptz not null default now()
);
alter table public.user_prefs enable row level security;
drop policy if exists "own prefs" on public.user_prefs;
create policy "own prefs" on public.user_prefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop trigger if exists prefs_touch on public.user_prefs;
create trigger prefs_touch before update on public.user_prefs
  for each row execute function public.touch_updated_at();

-- ── 4. BODYWEIGHT LOG (weigh-ins over time) ──
create table if not exists public.bodyweight_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  weight_kg   numeric(5,2) not null,
  note        text,
  created_at  timestamptz not null default now()
);
create unique index if not exists bodyweight_user_date_idx
  on public.bodyweight_log (user_id, date);
alter table public.bodyweight_log enable row level security;
drop policy if exists "own bodyweight" on public.bodyweight_log;
create policy "own bodyweight" on public.bodyweight_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 5. PR VIEW — best (heaviest) numeric set per exercise slot, per user ──
-- weight/reps are stored as text; cast defensively (non-numeric -> null -> ignored).
create or replace view public.personal_records as
select
  w.user_id,
  sl.slot,
  max(nullif(regexp_replace(st.weight, '[^0-9.]', '', 'g'), '')::numeric) as best_weight,
  max( (nullif(regexp_replace(st.weight,'[^0-9.]','','g'),'')::numeric)
       * (nullif(regexp_replace(st.reps,'[^0-9.]','','g'),'')::numeric) ) as best_volume
from public.workouts w
join public.workout_slots sl on sl.workout_id = w.id
join public.workout_sets  st on st.slot_id   = sl.id
where w.type = 'workout'
  and nullif(regexp_replace(st.weight,'[^0-9.]','','g'),'') is not null
group by w.user_id, sl.slot;

-- personal_records inherits RLS from the base tables (security_invoker).
alter view public.personal_records set (security_invoker = true);

-- ── 6. BATCHED SAVE RPC — insert a whole workout in ONE round-trip ──
-- payload shape (jsonb):
-- { "client_id":123, "date":"...", "plan":"gym", "sess":"push", "name":"Push",
--   "type":"workout",
--   "slots":[ { "slot":"Flat chest press","kind":"bar","done":true,"force":false,
--               "sets":[ {"weight":"40","reps":"8","rpe":8}, ... ] }, ... ] }
-- Upserts on (user_id, client_id): re-saving the same workout replaces it in place.
create or replace function public.save_workout(payload jsonb)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_user   uuid := auth.uid();
  v_wid    uuid;
  v_client bigint := nullif(payload->>'client_id','')::bigint;
  v_slot   jsonb;
  v_set    jsonb;
  v_sid    uuid;
  v_spos   int := 0;
  v_setpos int := 0;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  -- upsert the workout by client_id (dedupe / edit-in-place)
  if v_client is not null then
    select id into v_wid from public.workouts
      where user_id = v_user and client_id = v_client;
  end if;

  if v_wid is null then
    insert into public.workouts (user_id, client_id, date, plan, sess, name, type)
    values (v_user, v_client, (payload->>'date')::timestamptz,
            coalesce(payload->>'plan','gym'), payload->>'sess', payload->>'name',
            coalesce(payload->>'type','workout'))
    returning id into v_wid;
  else
    update public.workouts set
      date = (payload->>'date')::timestamptz,
      plan = coalesce(payload->>'plan','gym'),
      sess = payload->>'sess',
      name = payload->>'name',
      type = coalesce(payload->>'type','workout')
    where id = v_wid;
    -- clear old children (cascade handles sets)
    delete from public.workout_slots where workout_id = v_wid;
  end if;

  -- rebuild slots + sets
  v_spos := 0;
  for v_slot in select * from jsonb_array_elements(coalesce(payload->'slots','[]'::jsonb))
  loop
    insert into public.workout_slots (workout_id, position, slot, kind, done, force)
    values (v_wid, v_spos, v_slot->>'slot', coalesce(v_slot->>'kind','bw'),
            coalesce((v_slot->>'done')::boolean,false),
            coalesce((v_slot->>'force')::boolean,false))
    returning id into v_sid;

    v_setpos := 0;
    for v_set in select * from jsonb_array_elements(coalesce(v_slot->'sets','[]'::jsonb))
    loop
      insert into public.workout_sets (slot_id, position, weight, reps, rpe)
      values (v_sid, v_setpos, coalesce(v_set->>'weight',''), coalesce(v_set->>'reps',''),
              nullif(v_set->>'rpe','')::smallint);
      v_setpos := v_setpos + 1;
    end loop;

    v_spos := v_spos + 1;
  end loop;

  return v_wid;
end;
$$;
