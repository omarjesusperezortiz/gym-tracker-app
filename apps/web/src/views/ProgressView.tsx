import '../styles/progress-extras.css';
import { useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { MuscleMap } from '../components/MuscleMap';
import { useAppState } from '../state/AppState';
import { useWorkouts } from '../lib/useWorkouts';
import { usePersonalRecords } from '../lib/useProfileData';
import {
  allExerciseNames,
  exerciseSeries,
  muscleBalance,
  volumeSeries,
  weekVolume,
  type ExercisePoint,
  type MuscleGroup,
  type VolumePoint,
} from '../lib/stats';
import {
  MUSCLE_LABEL,
  weeklyMuscleStats,
  bestE1RM,
  detectExercisePlateau,
  type WeeklyMuscleStat,
  type PlateauResult,
} from '@gym-tracker/core';
import { areaPath, makeYScale, smoothPath } from '../lib/chart';
import { IconChev, IconEmpty } from '../lib/icons';

const GROUP_LABEL: Record<MuscleGroup, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  core: 'Core',
  other: 'Other',
};

// Distinct hues from the existing palette — these read as categories, never as
// good/bad.
const GROUP_COLOR: Record<MuscleGroup, string> = {
  push: 'var(--push)',
  pull: 'var(--pull)',
  legs: 'var(--violet)',
  core: 'var(--warn)',
  other: 'var(--mut2)',
};

const dateLabel = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

// 12 400 kg reads better as 12.4t once the numbers get big.
function fmtVolume(kg: number): string {
  if (kg >= 10_000) return `${(kg / 1000).toFixed(1)}t`;
  if (kg >= 1000) return `${Math.round(kg / 100) / 10}t`;
  return `${Math.round(kg)}kg`;
}

