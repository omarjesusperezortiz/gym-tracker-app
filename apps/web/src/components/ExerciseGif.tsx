import { useState } from 'react';
import { mediaFor, gifUrl, posterUrl, type ExerciseMedia } from '@gym-tracker/core';

const MEDIA_BASE = `${import.meta.env.BASE_URL}exercise-media/`;

interface ExerciseGifProps {
  /** Catalog movement name (slot[0]). */
  name: string;
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
 * Today where motion is distracting). When we have no gif for this movement, it
 * shows `fallbackImg` if provided, else a muscle glyph — so the UI never shows a
 * broken image.
 */
export function ExerciseGif({
  name,
  size = 'thumb',
  badge = false,
  hideWhenMissing = false,
  poster = false,
  fallbackImg = null,
}: ExerciseGifProps) {
  const media = mediaFor(name);
  const [failed, setFailed] = useState(false);

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
      <img src={src} alt={`${name} demonstration`} loading="lazy" onError={() => setFailed(true)} />
    </div>
  );
}
