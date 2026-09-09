import { useMemo, useState } from 'react';
import { addableExercises, KIND_LABEL, type AddedSlot, type Plan, type Session } from '@gym-tracker/core';
import { Sheet } from '../components/Sheet';
import { Segmented } from '../components/PrefControls';
import { IconChev } from '../lib/icons';

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
  // Anything typed that isn't already an option can be added as a custom name.
  const canAddCustom = !!term && !addable.some((a) => a.slot.toLowerCase() === term) && !session.slots.some((s) => s[0].toLowerCase() === term);

  function add(slot: string, custom = false) {
    onAdd({ slot, scheme: DEFAULT_SCHEME, ...(custom ? { custom: true } : {}) }, scope);
    setQuery('');
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add exercise">
      <h2>Add exercise</h2>
      <div className="sh-sub">Pick a movement, or type your own.</div>

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

      {canAddCustom && (
        <button className="add-custom" onClick={() => add(query.trim(), true)} disabled={busy}>
          <span className="add-custom-plus">+</span>
          <span>
            Add “<b>{query.trim()}</b>” as a custom exercise
          </span>
        </button>
      )}

      <div className="add-list">
        {matches.map((a) => (
          <button key={a.slot} className="add-row" onClick={() => add(a.slot)} disabled={busy}>
            {a.preview?.img ? (
              <img className="add-thumb" src={a.preview.img} alt="" loading="lazy" />
            ) : (
              <span className="add-thumb add-thumb-empty" aria-hidden="true" />
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
        {!matches.length && !canAddCustom && (
          <div className="pempty">Everything in the catalog is already in this session.</div>
        )}
      </div>
    </Sheet>
  );
}
