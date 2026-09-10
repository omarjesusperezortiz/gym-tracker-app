// Non-blocking "New PR!" burst shown mid-workout when a logged set beats the
// user's previous best weight for an exercise. Auto-dismisses; one is shown per
// exercise per session (the caller dedupes). Stacked top-of-screen so it never
// blocks the set inputs.
import { useEffect } from 'react';

export interface PrBurstData {
  id: number;
  exercise: string;
  weightKg: number;
}

export function PrBurst({ data, onDone }: { data: PrBurstData; onDone: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(data.id), 3200);
    return () => clearTimeout(t);
  }, [data.id, onDone]);

  return (
    <div className="pr-burst" role="status" aria-live="polite">
      <span className="pr-burst-emoji" aria-hidden="true">
        🎉
      </span>
      <span className="pr-burst-text">
        New PR! <b>{data.exercise}</b> {data.weightKg}kg
      </span>
    </div>
  );
}

export function PrBurstStack({ items, onDone }: { items: PrBurstData[]; onDone: (id: number) => void }) {
  if (!items.length) return null;
  return (
    <div className="pr-burst-stack">
      {items.map((it) => (
        <PrBurst key={it.id} data={it} onDone={onDone} />
      ))}
    </div>
  );
}
