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

/** Pick a legible text color (near-black or white) for a given background hex. */
export function readableTextColor(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1a1a1a" : "#ffffff";
}

/**
 * Darken a hex color by lowering its lightness by `amount` (0..1). Used to give
 * the Classroom half of the course split a deeper variant of the course color
 * (collective learning) vs. the Private half (the original color).
 */
export function darken(hex: string, amount = 0.18): string {
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, l - amount));
}

/** Parse a hex color into HSL (h in [0,360), s/l in [0,1]). */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

/** Build a hex color from HSL (h in [0,360), s/l in [0,1]). */
function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to2 = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

/**
 * Derive the AI's "ink" color from the student's (selected course) color by
 * rotating the hue, so the AI blob is always distinct from the student blob
 * regardless of which course was chosen. Kept a touch deeper/saturated so it
 * reads as a second voice rather than a tint of the first.
 */
export function aiInk(hex: string, hueShift = 175): string {
  const { h, s, l } = hexToHsl(hex);
  const nh = (h + hueShift) % 360;
  const ns = Math.min(1, Math.max(0.45, s));
  const nl = Math.min(0.6, Math.max(0.32, l * 0.85));
  return hslToHex(nh, ns, nl);
}
