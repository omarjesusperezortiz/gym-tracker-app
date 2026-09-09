// Per-session customizations (added / hidden / reordered exercises). Same
// user-scoped shared-cache pattern as useProfileData, and the writes patch the
// cache optimistically so an added or removed exercise lands on the next paint
// rather than after the round-trip.
import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  EMPTY_OVERLAY,
  fetchCustomizations,
  resetCustomization,
  saveCustomization,
  type SessionOverlay,
  type StoredCustomization,
} from '@gym-tracker/core';
import { useAuth } from '../auth/AuthContext';
import { CUSTOMIZATIONS_KEY, queryKeys } from './queryKeys';

function useUserId(): string | undefined {
  const { session } = useAuth();
  return session?.user.id;
}

export interface UseCustomizations {
  overlays: StoredCustomization[];
  loading: boolean;
  /** The overlay for one session, or EMPTY_OVERLAY when it has none. */
  overlayFor: (plan: string, sess: string) => SessionOverlay;
}

export function useCustomizations(): UseCustomizations {
  const userId = useUserId();
  const { data, isPending } = useQuery({
    queryKey: queryKeys.customizations(userId),
    queryFn: fetchCustomizations,
    enabled: !!userId,
  });
  const overlays = data ?? EMPTY_LIST;

  const overlayFor = useCallback(
    (plan: string, sess: string): SessionOverlay =>
      overlays.find((c) => c.plan === plan && c.sess === sess) ?? EMPTY_OVERLAY,
    [overlays]
  );

  return { overlays, loading: isPending, overlayFor };
}

// Stable identity so `overlays` doesn't change reference on every render while
// the first fetch is in flight (TrainView memoises off the overlay).
const EMPTY_LIST: StoredCustomization[] = [];

export interface SaveCustomizationVars {
  plan: string;
  sess: string;
  overlay: SessionOverlay;
}

type Rollback = { previous: [readonly unknown[], StoredCustomization[] | undefined][] };

function patchAll(
  queryClient: ReturnType<typeof useQueryClient>,
  patch: (rows: StoredCustomization[]) => StoredCustomization[]
) {
  const previous = queryClient.getQueriesData<StoredCustomization[]>({ queryKey: CUSTOMIZATIONS_KEY });
  previous.forEach(([key, rows]) => {
    if (rows) queryClient.setQueryData<StoredCustomization[]>(key, patch(rows));
  });
  return previous;
}

export function useSaveCustomization() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, SaveCustomizationVars, Rollback>({
    mutationFn: ({ plan, sess, overlay }) => saveCustomization(plan, sess, overlay),
    onMutate: async ({ plan, sess, overlay }) => {
      await queryClient.cancelQueries({ queryKey: CUSTOMIZATIONS_KEY });
      const previous = patchAll(queryClient, (rows) => {
        const rest = rows.filter((r) => !(r.plan === plan && r.sess === sess));
        return [...rest, { plan, sess, ...overlay }];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, rows]) => queryClient.setQueryData(key, rows));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: CUSTOMIZATIONS_KEY });
    },
  });
}

export interface ResetCustomizationVars {
  plan: string;
  sess: string;
}

export function useResetCustomization() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ResetCustomizationVars, Rollback>({
    mutationFn: ({ plan, sess }) => resetCustomization(plan, sess),
    onMutate: async ({ plan, sess }) => {
      await queryClient.cancelQueries({ queryKey: CUSTOMIZATIONS_KEY });
      const previous = patchAll(queryClient, (rows) =>
        rows.filter((r) => !(r.plan === plan && r.sess === sess))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      context?.previous.forEach(([key, rows]) => queryClient.setQueryData(key, rows));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: CUSTOMIZATIONS_KEY });
    },
  });
}
