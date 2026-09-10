// Horizontal ruler weight picker for onboarding — a value bubble with a pointer
// sits over a scroll-snap ruler of ticks (major marks labelled). Touch/trackpad
// friendly; keeps a labelled <input type=number> as the accessible + testable
// fallback so screen readers (and unit tests) can set the value directly.
import { useCallback, useEffect, useRef } from 'react';

const TICK = 12; // px between adjacent tick centres (2px tick + 5px*2 margin)

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function HRulerPicker({
  value,
  onChange,
  min,
  max,
  step = 0.5,
  defaultValue,
  unit,
  ariaLabel,
  majorEvery = 10,
  decimals = 1,
}: {
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  unit: string;
  ariaLabel: string;
  majorEvery?: number;
  decimals?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const programmatic = useRef(false);
  const raf = useRef<number | null>(null);

  const count = Math.round((max - min) / step);
  const parsed = value === '' ? null : Number(value);
  const active = parsed != null && !Number.isNaN(parsed) ? clamp(parsed, min, max) : null;
  const shown = active ?? defaultValue;
  const shownIndex = Math.round((shown - min) / step);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = shownIndex * TICK;
    if (Math.abs(el.scrollLeft - target) < 1) return;
    programmatic.current = true;
    el.scrollLeft = target;
    const id = requestAnimationFrame(() => {
      programmatic.current = false;
    });
    return () => cancelAnimationFrame(id);
  }, [shownIndex]);

  const onScroll = useCallback(() => {
    if (programmatic.current) return;
    const el = scrollRef.current;
    if (!el) return;
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const index = clamp(Math.round(el.scrollLeft / TICK), 0, count);
      const next = Number((min + index * step).toFixed(decimals));
      if (String(next) !== value) onChange(String(next));
    });
  }, [count, min, step, decimals, value, onChange]);

  const ticks = [];
  for (let i = 0; i <= count; i++) {
    const major = i % majorEvery === 0;
    const mid = !major && i % Math.round(majorEvery / 2) === 0;
    ticks.push(
      <span key={i} className={`ob-tick${major ? ' maj' : mid ? ' mid' : ''}`} aria-hidden="true">
        {major && <span className="ob-tick-num">{Number((min + i * step).toFixed(decimals))}</span>}
      </span>
    );
  }

  return (
    <>
      <div className="ob-wbubble">
        {shown.toFixed(decimals)}
        <small> {unit}</small>
      </div>
      <div className="ob-hruler">
        <div className="ob-hpointer" aria-hidden="true" />
        <div className="ob-hruler-scroll" ref={scrollRef} onScroll={onScroll} aria-hidden="true">
          <span className="ob-tick" style={{ visibility: 'hidden', width: '50%', margin: 0 }} />
          {ticks}
          <span className="ob-tick" style={{ visibility: 'hidden', width: '50%', margin: 0 }} />
        </div>
      </div>
      <label className="ob-typein">
        <span>Or type it</span>
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          placeholder={String(defaultValue)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={ariaLabel}
        />
      </label>
    </>
  );
}
