"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { currentCourses, layout } from "@/data/courses";
import { useAnchorRef } from "@/lib/anchors";

const collapsedWidth = layout.leftCollapsedWidth;
const expandedWidth = Math.round(collapsedWidth * layout.leftExpandFactor);
const LOOP_DURATION_MS = 45_000; // time for one full vertical loop

// Render each course twice so the strip can scroll seamlessly.
const loopCourses = [...currentCourses, ...currentCourses];

function CourseBlock({
  id,
  color,
  blockKey,
  hovered,
  onHover,
}: {
  id: string;
  color: string;
  blockKey: string;
  hovered: string | null;
  onHover: (key: string | null) => void;
}) {
  const anchorRef = useAnchorRef(`course-${id}`);
  const grown = hovered === blockKey;
  return (
    <motion.div
      ref={anchorRef}
      className="w-full"
      style={{ backgroundColor: color, flexGrow: grown ? 4 : 1, flexBasis: 0 }}
      animate={{ flexGrow: grown ? 4 : 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 28 }}
      onHoverStart={() => onHover(blockKey)}
      onHoverEnd={() => onHover(null)}
      aria-hidden
    />
  );
}

export default function LeftSidebar() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const [hovered, setHovered] = useState(false);
  const [locked, setLocked] = useState(false);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const expanded = hovered || locked;

  // Continuous vertical scroll, eased to a stop while the sidebar is active.
  const y = useMotionValue(0);
  const speed = useRef(0);
  useAnimationFrame((_t, delta) => {
    const half = (stripRef.current?.clientHeight ?? 0) / 2;
    if (half <= 0) return;
    const base = reduced ? 0 : half / LOOP_DURATION_MS;
    const target = expanded ? 0 : base; // pause while interacting
    speed.current += (target - speed.current) * Math.min(1, delta / 280);
    let next = y.get() - speed.current * delta;
    if (next <= -half) next += half;
    if (next > 0) next -= half;
    y.set(next);
  });

  // Click locks the sidebar open; clicking outside collapses it.
  useEffect(() => {
    if (!locked) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setLocked(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [locked]);

  return (
    <motion.div
      ref={containerRef}
      className="absolute left-0 top-0 z-10 h-full overflow-hidden"
      style={{ width: collapsedWidth }}
      animate={{ width: expanded ? expandedWidth : collapsedWidth }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => setLocked(true)}
    >
      <motion.div
        ref={stripRef}
        className="flex w-full flex-col"
        style={{ height: "200%", y }}
      >
        {loopCourses.map((course, i) => {
          const blockKey = `${course.id}-${i}`;
          return (
            <CourseBlock
              key={blockKey}
              id={course.id}
              color={course.color}
              blockKey={blockKey}
              hovered={hoveredBlock}
              onHover={setHoveredBlock}
            />
          );
        })}
      </motion.div>
    </motion.div>
  );
}
