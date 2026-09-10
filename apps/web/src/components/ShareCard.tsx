// Self-contained "Share" affordance for the weekly recap. Hand-draws a branded
// dark + lime summary card straight onto a <canvas> (no html2canvas / heavy
// deps), then tries the Web Share API with the PNG file and falls back to a
// plain download. Every browser API used is feature-detected.
import { useCallback, useState } from 'react';
import type { WeeklyRecap } from '../lib/recap';
import { formatVolume } from '../lib/recap';

interface ShareCardProps {
  recap: WeeklyRecap;
  /** e.g. "Jan 5 – Jan 11" — drawn as the card subtitle. */
  weekLabel: string;
}

// Brand tokens, mirrored from styles.css so the image matches the app.
const INK = '#0a0b0e';
const LIME = '#c6f24e';
const SURF = '#16181d';
const TEXT = '#f5f7fa';
const MUTED = '#8b90a0';
const LINE = 'rgba(255,255,255,0.11)';

// Draw a rounded rectangle path.
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Render the recap onto a freshly-created canvas and return it. Uses a 2×
// device scale for crisp text. Kept pure/DOM-free beyond the canvas itself.
export function drawRecapCanvas(recap: WeeklyRecap, weekLabel: string): HTMLCanvasElement {
  const W = 540;
  const H = 675;
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // Background.
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, 'rgba(198,242,78,0.10)');
  grad.addColorStop(0.5, 'rgba(198,242,78,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const pad = 40;

  // Header: lime dot + wordmark.
  ctx.fillStyle = LIME;
  ctx.beginPath();
  ctx.arc(pad + 7, 56, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = TEXT;
  ctx.font = '700 20px Inter, system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('Weekly Recap', pad + 24, 57);

  ctx.fillStyle = MUTED;
  ctx.font = '500 14px Inter, system-ui, sans-serif';
  ctx.fillText(weekLabel, pad, 92);

  // Hero: workouts count.
  ctx.fillStyle = LIME;
  ctx.font = '800 92px Inter, system-ui, sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(String(recap.workouts), pad, 200);
  ctx.fillStyle = MUTED;
  ctx.font = '600 16px Inter, system-ui, sans-serif';
  ctx.fillText(recap.workouts === 1 ? 'workout' : 'workouts', pad, 232);

  // Stat tiles (2×2 grid): volume, sets, streak, PRs.
  const tiles: [string, string][] = [
    [formatVolume(recap.volumeKg), 'volume lifted'],
    [String(recap.sets), 'sets logged'],
    [`${recap.streak}🔥`, 'day streak'],
    [String(recap.prs.length), recap.prs.length === 1 ? 'new PR' : 'new PRs'],
  ];
  const gap = 16;
  const tileW = (W - pad * 2 - gap) / 2;
  const tileH = 96;
  const gridTop = 268;
  tiles.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const tx = pad + col * (tileW + gap);
    const ty = gridTop + row * (tileH + gap);
    ctx.fillStyle = SURF;
    roundRect(ctx, tx, ty, tileW, tileH, 16);
    ctx.fill();
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    roundRect(ctx, tx, ty, tileW, tileH, 16);
    ctx.stroke();
    ctx.fillStyle = TEXT;
    ctx.font = '700 30px Inter, system-ui, sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(t[0], tx + 18, ty + 50);
    ctx.fillStyle = MUTED;
    ctx.font = '500 13px Inter, system-ui, sans-serif';
    ctx.fillText(t[1], tx + 18, ty + 74);
  });

  // PR highlight strip.
  const stripY = gridTop + 2 * tileH + gap + 24;
  ctx.fillStyle = MUTED;
  ctx.font = '600 12px Inter, system-ui, sans-serif';
  ctx.fillText(recap.prs.length ? 'NEW PERSONAL RECORDS' : 'KEEP IT GOING', pad, stripY);
  if (recap.prs.length) {
    const top = recap.prs.slice(0, 2);
    top.forEach((pr, i) => {
      const y = stripY + 24 + i * 34;
      ctx.fillStyle = LIME;
      ctx.font = '700 16px "JetBrains Mono", ui-monospace, monospace';
      const wtxt = `${pr.weight}kg`;
      ctx.fillText(wtxt, pad, y);
      ctx.fillStyle = TEXT;
      ctx.font = '500 15px Inter, system-ui, sans-serif';
      ctx.fillText(pr.slot, pad + 72, y);
    });
  } else {
    ctx.fillStyle = TEXT;
    ctx.font = '500 15px Inter, system-ui, sans-serif';
    ctx.fillText('Consistency compounds — book the next session.', pad, stripY + 26);
  }

  // Footer wordmark.
  ctx.fillStyle = MUTED;
  ctx.font = '500 12px Inter, system-ui, sans-serif';
  ctx.fillText('Tracked with Gym Tracker', pad, H - 30);

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (typeof canvas.toBlob === 'function') {
      canvas.toBlob((b) => resolve(b), 'image/png');
    } else {
      resolve(null);
    }
  });
}

export function ShareCard({ recap, weekLabel }: ShareCardProps) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const onShare = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      const canvas = drawRecapCanvas(recap, weekLabel);
      const blob = await canvasToBlob(canvas);
      if (!blob) {
        setNote('Could not render image');
        return;
      }
      const file = new File([blob], 'weekly-recap.png', { type: 'image/png' });

      // Prefer native share sheet with the file when supported.
      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
        share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
      };
      if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: 'Weekly Recap', text: 'My training week 💪' });
          return;
        } catch (err) {
          // User cancelled the share sheet — not an error worth surfacing.
          if (err instanceof DOMException && err.name === 'AbortError') return;
        }
      }

      // Fallback: download the PNG.
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'weekly-recap.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setNote('Saved image');
    } catch {
      setNote('Share failed');
    } finally {
      setBusy(false);
    }
  }, [busy, recap, weekLabel]);

  return (
    <button className="recap-share" onClick={onShare} disabled={busy} aria-label="Share weekly recap">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
        <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
      </svg>
      {busy ? 'Preparing…' : note ?? 'Share'}
    </button>
  );
}
