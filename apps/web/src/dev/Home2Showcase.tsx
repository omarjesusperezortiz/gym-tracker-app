import { useMemo, useState } from 'react';
import { catalog, type Plan, type PlanKey } from '@gym-tracker/core';
import { ExerciseGif } from '../components/ExerciseGif';
import '../styles/exercise-gif.css';
import '../styles/home2.css';

// PROTOTYPE Home (direction A, reference-inspired). Live, tappable, real catalog
// data — but a throwaway route (?showcase=home2), NOT the real Home. Lets Omar
// feel it on his phone before we commit to rebuilding HomeView.

const FOCUS = [
  { key: 'all', label: 'Full Body' },
  { key: 'upper', label: 'Upper' },
  { key: 'lower', label: 'Lower' },
  { key: 'core', label: 'Core' },
] as const;

// crude focus match from a session's muscles string
function focusOf(muscles: string): Set<string> {
  const m = muscles.toLowerCase();
  const s = new Set<string>(['all']);
  if (/chest|back|shoulder|arm|bicep|tricep|delt|trap|lat|pull|push/.test(m)) s.add('upper');
  if (/leg|quad|glute|hamstring|calf|squat|lunge/.test(m)) s.add('lower');
  if (/core|abs|oblique|plank/.test(m)) s.add('core');
  return s;
}

function estMinutes(slotCount: number): number {
  return Math.max(15, Math.round((slotCount * 7) / 5) * 5); // ~7 min/exercise, rounded to 5
}

export function Home2Showcase() {
  const [focus, setFocus] = useState<string>('all');
  const [plan] = useState<PlanKey>('gym');
  const P = catalog.plans[plan] as unknown as Plan;

  const sessions = useMemo(() => {
    return Object.entries(P.sessions).map(([key, s]) => ({
      key,
      name: s.name,
      emoji: s.emoji,
      muscles: s.muscles,
      count: s.slots.length,
      minutes: estMinutes(s.slots.length),
      firstExercise: s.slots[0]?.[0] ?? '',
      focus: focusOf(s.muscles),
    }));
  }, [P]);

  const shown = sessions.filter((s) => focus === 'all' || s.focus.has(focus));
  const recommended = sessions[0];

  return (
    <div className="h2">
      <div className="h2-top">
        <div className="h2-av" />
        <div className="h2-hi">
          <div className="h2-wb">Welcome back</div>
          <div className="h2-nm">Omar</div>
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

      <div className="h2-sh">
        <span className="h2-sh-t">Suggested</span>
        <span className="h2-sh-a">See all</span>
      </div>

      <div className="h2-list">
        {shown.map((s) => (
          <button className="h2-wc" key={s.key}>
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
        ))}
        {!shown.length && <div className="h2-empty">No sessions match this focus.</div>}
      </div>
    </div>
  );
}
