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

export interface ControlOptions {
  /** Vertical offset (px) of the first control point (near `start`). */
  wave1?: number;
  /** Vertical offset (px) of the second control point (near `end`). */
  wave2?: number;
  /** Extra vertical pull (px) applied to both, e.g. from cursor proximity. */
  bend?: number;
  /** How far (fraction of dx) cp1 reaches toward the centre. */
  curviness1?: number;
  /** How far (fraction of dx) cp2 reaches toward the centre. */
  curviness2?: number;
}

/**
 * Control points for a cubic bezier between `start` and `end`. The two points
 * are independent (separate reach + vertical offset), so curves can be
 * asymmetric and amorphous rather than clean mirror-image S-shapes.
 */
export function controlPoints(
  start: Point,
  end: Point,
  opts: ControlOptions = {},
): [Point, Point] {
  const {
    wave1 = 0,
    wave2 = 0,
    bend = 0,
    curviness1 = 0.58,
    curviness2 = 0.58,
  } = opts;
  const dx = end.x - start.x;
  const cp1: Point = { x: start.x + dx * curviness1, y: start.y + wave1 + bend };
  const cp2: Point = { x: end.x - dx * curviness2, y: end.y + wave2 + bend };
  return [cp1, cp2];
}

/**
 * Deterministic pseudo-random value in [0, 1) from an integer seed. Used to
 * give each line a stable, distinct shape (no per-frame flicker, no Math.random).
 */
export function hash01(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
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
