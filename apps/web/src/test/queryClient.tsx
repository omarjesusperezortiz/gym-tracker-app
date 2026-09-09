import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// A per-test QueryClient: no retries (so a rejected mutation surfaces its error
// immediately) and no cross-test cache sharing.
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}

export function withQueryClient(children: ReactNode, client = createTestQueryClient()) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
