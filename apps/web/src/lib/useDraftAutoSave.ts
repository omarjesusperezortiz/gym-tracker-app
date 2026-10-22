// Saves a workout that was left unfinished once its day has passed — through the
// same mutations as the Finish button (optimistic patch + offline queue), dated
// the day it was started. No toast, no celebration: the Calendar marks it
// "auto-saved". Runs on load (once history is known), when the app comes back to
// the foreground, and at local midnight while it stays open.
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { FinishedWorkout } from '@gym-tracker/core';
import { useAppState } from '../state/AppState';
import { autoSaveEntry, liveKeysBySession, localDateKey, msUntilNextMidnight, staleSessions } from './draftAutoSave';
import { MUT } from './mutationDefaults';
import { useFinishWorkout, useUpdateWorkout } from './useWorkoutMutations';
import { useWorkouts } from './useWorkouts';

export function useDraftAutoSave(): void {
  const { state, dispatch } = useAppState();
  const { history, loading } = useWorkouts();
  const queryClient = useQueryClient();
  const finish = useFinishWorkout();
  const update = useUpdateWorkout();
  const [today, setToday] = useState(localDateKey);
  // Client ids this mount has already sent, so a re-render while the write is
  // in flight can't fire it twice.
  const sentRef = useRef(new Set<number>());

  // Background timers are throttled on a sleeping phone, so the midnight timer
  // alone can't be trusted: re-read the date whenever the app comes back.
  useEffect(() => {
    const refresh = () => setToday(localDateKey());
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        refresh();
        schedule();
      }, msUntilNextMidnight() + 1000);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    schedule();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', refresh);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  useEffect(() => {
    const stale = staleSessions(state.draftDates, today);
    if (!stale.length) return;
    const bySession = liveKeysBySession(state.live);
    const clear = (sessionKey: string) =>
      dispatch({ type: 'CLEAR_SLOTS', keys: bySession[sessionKey] ?? [], sessionKey });

    for (const sessionKey of stale) {
      const day = state.draftDates[sessionKey];
      const keys = bySession[sessionKey] ?? [];
      const entry = autoSaveEntry(state.live, keys, sessionKey, day);
      if (!entry) {
        clear(sessionKey); // nothing logged: drop it silently
        continue;
      }
      // Need history to tell whether this day's workout already landed.
      if (loading) continue;
      const clientId = entry.clientId as number;
      const [plan, sess] = sessionKey.split('|');
      const sent = sentRef.current;
      // Queued offline (possibly from before a reload): it replays on its own.
      const inFlight =
        sent.has(clientId) ||
        queryClient
          .getMutationCache()
          .findAll({ mutationKey: MUT.finishWorkout, status: 'pending' })
          .some((m) => (m.state.variables as FinishedWorkout | undefined)?.clientId === clientId);

      if (state.editingId && state.editingKey === sessionKey) {
        // Was editing a past workout: finish the edit in place, as Finish would.
        if (inFlight) continue;
        sent.add(clientId);
        update.mutate(
          { id: state.editingId, plan, sess, name: entry.name, slots: entry.slots },
          { onSuccess: () => clear(sessionKey), onError: () => sent.delete(clientId) }
        );
        continue;
      }

      // Already in history for that day — Finish was tapped, or our own earlier
      // save landed (a mutate callback only fires for the latest call, and not
      // at all after a reload, so history is what finally clears the draft). Our
      // own optimistic row doesn't count until the server confirms it.
      const saved = history.find(
        (w) => w.type === 'workout' && w.plan === plan && w.sess === sess && localDateKey(new Date(w.date)) === day
      );
      if (saved && !(inFlight && saved.id.startsWith('optimistic-'))) {
        sent.delete(clientId);
        clear(sessionKey);
        continue;
      }
      if (inFlight) continue;

      sent.add(clientId);
      // A failed write leaves the draft (and un-marks it) so the next check
      // retries; the stable clientId keeps any retry from adding a second row.
      finish.mutate(entry, { onSuccess: () => clear(sessionKey), onError: () => sent.delete(clientId) });
    }
    // finish/update/dispatch/queryClient are stable enough; re-running on them would only re-check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, state.draftDates, state.live, history, loading]);
}
