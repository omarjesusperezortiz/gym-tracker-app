import { catalog, nutritionTargets } from '@gym-tracker/core';
import { PageHeader } from '../components/PageHeader';
import { DEFAULT_PREFS, useBodyweight, usePrefs } from '../lib/useProfileData';
import { useAppState } from '../state/AppState';

// Inline link styling — the app has no shared link class and this view mustn't
// touch styles.css, so the one "go to Profile" affordance is styled locally.
const LINK_STYLE: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  font: 'inherit',
  color: 'var(--acc)',
  textDecoration: 'underline',
  cursor: 'pointer',
};

interface Meal {
  t: string;
  p: string;
  ideas: string[];
}

export function MealsView() {
  const { dispatch } = useAppState();
  const prefsQuery = usePrefs();
  const bodyweightQuery = useBodyweight();

  const prefs = prefsQuery.data ?? DEFAULT_PREFS;
  const log = bodyweightQuery.data ?? [];
  // Prefer the latest logged weigh-in; fall back to the goal weight if that's
  // all we have. Null means "no body data yet" → prompt instead of faking it.
  const latestKg = log.length ? log[log.length - 1].weightKg : null;
  const bodyweightKg = latestKg ?? prefs.goalWeightKg ?? null;

  const targets = nutritionTargets(prefs.goal, bodyweightKg);

  const M = catalog.meals as unknown as { principles: string[]; meals: Meal[]; protein_foods: string[] };

  const proteinLabel = targets.protein ? `${targets.protein.minG}–${targets.protein.maxG}` : '—';
  const waterLabel = targets.waterLitres != null ? `${targets.waterLitres}L` : '—';

  return (
    <div className="meals">
      <PageHeader title="Nutrition" subtitle="Guidance estimates based on your goal — not strict targets." />

      <div className="target-card">
        <div className="tg">
          <div className="ti">
            <div className="tv">{proteinLabel}</div>
            <div className="tl">g protein/day</div>
          </div>
          <div className="ti">
            <div className="tv">{targets.calories.label}</div>
            <div className="tl">calories</div>
          </div>
          <div className="ti">
            <div className="tv">{waterLabel}</div>
            <div className="tl">water</div>
          </div>
        </div>
        {targets.protein ? (
          <div className="target-note">{targets.note}</div>
        ) : (
          <div className="target-note">
            {targets.note} Add your bodyweight in{' '}
            <button style={LINK_STYLE} type="button" onClick={() => dispatch({ type: 'SET_VIEW', view: 'profile' })}>
              Profile
            </button>{' '}
            to see protein and water estimates.
          </div>
        )}
      </div>

      <div className="sec-label">Principles</div>
      <div className="mcard">
        <div className="mideas">
          {M.principles.map((p, i) => (
            <div className="midea" key={i}>
              {p}
            </div>
          ))}
        </div>
      </div>

      <div className="sec-label">Example day</div>
      {M.meals.map((mm, i) => (
        <div className="mcard" key={i}>
          <div className="mtitle2">
            {mm.t}
            <span className="mp">{mm.p}</span>
          </div>
          <div className="mideas">
            {mm.ideas.map((idea, j) => (
              <div className="midea" key={j}>
                {idea}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="sec-label">Go-to protein foods</div>
      <div className="mcard">
        <div className="chips">
          {M.protein_foods.map((f, i) => (
            <span className="c" key={i}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
