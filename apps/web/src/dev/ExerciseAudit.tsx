import { useMemo, useState } from 'react';
import {
  catalog,
  muscleGroups,
  groupForMovement,
  mediaFor,
  KIND_LABEL,
  type Plan,
  type Kind,
  type MuscleGroup,
} from '@gym-tracker/core';
import { ExerciseGif } from '../components/ExerciseGif';
import '../styles/exercise-gif.css';
import '../styles/exercise-audit.css';

// FULL QA / AUDIT PAGE — every muscle group → movement → specific exercises,
// with the gif, equipment variations, muscle tags and validation flags. Lets us
// (and Omar) eyeball that every image matches its exercise and nothing is
// broken. No login. Reached at ?showcase=audit.

const gym = catalog.plans.gym as unknown as Plan;

interface MovementRow {
  movement: string;
  group: MuscleGroup;
  kinds: Kind[];
  variations: { kind: Kind; name: string; img: string }[];
  hasGif: boolean;
  gifTarget: string | null;
}

export function ExerciseAudit() {
  const [filter, setFilter] = useState<MuscleGroup | 'all'>('all');

  const rows: MovementRow[] = useMemo(() => {
    return Object.entries(gym.variations).map(([movement, vars]) => {
      const kinds = Object.keys(vars) as Kind[];
      const media = mediaFor(movement);
      return {
        movement,
        group: groupForMovement(movement),
        kinds,
        variations: kinds.map((k) => ({ kind: k, name: vars[k]!.name, img: vars[k]!.img })),
        hasGif: media != null,
        gifTarget: media?.target ?? null,
      };
    });
  }, []);

  const total = rows.length;
  const withGif = rows.filter((r) => r.hasGif).length;

  const byGroup = muscleGroups
    .map((g) => ({ group: g, rows: rows.filter((r) => r.group === g.key) }))
    .filter((b) => b.rows.length > 0 && (filter === 'all' || filter === b.group.key));

  return (
    <div className="aud">
      <header className="aud-head">
        <h1>Exercise catalog — QA</h1>
        <p>
          Every muscle group → movement → specific exercises, with the demo gif, equipment variations
          and validation. Check each image matches its exercise.
        </p>
        <div className="aud-stats">
          <span className="aud-stat">
            <b>{total}</b> movements
          </span>
          <span className="aud-stat ok">
            <b>{withGif}</b> with gif
          </span>
          <span className="aud-stat warn">
            <b>{total - withGif}</b> gif pending
          </span>
        </div>
        <div className="aud-filters">
          <button className={`aud-fchip${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>
            All
          </button>
          {muscleGroups.map((g) => (
            <button
              key={g.key}
              className={`aud-fchip${filter === g.key ? ' on' : ''}`}
              onClick={() => setFilter(g.key)}
            >
              {g.emoji} {g.label}
            </button>
          ))}
        </div>
      </header>

      {byGroup.map((b) => (
        <section className="aud-group" key={b.group.key}>
          <div className="aud-group-head">
            <span className="aud-group-emoji">{b.group.emoji}</span>
            {b.group.label}
            <span className="aud-group-count">{b.rows.length}</span>
          </div>

          {b.rows.map((r) => (
            <div className="aud-mv" key={r.movement}>
              <div className="aud-mv-media">
                <ExerciseGif name={r.movement} size="card" badge fallbackImg={r.variations[0]?.img} />
              </div>
              <div className="aud-mv-body">
                <div className="aud-mv-top">
                  <span className="aud-mv-name">{r.movement}</span>
                  {r.hasGif ? (
                    <span className="aud-flag ok">gif ✓{r.gifTarget ? ` · ${r.gifTarget}` : ''}</span>
                  ) : (
                    <span className="aud-flag warn">gif pending</span>
                  )}
                </div>
                <div className="aud-mv-sub">
                  {r.group} · {r.kinds.length} equipment variation{r.kinds.length === 1 ? '' : 's'}
                </div>
                <div className="aud-vars">
                  {r.variations.map((v) => (
                    <div className="aud-var" key={v.kind}>
                      <img className="aud-var-img" src={v.img} alt="" loading="lazy" />
                      <div className="aud-var-info">
                        <span className="aud-var-kind">{KIND_LABEL[v.kind] || v.kind}</span>
                        <span className="aud-var-name">{v.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
