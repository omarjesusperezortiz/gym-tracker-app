import { avatarFor, AVATARS } from '@gym-tracker/core';
import '../styles/avatar.css';

// Small circular avatar tile (emoji on a gradient). Used in the Home header and
// the Profile picker.
export function Avatar({ avatarKey, size = 44 }: { avatarKey: string | null | undefined; size?: number }) {
  const a = avatarFor(avatarKey);
  return (
    <span
      className="avatar"
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

// Grid picker: tap a preset to choose it.
export function AvatarPicker({
  value,
  onPick,
}: {
  value: string | null | undefined;
  onPick: (key: string) => void;
}) {
  return (
    <div className="avatar-grid">
      {AVATARS.map((a) => (
        <button
          key={a.key}
          className={`avatar-opt${value === a.key ? ' on' : ''}`}
          onClick={() => onPick(a.key)}
          aria-label={`Avatar ${a.key}`}
          aria-pressed={value === a.key}
        >
          <span
            className="avatar"
            style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
          >
            {a.emoji}
          </span>
        </button>
      ))}
    </div>
  );
}
