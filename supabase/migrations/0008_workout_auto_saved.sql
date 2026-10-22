-- Gym Trainer — Schema v8: auto-saved workouts
-- Additive & idempotent. An unfinished workout left open past its day is saved
-- by the app instead of discarded; workouts.auto_saved marks those rows so the
-- Calendar can say the user didn't tap Finish. Old rows default to false.

alter table public.workouts add column if not exists auto_saved boolean not null default false;

-- Same save RPC as v6, now also persisting auto_saved (absent → false).
create or replace function public.save_workout(payload jsonb)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_user   uuid := auth.uid();
  v_wid    uuid := nullif(payload->>'id','')::uuid;
  v_client bigint := nullif(payload->>'client_id','')::bigint;
  v_auto   boolean := coalesce((payload->>'auto_saved')::boolean, false);
  v_slot   jsonb;
  v_set    jsonb;
  v_sid    uuid;
  v_spos   int := 0;
  v_setpos int := 0;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  if v_wid is not null then
    perform 1 from public.workouts where id = v_wid and user_id = v_user;
    if not found then v_wid := null; end if;
  elsif v_client is not null then
    select id into v_wid from public.workouts
      where user_id = v_user and client_id = v_client;
  end if;

  if v_wid is null then
    insert into public.workouts (user_id, client_id, date, plan, sess, name, type, auto_saved)
    values (v_user, v_client, (payload->>'date')::timestamptz,
            coalesce(payload->>'plan','gym'), payload->>'sess', payload->>'name',
            coalesce(payload->>'type','workout'), v_auto)
    returning id into v_wid;
  else
    update public.workouts set
      date = (payload->>'date')::timestamptz,
      plan = coalesce(payload->>'plan','gym'),
      sess = payload->>'sess',
      name = payload->>'name',
      type = coalesce(payload->>'type','workout'),
      auto_saved = v_auto
    where id = v_wid;
    delete from public.workout_slots where workout_id = v_wid;
  end if;

  v_spos := 0;
  for v_slot in select * from jsonb_array_elements(coalesce(payload->'slots','[]'::jsonb))
  loop
    insert into public.workout_slots (workout_id, position, slot, slot_id, exercise_id, kind, done, force)
    values (v_wid, v_spos, v_slot->>'slot', nullif(v_slot->>'slot_id',''),
            nullif(v_slot->>'exercise_id',''),
            coalesce(v_slot->>'kind','bw'),
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
