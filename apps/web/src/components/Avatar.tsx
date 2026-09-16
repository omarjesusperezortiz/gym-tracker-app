import { avatarFor, AVATAR_PORTRAITS, AVATAR_GLYPHS, type AvatarPreset } from '@gym-tracker/core';
import '../styles/avatar.css';

const PORTRAIT_BASE = `${import.meta.env.BASE_URL}avatars/`;

function portraitSrc(key: string): string {
  return `${PORTRAIT_BASE}portrait-${key}.svg`;
}

// Small circular avatar tile. Shows an illustrated portrait for portrait-type
// presets; an emoji-on-gradient tile for symbol presets. Used in the Home
// header and the Profile picker.
export function Avatar({ avatarKey, size = 44 }: { avatarKey: string | null | undefined; size?: number }) {
  const a = avatarFor(avatarKey);
  if (a.portrait) {
    return (
      <span
        className="avatar avatar-portrait"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <img src={portraitSrc(a.key)} alt="" loading="lazy" />
      </span>
    );
  }
  return (
    <span
      className="avatar avatar-glyph"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${a.from}, ${a.to})`,
        fontSize: size * 0.5,
      }}
      aria-hidden="true"
    >
      {a.emoji}
    </span>
  );
}

function AvatarOption({ preset, value, onPick }: { preset: AvatarPreset; value: string | null | undefined; onPick: (key: string) => void }) {
  const selected = value === preset.key;
  return (
    <button
      key={preset.key}
      className={`avatar-opt${selected ? ' on' : ''}`}
      onClick={() => onPick(preset.key)}
      aria-label={`Avatar ${preset.key}`}
      aria-pressed={selected}
    >
      {preset.portrait ? (
        <span className="avatar avatar-portrait">
          <img src={portraitSrc(preset.key)} alt="" loading="lazy" />
        </span>
      ) : (
        <span
          className="avatar avatar-glyph"
          style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
        >
          {preset.emoji}
        </span>
      )}
    </button>
  );
}

// Portrait + symbol picker. Portraits are the recommended default (illustrated
// characters); symbols remain as a secondary option.
export function AvatarPicker({
  value,
  onPick,
}: {
  value: string | null | undefined;
  onPick: (key: string) => void;
}) {
  return (
    <div className="avatar-picker">
      <div className="avatar-picker-label">Portraits</div>
      <div className="avatar-grid">
        {AVATAR_PORTRAITS.map((a) => (
          <AvatarOption key={a.key} preset={a} value={value} onPick={onPick} />
        ))}
      </div>
      <div className="avatar-picker-label">Symbols</div>
      <div className="avatar-grid">
        {AVATAR_GLYPHS.map((a) => (
          <AvatarOption key={a.key} preset={a} value={value} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}
