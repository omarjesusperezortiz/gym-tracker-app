// Avatar presets — cartoon PORTRAIT illustrations (DiceBear-generated SVGs)
// plus a fallback set of emoji-on-gradient tiles for users who prefer symbols.
// The pref stores just the `key`; both web and mobile look up the preset here.

export interface AvatarPreset {
  key: string;
  /** True for illustrated character portraits (rendered from a bundled SVG). */
  portrait?: boolean;
  /** Emoji character used when the preset is glyph-based (portrait=false). */
  emoji?: string;
  /** CSS gradient stops for glyph-based tiles. */
  from?: string;
  to?: string;
}

// Portrait keys must match the filenames in apps/web/public/avatars/portrait-<key>.svg
// (12 curated illustrated characters generated via DiceBear `avataaars`).
const PORTRAIT_KEYS = [
  'ryan', 'mia', 'zoe', 'leo', 'aria', 'kai',
  'omar', 'sara', 'jax', 'nova', 'rex', 'luna',
] as const;

const PORTRAITS: AvatarPreset[] = PORTRAIT_KEYS.map((k) => ({ key: k, portrait: true }));

const GLYPHS: AvatarPreset[] = [
  { key: 'lime', emoji: '💪', from: '#d6f24e', to: '#7a8a2e' },
  { key: 'flame', emoji: '🔥', from: '#ff8a3d', to: '#c23b1e' },
  { key: 'bolt', emoji: '⚡', from: '#ffd93d', to: '#d69a1e' },
  { key: 'skate', emoji: '🛹', from: '#5b9dff', to: '#2e4a8a' },
  { key: 'rocket', emoji: '🚀', from: '#b98cff', to: '#6a3fd6' },
  { key: 'kettlebell', emoji: '🏋️', from: '#9297a6', to: '#4a4f5e' },
  { key: 'ice', emoji: '🧊', from: '#6ee7e7', to: '#2e8a8a' },
  { key: 'crown', emoji: '👑', from: '#ffd93d', to: '#b8860b' },
  { key: 'trophy', emoji: '🏆', from: '#f2c94e', to: '#a8842e' },
  { key: 'target', emoji: '🎯', from: '#ff6b6b', to: '#c23b3b' },
  { key: 'wolf', emoji: '🐺', from: '#8a95a6', to: '#3e4656' },
  { key: 'tiger', emoji: '🐯', from: '#ffa53d', to: '#c26b1e' },
];

// PORTRAITS first — the new default. GLYPHS remain available for backward
// compatibility (old picks) and users who want a symbol.
export const AVATARS: AvatarPreset[] = [...PORTRAITS, ...GLYPHS];

export const AVATAR_PORTRAITS = PORTRAITS;
export const AVATAR_GLYPHS = GLYPHS;

export const DEFAULT_AVATAR = PORTRAITS[0];

export function avatarFor(key: string | null | undefined): AvatarPreset {
  return AVATARS.find((a) => a.key === key) ?? DEFAULT_AVATAR;
}
