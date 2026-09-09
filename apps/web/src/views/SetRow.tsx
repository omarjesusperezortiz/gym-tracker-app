import type { LiveSet } from '../state/AppState';

export interface SetRowProps {
  index: number;
  set: LiveSet;
  weighted: boolean;
  timeBased: boolean;
  onChange: (field: 'w' | 'r', value: string) => void;
}

export function SetRow({ index, set, weighted, timeBased, onChange }: SetRowProps) {
  return (
    <div className={`setrow${weighted ? '' : ' noweight'}`}>
      <div className="sl">SET {index + 1}</div>
      {weighted && (
        <>
          <input
            inputMode="decimal"
            placeholder="kg"
            aria-label={`Set ${index + 1} weight`}
            value={set.w}
            className={set.w ? 'filled' : ''}
            onChange={(e) => onChange('w', e.target.value)}
          />
          <span className="x">×</span>
        </>
      )}
      <input
        inputMode="numeric"
        placeholder={timeBased ? 'sec' : 'reps'}
        aria-label={`Set ${index + 1} ${timeBased ? 'seconds' : 'reps'}`}
        value={set.r}
        className={set.r ? 'filled' : ''}
        onChange={(e) => onChange('r', e.target.value)}
      />
      <div className="last">{set.last || ''}</div>
    </div>
  );
}
