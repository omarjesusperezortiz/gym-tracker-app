import { useMemo, useState } from 'react';
import { useWorkouts } from '../lib/useWorkouts';
import { allExerciseNames, exerciseSeries, type ExercisePoint } from '../lib/stats';
import { IconChev, IconEmpty } from '../lib/icons';

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
      <div className="prog-select-wrap">
        <select className="prog-select" value={progExercise ?? ''} onChange={(e) => setSelected(e.target.value)}>
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="prog-select-chev">
          <IconChev />
        </span>
      </div>
      <ProgressChart series={series} name={progExercise!} />
    </div>
  );
}

// Catmull-Rom -> cubic Bézier, so the line reads as a smooth curve instead of
// straight segments between sessions.
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
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
  const worst = Math.min(...series.map((p) => p.top));

  const W = 320;
  const H = 170;
  const padX = 10;
  const padTop = 16;
  const padBottom = 26;
  const n = series.length;
  // A little headroom above the PR and below the worst session so the curve
  // never touches the chart edges, with a floor so a flat series doesn't
  // divide by ~0.
  const span = Math.max(best - worst, best * 0.08, 1);
  const domainMin = worst - span * 0.25;
  const domainMax = best + span * 0.25;
  const yOf = (v: number) => padTop + (1 - (v - domainMin) / (domainMax - domainMin)) * (H - padTop - padBottom);
  const xOf = (i: number) => (n === 1 ? W / 2 : padX + (i / (n - 1)) * (W - padX * 2));
  const points = series.map((p, i) => ({ x: xOf(i), y: yOf(p.top), v: p.top }));
  const baselineY = H - padBottom;

  const linePath = smoothPath(points);
  const areaPath = points.length > 1 ? `${linePath} L ${points[n - 1].x.toFixed(1)} ${baselineY} L ${points[0].x.toFixed(1)} ${baselineY} Z` : '';

  const dateLabel = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <>
      <div className="cal-stats prog-stats">
        <div className="stat">
          <div className="sv acc">{best}kg</div>
          <div className="sl">PR best</div>
        </div>
        <div className="stat">
          <div className="sv">{last}kg</div>
          <div className="sl">last top set</div>
        </div>
        <div className="stat">
          <div className={`sv${delta == null ? '' : delta > 0 ? ' up' : delta < 0 ? ' down' : ''}`}>
            {delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta}kg`}
          </div>
          <div className="sl">vs last time</div>
        </div>
      </div>

      <div className="prog-chart">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${name} top set progress`}>
          <defs>
            <linearGradient id="progFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--acc)', stopOpacity: 0.32 }} />
              <stop offset="100%" style={{ stopColor: 'var(--acc)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          {/* Gridlines at the PR and the floor, with weight labels. */}
          <line x1={padX} x2={W - padX} y1={yOf(domainMax)} y2={yOf(domainMax)} className="prog-grid" />
          <line x1={padX} x2={W - padX} y1={baselineY} y2={baselineY} className="prog-grid" />
          <text x={padX} y={yOf(domainMax) - 4} className="prog-axis-label">
            {Math.round(domainMax)}kg
          </text>
          <text x={padX} y={baselineY - 4} className="prog-axis-label">
            {Math.round(domainMin)}kg
          </text>

          {areaPath && <path d={areaPath} fill="url(#progFill)" stroke="none" />}
          {linePath && <path d={linePath} fill="none" stroke="var(--acc)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />}

          {points.map((p, i) => {
            const isLast = i === n - 1;
            return (
              <circle
                key={i}
                cx={p.x.toFixed(1)}
                cy={p.y.toFixed(1)}
                r={isLast ? 5 : 3}
                fill={isLast ? 'var(--acc)' : 'var(--bg)'}
                stroke="var(--acc)"
                strokeWidth={isLast ? 0 : 2}
              />
            );
          })}

          {points.map((p, i) => {
            const showLabel = i === 0 || i === n - 1 || n <= 6;
            if (!showLabel) return null;
            return (
              <text key={`l${i}`} x={p.x.toFixed(1)} y={H - 8} className="prog-x-label" textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>
                {dateLabel(series[i].date)}
              </text>
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
