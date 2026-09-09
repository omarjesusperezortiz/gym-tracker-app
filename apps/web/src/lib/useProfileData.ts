// Profile-screen data: prefs, bodyweight log and personal records. Same
// user-scoped, shared-cache pattern as useWorkouts, and the two writes patch
// the cache optimistically so the UI answers on the next paint.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBodyweight,
  fetchPersonalRecords,
  fetchPrefs,
  logBodyweight,
  savePrefs,
  type BodyweightEntry,
  type UserPrefs,
} from '@gym-tracker/core';
import { useAuth } from '../auth/AuthContext';
import { BODYWEIGHT_KEY, PREFS_KEY, queryKeys } from './queryKeys';

// What the UI falls back to before the user has ever saved prefs (no row yet).
export const DEFAULT_PREFS: UserPrefs = { units: 'kg', defaultPlan: 'gym', restSeconds: 90 };

function useUserId(): string | undefined {
  const { session } = useAuth();
  return session?.user.id;
}

export function usePrefs() {
  const userId = useUserId();
  return useQuery({ queryKey: queryKeys.prefs(userId), queryFn: fetchPrefs, enabled: !!userId });
}

export function useBodyweight() {
  const userId = useUserId();
  return useQuery({ queryKey: queryKeys.bodyweight(userId), queryFn: fetchBodyweight, enabled: !!userId });
}

export function usePersonalRecords() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.personalRecords(userId),
    queryFn: fetchPersonalRecords,
    enabled: !!userId,
  });
}

// A units/rest-timer toggle has to move the instant it's tapped, so the pref is
// patched into the cache before the round-trip and restored if it fails.
export function useSavePrefs() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Partial<UserPrefs>, { previous: [readonly unknown[], UserPrefs | null | undefined][] }>({
    mutationFn: savePrefs,
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: PREFS_KEY });
      const previous = queryClient.getQueriesData<UserPrefs | null>({ queryKey: PREFS_KEY });
      previous.forEach(([key]) => {
        queryClient.setQueryData<UserPrefs | null>(key, (old) => ({ ...(old ?? DEFAULT_PREFS), ...patch }));
      });
      return { previous };
    },
    onError: (_err, _patch, context) => {
      context?.previous.forEach(([key, prefs]) => queryClient.setQueryData(key, prefs));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: PREFS_KEY });
    },
  });
}

export interface WeighIn {
  date: string;
  weightKg: number;
  note?: string;
}

export function useLogBodyweight() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, WeighIn, { previous: [readonly unknown[], BodyweightEntry[] | undefined][] }>({
    mutationFn: ({ date, weightKg, note }) => logBodyweight(date, weightKg, note),
    onMutate: async (entry) => {
      await queryClient.cancelQueries({ queryKey: BODYWEIGHT_KEY });
      const previous = queryClient.getQueriesData<BodyweightEntry[]>({ queryKey: BODYWEIGHT_KEY });
      previous.forEach(([key, log]) => {
        if (!log) return;
        // logBodyweight upserts on (user, date), so a same-day weigh-in replaces
        // rather than duplicates. fetchBodyweight returns oldest-first.
        const next = log
          .filter((e) => e.date !== entry.date)
          .concat({ id: `optimistic-${entry.date}`, date: entry.date, weightKg: entry.weightKg, note: entry.note ?? null })
          .sort((a, b) => a.date.localeCompare(b.date));
        queryClient.setQueryData<BodyweightEntry[]>(key, next);
      });
      return { previous };
    },
    onError: (_err, _entry, context) => {
      context?.previous.forEach(([key, log]) => queryClient.setQueryData(key, log));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: BODYWEIGHT_KEY });
    },
  });
}
