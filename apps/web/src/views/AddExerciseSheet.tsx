import { useMemo, useState } from 'react';
import { addableExercises, KIND_LABEL, type AddedSlot, type Plan, type Session } from '@gym-tracker/core';
import { Sheet } from '../components/Sheet';
import { Segmented } from '../components/PrefControls';
import { IconChev } from '../lib/icons';
// Owns the .add-thumb-empty placeholder styling; importing here guarantees the
// picker's polish applies wherever the sheet mounts, independent of Home.
import '../styles/recap-extras.css';

// Subtle lime dumbbell shown instead of a blank box when an exercise has no
// preview image, so every row reads as a deliberate thumbnail.
function DumbbellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6.5 6.5l11 11M2 6l4-4M18 22l4-4M3 3l1 1M20 20l1 1M3.5 9.5l6-6M14.5 20.5l6-6" />
    </svg>
  );
}

export type AddScope = 'today' | 'permanent';

// Sensible default for anything added by hand; the scheme is editable later by
// adding/removing sets on the card itself.
export const DEFAULT_SCHEME = '3 × 8–12';

export interface AddExerciseSheetProps {
  open: boolean;
  onClose: () => void;
  plan: Plan;
  /** The session as currently trained, so what's already in it isn't offered. */
  session: Session;
  sessionName: string;
  onAdd: (slot: AddedSlot, scope: AddScope) => void;
  busy?: boolean;
}

export function AddExerciseSheet({ open, onClose, plan, session, sessionName, onAdd, busy }: AddExerciseSheetProps) {
  const [scope, setScope] = useState<AddScope>('today');
  const [query, setQuery] = useState('');

  const addable = useMemo(() => addableExercises(plan, session), [plan, session]);
  const term = query.trim().toLowerCase();
  const matches = term ? addable.filter((a) => a.slot.toLowerCase().includes(term)) : addable;

  function add(slot: string) {
    onAdd({ slot, scheme: DEFAULT_SCHEME }, scope);
    setQuery('');
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add exercise">
      <h2>Add exercise</h2>
      <div className="sh-sub">Pick a movement to add to this session.</div>

      <Segmented
        value={scope}
        options={[
          { value: 'today', label: 'Just today' },
          { value: 'permanent', label: `Always in ${sessionName}` },
        ]}
        onChange={(v) => setScope(v as AddScope)}
        ariaLabel="How long to add it for"
      />
      <div className="add-scope-note">
        {scope === 'today'
          ? 'Added to this workout only — your plan stays as it is.'
          : `Saved to ${sessionName}, so it's there every time.`}
      </div>

      <input
        className="add-search"
        type="search"
        placeholder="Search exercises…"
        aria-label="Search exercises"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="add-list">
        {matches.map((a) => (
          <button key={a.slot} className="add-row" onClick={() => add(a.slot)} disabled={busy}>
            {a.preview?.img ? (
              <img className="add-thumb" src={a.preview.img} alt="" loading="lazy" />
            ) : (
              <span className="add-thumb add-thumb-empty" aria-hidden="true">
                <DumbbellIcon />
              </span>
            )}
            <span className="add-info">
              <span className="add-name">{a.slot}</span>
              <span className="add-kinds">
                {a.kinds.map((k) => (
                  <span className="add-kind" key={k}>
                    {KIND_LABEL[k] || k}
                  </span>
                ))}
              </span>
            </span>
            <span className="add-go">
              <IconChev />
            </span>
          </button>
        ))}
        {!matches.length && (
          <div className="pempty">
            {term ? 'No matching exercises.' : 'Everything in the catalog is already in this session.'}
          </div>
        )}
      </div>
    </Sheet>
  );
}
