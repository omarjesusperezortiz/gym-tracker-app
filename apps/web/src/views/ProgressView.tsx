import { useMemo, useState } from 'react';
import { useWorkouts } from '../lib/useWorkouts';
import { allExerciseNames, exerciseSeries, type ExercisePoint } from '../lib/stats';
import { IconEmpty } from '../lib/icons';

export function ProgressView() {
  const { history } = useWorkouts();
  const names = useMemo(() => allExerciseNames(history), [history]);
  const [selected, setSelected] = useState<string | null>(null);
  const progExercise = selected && names.includes(selected) ? selected : names[0] ?? null;

  if (!names.length) {
    return (
      <div className="progress-view">
        <div className="sec-label">Progress</div>
        <div className="empty">
          <IconEmpty />
          <br />
          No weight logged yet.
          <br />
          Finish a workout with kg × reps to see progress here.
        </div>
      </div>
    );
  }

  const series = exerciseSeries(history, progExercise!);

  return (
    <div className="progress-view">
      <div className="sec-label">Progress</div>
      <select className="prog-select" value={progExercise ?? ''} onChange={(e) => setSelected(e.target.value)}>
        {names.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <ProgressChart series={series} name={progExercise!} />
    </div>
  );
}

function ProgressChart({ series, name }: { series: ExercisePoint[]; name: string }) {
  if (!series.length) {
    return (
      <div className="empty">
        <IconEmpty />
        <br />
        No weight logged for {name} yet.
      </div>
    );
  }
  const last = series[series.length - 1].top;
  const prev = series.length > 1 ? series[series.length - 2].top : null;
  const delta = prev != null ? +(last - prev).toFixed(1) : null;
  const best = Math.max(...series.map((p) => p.top));
  const maxV = best * 1.15 || 1;
  const W = 320;
  const H = 160;
  const pad = 8;
  const n = series.length;
  const slot = (W - pad * 2) / n;
  const bw = Math.max(6, slot - 6);
  const dateLabel = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <>
      <div className="prog-stats">
        <div className="pstat">
          <div className="pv">{best}kg</div>
          <div className="pl">PR best</div>
        </div>
        <div className="pstat">
          <div className="pv">{last}kg</div>
          <div className="pl">last top set</div>
        </div>
        <div className="pstat">
          <div className={`pv${delta == null ? '' : delta > 0 ? ' up' : delta < 0 ? ' down' : ''}`}>
            {delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta}kg`}
          </div>
          <div className="pl">vs last time</div>
        </div>
      </div>
      <div className="prog-chart">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${name} top set progress`}>
          {series.map((p, i) => {
            const x = pad + i * slot;
            const bh = Math.max(2, (p.top / maxV) * (H - 30));
            const y = H - 20 - bh;
            const isLast = i === n - 1;
            const showLabel = i === 0 || i === n - 1 || n <= 6;
            return (
              <g key={i}>
                <rect x={x.toFixed(1)} y={y.toFixed(1)} width={bw.toFixed(1)} height={bh.toFixed(1)} rx={3} fill={isLast ? 'var(--acc)' : 'var(--surf3)'} />
                {showLabel && (
                  <text x={(x + bw / 2).toFixed(1)} y={H - 6} fontSize={9} textAnchor="middle" fill="var(--mut)">
                    {p.top}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="prog-sub">
        {series.length} session{series.length !== 1 ? 's' : ''} · {dateLabel(series[0].date)} → {dateLabel(series[series.length - 1].date)}
      </div>
    </>
  );
}
