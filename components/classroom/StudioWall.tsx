"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion } from "motion/react";
import { clusters, studioObjects, WALL } from "@/data/classroom";
import { hexToRgba } from "@/lib/geometry";
import type { StudioObject } from "@/types";
import ArtifactCard from "@/components/classroom/ArtifactCard";
import StudioCanvas from "@/components/classroom/StudioCanvas";

/** Bounding box (padded) of a cluster's objects — drives its soft halo + label. */
function clusterBox(clusterId: string) {
  const items = studioObjects.filter((o) => o.clusterId === clusterId);
  const pad = 56;
  const minX = Math.min(...items.map((o) => o.x)) - pad;
  const minY = Math.min(...items.map((o) => o.y)) - pad;
  const maxX = Math.max(...items.map((o) => o.x + o.w)) + pad;
  const maxY = Math.max(...items.map((o) => o.y + o.h)) + pad;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/**
 * The Studio Wall — a curated, pre-arranged plane of clustered artifacts that
 * the student PANS across (drag the background; no zoom, no rearranging). Soft
 * cluster halos group related work; StudioCanvas draws the flowing connections
 * behind the cards. The wall is the heart of the Classroom.
 */
export default function StudioWall({
  countFor,
  onOpenObject,
}: {
  countFor: (id: string) => number;
  onOpenObject: (object: StudioObject) => void;
}) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [constraints, setConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

  // Center the wall in the viewport on mount/resize, and clamp pan to its edges
  // (with a little breathing margin so nothing sits flush against the frame).
  useEffect(() => {
    const recalc = () => {
      const el = containerRef.current;
      if (!el) return;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      const margin = 80;
      const left = Math.min(0, vw - WALL.width - margin);
      const top = Math.min(0, vh - WALL.height - margin);
      setConstraints({ left, right: margin, top, bottom: margin });
      // Only center on first run (when still at origin).
      if (x.get() === 0 && y.get() === 0) {
        x.set((vw - WALL.width) / 2);
        y.set((vh - WALL.height) / 2);
      }
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [x, y]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Flowing connections — fixed to the viewport, reads live (panned) rects. */}
      <StudioCanvas />

      {/* The panned plane. Dragging the background pans; cards stop propagation. */}
      <motion.div
        className="absolute left-0 top-0 cursor-grab active:cursor-grabbing"
        style={{ width: WALL.width, height: WALL.height, x, y }}
        drag
        dragConstraints={constraints}
        dragElastic={0.04}
        dragMomentum={!reduced}
      >
        {/* Cluster halos + labels (behind the cards). */}
        {clusters.map((c) => {
          const box = clusterBox(c.id);
          return (
            <div key={c.id} className="pointer-events-none absolute" style={{ left: box.x, top: box.y, width: box.w, height: box.h }}>
              <div
                className="absolute inset-0 rounded-[40%]"
                style={{
                  background: `radial-gradient(closest-side, ${hexToRgba(c.color, 0.1)}, transparent 80%)`,
                  filter: "blur(8px)",
                }}
              />
              <span
                className="absolute left-6 top-4 font-hand text-2xl italic"
                style={{ color: hexToRgba(c.color, 0.7) }}
              >
                {c.label}
              </span>
            </div>
          );
        })}

        {studioObjects.map((o) => (
          <ArtifactCard
            key={o.id}
            object={o}
            count={countFor(o.id)}
            onOpen={() => onOpenObject(o)}
          />
        ))}
      </motion.div>
    </div>
  );
}
