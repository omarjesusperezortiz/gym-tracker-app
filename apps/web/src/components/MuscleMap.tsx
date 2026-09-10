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

// A hand-built front-body silhouette. Each trainable region is a path/shape
// tagged with the muscle it represents; the fill class is driven by training
// intensity (heavy = lime, light = amber, none = dim). It doesn't aim to be
// anatomically perfect — just clearly readable at a glance, matching the design
// reference's concept.
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
          viewBox="0 0 130 250"
          role="img"
          aria-label="Muscles worked, shaded by training volume"
        >
          {/* head + neck (never a muscle target) */}
          <circle className="mm-base" cx="65" cy="20" r="14" />
          <rect className="mm-base" x="59" y="32" width="12" height="8" rx="3" />

          {/* torso outline */}
          <path className="mm-base" d="M40 42 Q65 36 90 42 L94 104 Q65 112 36 104 Z" />

          {/* chest */}
          <path className={cls('chest')} d="M46 52 Q65 48 84 52 L82 72 Q65 79 48 72 Z" />
          {/* shoulders / delts */}
          <circle className={cls('delts')} cx="40" cy="50" r="10" />
          <circle className={cls('delts')} cx="90" cy="50" r="10" />
          {/* abs / core */}
          <rect className={cls('abs')} x="54" y="80" width="22" height="26" rx="5" />

          {/* upper arms */}
          <path className="mm-base" d="M31 50 Q22 76 26 112 L35 112 Q35 78 41 56 Z" />
          <path className="mm-base" d="M99 50 Q108 76 104 112 L95 112 Q95 78 89 56 Z" />
          {/* biceps */}
          <ellipse className={cls('biceps')} cx="31" cy="72" rx="5.5" ry="11" />
          <ellipse className={cls('biceps')} cx="99" cy="72" rx="5.5" ry="11" />
          {/* triceps (outer arm) */}
          <ellipse className={cls('triceps')} cx="24" cy="74" rx="4" ry="10" />
          <ellipse className={cls('triceps')} cx="106" cy="74" rx="4" ry="10" />
          {/* back (shown as flanks behind the torso) */}
          <path className={cls('back')} d="M40 60 L46 60 L44 96 L38 96 Z" />
          <path className={cls('back')} d="M90 60 L84 60 L86 96 L92 96 Z" />

          {/* hips / glutes */}
          <path className={cls('glutes')} d="M42 106 Q65 100 88 106 L86 122 Q65 128 44 122 Z" />
          {/* quads */}
          <path className={cls('quads')} d="M44 124 L62 124 L60 184 L48 184 Z" />
          <path className={cls('quads')} d="M86 124 L68 124 L70 184 L82 184 Z" />
          {/* hamstrings (inner strip, reads as posterior thigh) */}
          <path className={cls('hamstrings')} d="M56 126 L62 126 L60 182 L56 182 Z" />
          <path className={cls('hamstrings')} d="M74 126 L68 126 L70 182 L74 182 Z" />
          {/* calves */}
          <path className={cls('calves')} d="M48 188 L60 188 L58 232 L50 232 Z" />
          <path className={cls('calves')} d="M82 188 L70 188 L72 232 L80 232 Z" />
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
