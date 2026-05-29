/** Geometry helpers for the organic connecting lines. */

export interface Point {
  x: number;
  y: number;
}

/**
 * A point on an element's right edge, in viewport (CSS px) coordinates.
 * `t` runs 0 (top border) → 1 (bottom border).
 */
export function rightEdgePoint(rect: DOMRect, t: number): Point {
  return { x: rect.right, y: rect.top + rect.height * t };
}

/**
 * A point on an element's left edge, in viewport (CSS px) coordinates.
 * `t` runs 0 (top border) → 1 (bottom border).
 */
export function leftEdgePoint(rect: DOMRect, t: number): Point {
  return { x: rect.left, y: rect.top + rect.height * t };
}

/**
 * Control points for a cubic bezier between `start` and `end`.
 *
 * @param wave   vertical offset (px) applied to the control points to create a
 *               soft S-shaped sway. Pass a time-varying value for animation.
 * @param bend   extra vertical pull (px) applied near the curve's middle, e.g.
 *               from cursor proximity. Positive bends downward.
 * @param curviness  how far (fraction of dx) the control points reach toward
 *               the centre. Higher → flatter starts and a deeper S-curve.
 */
export function controlPoints(
  start: Point,
  end: Point,
  wave = 0,
  bend = 0,
  curviness = 0.58,
): [Point, Point] {
  const dx = end.x - start.x;
  // Push control points horizontally toward (and slightly past) the centre so
  // the curve eases out of each edge, then sweeps through a pronounced S.
  const cp1: Point = { x: start.x + dx * curviness, y: start.y + wave + bend };
  const cp2: Point = { x: end.x - dx * curviness, y: end.y - wave + bend };
  return [cp1, cp2];
}

/**
 * Approximate the closest distance from a point to the straight chord between
 * `start` and `end`. Cheap stand-in for true bezier distance — good enough to
 * drive cursor-proximity effects.
 */
export function distanceToSegment(p: Point, start: Point, end: Point): number {
  const vx = end.x - start.x;
  const vy = end.y - start.y;
  const len2 = vx * vx + vy * vy;
  if (len2 === 0) return Math.hypot(p.x - start.x, p.y - start.y);
  let t = ((p.x - start.x) * vx + (p.y - start.y) * vy) / len2;
  t = Math.max(0, Math.min(1, t));
  const projX = start.x + t * vx;
  const projY = start.y + t * vy;
  return Math.hypot(p.x - projX, p.y - projY);
}

/**
 * Visibility weight (0..1) for an anchor near the viewport's top/bottom edges.
 * Used to crossfade the two copies of each course block as the infinite
 * carousel wraps, so lines flow in/out instead of jumping.
 */
export function edgeFade(y: number, height: number, margin: number): number {
  if (y < margin) return Math.max(0, y / margin);
  if (y > height - margin) return Math.max(0, (height - y) / margin);
  return 1;
}

/** Convert a hex color to an rgba() string with the given alpha. */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