export function ProgressView() {
  const { dispatch } = useAppState();
  const { history } = useWorkouts();
  const prsQuery = usePersonalRecords();
  const names = useMemo(() => allExerciseNames(history), [history]);
  const volume = useMemo(() => volumeSeries(history), [history]);
  const balance = useMemo(() => muscleBalance(history), [history]);
  const weekly = useMemo(() => weeklyMuscleStats(history), [history]);
  const [selected, setSelected] = useState<string | null>(null);
  // Default to the lift with the most sessions behind it — opening on whatever
  // sorts first alphabetically usually means a chart with a single dot in it.
  const mostLogged = useMemo(
    () =>
      names
        .map((name) => ({ name, points: exerciseSeries(history, name).length }))
        .sort((a, b) => b.points - a.points)[0]?.name ?? null,
    [names, history]
  );
  const progExercise = selected && names.includes(selected) ? selected : mostLogged;

  const prs = (prsQuery.data ?? [])
    .filter((p) => p.bestWeight != null && p.bestWeight > 0)
    .sort((a, b) => (b.bestWeight ?? 0) - (a.bestWeight ?? 0))
    .slice(0, 4);

  const hasWork = volume.length > 0 || names.length > 0;

  if (!hasWork) {
    return (
      <div className="progress-view">
        <PageHeader title="Progress" subtitle="Your lifts, volume and balance over time." />
        <div className="empty">
          <svg
            viewBox="0 0 24 24"
            width={44}
            height={44}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.9 }}
            aria-hidden="true"
          >
            <path d="M3 3v18h18" />
            <path d="M18 9l-5 5-4-4-3 3" />
          </svg>
          <br />
          Nothing to chart yet.
          <br />
          Finish a workout with kg × reps and this fills in.
          <br />
          <button className="btn acc" style={{ marginTop: 12 }} onClick={() => dispatch({ type: 'SET_VIEW', view: 'today' })}>
            Start your first workout
          </button>
        </div>
      </div>
    );
  }

  const thisWeek = weekVolume(history, 0);
  const perSession = volume.length ? volume.reduce((s, p) => s + p.volume, 0) / volume.length : 0;
  const allTime = volume.reduce((s, p) => s + p.volume, 0);

  return (
    <div className="progress-view">
      <PageHeader title="Progress" subtitle="Your lifts, volume and balance over time." />

      <div className="sec-label">Muscles worked</div>
      <div className="pcard">
        {balance.some((b) => b.sets > 0) ? (
          <>
            <MuscleMap history={history} />
            <div className="mmap-note">Filled by all-time set volume — lime = heavily trained, amber = light, dim = skipped.</div>
            <MuscleStats weekly={weekly} />
            <div className="mb-list" style={{ marginTop: 16 }}>
              {balance.map((b) => (
                <div className="mb-row" key={b.group}>
                  <div className="mb-name">{GROUP_LABEL[b.group]}</div>
                  <div className="mb-track">
                    <div
                      className="mb-fill"
                      style={{ width: `${Math.max(b.share * 100, b.sets ? 3 : 0)}%`, background: GROUP_COLOR[b.group] }}
                    />
                  </div>
                  <div className="mb-val">{b.sets}</div>
                </div>
              ))}
            </div>
            <div className="mb-note">Sets logged per group, all time — aim for push and pull to stay close.</div>
          </>
        ) : (
          <div className="pempty">No sets logged yet.</div>
        )}
      </div>

      <div className="sec-label">Training volume</div>
      <div className="cal-stats prog-stats">
        <div className="stat">
          <div className="sv acc">{fmtVolume(thisWeek)}</div>
          <div className="sl">this week</div>
        </div>
        <div className="stat">
          <div className="sv">{fmtVolume(perSession)}</div>
          <div className="sl">per session</div>
        </div>
        <div className="stat">
          <div className="sv">{fmtVolume(allTime)}</div>
          <div className="sl">lifted total</div>
        </div>
      </div>
      <VolumeChart series={volume} />

      <div className="sec-label">Personal records</div>
      {prs.length ? (
        <div className="pr-board">
          {prs.map((pr) => (
            <div className="prb" key={pr.slot}>
              <div className="prb-val">{Math.round(pr.bestWeight ?? 0)}<span>kg</span></div>
              <div className="prb-slot">{pr.slot}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pcard pempty">Log a weighted set to set your first record.</div>
      )}

      {progExercise && (
        <>
          <div className="sec-label">Exercise detail</div>
          <div className="prog-select-wrap">
            <select className="prog-select" value={progExercise} onChange={(e) => setSelected(e.target.value)}>
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
          <ExerciseDetail
            series={exerciseSeries(history, progExercise)}
            name={progExercise}
            e1rm={bestE1RM(history, progExercise)}
            plateau={detectExercisePlateau(history, progExercise)}
          />
        </>
      )}
    </div>
  );
}

// Weekly volume-landmark + recovery chips per trained muscle. Untrained muscles
// are dropped so the list stays to what the user is actually doing.
function MuscleStats({ weekly }: { weekly: WeeklyMuscleStat[] }) {
  const shown = weekly.filter((s) => s.setsPerWeek > 0 || s.lastTrained != null);
  if (!shown.length) return null;
  return (
    <div className="mstat-list">
      {shown.map((s) => (
        <div className="mstat" key={s.muscle}>
          <span className="mstat-name">{MUSCLE_LABEL[s.muscle]}</span>
          <span className="mstat-sets">{s.setsPerWeek} sets/wk</span>
          <span className={`mstat-chip ${s.landmark}`}>{s.landmark}</span>
          {s.daysSince != null && (
            <span className="mstat-rec">
              {s.daysSince === 0 ? 'trained today' : `last trained ${s.daysSince}d ago`}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// Volume over time. Deliberately always lime, whatever the slope — this is the
// "am I doing the work" view, not a verdict.
function VolumeChart({ series }: { series: VolumePoint[] }) {
  if (series.length < 2) {
    return (
      <div className="pcard pempty">
        {series.length === 1 ? 'One session logged — the trend starts after the next one.' : 'No weighted sets logged yet.'}
      </div>
    );
  }
  const W = 320;
  const H = 150;
  const padX = 10;
  const padTop = 14;
  const padBottom = 24;
  const baselineY = H - padBottom;
  const values = series.map((p) => p.volume);
  // Volume is a "total work" measure, so anchor the area at zero rather than
  // zooming into the variation — it keeps the shape honest and less jumpy.
  const max = Math.max(...values) * 1.15;
  const y = (v: number) => padTop + (1 - v / max) * (baselineY - padTop);
  const x = (i: number) => padX + (i / (series.length - 1)) * (W - padX * 2);
  const points = series.map((p, i) => ({ x: x(i), y: y(p.volume) }));

  return (
    <>
      <div className="prog-chart">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Training volume per session">
          <defs>
            <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--acc)', stopOpacity: 0.34 }} />
              <stop offset="100%" style={{ stopColor: 'var(--acc)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <line x1={padX} x2={W - padX} y1={baselineY} y2={baselineY} className="prog-grid" />
          <path d={areaPath(points, baselineY)} fill="url(#volFill)" stroke="none" />
          <path d={smoothPath(points)} fill="none" stroke="var(--acc)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={points[points.length - 1].x.toFixed(1)} cy={points[points.length - 1].y.toFixed(1)} r={4.5} fill="var(--acc)" />
          <text x={padX} y={H - 8} className="prog-x-label" textAnchor="start">
            {dateLabel(series[0].date)}
          </text>
          <text x={W - padX} y={H - 8} className="prog-x-label" textAnchor="end">
            {dateLabel(series[series.length - 1].date)}
          </text>
        </svg>
      </div>
      <div className="prog-sub">
        {series.length} sessions · peak {fmtVolume(Math.max(...values))} in one session
      </div>
    </>
  );
}

// Per-exercise top set over time. The line itself stays neutral (accent) even
// when it slopes down; only the small "vs last time" stat is coloured.
function ExerciseDetail({
  series,
  name,
  e1rm,
  plateau,
}: {
  series: ExercisePoint[];
  name: string;
  e1rm: number | null;
  plateau: PlateauResult;
}) {
  if (!series.length) {
    return (
      <div className="pcard pempty">
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

  const W = 320;
  const H = 160;
  const padX = 10;
  const padTop = 16;
  const padBottom = 26;
  const baselineY = H - padBottom;
  const { domainMin, domainMax, y } = makeYScale(
    series.map((p) => p.top),
    padTop,
    baselineY
  );
  const n = series.length;
  const xOf = (i: number) => (n === 1 ? W / 2 : padX + (i / (n - 1)) * (W - padX * 2));
  const points = series.map((p, i) => ({ x: xOf(i), y: y(p.top) }));

  return (
    <>
      <div className="cal-stats prog-stats">
        <div className="stat">
          <div className="sv acc">{best}kg</div>
          <div className="sl">best set</div>
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

      {(e1rm != null || plateau.stalled) && (
        <div className="prog-notes">
          {e1rm != null && (
            <div className="prog-note e1rm">
              <span className="pn-ic">1RM</span>
              <span>
                Est. 1-rep max <b>{Math.round(e1rm)}kg</b> <span style={{ opacity: 0.7 }}>(Epley)</span>
              </span>
            </div>
          )}
          {plateau.stalled && (
            <div className="prog-note plateau">
              <span className="pn-ic">!</span>
              <span>
                <b>{name}</b> has stalled {plateau.sessions} sessions — consider a deload or rep change
              </span>
            </div>
          )}
        </div>
      )}

      <div className="prog-chart">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${name} top set progress`}>
          <defs>
            <linearGradient id="progFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--acc)', stopOpacity: 0.28 }} />
              <stop offset="100%" style={{ stopColor: 'var(--acc)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          <line x1={padX} x2={W - padX} y1={y(domainMax)} y2={y(domainMax)} className="prog-grid" />
          <line x1={padX} x2={W - padX} y1={baselineY} y2={baselineY} className="prog-grid" />
          {/* A single session has no range to label — both bounds round to the
              same number, which just looks broken. */}
          {n > 1 && (
            <>
              <text x={padX} y={y(domainMax) - 4} className="prog-axis-label">
                {Math.round(domainMax)}kg
              </text>
              <text x={padX} y={baselineY - 4} className="prog-axis-label">
                {Math.round(domainMin)}kg
              </text>
            </>
          )}

          {points.length > 1 && <path d={areaPath(points, baselineY)} fill="url(#progFill)" stroke="none" />}
          {points.length > 1 && (
            <path d={smoothPath(points)} fill="none" stroke="var(--acc)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          )}

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
              <text
                key={`l${i}`}
                x={p.x.toFixed(1)}
                y={H - 8}
                className="prog-x-label"
                textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
              >
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
