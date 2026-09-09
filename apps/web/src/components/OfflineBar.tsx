import { useEffect, useState } from 'react';
import { onlineManager, useIsRestoring, useMutationState } from '@tanstack/react-query';

// A slim status strip: shows when you're offline, and how many changes are
// queued to sync. Stays hidden when online with nothing pending.
export function OfflineBar() {
  const restoring = useIsRestoring();
  const [online, setOnline] = useState(() => onlineManager.isOnline());

  useEffect(() => onlineManager.subscribe(setOnline), []);

  // Count mutations that are paused (offline) or still retrying.
  const pending = useMutationState({
    filters: { status: 'pending' },
  }).length;
  const paused = useMutationState({
    filters: { predicate: (m) => m.state.isPaused },
  }).length;

  if (restoring) return null;
  if (online && paused === 0 && pending === 0) return null;

  const queued = Math.max(paused, pending);
  return (
    <div className={`offlinebar${online ? ' syncing' : ''}`} role="status" aria-live="polite">
      {!online ? (
        <>
          <span className="offdot" /> Offline — {queued > 0 ? `${queued} change${queued === 1 ? '' : 's'} will sync when you reconnect` : 'changes are saved on this device'}
        </>
      ) : (
        <>
          <span className="offdot syncing" /> Syncing {queued} change{queued === 1 ? '' : 's'}…
        </>
      )}
    </div>
  );
}
