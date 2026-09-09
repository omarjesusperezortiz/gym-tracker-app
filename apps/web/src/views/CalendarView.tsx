import { useState } from 'react';
import { useWorkouts } from '../lib/useWorkouts';
import { useLogRestDay, useRemoveWorkout } from '../lib/useWorkoutMutations';
import { type LoggedWorkout } from '../lib/workouts';
import { dotColor, hueOf } from '../lib/colors';
import { calcStreak, dayKey, groupByDay } from '../lib/stats';
import { useToast } from '../components/Toast';
import { Sheet } from '../components/Sheet';
import { useAppState, keyOf, type LiveMap } from '../state/AppState';
import { catalog } from '@gym-tracker/core';
import type { PlanKey } from '@gym-tracker/core';
import { IconChev, IconRest } from '../lib/icons';

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function isPlanKey(pk: string | null): pk is PlanKey {
  return !!pk && pk in catalog.plans;
}

export function CalendarView() {
  const { history } = useWorkouts();
  const { toast } = useToast();
  const { dispatch } = useAppState();
  const logRestDay = useLogRestDay();
  const removeEntry = useRemoveWorkout();
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [sheetDay, setSheetDay] = useState<string | null>(null);

  const byDay = groupByDay(history);
  const y = calMonth.getFullYear();
  const m = calMonth.getMonth();
  const first = new Date(y, m, 1);
  const start = (first.getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const today = dayKey(new Date());
  const monthName = calMonth.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  const monthCount = Object.keys(byDay).filter((k) => k.slice(0, 7) === `${y}-${String(m + 1).padStart(2, '0')}`).length;
  const streak = calcStreak(byDay);

  // Fire-and-forget: the optimistic cache patch paints the dot immediately and
  // rolls back if the write fails, so there's nothing to await here.
  function toggleDayType(key: string, type: 'rest') {
    const existing = (byDay[key] || []).find((e) => e.type === type);
    const onError = (err: Error) => toast(err.message || 'Could not update this day');
    if (existing) {
      removeEntry.mutate({ id: existing.id }, { onSuccess: () => toast('Rest removed'), onError });
    } else {
      logRestDay.mutate({ date: `${key}T12:00:00` }, { onSuccess: () => toast('Rest logged'), onError });
    }
  }

  // Mirrors the original app's editLogEntry: reopen a past, already-finished
  // workout in TrainView with its sets prefilled, so Finish updates it in place.
  function editEntry(entry: LoggedWorkout) {
    if (!isPlanKey(entry.plan) || !entry.sess || !catalog.plans[entry.plan].sessions[entry.sess]) {
      toast("Couldn't open that workout");
      return;
    }
    const plan = entry.plan;
    const sess = entry.sess;
    const live: LiveMap = {};
    entry.slots.forEach((s) => {
      live[keyOf(plan, sess, s.slot)] = {
        kind: s.kind,
        done: s.done,
        force: s.force,
        sets: s.sets.map((x) => ({ w: x.w, r: x.r, last: '', wAuto: false, rAuto: false })),
      };
    });
    dispatch({ type: 'EDIT_ENTRY', plan, sess, entryId: entry.id, live });
    setSheetDay(null);
    toast('Editing this workout ✏️');
  }

  const sheetEvents = sheetDay ? byDay[sheetDay] || [] : [];

  return (
    <div className="cal">
      <div className="cal-stats">
        <div className="stat">
          <div className="sv acc">{monthCount}</div>
          <div className="sl">this month</div>
        </div>
        <div className="stat">
          <div className="sv">{streak}</div>
          <div className="sl">streak 🔥</div>
        </div>
        <div className="stat">
          <div className="sv">{history.length}</div>
          <div className="sl">total</div>
        </div>
      </div>

      <div className="cal-hd">
        <div className="mtitle">{monthName}</div>
        <div className="cal-nav">
          <button onClick={() => setCalMonth(new Date(y, m - 1, 1))}>‹</button>
          <button onClick={() => setCalMonth(new Date())}>•</button>
          <button onClick={() => setCalMonth(new Date(y, m + 1, 1))}>›</button>
        </div>
      </div>

      <div className="grid">
        {DAY_NAMES.map((d, i) => (
          <div className="gh" key={`h${i}`}>
            {d}
          </div>
        ))}
        {Array.from({ length: start }, (_, i) => (
          <div className="cell empty" key={`e${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1;
          const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const evs = byDay[key] || [];
          return (
            <div className={`cell${evs.length ? ' has' : ''}${key === today ? ' today' : ''}`} key={key} onClick={() => setSheetDay(key)}>
              <div className="dn">{d}</div>
              <div className="dots">
                {evs.slice(0, 3).map((e, j) => (
                  <i key={j} style={{ background: dotColor(e.type, e) }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="cal-legend">
        <i className="lg" style={{ background: 'var(--acc)' }} /> workout &nbsp;
        <i className="lg" style={{ background: 'var(--mut2)' }} /> rest
      </div>

      <Sheet
        open={!!sheetDay}
        onClose={() => setSheetDay(null)}
        title={sheetDay ? new Date(`${sheetDay}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Day details'}
      >
        {sheetDay && (
          <DaySheetContent day={sheetDay} events={sheetEvents} onToggle={toggleDayType} onEdit={editEntry} onClose={() => setSheetDay(null)} />
        )}
      </Sheet>
    </div>
  );
}

function DaySheetContent({
  day,
  events,
  onToggle,
  onEdit,
  onClose,
}: {
  day: string;
  events: LoggedWorkout[];
  onToggle: (key: string, type: 'rest') => void;
  onEdit: (entry: LoggedWorkout) => void;
  onClose: () => void;
}) {
  const d = new Date(`${day}T00:00:00`);
  const workouts = events.filter((e) => e.type === 'workout');
  const rested = events.some((e) => e.type === 'rest');
  return (
    <>
      <h2>{d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
      <div className="sh-sub">
        {workouts.length ? `${workouts.length} workout${workouts.length !== 1 ? 's' : ''}` : 'nothing logged yet'}
        {rested ? ' · rest' : ''}
      </div>
      {workouts.map((e) => {
        const pl = e.plan ? catalog.plans[e.plan as keyof typeof catalog.plans] : undefined;
        const canRepeat = isPlanKey(e.plan) && !!e.sess && !!catalog.plans[e.plan].sessions[e.sess];
        return (
          <div className="hentry" key={e.id}>
            <div className="hd">
              <span className="hbadge" style={{ color: hueOf(e) }}>
                {pl ? pl.icon : ''} {pl ? pl.label : ''} · {e.name}
              </span>
              <span className="htime">
                {new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="hln">
              {e.slots.map((s, i) => {
                const sets = s.sets.map((x) => (s.kind === 'bw' ? `${x.r || '–'}` : `${x.w || '–'}×${x.r || '–'}`)).join('  ');
                return (
                  <span key={i}>
                    <b>{s.slot}</b> <span style={{ color: 'var(--mut)' }}>{s.kind}{s.force ? ' · 💪' : ''}</span> {sets || '✓'}
                    <br />
                  </span>
                );
              })}
            </div>
            {canRepeat && (
              <button className="btn sec" style={{ marginTop: 10 }} onClick={() => onEdit(e)}>
                <IconChev /> Continue / edit this workout
              </button>
            )}
          </div>
        );
      })}
      <div className="sec-label" style={{ marginTop: 6 }}>
        Log for this day
      </div>
      <div className="quicklog">
        <button className={`ql rest${rested ? ' on' : ''}`} onClick={() => onToggle(day, 'rest')}>
          <IconRest /> Rest day
        </button>
      </div>
      <button className="btn acc" onClick={onClose} style={{ marginTop: 12 }}>
        Close
      </button>
    </>
  );
}
