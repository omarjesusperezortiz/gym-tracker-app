import { useState } from 'react';
import { mediaFor, gifUrl, type ExerciseMedia } from '@gym-tracker/core';

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
}

/**
 * Renders an exercise demonstration gif on a white tile. Falls back to a muscle
 * emoji glyph when we don't have media mapped for this movement yet, so the UI
 * never shows a broken image. Reused across Today, Train, the picker and detail.
 */
export function ExerciseGif({ name, size = 'thumb', badge = false, hideWhenMissing = false }: ExerciseGifProps) {
  const media = mediaFor(name);
  const [failed, setFailed] = useState(false);

  if (!media || failed) {
    if (hideWhenMissing) return null;
    return (
      <div className={`exgif exgif-${size} exgif-fallback`} aria-label={name} role="img">
        <span className="exgif-glyph">🏋️</span>
      </div>
    );
  }

  return (
    <div className={`exgif exgif-${size}`}>
      {badge && <span className="exgif-badge">Demo</span>}
      <img
        src={gifUrl(media as ExerciseMedia, MEDIA_BASE)}
        alt={`${name} demonstration`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
