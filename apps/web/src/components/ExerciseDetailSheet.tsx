import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import {
  catalog,
  mediaFor,
  mediaForExercise,
  gifUrl,
  resolveVariant,
  shortLabel,
  variantMedia,
  variantsFor,
  KIND_LABEL,
  type Plan,
  type Kind,
  type ExerciseMedia,
} from '@gym-tracker/core';

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
  /** Chosen style variants keyed `${slot}|${kind}` (AppState.activeVariant). */
  activeVariants?: Record<string, string>;
  /** When set (and the slot has 2+ style variants for `kind`), renders the
   *  variant chips under the hero; tapping one calls this with its name. */
  onVariantChange?: (name: string) => void;
  /** Called when the user dismisses the sheet. */
  onClose: () => void;
}

// Reusable "how to do this exercise" sheet — big demo, target/secondary muscles,
// all equipment variations, and the numbered how-to steps. Used by the Exercise
// Library (tap a card) AND by ExerciseCard on Train (tap the demo image).
export function ExerciseDetailSheet({ movement, kind, activeVariants, onVariantChange, onClose }: ExerciseDetailSheetProps) {
  // Lock body scroll while the sheet is open — MUST run before any early return
  // (Rules of Hooks) so the cleanup fires when movement transitions to null.
  // Otherwise body.overflow='hidden' sticks and you can't scroll after closing.
  useEffect(() => {
    if (!movement) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [movement]);

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
  // A style variant (same equipment, different movement style) takes over the
  // hero, title and steps when the slot has any for this kind.
  const variants = kind ? variantsFor(movement, kind) : null;
  const variant = kind ? resolveVariant(movement, kind, activeVariants) : null;
  const activeVar = kind ? vars[kind] : undefined;
  const activeVarName = variant?.name ?? activeVar?.name;
  const media: ExerciseMedia | null = variant
    ? variantMedia(variant, movement)
    : (mediaForExercise(activeVarName, movement) ?? mediaFor(movement));
  const fallbackImg = activeVar?.img ?? variations[0]?.img ?? null;
  const displayTitle = activeVarName ?? movement;
  const displaySubtitle = activeVarName ? movement : null;

  // Render in a portal attached to <body> — this guarantees `position: fixed`
  // is measured against the viewport, not against any ancestor whose filter/
  // transform/backdrop-filter would otherwise create a new containing block
  // (our sticky header does exactly that, which pinned the sheet to the top).
  return createPortal(
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

        {onVariantChange && variants && variants.length > 1 && (
          <div className="variants-row" role="group" aria-label="Variants">
            {variants.map((v) => (
              <button
                key={v.name}
                type="button"
                className={`vchip${v.name === variant?.name ? ' on' : ''}`}
                aria-pressed={v.name === variant?.name}
                onClick={() => onVariantChange(v.name)}
              >
                <span className={`d ${v.difficulty}`} aria-hidden="true" />
                {shortLabel(v.name)}
              </button>
            ))}
          </div>
        )}

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
    </div>,
    document.body,
  );
}
