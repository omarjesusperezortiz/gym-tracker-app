import { useState } from 'react';
import { useDrag } from '@use-gesture/react';
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

const REVEAL = 76; // px the row slides left to expose the Delete action

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

  // Swipe-to-delete via @use-gesture. axis:'lock' means the gesture commits to
  // the dominant direction on the first move: a mostly-vertical drag stays a
  // normal page scroll (we never touch it), only a mostly-horizontal drag pulls
  // the row. That's what stops the list scrolling when you try to swipe.
  const [open, setOpen] = useState(false);
  const [dx, setDx] = useState(0);
  const [active, setActive] = useState(false);

  const bind = useDrag(
    ({ last, movement: [mx], axis, tap, cancel, dragging: isDragging }) => {
      if (!onDelete) return;
      // Only react to a horizontal-locked drag; let vertical scroll pass through.
      if (axis === 'y') {
        cancel();
        return;
      }
      if (tap) return;
      const base = open ? -REVEAL : 0;
      const next = Math.max(-REVEAL, Math.min(0, base + mx));
      setActive(!!isDragging);
      if (last) {
        setOpen(next < -REVEAL / 2);
        setDx(0);
      } else {
        setDx(next);
      }
    },
    { axis: 'lock', filterTaps: true, pointer: { touch: true } }
  );

  const translateX = open ? -REVEAL : dx;

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
        {...(onDelete ? bind() : {})}
        className={`setrow${weighted ? '' : ' noweight'}${done ? ' done' : ''}${active ? ' dragging' : ''}`}
        style={{ transform: `translateX(${translateX}px)`, touchAction: 'pan-y' }}
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
          onClick={() => onToggleDone?.()}
        >
          {done ? '✓' : ''}
        </button>
      </div>
    </div>
  );
}
