import { KIND_LABEL, type Kind, type Variation } from '@gym-tracker/core';
import { Sheet } from '../components/Sheet';
import { IconCheck } from '../lib/icons';
import '../styles/swap-sheet.css';

export interface SwapSheetProps {
  open: boolean;
  onClose: () => void;
  /** The movement being swapped (slot name, e.g. "Vertical pull (lats)"). */
  movement: string;
  /** Equipment variations available for this movement. */
  variations: Partial<Record<Kind, Variation>>;
  /** The currently-selected equipment kind. */
  current: Kind;
  /** Kinds the user has logged before (shown with a dot). */
  loggedKinds?: Set<Kind>;
  /** Pick a different variation → switches the specific exercise for this slot. */
  onPick: (kind: Kind) => void;
}

// Swap sheet: a movement (e.g. "Vertical pull") is trained by one of several
// specific exercises, distinguished by equipment. This lets the user pick a
// different one — the movement/slot stays, only the exercise changes.
export function SwapSheet({ open, onClose, movement, variations, current, loggedKinds, onPick }: SwapSheetProps) {
  const kinds = Object.keys(variations) as Kind[];

  function pick(k: Kind) {
    onPick(k);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Swap exercise">
      <h2>Swap exercise</h2>
      <div className="sh-sub">
        Pick a different exercise for <b>{movement}</b>. Same movement — your logged history stays.
      </div>

      <div className="swap-list">
        {kinds.map((k) => {
          const v = variations[k]!;
          const active = k === current;
          return (
            <button
              key={k}
              className={`swap-row${active ? ' active' : ''}`}
              onClick={() => pick(k)}
              aria-pressed={active}
            >
              {v.img ? (
                <img className="swap-thumb" src={v.img} alt="" loading="lazy" />
              ) : (
                <span className="swap-thumb swap-thumb-empty" aria-hidden="true">
                  🏋️
                </span>
              )}
              <span className="swap-info">
                <span className="swap-name">{v.name}</span>
                <span className="swap-kind">
                  {KIND_LABEL[k] || k}
                  {loggedKinds?.has(k) && <span className="swap-dot" aria-label="previously logged" />}
                </span>
              </span>
              {active && (
                <span className="swap-check" aria-label="current">
                  <IconCheck stroke="#062a1c" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
