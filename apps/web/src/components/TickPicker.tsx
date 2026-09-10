// A horizontally-scrolling tick strip with a fixed centre indicator — the shared
// engine behind RulerPicker (height) and ScalePicker (weight). Touch + mouse
// friendly (native scroll + scroll-snap), keyboard-accessible via role="slider"
// with arrow-key support, and it always keeps a real <input type=number> as an
// accessible fallback so screen readers (and tests) can set the value directly.
import { useCallback, useEffect, useRef } from 'react';

export interface TickPickerProps {
  /** Current committed value as a string (shares onboarding draft state). */
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  /** Distance between adjacent ticks in real units (e.g. 1cm, 0.5kg). */
  step: number;
  /** Where the strip centres when no value is set yet (nothing is committed). */
  defaultValue: number;
  unit: string;
  ariaLabel: string;
  /** Every Nth tick is a tall "major" mark, labelled with its value. */
  majorEvery?: number;
  /** Decimal places for the big display + committed value. */
  decimals?: number;
}

const TICK_PX = 12;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function TickPicker({
  value,
  onChange,
  min,
  max,
  step,
  defaultValue,
  unit,
  ariaLabel,
  majorEvery = 5,
  decimals = 0,
}: TickPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Guards a programmatic scroll (from a value change) so it doesn't echo back
  // through the scroll handler and fight the user / cause a feedback loop.
  const programmatic = useRef(false);
  const raf = useRef<number | null>(null);

  const count = Math.round((max - min) / step);
  const parsed = value === '' ? null : Number(value);
  const active = parsed != null && !Number.isNaN(parsed) ? clamp(parsed, min, max) : null;
  // The strip is always positioned somewhere; fall back to the default centre
  // when nothing is committed yet, without committing that default.
  const shown = active ?? defaultValue;
  const shownIndex = Math.round((shown - min) / step);

  const indexToValue = useCallback(
    (index: number) => Number((min + clamp(index, 0, count) * step).toFixed(decimals)),
    [min, step, count, decimals]
  );

  // Keep the strip's scroll position in sync when the value changes from
  // elsewhere (typing in the input, arrow keys, initial mount).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = shownIndex * TICK_PX;
    if (Math.abs(el.scrollLeft - target) < 1) return;
    programmatic.current = true;
    el.scrollLeft = target;
    // Release the guard on the next frame, after the scroll settles.
    const id = requestAnimationFrame(() => {
      programmatic.current = false;
    });
    return () => cancelAnimationFrame(id);
  }, [shownIndex]);

  function onScroll() {
    if (programmatic.current) return;
    const el = scrollRef.current;
    if (!el) return;
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const index = Math.round(el.scrollLeft / TICK_PX);
      const next = indexToValue(index);
      if (String(next) !== value) onChange(String(next));
    });
  }

  function nudge(deltaSteps: number) {
    const base = active ?? defaultValue;
    const next = clamp(Number((base + deltaSteps * step).toFixed(decimals)), min, max);
    onChange(String(next));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      nudge(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      nudge(-1);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      nudge(majorEvery);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      nudge(-majorEvery);
    }
  }

  // Render major ticks only as spaced anchors; minor ticks fill between. Keeping
  // the DOM to one node per tick is fine for a few hundred marks.
  const ticks = [];
  for (let i = 0; i <= count; i++) {
    const major = i % majorEvery === 0;
    ticks.push(
      <span key={i} className={`tick${major ? ' major' : ''}`} aria-hidden="true">
        {major && <span className="tick-num">{indexToValue(i)}</span>}
      </span>
    );
  }

  return (
    <div className="tickpicker">
      <div className="tickpicker-val">
        <span className={`tickpicker-num${active == null ? ' placeholder' : ''}`}>
          {shown.toFixed(decimals)}
        </span>
        <span className="tickpicker-unit">{unit}</span>
      </div>
      <div
        className="tickpicker-strip"
        ref={scrollRef}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        role="slider"
        tabIndex={0}
        aria-label={`${ariaLabel} — drag or use arrow keys`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={active ?? undefined}
        aria-valuetext={active != null ? `${active.toFixed(decimals)} ${unit}` : undefined}
      >
        <span className="tickpicker-pad" aria-hidden="true" />
        {ticks}
        <span className="tickpicker-pad" aria-hidden="true" />
        <span className="tickpicker-center" aria-hidden="true" />
      </div>
      <label className="tickpicker-input">
        <span className="tickpicker-input-lbl">Or type it</span>
        <input
          type="number"
          inputMode="decimal"
          step={step}
          placeholder={String(defaultValue)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={ariaLabel}
        />
      </label>
    </div>
  );
}
