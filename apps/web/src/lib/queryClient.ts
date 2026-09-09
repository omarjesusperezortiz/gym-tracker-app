import { QueryClient } from '@tanstack/react-query';

// staleTime 30s: moving between tabs within half a minute serves straight from
// cache. gcTime 5min: come back to the app later and the last data still paints
// instantly while a background refetch runs.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  });
}
