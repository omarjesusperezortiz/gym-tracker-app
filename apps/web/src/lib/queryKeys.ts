// Query keys for the TanStack Query cache. Workout history is keyed by user so
// signing in as someone else can never read the previous user's cached rows.
export const WORKOUTS_KEY = ['workouts'] as const;

export const queryKeys = {
  // Every view calls useWorkouts(), so they all share this one cache entry —
  // switching tabs reads the cache instead of refetching.
  workouts: (userId: string | undefined) => [...WORKOUTS_KEY, userId] as const,
};
