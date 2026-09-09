// Workout writes, each with an optimistic cache patch so the UI reflects the
// change on the next paint instead of after the round-trip, and a rollback if
// the server rejects it.
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { finishWorkout, updateWorkout, type FinishedWorkout, type UpdateWorkout } from '@gym-tracker/core';
import { logDayMarker, removeWorkout, type LoggedWorkout } from './workouts';
import { WORKOUTS_KEY } from './queryKeys';

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
function useOptimisticWorkoutMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
  patch: (history: LoggedWorkout[], vars: TVars) => LoggedWorkout[]
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, TVars, Rollback>({
    mutationFn,
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
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: WORKOUTS_KEY });
    },
  });
}

// Finishing a session: shows up in Calendar/Home/Progress before the RPC returns.
export function useFinishWorkout() {
  return useOptimisticWorkoutMutation<FinishedWorkout>(finishWorkout, (history, entry) =>
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
  return useOptimisticWorkoutMutation<UpdateWorkout>(updateWorkout, (history, entry) =>
    history.map((w) =>
      w.id === entry.id ? { ...w, plan: entry.plan, sess: entry.sess, name: entry.name, slots: entry.slots } : w
    )
  );
}

// Logging a rest day from the Calendar day sheet.
export function useLogRestDay() {
  return useOptimisticWorkoutMutation<{ date: string }>(
    ({ date }) => logDayMarker(date, 'rest'),
    (history, { date }) =>
      newestFirst([
        { id: `${OPTIMISTIC_ID}${date}`, date, plan: 'gym', sess: null, name: 'Rest', type: 'rest', slots: [] },
        ...history,
      ])
  );
}

// Deleting a row — used to un-log a rest day.
export function useRemoveWorkout() {
  return useOptimisticWorkoutMutation<{ id: string }>(
    ({ id }) => removeWorkout(id),
    (history, { id }) => history.filter((w) => w.id !== id)
  );
}
