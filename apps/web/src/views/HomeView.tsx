import { catalog } from '@gym-tracker/core';
import type { PlanKey } from '@gym-tracker/core';
import { useAppState } from '../state/AppState';
import { useWorkouts } from '../lib/useWorkouts';
import { dayColor } from '../lib/colors';
import { weekCount, calcStreak, groupByDay } from '../lib/stats';
import { IconChev } from '../lib/icons';

interface InProgress {
  plan: PlanKey;
  day: string;
  done: number;
  total: number;
}

function inProgressSessions(live: ReturnType<typeof useAppState>['state']['live']): InProgress[] {
  const map: Record<string, InProgress> = {};
  for (const key in live) {
    const parts = key.split('|');
    if (parts.length < 3) continue;
    const pk = parts[0] as PlanKey;
    const dk = parts[1];
    const st = live[key];
    const hasValues = !!(st.sets && st.sets.some((x) => x && (x.w || x.r)));
    if (!(st.done || hasValues)) continue;
    if (!catalog.plans[pk]?.sessions[dk]) continue;
    const id = `${pk}|${dk}`;
    if (!map[id]) map[id] = { plan: pk, day: dk, done: 0, total: catalog.plans[pk].sessions[dk].slots.length };
    if (st.done || hasValues) map[id].done++;
  }
  return Object.values(map);
}

export function HomeView() {
  const { state, dispatch } = useAppState();
  const { history } = useWorkouts();
  const { plan } = state;
  const P = catalog.plans[plan];

  const wc = weekCount(history);
  const total = history.length;
  const streak = calcStreak(groupByDay(history));

  const ip = inProgressSessions(state.live);
  const keys = Object.keys(P.sessions);
  const groups: [string, string][] = [
    ['broad', '⚡ Quick picks — broad sessions'],
    ['focused', '🎯 Focused — one area'],
  ];

  function openSession(pk: PlanKey, sk: string) {
    dispatch({ type: 'OPEN_SESSION', plan: pk, sess: sk });
  }

  return (
    <div className="dash">
      <div className="dash-h">Let's train 💪</div>
      <div className="dash-sub">Pick your mode, then today's focus.</div>

      {ip.length > 0 && (
        <>
          <div className="sec-label">▶ Continue where you left off</div>
          {ip.map((x) => {
            const s = catalog.plans[x.plan].sessions[x.day];
            const col = dayColor(x.plan, x.day);
            const pl = catalog.plans[x.plan];
            return (
              <div className="resume" key={`${x.plan}|${x.day}`} onClick={() => openSession(x.plan, x.day)}>
                <div className="rbar" style={{ background: col }} />
                <div className="rico">{s.emoji}</div>
                <div className="rinfo">
                  <div className="rname">
                    {s.name} <span className="rtag">{pl.icon} {pl.label}</span>
                  </div>
                  <div className="rmus">{x.done} of {x.total} done · tap to resume</div>
                </div>
                <div className="rplay">▶</div>
              </div>
            );
          })}
        </>
      )}

      <div className="week-strip">
        <div className="wk">
          <div className="wv acc">{wc}</div>
          <div className="wl">this week</div>
        </div>
        <div className="wk">
          <div className="wv">{total}</div>
          <div className="wl">total workouts</div>
        </div>
        <div className="wk">
          <div className="wv">{streak}</div>
          <div className="wl">day streak 🔥</div>
        </div>
      </div>

      <div className="sec-label">Mode</div>
      <div className="plan-grid">
        {(Object.keys(catalog.plans) as PlanKey[]).map((pk) => {
          const pl = catalog.plans[pk];
          const n = Object.keys(pl.sessions).length;
          return (
            <div
              key={pk}
              className={`plancard${pk === plan ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'SET_PLAN', plan: pk })}
            >
              <div className="pe">{pl.icon}</div>
              <div className="pl">{pl.label}</div>
              <div className="ps">{n} days</div>
            </div>
          );
        })}
      </div>

      {groups.map(([g, label]) => {
        const gk = keys.filter((k) => (P.sessions[k].group || 'focused') === g);
        if (!gk.length) return null;
        return (
          <div key={g}>
            <div className="sec-label">{label}</div>
            <div className="day-list">
              {gk.map((k) => {
                const s = P.sessions[k];
                const col = dayColor(plan, k);
                return (
                  <div className="dayrow" key={k} onClick={() => openSession(plan, k)}>
                    <div className="dbar" style={{ background: col }} />
                    <div className="dnum">{s.emoji}</div>
                    <div className="dinfo">
                      <div className="dname">{s.name}</div>
                      <div className="dmus">{s.muscles}</div>
                    </div>
                    <div className="dcount">{s.slots.length} ex</div>
                    <div className="dgo">
                      <IconChev />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
