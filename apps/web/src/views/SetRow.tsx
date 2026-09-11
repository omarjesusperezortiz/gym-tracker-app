import { useRef, useState } from 'react';
import type { LiveSet } from '../state/AppState';

export interface SetRowProps {
  index: number;
  set: LiveSet;
  weighted: boolean;
  timeBased: boolean;
  /** Cascading ghost values (from the nearest filled set above) shown gray when empty. */
  ghostW: string;
  ghostR: string;
  onChange: (field: 'w' | 'r', value: string) => void;
  /** Toggle this set's per-set completion check (layout A). */
  onToggleDone?: () => void;
  /** Remove this set — revealed by swiping the row left. */
  onDelete?: () => void;
}

export function SetRow({
  index,
  set,
  weighted,
  timeBased,
  ghostW,
  ghostR,
  onChange,
  onToggleDone,
  onDelete,
}: SetRowProps) {
  const repPlaceholder = timeBased ? 'sec' : 'reps';
  const done = !!set.done;

  // Swipe-to-delete: drag the row left to reveal a Delete action underneath.
  const REVEAL = 76; // px the row slides to expose the delete button
  const [dx, setDx] = useState(0);
  const [open, setOpen] = useState(false);
  const startX = useRef<number | null>(null);
  const startOpen = useRef(false);
  const dragging = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    if (!onDelete) return;
    startX.current = e.clientX;
    startOpen.current = open;
    dragging.current = false;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (startX.current == null || !onDelete) return;
    const delta = e.clientX - startX.current + (startOpen.current ? -REVEAL : 0);
    // horizontal intent only; clamp between fully-open (-REVEAL) and closed (0)
    if (Math.abs(e.clientX - startX.current) > 6) dragging.current = true;
    setDx(Math.max(-REVEAL, Math.min(0, delta)));
  }
  function onPointerUp() {
    if (startX.current == null) return;
    startX.current = null;
    const shouldOpen = dx < -REVEAL / 2;
    setOpen(shouldOpen);
    setDx(0);
  }

  return (
    <div className={`setrow-wrap${onDelete ? ' swipeable' : ''}`}>
      {onDelete && (
        <button
          type="button"
          className="setrow-delete"
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
          aria-label={`Delete set ${index + 1}`}
          tabIndex={open ? 0 : -1}
        >
          <span className="srd-ico">🗑</span>
          Delete
        </button>
      )}
      <div
        className={`setrow${weighted ? '' : ' noweight'}${done ? ' done' : ''}`}
        style={{ transform: `translateX(${open ? -REVEAL : dx}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="sl">{index + 1}</div>
        <div className="prev">{set.last || '–'}</div>
        {weighted && (
          <input
            inputMode="decimal"
            placeholder={ghostW || 'kg'}
            aria-label={`Set ${index + 1} weight`}
            value={set.w}
            className={set.w ? 'filled' : ghostW ? 'ghost' : ''}
            onChange={(e) => onChange('w', e.target.value)}
          />
        )}
        <input
          inputMode="numeric"
          placeholder={ghostR || repPlaceholder}
          aria-label={`Set ${index + 1} ${timeBased ? 'seconds' : 'reps'}`}
          value={set.r}
          className={set.r ? 'filled' : ghostR ? 'ghost' : ''}
          onChange={(e) => onChange('r', e.target.value)}
        />
        <button
          type="button"
          className={`setrow-check${done ? ' on' : ''}`}
          role="checkbox"
          aria-checked={done}
          aria-label={`Set ${index + 1} done`}
          onClick={() => {
            if (dragging.current) return; // ignore the tap that ended a swipe
            onToggleDone?.();
          }}
        >
          {done ? '✓' : ''}
        </button>
      </div>
    </div>
  );
}
