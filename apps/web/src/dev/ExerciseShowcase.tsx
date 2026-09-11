import { useMemo, useState } from 'react';
import { exerciseMedia, gifUrl, posterUrl, type ExerciseMedia } from '@gym-tracker/core';
import '../styles/exercise-gif.css';
import '../styles/exercise-catalog.css';

const MEDIA_BASE = `${import.meta.env.BASE_URL}exercise-media/`;

// Full exercise catalog — every mapped movement with its demo gif, muscles,
// equipment and how-to steps. Also runs a lightweight self-check so we can
// eyeball whether each image actually matches its exercise. No login needed;
// reached at ?showcase=exercises.

type Entry = { name: string; media: ExerciseMedia };

export function ExerciseShowcase() {
  const entries: Entry[] = useMemo(
    () => Object.entries(exerciseMedia).map(([name, media]) => ({ name, media })),
    []
  );
  const [open, setOpen] = useState<Entry | null>(null);
  const [q, setQ] = useState('');

  const filtered = entries.filter(
    (e) =>
      e.name.toLowerCase().includes(q.toLowerCase()) ||
      e.media.target.toLowerCase().includes(q.toLowerCase()) ||
      e.media.equip.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="excat">
      <header className="excat-head">
        <h1>Exercise Library</h1>
        <p>
          {entries.length} movements mapped · animated 3D demos with the worked muscle highlighted.
          Tap any card to review the full demonstration and check the image matches.
        </p>
        <input
          className="excat-search"
          placeholder="Search by name, muscle or equipment…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </header>

      <div className="excat-grid">
        {filtered.map((e) => (
          <button className="excat-card" key={e.name} onClick={() => setOpen(e)}>
            <div className="excat-gif">
              <img src={gifUrl(e.media, MEDIA_BASE)} alt={e.name} loading="lazy" />
            </div>
            <div className="excat-meta">
              <div className="excat-name">{e.name}</div>
              <div className="excat-tags">
                <span className="excat-tag on">{e.media.target}</span>
                <span className="excat-tag">{e.media.equip}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div className="excat-sheet" onClick={() => setOpen(null)}>
          <div className="excat-sheet-in" onClick={(ev) => ev.stopPropagation()}>
            <button className="excat-close" onClick={() => setOpen(null)}>
              ✕
            </button>
            <div className="excat-detail-gif">
              <img src={gifUrl(open.media, MEDIA_BASE)} alt={open.name} />
            </div>
            <h2>{open.name}</h2>
            <div className="excat-tags">
              <span className="excat-tag on">{open.media.target}</span>
              {open.media.secondary.map((s) => (
                <span className="excat-tag" key={s}>
                  {s}
                </span>
              ))}
              <span className="excat-tag">{open.media.equip}</span>
            </div>
            {open.media.steps && (
              <ol className="excat-steps">
                {open.media.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            )}
            <div className="excat-poster-row">
              <div>
                <span className="excat-cap">Animated (Train)</span>
                <img className="excat-mini" src={gifUrl(open.media, MEDIA_BASE)} alt="" />
              </div>
              <div>
                <span className="excat-cap">Poster (Today)</span>
                <img className="excat-mini" src={posterUrl(open.media, MEDIA_BASE)} alt="" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
