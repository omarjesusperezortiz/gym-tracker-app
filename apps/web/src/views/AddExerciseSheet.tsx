import { useMemo, useState } from 'react';
import { addableByGroup, addableExercises, KIND_LABEL, type AddedSlot, type Plan, type Session } from '@gym-tracker/core';
import { Sheet } from '../components/Sheet';
import { Segmented } from '../components/PrefControls';
import { ExerciseGif } from '../components/ExerciseGif';
import { IconChev } from '../lib/icons';
// Owns the .add-thumb-empty placeholder styling; importing here guarantees the
// picker's polish applies wherever the sheet mounts, independent of Home.
import '../styles/recap-extras.css';
import '../styles/exercise-gif.css';

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
  const grouped = useMemo(() => addableByGroup(plan, session), [plan, session]);
  const term = query.trim().toLowerCase();
  const matches = term ? addable.filter((a) => a.slot.toLowerCase().includes(term)) : addable;

  function add(slot: string) {
    onAdd({ slot, scheme: DEFAULT_SCHEME }, scope);
    setQuery('');
  }

  // One picker row — reused by the flat (search) and grouped (browse) views.
  function Row({ slot, kinds }: { slot: string; kinds: import('@gym-tracker/core').Kind[] }) {
    const preview = addable.find((a) => a.slot === slot)?.preview ?? null;
    return (
      <button className="add-row" onClick={() => add(slot)} disabled={busy}>
        <ExerciseGif name={slot} size="thumb" poster fallbackImg={preview?.img} />
        <span className="add-info">
          <span className="add-name">{slot}</span>
          <span className="add-kinds">
            {kinds.map((k) => (
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
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add exercise">
      <h2>Add exercise</h2>
      <div className="sh-sub">Browse by muscle group, or search.</div>

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

      {term ? (
        // Search view — flat list of matches.
        <div className="add-list">
          {matches.map((a) => (
            <Row key={a.slot} slot={a.slot} kinds={a.kinds} />
          ))}
          {!matches.length && <div className="pempty">No matching exercises.</div>}
        </div>
      ) : (
        // Browse view — grouped by muscle group.
        <div className="add-list">
          {grouped.map((g) => (
            <div className="add-group" key={g.group.key}>
              <div className="add-group-head">
                <span className="add-group-emoji" aria-hidden="true">
                  {g.group.emoji}
                </span>
                {g.group.label}
                <span className="add-group-count">{g.exercises.length}</span>
              </div>
              {g.exercises.map((a) => (
                <Row key={a.slot} slot={a.slot} kinds={a.kinds} />
              ))}
            </div>
          ))}
          {!grouped.length && (
            <div className="pempty">Everything in the catalog is already in this session.</div>
          )}
        </div>
      )}
    </Sheet>
  );
}
