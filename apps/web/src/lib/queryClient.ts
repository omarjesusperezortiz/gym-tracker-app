import { MutationCache, QueryClient } from '@tanstack/react-query';
import { WORKOUTS_KEY } from './queryKeys';

// staleTime 30s: moving between tabs within half a minute serves straight from
// cache. gcTime 24h so the persisted cache is still valid after a reload (the
// persister only restores entries within gcTime).
//
// networkMode 'offlineFirst': queries try once even when the browser reports
// offline (the cache answers instantly), and MUTATIONS made offline are PAUSED
// rather than failed — they resume automatically when the connection returns
// (see resumePausedMutations in App). This is what makes logging work with no
// gym signal.
export function createQueryClient(): QueryClient {
  // A cache-level onSettled fires for EVERY mutation — including ones paused
  // offline and resumed after a reload (whose hook-scoped onSettled no longer
  // exists). Invalidating here swaps optimistic rows for real server rows.
  const mutationCache = new MutationCache({
    onSettled: () => {
      void client.invalidateQueries({ queryKey: WORKOUTS_KEY });
    },
  });

  const client = new QueryClient({
    mutationCache,
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 24 * 60 * 60_000,
        refetchOnWindowFocus: true,
        networkMode: 'offlineFirst',
        retry: 2,
      },
      mutations: {
        // 'online' PAUSES a mutation the moment it's fired while offline (it does
        // not even attempt), so it's cleanly queued and replayed on reconnect.
        networkMode: 'online',
        retry: 3,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      },
    },
  });
  return client;
}
