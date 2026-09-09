import { catalog } from '@gym-tracker/core';

interface Targets {
  protein: string;
  calories: string;
  water: string;
  note: string;
}
interface Meal {
  t: string;
  p: string;
  ideas: string[];
}

export function MealsView() {
  const M = catalog.meals as unknown as { targets: Targets; principles: string[]; meals: Meal[]; protein_foods: string[] };

  return (
    <div className="meals">
      <div className="target-card">
        <div className="tg">
          <div className="ti">
            <div className="tv">{M.targets.protein.split(' ')[0]}</div>
            <div className="tl">protein/day</div>
          </div>
          <div className="ti">
            <div className="tv">+250</div>
            <div className="tl">kcal surplus</div>
          </div>
          <div className="ti">
            <div className="tv">{M.targets.water.split('–')[0]}L</div>
            <div className="tl">water</div>
          </div>
        </div>
        <div className="target-note">{M.targets.note}</div>
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

      <div className="sec-label">Daily meals</div>
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
