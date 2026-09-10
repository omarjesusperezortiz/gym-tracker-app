import { useMemo } from 'react';
import Body, { type ExtendedBodyPart, type Slug } from 'react-muscle-highlighter';
import {
  MUSCLES,
  MUSCLE_LABEL,
  muscleSetCounts,
  muscleIntensities,
  type Muscle,
  type MuscleHistoryEntry,
  type MuscleIntensity,
} from '@gym-tracker/core';

// Anatomical muscle map powered by react-muscle-highlighter (MIT, MuscleWiki-style
// SVGs, front + back). We keep our own exercise→muscle→intensity logic and just
// feed it into the library's per-muscle color model.

// Our 10 groups → the library's slugs. Some of ours map to several library slugs
// (e.g. "back" covers upper-back + lower-back + trapezius; "abs" covers abs +
// obliques) so the whole region lights up.
const SLUGS: Record<Muscle, Slug[]> = {
  chest: ['chest'],
  delts: ['deltoids'],
  back: ['upper-back', 'lower-back', 'trapezius'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  abs: ['abs', 'obliques'],
  quads: ['quadriceps'],
  hamstrings: ['hamstring'],
  glutes: ['gluteal'],
  calves: ['calves'],
};

// Intensity → color. Index 0 unused; library `intensity` is 1-based into `colors`.
const COLORS = ['#2a2d35', '#a8d63e', '#c6f24e']; // [n/a, light-ish, heavy]
const LIGHT = '#e6b45a'; // amber for "light" — set as explicit color, overrides gradient

export function MuscleMap({ history }: { history: MuscleHistoryEntry[] }) {
  const { intensity, worked, data } = useMemo(() => {
    const volumes = muscleSetCounts(history);
    const intensity = muscleIntensities(volumes);
    const worked = volumes.some((v) => v.sets > 0);

    // Build the library data: one entry per library slug, colored by our intensity.
    const data: ExtendedBodyPart[] = [];
    for (const m of MUSCLES) {
      const lvl = intensity[m];
      if (lvl === 'none') continue; // leave untrained muscles at defaultFill (dim)
      const color = lvl === 'heavy' ? '#c6f24e' : LIGHT;
      for (const slug of SLUGS[m]) data.push({ slug, color });
    }
    return { intensity, worked, data };
  }, [history]);

  // Legend buckets by intensity.
  const buckets: Record<MuscleIntensity, string[]> = { heavy: [], light: [], none: [] };
  for (const m of MUSCLES) buckets[intensity[m]].push(MUSCLE_LABEL[m]);

  return (
    <div className="mmap">
      <div className="mmap-bodies">
        <div className="mmap-fig">
          <Body
            data={data}
            side="front"
            gender="male"
            scale={1}
            colors={COLORS}
            defaultFill="#20232b"
            border="none"
          />
          <span className="mmap-view">Front</span>
        </div>
        <div className="mmap-fig">
          <Body
            data={data}
            side="back"
            gender="male"
            scale={1}
            colors={COLORS}
            defaultFill="#20232b"
            border="none"
          />
          <span className="mmap-view">Back</span>
        </div>
      </div>

      <div className="mmap-legend">
        {buckets.heavy.length > 0 && (
          <div className="mmap-leg">
            <span className="mmap-sw heavy" />
            <span>
              <b>{buckets.heavy.join(', ')}</b> · heavy
            </span>
          </div>
        )}
        {buckets.light.length > 0 && (
          <div className="mmap-leg">
            <span className="mmap-sw light" />
            <span>
              <b>{buckets.light.join(', ')}</b> · light
            </span>
          </div>
        )}
        {buckets.none.length > 0 && (
          <div className="mmap-leg">
            <span className="mmap-sw none" />
            <span>
              <b>{buckets.none.join(', ')}</b> · {worked ? 'skipped' : 'no data'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
