import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createQueryClient } from '../lib/queryClient';

// Starts from the app's real defaults (so tests exercise the actual staleTime /
// gcTime behaviour) and only turns off what makes tests flaky: retries, which
// would swallow a rejected mutation, and window-focus refetching.
export function createTestQueryClient(): QueryClient {
  const client = createQueryClient();
  const { queries, mutations } = client.getDefaultOptions();
  client.setDefaultOptions({
    queries: { ...queries, retry: false, refetchOnWindowFocus: false },
    mutations: { ...mutations, retry: false },
  });
  return client;
}

export function withQueryClient(children: ReactNode, client = createTestQueryClient()) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
