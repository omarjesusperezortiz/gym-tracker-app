import { isTimeScheme, KIND_LABEL } from '@gym-tracker/core';
import type { Kind, Plan, Slot } from '@gym-tracker/core';
import type { LiveSlotState } from '../state/AppState';
import { SetRow } from './SetRow';
import { IconCheck } from '../lib/icons';

export interface ExerciseCardProps {
  index: number;
  slotDef: Slot;
  plan: Plan;
  state: LiveSlotState;
  onToggleDone: () => void;
  onToggleForce: () => void;
  onKindChange: (kind: Kind) => void;
  onSetChange: (index: number, field: 'w' | 'r', value: string) => void;
  onAddSet: () => void;
  onZoom: (src: string) => void;
}

export function ExerciseCard({
  index,
  slotDef,
  plan,
  state,
  onToggleDone,
  onToggleForce,
  onKindChange,
  onSetChange,
  onAddSet,
  onZoom,
}: ExerciseCardProps) {
  const [slot, scheme, force] = slotDef;
  const { kind, done, sets } = state;
  const timeBased = isTimeScheme(scheme);
  const weighted = kind !== 'bw';

  const variationsForSlot = plan.variations[slot] || {};
  const vr = variationsForSlot[kind] || Object.values(variationsForSlot)[0];
  const cue = vr ? plan.cues[vr.name] || '' : '';
  const kinds = Object.keys(variationsForSlot) as Kind[];
  const kIdx = Math.max(0, kinds.indexOf(kind));

  return (
    <div className={`ex${done ? ' done' : ''}`}>
      <div className="head">
        <div className="num">{done ? <IconCheck stroke="#062a1c" /> : index + 1}</div>
        <div className="hmeta">
          <div className="hname">{slot}</div>
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

      {kinds.length > 1 && (
        <div className="seg">
          <div className="thumb" style={{ width: `calc((100% - 6px)/${kinds.length})`, transform: `translateX(${kIdx * 100}%)` }} />
          {kinds.map((kk) => (
            <div key={kk} className={`segi${kk === kind ? ' active' : ''}`} onClick={() => onKindChange(kk)}>
              {KIND_LABEL[kk] || kk}
            </div>
          ))}
        </div>
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
          {(sets ?? []).map((set, j) => (
            <SetRow key={j} index={j} set={set} weighted={weighted} timeBased={timeBased} onChange={(field, value) => onSetChange(j, field, value)} />
          ))}
        </div>
        <button className="addset" onClick={onAddSet}>
          + Add set
        </button>
      </div>
    </div>
  );
}
