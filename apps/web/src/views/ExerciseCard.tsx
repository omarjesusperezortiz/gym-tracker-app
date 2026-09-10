import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { isTimeScheme, KIND_LABEL } from '@gym-tracker/core';
import type { Kind, Plan, Slot } from '@gym-tracker/core';
import type { LiveSlotState } from '../state/AppState';
import { SetRow } from './SetRow';
import { ghostFor } from '../lib/ghost';
import type { ProgressionSuggestion } from '../lib/progression';
import { IconArrowDown, IconArrowUp, IconCheck, IconTrash } from '../lib/icons';

export interface ExerciseCardProps {
  index: number;
  slotDef: Slot;
  plan: Plan;
  state: LiveSlotState;
  loggedKinds?: Set<Kind>;
  onToggleDone: () => void;
  onToggleForce: () => void;
  onKindChange: (kind: Kind) => void;
  onSetChange: (index: number, field: 'w' | 'r', value: string) => void;
  onAddSet: () => void;
  onZoom: (src: string) => void;
  /** Session-edit mode: reveals the reorder/remove controls. */
  editing?: boolean;
  /** Not part of the catalog session — added by the user. */
  addedTag?: 'added' | 'today' | null;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  /** Suggested next target from last-time data (null when no history). */
  suggestion?: ProgressionSuggestion | null;
  /** True when there's a previous logged session to copy numbers from. */
  hasLast?: boolean;
  /** Start a rest countdown for this exercise. */
  onRest?: () => void;
  /** Pre-fill this exercise's sets with last time's weights/reps. */
  onUseLast?: () => void;
  /** When true, empty sets ghost the suggested weight instead of nothing. */
  autofill?: boolean;
  /** Flip the global "auto-fill suggested weight" preference. */
  onToggleAutofill?: () => void;
}

