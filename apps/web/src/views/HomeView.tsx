import { catalog } from '@gym-tracker/core';
import type { PlanKey } from '@gym-tracker/core';
// Recap-owned styles (empty nudge, picker thumb polish) + new home redesign.
import '../styles/recap-extras.css';
import '../styles/home-redesign.css';
import '../styles/exercise-gif.css';
import { useAppState } from '../state/AppState';
import { useWorkouts } from '../lib/useWorkouts';
import { usePrefs } from '../lib/useProfileData';
import { weeklyRecap } from '../lib/recap';
import { dayColor } from '../lib/colors';
import { Avatar } from '../components/Avatar';
import { ExerciseGif } from '../components/ExerciseGif';
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

function estMinutes(slotCount: number): number {
  return Math.max(15, Math.round((slotCount * 7) / 5) * 5);
}

export function HomeView() {
  const { state, dispatch } = useAppState();
  const { history } = useWorkouts();
  const prefs = usePrefs().data ?? undefined;
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
      {/* Header: avatar + name + Start (layout A — no big hero) */}
      <div className="home-head">
        <Avatar avatarKey={prefs?.avatar} size={44} />
        <div className="home-head-hi">
          <div className="home-head-wb">{greeting()}</div>
          <div className="home-head-nm">{prefs?.displayName || 'Athlete'}</div>
        </div>
        {heroSession && (
          <button
            className="home-head-start"
            onClick={() => openSession(heroSession.plan, heroSession.day)}
          >
            {ip[0] ? 'Resume' : 'Start'} ▶
          </button>
        )}
      </div>

      {/* Slim one-line stat strip */}
      <div className="home-statline">
        <div className="hsl-item">
          <span className="hsl-n">{recap.workouts}</span>
          <span className="hsl-l">this week</span>
        </div>
        <span className="hsl-sep" />
        <div className="hsl-item">
          <span className="hsl-n">{total}</span>
          <span className="hsl-l">total</span>
        </div>
        <span className="hsl-sep" />
        <div className="hsl-item">
          <span className="hsl-n">🔥 {recap.streak}</span>
          <span className="hsl-l">streak</span>
        </div>
      </div>

      {firstTime && (
        <div className="empty" style={{ marginBottom: 4 }}>
          No workouts yet — pick a mode and your first session below.
        </div>
      )}

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

      {/* Mode — Gym / Calisthenics / Travel as image mode cards (2 per row). */}
      <div className="sec-label">Mode</div>
      <div className="mode-grid">
        {(Object.keys(catalog.plans) as PlanKey[]).map((pk) => {
          const pl = catalog.plans[pk];
          return (
            <button
              key={pk}
              className={`mode-card mode-${pk}${pk === plan ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'SET_PLAN', plan: pk })}
            >
              <span className="mode-ico">{pl.icon}</span>
              <span className="mode-name">{pl.label}</span>
            </button>
          );
        })}
      </div>

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
                const firstEx = s.slots[0]?.[0] ?? '';
                return (
                  <div className="dayrow" key={k} onClick={() => openSession(plan, k)}>
                    <div className="dbar" style={{ background: col }} />
                    <div className="dthumb">
                      <ExerciseGif name={firstEx} size="thumb" poster hideWhenMissing />
                      <span className="dthumb-emoji">{s.emoji}</span>
                    </div>
                    <div className="dinfo">
                      <div className="dname">{s.name}</div>
                      <div className="dmus" title={s.muscles}>
                        {s.slots.length} exercises · ~{estMinutes(s.slots.length)} min
                      </div>
                    </div>
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
