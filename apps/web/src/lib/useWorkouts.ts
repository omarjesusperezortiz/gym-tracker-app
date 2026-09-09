import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { fetchWorkouts, type LoggedWorkout } from './workouts';

export interface UseWorkouts {
  history: LoggedWorkout[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWorkouts(): UseWorkouts {
  const { session } = useAuth();
  const [history, setHistory] = useState<LoggedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWorkouts();
      setHistory(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) void refetch();
  }, [session, refetch]);

  return { history, loading, error, refetch };
}
