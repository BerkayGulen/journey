"use client";

import { useEffect, useRef } from "react";
import { studioConnections, studioObjects } from "@/data/classroom";
import { useAnchorElements } from "@/lib/anchors";
import {
  controlPoints,
  distanceToSegment,
  hash01,
  hexToRgba,
  type Point,
} from "@/lib/geometry";

/**
 * The Studio Wall's flowing-line layer — Journey's connection canvas adapted for
 * the spatial studio. It reads the live `getBoundingClientRect()` of each
 * artifact (registered under `studio-{id}`) every frame and draws an organic
 * bezier between related objects. Because the artifacts live inside the panned
 * plane, their viewport rects already include the pan transform — so the lines
 * track the wall as it moves, with no pan math here (same idea as the welcome
 * canvas tracking the sidebars).
 */
const objectColor = new Map(studioObjects.map((o) => [o.id, o.color]));

const WAVE_AMPLITUDE = 16; // px of sway (calmer than the welcome fan)
const WAVE_SPEED = 0.0004; // radians per ms
const CURSOR_RADIUS = 200;
const CURSOR_STRENGTH = 0.5;
const TAU = Math.PI * 2;

// Per-line personality (stable, no per-frame flicker), keyed by connection index.
const lineParams = Array.from({ length: studioConnections.length }, (_, k) => ({
  amp1: WAVE_AMPLITUDE * (0.5 + hash01(k * 2 + 1) * 1.1),
  amp2: WAVE_AMPLITUDE * (0.5 + hash01(k * 2 + 2) * 1.1),
  ph1: hash01(k + 5) * TAU,
  ph2: hash01(k + 9) * TAU,
  sp1: WAVE_SPEED * (0.55 + hash01(k + 13) * 0.9),
  sp2: WAVE_SPEED * (0.55 + hash01(k + 17) * 0.9),
  off1: (hash01(k + 21) - 0.5) * 64,
  off2: (hash01(k + 25) - 0.5) * 64,
  cv1: 0.4 + hash01(k + 29) * 0.34,
  cv2: 0.4 + hash01(k + 33) * 0.34,
}));

/** Midpoint of the rect edge facing `toward` (so lines leave the near side). */
function facingEdge(rect: DOMRect, towardX: number): Point {
  const cy = rect.top + rect.height / 2;
  return towardX >= rect.left + rect.width / 2
    ? { x: rect.right, y: cy }
    : { x: rect.left, y: cy };
}

export default function StudioCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elements = useAnchorElements();
  const mouse = useRef<Point>({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

      studioConnections.forEach(({ fromId, toId }, i) => {
        const fromSet = elements.get(`studio-${fromId}`);
        const toSet = elements.get(`studio-${toId}`);
        const fromEl = fromSet?.values().next().value;
        const toEl = toSet?.values().next().value;
        if (!fromEl || !toEl) return;

        const a = fromEl.getBoundingClientRect();
        const b = toEl.getBoundingClientRect();
        const start = facingEdge(a, b.left + b.width / 2);
        const end = facingEdge(b, a.left + a.width / 2);
        const p = lineParams[i];

        const wave1 = p.off1 + (reduced ? 0 : Math.sin(time * p.sp1 + p.ph1) * p.amp1);
        const wave2 = p.off2 + (reduced ? 0 : Math.sin(time * p.sp2 + p.ph2) * p.amp2);

        let bend = 0;
        const mid: Point = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
        const d = distanceToSegment(m, start, end);
        if (d < CURSOR_RADIUS) {
          bend = (m.y - mid.y) * CURSOR_STRENGTH * (1 - d / CURSOR_RADIUS);
        }

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
        ctx.strokeStyle = hexToRgba(objectColor.get(fromId) ?? "#888", 0.4);
        ctx.lineWidth = 1.6;
        ctx.stroke();
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
    <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden />
  );
}
