import { catalog } from '@gym-tracker/core';
import type { PlanKey } from '@gym-tracker/core';
// Recap-owned styles (empty nudge, picker thumb polish) + new home redesign.
import '../styles/recap-extras.css';
import '../styles/home-redesign.css';
import { useAppState } from '../state/AppState';
import { useWorkouts } from '../lib/useWorkouts';
import { weeklyRecap } from '../lib/recap';
import { dayColor } from '../lib/colors';
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

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeView() {
  const { state, dispatch } = useAppState();
  const { history } = useWorkouts();
  const { plan } = state;
  const P = catalog.plans[plan];

  const recap = weeklyRecap(history);
  const total = history.filter((w) => w.type === 'workout').length;

  const ip = inProgressSessions(state.live);
  const keys = Object.keys(P.sessions);
  const groups: [string, string][] = [
    ['broad', 'Quick picks'],
    ['focused', 'Focused'],
  ];

  function openSession(pk: PlanKey, sk: string) {
    dispatch({ type: 'OPEN_SESSION', plan: pk, sess: sk });
  }

  const firstTime = total === 0;
  // Pick a session to launch from the hero: continue an in-progress one, else the
  // first quick-pick of the current plan.
  const heroSession =
    ip[0] ?? (keys.length ? { plan, day: keys[0], done: 0, total: 0 } : null);

  return (
    <div className="dash">
      {/* Welcome hero — image-background card (reused for first-time welcome). */}
      <div className={`home-hero${firstTime ? ' first' : ''}`}>
        <span className="home-hero-badge">{firstTime ? 'Welcome' : greeting()}</span>
        <div className="home-hero-title">
          {firstTime ? (
            <>
              Let&apos;s start
              <br />
              <span className="a">training.</span>
            </>
          ) : (
            <>
              Ready to
              <br />
              <span className="a">train?</span>
            </>
          )}
        </div>
        <div className="home-hero-sub">
          {firstTime
            ? 'Pick a mode and your first session below.'
            : `${recap.workouts} session${recap.workouts === 1 ? '' : 's'} this week — keep it going.`}
        </div>
        {heroSession && (
          <button
            className="home-hero-cta"
            onClick={() => openSession(heroSession.plan, heroSession.day)}
          >
            {ip[0] ? 'Resume session' : "Start today's session"} →
          </button>
        )}
      </div>

      {/* Straightforward "this week" 3-stat strip. */}
      <div className="home-stats">
        <div className="home-stat">
          <div className="hs-n">{recap.workouts}</div>
          <div className="hs-l">This week</div>
        </div>
        <div className="home-stat">
          <div className="hs-n">{total}</div>
          <div className="hs-l">Total</div>
        </div>
        <div className="home-stat">
          <div className="hs-n">{recap.streak}</div>
          <div className="hs-l">Day streak</div>
        </div>
      </div>

      {ip.length > 0 && (
        <>
          <div className="sec-label">Continue where you left off</div>
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

      {/* Choose your mode — Gym / Calisthenics / Travel as image mode cards. */}
      <div className="sec-label">Choose your mode</div>
      <div className="mode-grid">
        {(Object.keys(catalog.plans) as PlanKey[]).map((pk) => {
          const pl = catalog.plans[pk];
          const n = Object.keys(pl.sessions).length;
          return (
            <button
              key={pk}
              className={`mode-card mode-${pk}${pk === plan ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'SET_PLAN', plan: pk })}
            >
              <span className="mode-ico">{pl.icon}</span>
              <span className="mode-count">{n}d</span>
              <span className="mode-name">{pl.label}</span>
            </button>
          );
        })}
      </div>

      {firstTime && (
        <div className="empty" style={{ marginBottom: 4 }}>
          No workouts yet — your week, total and streak fill in once you finish your first.
        </div>
      )}

      {groups.map(([g, label]) => {
        const gk = keys.filter((k) => (P.sessions[k].group || 'focused') === g);
        if (!gk.length) return null;
        return (
          <div key={g}>
            <div className="sec-label">
              {P.label} · {label}
            </div>
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
                      <div className="dmus" title={s.muscles}>{s.muscles}</div>
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
