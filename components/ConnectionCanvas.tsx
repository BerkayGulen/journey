"use client";

import { useEffect, useRef } from "react";
import { connections, currentCourses } from "@/data/courses";
import { useAnchorElements } from "@/lib/anchors";
import {
  controlPoints,
  distanceToSegment,
  edgeFade,
  hash01,
  hexToRgba,
  leftEdgePoint,
  rightEdgePoint,
  type Point,
} from "@/lib/geometry";

const courseColor = new Map(currentCourses.map((c) => [c.id, c.color]));

// Wave + cursor tuning.
const WAVE_AMPLITUDE = 22; // px of vertical sway
const WAVE_SPEED = 0.00055; // radians per ms
const CURSOR_RADIUS = 220; // px of influence
const CURSOR_STRENGTH = 0.6; // how strongly lines bend toward the cursor
const FADE_MARGIN = 46; // px edge band for carousel crossfade

// Lines exit the top and bottom borders of each block (slightly inset so they
// sit on the border without overlapping the neighbouring block's seam).
const TOP_T = 0.04;
const BOTTOM_T = 0.96;

const TAU = Math.PI * 2;

/**
 * A stable, distinct "personality" per line so the set looks asymmetric and
 * amorphous instead of a tidy bundle of mirror-image S-curves. Each control
 * point gets its own reach, a static vertical offset, and an independently
 * phased/sped sway. Keyed by line index (connection * 2 + edge).
 */
const lineParams = Array.from({ length: connections.length * 2 }, (_, k) => ({
  amp1: WAVE_AMPLITUDE * (0.5 + hash01(k * 2 + 1) * 1.2),
  amp2: WAVE_AMPLITUDE * (0.5 + hash01(k * 2 + 2) * 1.2),
  ph1: hash01(k + 5) * TAU,
  ph2: hash01(k + 9) * TAU,
  sp1: WAVE_SPEED * (0.55 + hash01(k + 13) * 0.9),
  sp2: WAVE_SPEED * (0.55 + hash01(k + 17) * 0.9),
  // Static asymmetric resting offset — bends each curve off the clean S.
  off1: (hash01(k + 21) - 0.5) * 90,
  off2: (hash01(k + 25) - 0.5) * 90,
  // Independent horizontal reach → the curve's belly leans left or right.
  cv1: 0.4 + hash01(k + 29) * 0.38,
  cv2: 0.4 + hash01(k + 33) * 0.38,
}));

export default function ConnectionCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elements = useAnchorElements();
  const mouse = useRef<Point>({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    const draw = (time: number) => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";

      const m = mouse.current;
      const color = (id: string) => courseColor.get(id) ?? "#444";

      connections.forEach(({ courseId, historyId }, i) => {
        const sources = elements.get(`course-${courseId}`);
        const targetSet = elements.get(`history-${historyId}`);
        if (!sources || !targetSet) return;
        const targetEl = targetSet.values().next().value;
        if (!targetEl) return;
        const targetRect = targetEl.getBoundingClientRect();

        // Each course can have two copies (carousel loop) — draw both, weighted
        // by the block centre's edge fade so they crossfade across the wrap.
        for (const sourceEl of sources) {
          const rect = sourceEl.getBoundingClientRect();
          const weight = edgeFade(rect.top + rect.height / 2, H, FADE_MARGIN);
          if (weight <= 0.001) continue;

          // A line from the top border and one from the bottom border.
          for (const [bi, t] of [TOP_T, BOTTOM_T].entries()) {
            const start = rightEdgePoint(rect, t);
            const end = leftEdgePoint(targetRect, t);
            const p = lineParams[i * 2 + bi];

            // Independent sway per control point (static offset + animated),
            // so the two ends of each curve wander out of sync — amorphous.
            const wave1 =
              p.off1 + (reduced ? 0 : Math.sin(time * p.sp1 + p.ph1) * p.amp1);
            const wave2 =
              p.off2 + (reduced ? 0 : Math.sin(time * p.sp2 + p.ph2) * p.amp2);

            // Cursor proximity → bend control points toward the cursor.
            let bend = 0;
            const mid: Point = {
              x: (start.x + end.x) / 2,
              y: (start.y + end.y) / 2,
            };
            const d = distanceToSegment(m, start, end);
            if (d < CURSOR_RADIUS) {
              bend = (m.y - mid.y) * CURSOR_STRENGTH * (1 - d / CURSOR_RADIUS);
            }

            const width = Math.max(0.6, Math.min(4, rect.height / 120));
            const [cp1, cp2] = controlPoints(start, end, {
              wave1,
              wave2,
              bend,
              curviness1: p.cv1,
              curviness2: p.cv2,
            });

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
            ctx.strokeStyle = hexToRgba(color(courseId), 0.5 * weight);
            ctx.lineWidth = width;
            ctx.stroke();
          }
        }
      });

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [elements]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}
