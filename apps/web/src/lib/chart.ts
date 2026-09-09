// Shared SVG path geometry for the app's little charts (Progress dashboard,
// Profile bodyweight sparkline). Callers do their own scaling and pass pixels.
export interface ChartPoint {
  x: number;
  y: number;
}

// Catmull-Rom -> cubic Bézier, so a line reads as a smooth curve instead of
// straight segments between sessions.
export function smoothPath(points: ChartPoint[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// Closes a line down to a baseline so it can be filled as an area.
export function areaPath(points: ChartPoint[], baselineY: number): string {
  if (points.length < 2) return '';
  const line = smoothPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${line} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;
}

// Maps values onto y pixels with a little headroom at both ends, so a curve
// never touches the chart edges and a flat series doesn't divide by ~0.
export function makeYScale(values: number[], top: number, bottom: number, pad = 0.25) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(max - min, Math.abs(max) * 0.08, 1);
  const domainMin = min - span * pad;
  const domainMax = max + span * pad;
  return {
    domainMin,
    domainMax,
    y: (v: number) => top + (1 - (v - domainMin) / (domainMax - domainMin)) * (bottom - top),
  };
}
