import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@gym-tracker/core';
import { useAuth } from '../auth/AuthContext';
import { WORKOUTS_KEY, PREFS_KEY, BODYWEIGHT_KEY, PRS_KEY, CUSTOMIZATIONS_KEY } from './queryKeys';

// Live multi-device sync: subscribe to this user's rows and invalidate the
// matching TanStack query when something changes on the server (e.g. a workout
// logged on the phone shows up on the laptop within a second). RLS means we only
// ever receive our own rows. We debounce a touch so a batched save (workout +
// slots + sets) triggers a single refetch.
export function useRealtimeSync(): void {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    const supabase = getSupabase();

    let workoutsTimer: ReturnType<typeof setTimeout> | undefined;
    const invalidateWorkoutsSoon = () => {
      clearTimeout(workoutsTimer);
      workoutsTimer = setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: WORKOUTS_KEY });
        void queryClient.invalidateQueries({ queryKey: PRS_KEY });
      }, 400);
    };

    const channel = supabase
      .channel(`sync-${userId}`)
      // workout tree — filter workouts by user; slots/sets have no user_id column,
      // so we listen broadly and let the debounced refetch (RLS-scoped) reconcile.
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts', filter: `user_id=eq.${userId}` }, invalidateWorkoutsSoon)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workout_slots' }, invalidateWorkoutsSoon)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workout_sets' }, invalidateWorkoutsSoon)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_customizations', filter: `user_id=eq.${userId}` }, () => {
        void queryClient.invalidateQueries({ queryKey: CUSTOMIZATIONS_KEY });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_prefs', filter: `user_id=eq.${userId}` }, () => {
        void queryClient.invalidateQueries({ queryKey: PREFS_KEY });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bodyweight_log', filter: `user_id=eq.${userId}` }, () => {
        void queryClient.invalidateQueries({ queryKey: BODYWEIGHT_KEY });
      })
      .subscribe();

    return () => {
      clearTimeout(workoutsTimer);
      void supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
