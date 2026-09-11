import { useMemo, useState } from 'react';
import { catalog, type Plan, type PlanKey } from '@gym-tracker/core';
import { ExerciseGif } from '../components/ExerciseGif';
import { Avatar } from '../components/Avatar';
import '../styles/exercise-gif.css';
import '../styles/home2.css';

// PROTOTYPE Home (direction A + your tweaks). Live, tappable, real catalog data —
// throwaway route (?showcase=home2), NOT the real Home.
//   • avatar in header (from a preset)
//   • 2-per-row mode grid: Gym / Calisthenics / Travel
//   • muscle-focus chips
//   • Suggested list GROUPED as "<MODE> · QUICK PICKS" and "<MODE> · FOCUSED"

const FOCUS = [
  { key: 'all', label: 'Full Body' },
  { key: 'upper', label: 'Upper' },
  { key: 'lower', label: 'Lower' },
  { key: 'core', label: 'Core' },
] as const;

const MODE_META: Record<string, { emoji: string; label: string }> = {
  gym: { emoji: '🏋️', label: 'Gym' },
  cal: { emoji: '🤸', label: 'Calisthenics' },
  travel: { emoji: '✈️', label: 'Travel' },
};

// stable accent per session for the colored left bar
const BARS = ['#d6f24e', '#ff8a5b', '#5b9dff', '#3ddc97', '#ff6b9d', '#b98cff', '#ffd93d'];

function focusOf(muscles: string): Set<string> {
  const m = muscles.toLowerCase();
  const s = new Set<string>(['all']);
  if (/chest|back|shoulder|arm|bicep|tricep|delt|trap|lat|pull|push/.test(m)) s.add('upper');
  if (/leg|quad|glute|hamstring|calf|squat|lunge/.test(m)) s.add('lower');
  if (/core|abs|oblique|plank/.test(m)) s.add('core');
  return s;
}

function estMinutes(slotCount: number): number {
  return Math.max(15, Math.round((slotCount * 7) / 5) * 5);
}

export function Home2Showcase() {
  const [focus, setFocus] = useState<string>('all');
  const [plan, setPlan] = useState<PlanKey>('gym');
  const P = catalog.plans[plan] as unknown as Plan;
  const modeLabel = (MODE_META[plan]?.label ?? plan).toUpperCase();

  // pretend the user picked the flame avatar (in the real app this comes from prefs)
  const avatarKey = 'flame';
  const avatarName = 'Omar';

  const sessions = useMemo(() => {
    return Object.entries(P.sessions).map(([key, s], i) => ({
      key,
      name: s.name,
      emoji: s.emoji,
      muscles: s.muscles,
      group: (s as { group?: string }).group ?? 'focused',
      count: s.slots.length,
      minutes: estMinutes(s.slots.length),
      firstExercise: s.slots[0]?.[0] ?? '',
      focus: focusOf(s.muscles),
      bar: BARS[i % BARS.length],
    }));
  }, [P]);

  const shown = sessions.filter((s) => focus === 'all' || s.focus.has(focus));
  const quick = shown.filter((s) => s.group === 'broad');
  const focused = shown.filter((s) => s.group !== 'broad');
  const recommended = sessions[0];

  const Row = (s: (typeof sessions)[number]) => (
    <button className="h2-wc" key={s.key} style={{ ['--bar' as string]: s.bar }}>
      <span className="h2-bar" />
      <span className="h2-wt">
        <ExerciseGif name={s.firstExercise} size="thumb" poster hideWhenMissing />
        <span className="h2-wt-emoji">{s.emoji}</span>
      </span>
      <span className="h2-wi">
        <span className="h2-wn">{s.name}</span>
        <span className="h2-wm">
          <b>{s.count} exercises</b> · ~{s.minutes} min · {s.muscles}
        </span>
      </span>
      <span className="h2-go">›</span>
    </button>
  );

  return (
    <div className="h2">
      <div className="h2-top">
        <Avatar avatarKey={avatarKey} size={44} />
        <div className="h2-hi">
          <div className="h2-wb">Good evening</div>
          <div className="h2-nm">{avatarName}</div>
        </div>
        <div className="h2-bell">🔔</div>
      </div>

      <div className="h2-hero">
        <div className="h2-hero-body">
          <div className="h2-hero-t">Ready to train?</div>
          <div className="h2-hero-big">
            {recommended?.name ?? 'Upper'}
            <span>recommended today</span>
          </div>
          <button className="h2-hero-cta">Start today →</button>
        </div>
      </div>

      {/* 2-per-row mode grid */}
      <div className="h2-modes">
        {(Object.keys(catalog.plans) as PlanKey[]).map((pk) => {
          const meta = MODE_META[pk] ?? { emoji: '•', label: pk };
          return (
            <button
              key={pk}
              className={`h2-mode h2-mode-${pk}${pk === plan ? ' on' : ''}`}
              onClick={() => setPlan(pk)}
            >
              <span className="h2-mode-ico">{meta.emoji}</span>
              <span className="h2-mode-name">{meta.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h2-chips">
        {FOCUS.map((f) => (
          <button
            key={f.key}
            className={`h2-chip${focus === f.key ? ' on' : ''}`}
            onClick={() => setFocus(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {quick.length > 0 && (
        <>
          <div className="h2-glabel">{modeLabel} · Quick picks</div>
          <div className="h2-list">{quick.map(Row)}</div>
        </>
      )}
      {focused.length > 0 && (
        <>
          <div className="h2-glabel">{modeLabel} · Focused</div>
          <div className="h2-list">{focused.map(Row)}</div>
        </>
      )}
      {!shown.length && <div className="h2-empty">No sessions match this focus.</div>}
    </div>
  );
}