export function ExerciseCard({
  index,
  slotDef,
  plan,
  state,
  loggedKinds,
  onToggleDone,
  onToggleForce,
  onKindChange,
  onSetChange,
  onAddSet,
  onZoom,
  editing,
  addedTag,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  suggestion,
  hasLast,
  onRest,
  onUseLast,
  autofill,
  onToggleAutofill,
}: ExerciseCardProps) {
  const [slot, scheme, force] = slotDef;
  const { kind, done, sets } = state;
  const timeBased = isTimeScheme(scheme);
  const weighted = kind !== 'bw';

  const variationsForSlot = plan.variations[slot] || {};
  const vr = variationsForSlot[kind] || Object.values(variationsForSlot)[0];
  const cue = vr ? plan.cues[vr.name] || '' : '';
  const kinds = Object.keys(variationsForSlot) as Kind[];

  return (
    <div className={`ex${done ? ' done' : ''}`}>
      <div className="head">
        <div className="num">{done ? <IconCheck stroke="#062a1c" /> : index + 1}</div>
        <div className="hmeta">
          <div className="hname">
            {slot}
            {addedTag && <span className={`addtag${addedTag === 'today' ? ' today' : ''}`}>{addedTag === 'today' ? 'today' : 'added'}</span>}
          </div>
          <div className="hscheme">
            <span className="scheme-pill">{state.force && force ? force : scheme}</span>
            {force && (
              <span className={`forcebtn${state.force ? ' on' : ''}`} onClick={onToggleForce}>
                💪 Force
              </span>
            )}
          </div>
        </div>
        <div className={`check${done ? ' on' : ''}`} onClick={onToggleDone} role="checkbox" aria-checked={done} aria-label={`${slot} done`}>
          <IconCheck stroke="#062a1c" />
        </div>
      </div>

      {editing && (
        <div className="ex-edit">
          <button className="exbtn" onClick={onMoveUp} disabled={!canMoveUp} aria-label={`Move ${slot} up`}>
            <IconArrowUp />
          </button>
          <button className="exbtn" onClick={onMoveDown} disabled={!canMoveDown} aria-label={`Move ${slot} down`}>
            <IconArrowDown />
          </button>
          <button className="exbtn danger" onClick={onRemove} aria-label={`Remove ${slot}`}>
            <IconTrash /> Remove
          </button>
        </div>
      )}

      {kinds.length > 1 && (
        <ToggleGroup.Root
          type="single"
          className="seg"
          value={kind}
          // Single-select ToggleGroup deselects (value: '') when you click the
          // already-active item — this switcher must always keep exactly one
          // equipment kind selected, so an empty value is simply ignored.
          onValueChange={(value) => value && onKindChange(value as Kind)}
        >
          {kinds.map((kk) => (
            <ToggleGroup.Item key={kk} value={kk} className={`segi${kk === kind ? ' active' : ''}`}>
              {KIND_LABEL[kk] || kk}
              {loggedKinds?.has(kk) && <span className="segi-dot" aria-label="previously logged" />}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      )}

      <div className="detail">
        {vr && (
          <>
            <div className="exvarname">{vr.name}</div>
            {cue && <div className="cue">{cue}</div>}
            <div className="imgs">
              <div className="imgcell">
                <span className="tag">Start</span>
                <img loading="lazy" src={vr.img} alt={`${vr.name} start`} onClick={() => onZoom(vr.img)} />
              </div>
              <div className="imgcell">
                <span className="tag">Finish</span>
                <img loading="lazy" src={vr.img2} alt={`${vr.name} finish`} onClick={() => onZoom(vr.img2)} />
              </div>
            </div>
          </>
        )}
        {force && (
          <div className={`force-note${state.force ? ' show' : ''}`}>
            <b>💪 Strength:</b> {force} — heavier, fewer reps, longer rest.
          </div>
        )}
        <div className="sets">
          <div className={`sets-head${weighted ? '' : ' noweight'}`}>
            <div className="sl">SET</div>
            <div className="prev">PREVIOUS</div>
            {weighted && <div>{timeBased ? 'SEC' : 'KG'}</div>}
            <div>{timeBased ? 'TIME' : 'REPS'}</div>
          </div>
          {suggestion && (
            <div className="prog-hint">
              <span className="ph-ic" aria-hidden="true">
                <IconArrowUp />
              </span>
              <span className="ph-txt">
                Last time{' '}
                <b>
                  {suggestion.lastWeight != null ? `${suggestion.lastWeight}kg` : ''}
                  {suggestion.lastWeight != null && suggestion.lastReps != null ? ' × ' : ''}
                  {suggestion.lastReps != null ? suggestion.lastReps : ''}
                </b>{' '}
                — try <span className="ph-num">{suggestion.primary}</span>
                {suggestion.alt ? (
                  <>
                    {' '}
                    or <span className="ph-num">{suggestion.alt}</span>
                  </>
                ) : (
                  ''
                )}
              </span>
            </div>
          )}
          {(sets ?? []).map((set, j) => {
            // Non-invasive auto-fill: when the toggle is on and this exercise
            // has a suggested weight, feed it into the ghost placeholder ONLY
            // where there's no cascading ghost from a filled set above. SetRow
            // renders it gray exactly like any other ghost — no real value is
            // written to state until the user types.
            const cascadeW = ghostFor(sets ?? [], j, 'w');
            const ghostW =
              cascadeW ||
              (autofill && weighted && suggestion?.suggestedWeight != null
                ? String(suggestion.suggestedWeight)
                : '');
            return (
              <SetRow
                key={j}
                index={j}
                set={set}
                weighted={weighted}
                timeBased={timeBased}
                ghostW={ghostW}
                ghostR={ghostFor(sets ?? [], j, 'r')}
                onChange={(field, value) => onSetChange(j, field, value)}
              />
            );
          })}
        </div>
        {suggestion && onToggleAutofill && (
          <div className="autofill-row">
            <span className="af-label">Auto-fill suggested weight</span>
            <button
              type="button"
              className={`af-switch${autofill ? ' on' : ''}`}
              role="switch"
              aria-checked={!!autofill}
              aria-label="Auto-fill suggested weight"
              onClick={onToggleAutofill}
            >
              <span className="af-knob" />
            </button>
          </div>
        )}
        <div className="ex-actions">
          <button className="addset" onClick={onAddSet}>
            + Add set
          </button>
          {hasLast && onUseLast && (
            <button className="uselast" onClick={onUseLast}>
              ⟲ Use last time
            </button>
          )}
          {onRest && (
            <button className="restbtn" onClick={onRest}>
              ⏱ Rest
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
