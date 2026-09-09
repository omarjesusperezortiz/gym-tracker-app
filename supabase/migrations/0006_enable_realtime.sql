-- Gym Trainer — Schema v6: enable Supabase Realtime on user data tables.
-- Adds tables to the supabase_realtime publication so the app can subscribe to
-- INSERT/UPDATE/DELETE and refresh the cache live across devices. RLS still
-- governs which rows a client can actually receive.
do $$
declare t text;
begin
  foreach t in array array[
    'workouts','workout_slots','workout_sets',
    'session_customizations','user_prefs','bodyweight_log'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then
      -- already in the publication, ignore
      null;
    end;
  end loop;
end $$;
