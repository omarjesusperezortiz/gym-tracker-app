import { useMemo } from 'react';
import {
  MUSCLES,
  MUSCLE_LABEL,
  muscleSetCounts,
  muscleIntensities,
  type Muscle,
  type MuscleHistoryEntry,
  type MuscleIntensity,
} from '@gym-tracker/core';

// Anatomical front-body muscle map. A smooth body silhouette with muscle-shaped
// regions (pecs, deltoid caps, an ab grid, obliques, quads/hamstrings, calves)
// filled by training intensity: heavy = lime, light = amber, none = dim.
// Paths are hand-tuned to read as a real physique at a glance, matching the
// premium design reference — not the earlier blocky placeholder.
export function MuscleMap({ history }: { history: MuscleHistoryEntry[] }) {
  const { intensity, worked } = useMemo(() => {
    const volumes = muscleSetCounts(history);
    const intensity = muscleIntensities(volumes);
    const worked = volumes.some((v) => v.sets > 0);
    return { intensity, worked };
  }, [history]);

  const cls = (m: Muscle) => `mm-${intensity[m]}`;

  // Group the muscles into the three legend buckets by current intensity.
  const buckets: Record<MuscleIntensity, string[]> = { heavy: [], light: [], none: [] };
  for (const m of MUSCLES) buckets[intensity[m]].push(MUSCLE_LABEL[m]);

  return (
    <div className="mmap">
      <div className="mmap-fig">
        <svg
          className="mmap-svg"
          viewBox="0 0 220 380"
          role="img"
          aria-label="Muscles worked, shaded by training volume"
        >
          {/* ---- Body silhouette (single smooth outline behind everything) ---- */}
          <path
            className="mm-body"
            d="M110 20
               c-13 0-22 9-22 22 0 7 3 13 7 17-6 2-12 5-17 9-9 6-15 14-19 25l-9 28c-2 7 6 12 10 6l7-19 3 30c-1 10-3 22-3 33 0 9 1 19 4 30l5 40c1 11 1 22-1 33l-4 30c-1 8 10 10 12 2l8-38 4 26c1 9 2 19 2 28 0 8 11 8 12 0 0-9 1-19 2-28l4-26 8 38c2 8 13 6 12-2l-4-30c-2-11-2-22-1-33l5-40c3-11 4-21 4-30 0-11-2-23-3-33l3-30 7 19c4 6 12 1 10-6l-9-28c-4-11-10-19-19-25-5-4-11-7-17-9 4-4 7-10 7-17 0-13-9-22-22-22z"
          />

          {/* ---- Neck ---- */}
          <path className="mm-base" d="M101 40 q9 6 18 0 l-2 10 q-7 4 -14 0z" />

          {/* ---- Chest / pecs ---- */}
          <path className={cls('chest')} d="M108 62 q-20 -3 -28 5 q-4 9 1 17 q13 7 26 3 l1 -25z" />
          <path className={cls('chest')} d="M112 62 q20 -3 28 5 q4 9 -1 17 q-13 7 -26 3 l-1 -25z" />

          {/* ---- Shoulders / deltoid caps ---- */}
          <path className={cls('delts')} d="M80 58 q-15 1 -21 15 q-2 8 1 15 q9 -11 22 -16 q1 -8 -2 -14z" />
          <path className={cls('delts')} d="M140 58 q15 1 21 15 q2 8 -1 15 q-9 -11 -22 -16 q-1 -8 2 -14z" />

          {/* ---- Biceps (front upper arm, tucked to torso) ---- */}
          <path className={cls('biceps')} d="M60 76 q-8 15 -6 32 q6 3 11 0 q1 -17 5 -30 q-5 -4 -10 -2z" />
          <path className={cls('biceps')} d="M160 76 q8 15 6 32 q-6 3 -11 0 q-1 -17 -5 -30 q5 -4 10 -2z" />

          {/* ---- Triceps (outer edge of arm) ---- */}
          <path className={cls('triceps')} d="M55 78 q-6 16 -5 32 q4 2 7 0 q0 -17 4 -31 q-3 -3 -6 -1z" />
          <path className={cls('triceps')} d="M165 78 q6 16 5 32 q-4 2 -7 0 q0 -17 -4 -31 q3 -3 6 -1z" />

          {/* ---- Back (upper flanks / lats hint) ---- */}
          <path className={cls('back')} d="M82 86 q-7 4 -9 18 l3 16 q6 -5 9 -14 z" />
          <path className={cls('back')} d="M138 86 q7 4 9 18 l-3 16 q-6 -5 -9 -14 z" />

          {/* ---- Abs (6-pack grid, below the pecs) ---- */}
          <g className={cls('abs')}>
            <rect x="99" y="94" width="9" height="10" rx="3" />
            <rect x="112" y="94" width="9" height="10" rx="3" />
            <rect x="99" y="107" width="9" height="10" rx="3" />
            <rect x="112" y="107" width="9" height="10" rx="3" />
            <rect x="99" y="120" width="9" height="11" rx="3" />
            <rect x="112" y="120" width="9" height="11" rx="3" />
            {/* obliques */}
            <path d="M95 96 q-5 15 -2 35 q4 -2 6 -7 l-1 -28z" />
            <path d="M125 96 q5 15 2 35 q-4 -2 -6 -7 l1 -28z" />
          </g>

          {/* ---- Glutes / hips ---- */}
          <path className={cls('glutes')} d="M86 138 q24 -8 48 0 q3 12 -2 22 q-22 8 -44 0 q-5 -10 -2 -22z" />

          {/* ---- Quads ---- */}
          <path className={cls('quads')} d="M90 164 q-6 32 -2 66 q9 4 16 0 q3 -34 1 -66 q-8 -4 -15 0z" />
          <path className={cls('quads')} d="M130 164 q6 32 2 66 q-9 4 -16 0 q-3 -34 -1 -66 q8 -4 15 0z" />

          {/* ---- Hamstrings (inner posterior strip) ---- */}
          <path className={cls('hamstrings')} d="M104 168 q-3 30 -1 60 q4 2 7 0 q1 -30 0 -60 q-3 -2 -6 0z" />
          <path className={cls('hamstrings')} d="M116 168 q3 30 1 60 q-4 2 -7 0 q-1 -30 0 -60 q3 -2 6 0z" />

          {/* ---- Calves ---- */}
          <path className={cls('calves')} d="M92 240 q-4 24 0 46 q7 3 12 0 q3 -24 0 -46 q-6 -3 -12 0z" />
          <path className={cls('calves')} d="M128 240 q4 24 0 46 q-7 3 -12 0 q-3 -24 0 -46 q6 -3 12 0z" />
        </svg>
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
