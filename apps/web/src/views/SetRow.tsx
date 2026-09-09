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
}

export function SetRow({ index, set, weighted, timeBased, ghostW, ghostR, onChange }: SetRowProps) {
  const repPlaceholder = timeBased ? 'sec' : 'reps';
  return (
    <div className={`setrow${weighted ? '' : ' noweight'}`}>
      <div className="sl">SET {index + 1}</div>
      {weighted && (
        <>
          <input
            inputMode="decimal"
            placeholder={ghostW || 'kg'}
            aria-label={`Set ${index + 1} weight`}
            value={set.w}
            className={set.w ? 'filled' : ghostW ? 'ghost' : ''}
            onChange={(e) => onChange('w', e.target.value)}
          />
          <span className="x">×</span>
        </>
      )}
      <input
        inputMode="numeric"
        placeholder={ghostR || repPlaceholder}
        aria-label={`Set ${index + 1} ${timeBased ? 'seconds' : 'reps'}`}
        value={set.r}
        className={set.r ? 'filled' : ghostR ? 'ghost' : ''}
        onChange={(e) => onChange('r', e.target.value)}
      />
      <div className="last">{set.last || ''}</div>
    </div>
  );
}
