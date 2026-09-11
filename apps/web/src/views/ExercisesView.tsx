import { useMemo, useState } from 'react';
import {
  catalog,
  muscleGroups,
  groupForMovement,
  mediaFor,
  gifUrl,
  KIND_LABEL,
  type Plan,
  type Kind,
  type MuscleGroup,
  type ExerciseMedia,
} from '@gym-tracker/core';
import { PageHeader } from '../components/PageHeader';
import { ExerciseGif } from '../components/ExerciseGif';
import '../styles/exercise-gif.css';
import '../styles/exercise-library.css';

const MEDIA_BASE = `${import.meta.env.BASE_URL}exercise-media/`;
const gym = catalog.plans.gym as unknown as Plan;

interface LibEntry {
  movement: string;
  group: MuscleGroup;
  kinds: Kind[];
  variations: { kind: Kind; name: string; img: string }[];
  media: ExerciseMedia | null;
  fallbackImg: string | null;
}

// Real in-app Exercise Library. Browse the full catalog by muscle group, tap a
// movement to see its demo, worked muscles, equipment variations and how-to
// steps. Reference screen (read-only) — the picker is where you add to a session.
export function ExercisesView() {
  const [filter, setFilter] = useState<MuscleGroup | 'all'>('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<LibEntry | null>(null);

  const entries: LibEntry[] = useMemo(() => {
    return Object.entries(gym.variations)
      .map(([movement, vars]) => {
        const kinds = Object.keys(vars) as Kind[];
        return {
          movement,
          group: groupForMovement(movement),
          kinds,
          variations: kinds.map((k) => ({ kind: k, name: vars[k]!.name, img: vars[k]!.img })),
          media: mediaFor(movement),
          fallbackImg: vars[kinds[0]]?.img ?? null,
        };
      })
      .sort((a, b) => a.movement.localeCompare(b.movement));
  }, []);

  const term = query.trim().toLowerCase();
  const filtered = entries.filter(
    (e) =>
      (filter === 'all' || e.group === filter) &&
      (!term ||
        e.movement.toLowerCase().includes(term) ||
        e.variations.some((v) => v.name.toLowerCase().includes(term))),
  );

  const byGroup = muscleGroups
    .map((g) => ({ group: g, items: filtered.filter((e) => e.group === g.key) }))
    .filter((b) => b.items.length > 0);

  return (
    <div className="wrap">
      <PageHeader title="Exercises" subtitle={`${entries.length} movements · browse by muscle`} />

      <input
        className="lib-search"
        type="search"
        placeholder="Search exercises…"
        aria-label="Search exercises"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="lib-filters">
        <button className={`lib-fchip${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>
          All
        </button>
        {muscleGroups.map((g) => (
          <button
            key={g.key}
            className={`lib-fchip${filter === g.key ? ' on' : ''}`}
            onClick={() => setFilter(g.key)}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      {byGroup.map((b) => (
        <section className="lib-group" key={b.group.key}>
          <div className="lib-group-head">
            <span className="lib-group-emoji">{b.group.emoji}</span>
            {b.group.label}
            <span className="lib-group-count">{b.items.length}</span>
          </div>
          <div className="lib-grid">
            {b.items.map((e) => (
              <button className="lib-card" key={e.movement} onClick={() => setOpen(e)}>
                <div className="lib-card-media">
                  <ExerciseGif name={e.movement} size="card" poster fallbackImg={e.fallbackImg} />
                </div>
                <div className="lib-card-body">
                  <div className="lib-card-name">{e.movement}</div>
                  <div className="lib-card-tags">
                    {e.media?.target && <span className="lib-tag on">{e.media.target}</span>}
                    <span className="lib-tag">{e.kinds.length} options</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
      {!byGroup.length && <div className="pempty">No matching exercises.</div>}

      {open && (
        <div className="lib-sheet" onClick={() => setOpen(null)}>
          <div className="lib-sheet-in" onClick={(ev) => ev.stopPropagation()}>
            <button className="lib-close" onClick={() => setOpen(null)} aria-label="Close">
              ✕
            </button>
            <div className="lib-detail-media">
              {open.media ? (
                <img src={gifUrl(open.media, MEDIA_BASE)} alt={open.movement} />
              ) : open.fallbackImg ? (
                <img src={open.fallbackImg} alt={open.movement} />
              ) : (
                <span className="lib-detail-glyph">🏋️</span>
              )}
            </div>
            <h2 className="lib-detail-title">{open.movement}</h2>
            <div className="lib-card-tags">
              {open.media?.target && <span className="lib-tag on">{open.media.target}</span>}
              {open.media?.secondary.map((s) => (
                <span className="lib-tag" key={s}>
                  {s}
                </span>
              ))}
            </div>

            <div className="lib-detail-label">Equipment variations</div>
            <div className="lib-vars">
              {open.variations.map((v) => (
                <div className="lib-var" key={v.kind}>
                  <img className="lib-var-img" src={v.img} alt="" loading="lazy" />
                  <div className="lib-var-info">
                    <span className="lib-var-kind">{KIND_LABEL[v.kind] || v.kind}</span>
                    <span className="lib-var-name">{v.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {open.media?.steps && open.media.steps.length > 0 && (
              <>
                <div className="lib-detail-label">How to</div>
                <ol className="lib-steps">
                  {open.media.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
