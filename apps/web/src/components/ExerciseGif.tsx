import { useState } from 'react';
import { mediaFor, mediaForExercise, gifUrl, posterUrl, type ExerciseMedia } from '@gym-tracker/core';

const MEDIA_BASE = `${import.meta.env.BASE_URL}exercise-media/`;

interface ExerciseGifProps {
  /** Catalog movement name (slot[0]). */
  name: string;
  /** Specific exercise (equipment variation) name — when set, its own gif is used. */
  exercise?: string;
  /** Visual size preset. */
  size?: 'thumb' | 'card' | 'detail';
  /** Show the small "Demo" badge (card/detail only). */
  badge?: boolean;
  /** When true, render nothing (instead of a fallback tile) if we have no media. */
  hideWhenMissing?: boolean;
  /** Static first-frame image instead of the animated gif (calmer for lists). */
  poster?: boolean;
  /** Fallback image URL (e.g. free-exercise-db photo) shown when we have no gif yet. */
  fallbackImg?: string | null;
}

/**
 * Renders an exercise demonstration on a white tile — animated gif by default,
 * or a static poster frame when `poster` is set (used in list contexts like
 * Today where motion is distracting). When `exercise` is given, the demo tracks
 * that specific variation (e.g. the selected equipment tab); otherwise it falls
 * back to the movement's gif. When we have no gif it shows `fallbackImg` if
 * provided, else a muscle glyph — so the UI never shows a broken image.
 */
export function ExerciseGif({
  name,
  exercise,
  size = 'thumb',
  badge = false,
  hideWhenMissing = false,
  poster = false,
  fallbackImg = null,
}: ExerciseGifProps) {
  const media = exercise ? mediaForExercise(exercise, name) : mediaFor(name);
  // Re-mount the <img> when the resolved gif changes so a swap doesn't get stuck
  // on a stale error state.
  const [failedId, setFailedId] = useState<string | null>(null);
  const failed = media != null && failedId === media.id;

  if (!media || failed) {
    if (fallbackImg) {
      return (
        <div className={`exgif exgif-${size}`}>
          <img src={fallbackImg} alt={`${name} demonstration`} loading="lazy" />
        </div>
      );
    }
    if (hideWhenMissing) return null;
    return (
      <div className={`exgif exgif-${size} exgif-fallback`} aria-label={name} role="img">
        <span className="exgif-glyph">🏋️</span>
      </div>
    );
  }

  const src = poster
    ? posterUrl(media as ExerciseMedia, MEDIA_BASE)
    : gifUrl(media as ExerciseMedia, MEDIA_BASE);

  return (
    <div className={`exgif exgif-${size}`}>
      {badge && <span className="exgif-badge">Demo</span>}
      <img
        key={media.id}
        src={src}
        alt={`${exercise || name} demonstration`}
        loading="lazy"
        onError={() => setFailedId(media.id)}
      />
    </div>
  );
}
