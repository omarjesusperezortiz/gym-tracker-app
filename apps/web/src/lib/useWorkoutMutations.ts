// Workout writes, each with an optimistic cache patch so the UI reflects the
// change on the next paint instead of after the round-trip, and a rollback if
// the server rejects it. Each carries a mutationKey so that, when made OFFLINE,
// the mutation is paused + persisted and replays after reconnect/reload (the
// mutationFn is re-attached by key in mutationDefaults.ts).
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { type FinishedWorkout, type UpdateWorkout } from '@gym-tracker/core';
import { type LoggedWorkout } from './workouts';
import { WORKOUTS_KEY } from './queryKeys';
import { MUT } from './mutationDefaults';

// Placeholder id for a row the server hasn't assigned a uuid to yet. It only
// lives until onSettled's refetch swaps in the real row.
const OPTIMISTIC_ID = 'optimistic-';

// fetchWorkouts() returns newest-first; keep patched entries in the same order
// so the Calendar/Home/Progress derivations behave identically.
function newestFirst(list: LoggedWorkout[]): LoggedWorkout[] {
  return list.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

interface Rollback {
  previous: [QueryKey, LoggedWorkout[] | undefined][];
}

// Patches every cached ['workouts', userId] entry — the mutation doesn't need to
// know which user is signed in, and rollback restores exactly what was replaced.
// The mutationFn comes from the registered defaults (keyed), so paused-offline
// mutations can replay after a reload.
function useOptimisticWorkoutMutation<TVars>(
  mutationKey: readonly unknown[],
  patch: (history: LoggedWorkout[], vars: TVars) => LoggedWorkout[]
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, TVars, Rollback>({
    mutationKey: mutationKey as unknown[],
    onMutate: async (vars) => {
      // Stop in-flight refetches from overwriting the optimistic patch.
      await queryClient.cancelQueries({ queryKey: WORKOUTS_KEY });
      const previous = queryClient.getQueriesData<LoggedWorkout[]>({ queryKey: WORKOUTS_KEY });
      previous.forEach(([key, history]) => {
        if (history) queryClient.setQueryData<LoggedWorkout[]>(key, patch(history, vars));
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, history]) => queryClient.setQueryData(key, history));
    },
    // Note: the invalidate-on-settle lives at the MutationCache level (see
    // queryClient.ts) so it also runs for offline mutations resumed after a
    // reload. Adding it here too would double-refetch.
  });
}

// Finishing a session: shows up in Calendar/Home/Progress before the RPC returns.
export function useFinishWorkout() {
  return useOptimisticWorkoutMutation<FinishedWorkout>(MUT.finishWorkout, (history, entry) =>
    newestFirst([
      {
        id: `${OPTIMISTIC_ID}${entry.date}`,
        date: entry.date,
        plan: entry.plan,
        sess: entry.sess,
        name: entry.name,
        type: 'workout',
        slots: entry.slots,
      },
      ...history,
    ])
  );
}

// Editing a past workout in place — same row, new slots, original id/date kept.
export function useUpdateWorkout() {
  return useOptimisticWorkoutMutation<UpdateWorkout>(MUT.updateWorkout, (history, entry) =>
    history.map((w) =>
      w.id === entry.id ? { ...w, plan: entry.plan, sess: entry.sess, name: entry.name, slots: entry.slots } : w
    )
  );
}

// Logging a rest day from the Calendar day sheet.
export function useLogRestDay() {
  return useOptimisticWorkoutMutation<{ date: string }>(MUT.logRestDay, (history, { date }) =>
    newestFirst([
      { id: `${OPTIMISTIC_ID}${date}`, date, plan: 'gym', sess: null, name: 'Rest', type: 'rest', slots: [] },
      ...history,
    ])
  );
}

// Deleting a row — used to un-log a rest day.
export function useRemoveWorkout() {
  return useOptimisticWorkoutMutation<{ id: string }>(MUT.removeWorkout, (history, { id }) =>
    history.filter((w) => w.id !== id)
  );
}
