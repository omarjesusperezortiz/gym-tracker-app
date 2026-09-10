// Vertical number-wheel picker used for height in onboarding. The selected
// value sits big & lime in a centre selection band; neighbours fade above and
// below. Drives a real scroll-snap list (touch + trackpad friendly) and keeps a
// hidden-labelled <input type=number> as the accessible + testable fallback so
// screen readers (and unit tests) can set the value directly.
import { useCallback, useEffect, useRef } from 'react';

const ROW = 44; // px per wheel row — must match scroll-snap math

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function WheelPicker({
  value,
  onChange,
  min,
  max,
  step = 1,
  defaultValue,
  unit,
  ariaLabel,
  formatValue,
}: {
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  unit: string;
  ariaLabel: string;
  /** Optional display formatter (e.g. cm → 5'8"); storage stays in `min` units. */
  formatValue?: (v: number) => string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const programmatic = useRef(false);
  const raf = useRef<number | null>(null);

  const count = Math.round((max - min) / step);
  const values = Array.from({ length: count + 1 }, (_, i) => Number((min + i * step).toFixed(2)));
  const parsed = value === '' ? null : Number(value);
  const active = parsed != null && !Number.isNaN(parsed) ? clamp(parsed, min, max) : null;
  const shown = active ?? defaultValue;
  const shownIndex = Math.round((shown - min) / step);

  // Keep scroll position synced when the value changes elsewhere (typing, mount).
  // On first mount the flex layout may not have a measured height yet, so retry
  // across a couple of animation frames until the container is actually
  // scrollable — otherwise the wheel stays stuck at the top instead of centering
  // on the selected value.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = shownIndex * ROW;
    let tries = 0;
    let id = 0;
    const apply = () => {
      if (!scrollRef.current) return;
      const node = scrollRef.current;
      if (Math.abs(node.scrollTop - target) < 1) return;
      // Wait until the element is actually scrollable (laid out) before setting.
      if (node.scrollHeight <= node.clientHeight && tries < 10) {
        tries += 1;
        id = requestAnimationFrame(apply);
        return;
      }
      programmatic.current = true;
      node.scrollTop = target;
      id = requestAnimationFrame(() => {
        programmatic.current = false;
      });
    };
    apply();
    return () => cancelAnimationFrame(id);
  }, [shownIndex]);

  const onScroll = useCallback(() => {
    if (programmatic.current) return;
    const el = scrollRef.current;
    if (!el) return;
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const index = clamp(Math.round(el.scrollTop / ROW), 0, count);
      const next = Number((min + index * step).toFixed(2));
      if (String(next) !== value) onChange(String(next));
    });
  }, [count, min, step, value, onChange]);

  return (
    <>
      <div className="ob-wheel">
        <div className="ob-selband" aria-hidden="true" />
        <div className="ob-wheel-scroll" ref={scrollRef} onScroll={onScroll} aria-hidden="true">
          <span className="ob-wheel-pad" style={{ height: ROW * 2 }} />
          {values.map((v, i) => {
            const sel = i === shownIndex;
            const dist = Math.abs(i - shownIndex);
            const opacity = sel ? 1 : Math.max(0.1, 0.42 - (dist - 1) * 0.1);
            return (
              <div
                key={v}
                className={`ob-wheel-n${sel ? ' sel' : ''}`}
                style={{ height: ROW, opacity: sel ? 1 : opacity }}
              >
                {formatValue ? formatValue(v) : v}
                {sel && <small>{unit}</small>}
              </div>
            );
          })}
          <span className="ob-wheel-pad" style={{ height: ROW * 2 }} />
        </div>
      </div>
      <label className="ob-typein">
        <span>Or type it</span>
        <input
          type="number"
          inputMode="numeric"
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
