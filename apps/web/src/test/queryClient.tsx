import { QueryClientProvider, onlineManager, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createQueryClient } from '../lib/queryClient';
import { registerMutationDefaults } from '../lib/mutationDefaults';

// Starts from the app's real defaults (so tests exercise the actual staleTime /
// gcTime behaviour) and only turns off what makes tests flaky: retries, which
// would swallow a rejected mutation, and window-focus refetching. Mutation
// defaults are registered so keyed mutations resolve their fn, and networkMode
// is forced to 'always' so jsdom (which can report offline) never pauses them.
export function createTestQueryClient(): QueryClient {
  onlineManager.setOnline(true);
  const client = createQueryClient();
  registerMutationDefaults(client);
  const { queries, mutations } = client.getDefaultOptions();
  client.setDefaultOptions({
    queries: { ...queries, retry: false, refetchOnWindowFocus: false, networkMode: 'always' },
    mutations: { ...mutations, retry: false, networkMode: 'always' },
  });
  return client;
}

export function withQueryClient(children: ReactNode, client = createTestQueryClient()) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
