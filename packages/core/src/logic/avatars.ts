// Avatar presets — emoji + gradient color, chosen in Profile and shown in the
// Home header. Kept as a small fixed set (no uploads / storage): the pref stores
// just the key. Framework-agnostic so both web and mobile can render them.

export interface AvatarPreset {
  key: string;
  emoji: string;
  /** CSS gradient (two stops) for the tile background. */
  from: string;
  to: string;
}

export const AVATARS: AvatarPreset[] = [
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

export const DEFAULT_AVATAR = AVATARS[0];

export function avatarFor(key: string | null | undefined): AvatarPreset {
  return AVATARS.find((a) => a.key === key) ?? DEFAULT_AVATAR;
}
