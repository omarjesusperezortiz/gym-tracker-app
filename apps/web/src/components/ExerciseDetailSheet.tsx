import { catalog, mediaFor, mediaForExercise, gifUrl, KIND_LABEL, type Plan, type Kind, type ExerciseMedia } from '@gym-tracker/core';

const MEDIA_BASE = `${import.meta.env.BASE_URL}exercise-media/`;
const gym = catalog.plans.gym as unknown as Plan;

interface Variation {
  kind: Kind;
  name: string;
  img: string;
}

export interface ExerciseDetailSheetProps {
  /** The movement (catalog slot name), e.g. "Vertical pull (lats)". */
  movement: string | null;
  /** Optional: the equipment kind currently selected on the card. When set,
   *  the sheet shows THAT variation's demo image + title (e.g. "Machine Bench
   *  Press"). Without it, we show the movement's default. */
  kind?: Kind | null;
  /** Called when the user dismisses the sheet. */
  onClose: () => void;
}

// Reusable "how to do this exercise" sheet — big demo, target/secondary muscles,
// all equipment variations, and the numbered how-to steps. Used by the Exercise
// Library (tap a card) AND by ExerciseCard on Train (tap the demo image).
export function ExerciseDetailSheet({ movement, kind, onClose }: ExerciseDetailSheetProps) {
  if (!movement) return null;

  const vars = (gym.variations[movement] || {}) as Partial<Record<Kind, { name: string; img: string }>>;
  const kinds = Object.keys(vars) as Kind[];
  const variations: Variation[] = kinds.map((k) => ({
    kind: k,
    name: vars[k]!.name,
    img: vars[k]!.img,
  }));

  // Pick the correct demo for the CURRENTLY-selected variation, not the
  // movement's default. mediaForExercise first tries the variation-specific
  // media map, then falls back to the movement's media. Title reflects the
  // specific variation name when we have one.
  const activeVar = kind ? vars[kind] : undefined;
  const activeVarName = activeVar?.name;
  const media: ExerciseMedia | null = mediaForExercise(activeVarName, movement) ?? mediaFor(movement);
  const fallbackImg = activeVar?.img ?? variations[0]?.img ?? null;
  const displayTitle = activeVarName ?? movement;
  const displaySubtitle = activeVarName ? movement : null;

  return (
    <div className="lib-sheet" onClick={onClose} role="dialog" aria-modal="true" aria-label={displayTitle}>
      <div className="lib-sheet-in" onClick={(ev) => ev.stopPropagation()}>
        <button className="lib-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="lib-detail-media">
          {media ? (
            <img src={gifUrl(media, MEDIA_BASE)} alt={displayTitle} />
          ) : fallbackImg ? (
            <img src={fallbackImg} alt={displayTitle} />
          ) : (
            <span className="lib-detail-glyph">🏋️</span>
          )}
        </div>
        <h2 className="lib-detail-title">{displayTitle}</h2>
        {displaySubtitle && <div className="lib-detail-sub">{displaySubtitle}</div>}
        <div className="lib-card-tags">
          {media?.target && <span className="lib-tag on">{media.target}</span>}
          {media?.secondary.map((s) => (
            <span className="lib-tag" key={s}>
              {s}
            </span>
          ))}
        </div>

        {variations.length > 0 && (
          <>
            <div className="lib-detail-label">Equipment variations</div>
            <div className="lib-vars">
              {variations.map((v) => (
                <div className={`lib-var${v.kind === kind ? ' on' : ''}`} key={v.kind}>
                  <img className="lib-var-img" src={v.img} alt="" loading="lazy" />
                  <div className="lib-var-info">
                    <span className="lib-var-kind">{KIND_LABEL[v.kind] || v.kind}</span>
                    <span className="lib-var-name">{v.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {media?.steps && media.steps.length > 0 && (
          <>
            <div className="lib-detail-label">How to</div>
            <ol className="lib-steps">
              {media.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
