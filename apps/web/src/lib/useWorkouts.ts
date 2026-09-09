import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import { fetchWorkouts, type LoggedWorkout } from './workouts';
import { queryKeys } from './queryKeys';

export interface UseWorkouts {
  history: LoggedWorkout[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Stable reference so `history` doesn't change identity between renders while
// the first fetch is in flight (TrainView memoises off it).
const EMPTY: LoggedWorkout[] = [];

// One shared, cached copy of the workout history for every view. Previously each
// view held its own useState + useEffect fetch, so Today → Home → Calendar →
// Progress meant four full round-trips; now they all read the same query.
export function useWorkouts(): UseWorkouts {
  const { session } = useAuth();
  const userId = session?.user.id;

  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.workouts(userId),
    queryFn: fetchWorkouts,
    enabled: !!userId,
  });

  return {
    history: data ?? EMPTY,
    // Stays true while signed out (query disabled), matching the old hook, which
    // never flipped `loading` off until a fetch resolved.
    loading: isPending,
    error: error ? (error instanceof Error ? error.message : 'Failed to load history') : null,
    refetch: async () => {
      await refetch();
    },
  };
}
