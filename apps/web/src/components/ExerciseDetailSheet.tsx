import { catalog, mediaFor, gifUrl, KIND_LABEL, type Plan, type Kind, type ExerciseMedia } from '@gym-tracker/core';

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
  /** Called when the user dismisses the sheet. */
  onClose: () => void;
}

// Reusable "how to do this exercise" sheet — big demo, target/secondary muscles,
// all equipment variations, and the numbered how-to steps. Used by the Exercise
// Library (tap a card) AND by ExerciseCard on Train (tap the demo image).
export function ExerciseDetailSheet({ movement, onClose }: ExerciseDetailSheetProps) {
  if (!movement) return null;

  const vars = (gym.variations[movement] || {}) as Partial<Record<Kind, { name: string; img: string }>>;
  const kinds = Object.keys(vars) as Kind[];
  const variations: Variation[] = kinds.map((k) => ({
    kind: k,
    name: vars[k]!.name,
    img: vars[k]!.img,
  }));
  const media: ExerciseMedia | null = mediaFor(movement);
  const fallbackImg = variations[0]?.img ?? null;

  return (
    <div className="lib-sheet" onClick={onClose} role="dialog" aria-modal="true" aria-label={movement}>
      <div className="lib-sheet-in" onClick={(ev) => ev.stopPropagation()}>
        <button className="lib-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="lib-detail-media">
          {media ? (
            <img src={gifUrl(media, MEDIA_BASE)} alt={movement} />
          ) : fallbackImg ? (
            <img src={fallbackImg} alt={movement} />
          ) : (
            <span className="lib-detail-glyph">🏋️</span>
          )}
        </div>
        <h2 className="lib-detail-title">{movement}</h2>
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
                <div className="lib-var" key={v.kind}>
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
