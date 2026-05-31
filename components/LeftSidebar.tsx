"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { currentCourses, layout } from "@/data/courses";
import { useAnchorRef } from "@/lib/anchors";
import { PRIVATE_PORTAL_LAYOUT_ID, useJourney } from "@/lib/journey-state";
import { readableTextColor } from "@/lib/geometry";
import type { Course } from "@/types";

const collapsedWidth = layout.leftCollapsedWidth;
const expandedWidth = Math.round(collapsedWidth * layout.leftExpandFactor);
const LOOP_DURATION_MS = 45_000; // time for one full vertical loop

// Render each course twice so the strip can scroll seamlessly.
const loopCourses = [...currentCourses, ...currentCourses];

function CourseBlock({
  id,
  code,
  name,
  color,
  blockKey,
  hovered,
  onHover,
  onSelect,
}: {
  id: string;
  code: string;
  name: string;
  color: string;
  blockKey: string;
  hovered: string | null;
  onHover: (key: string | null) => void;
  onSelect: () => void;
}) {
  const anchorRef = useAnchorRef(`course-${id}`);
  const grown = hovered === blockKey;
  const textColor = readableTextColor(color);
  return (
    <motion.div
      ref={anchorRef}
      className="relative flex w-full cursor-pointer items-center overflow-hidden"
      style={{ backgroundColor: color, flexGrow: grown ? 4 : 1, flexBasis: 0 }}
      animate={{ flexGrow: grown ? 4 : 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 28 }}
      onHoverStart={() => onHover(blockKey)}
      onHoverEnd={() => onHover(null)}
      onClick={(e) => {
        // Select this course (don't bubble to the sidebar lock handler).
        e.stopPropagation();
        onSelect();
      }}
    >
      <AnimatePresence>
        {grown && (
          <motion.div
            className="px-3"
            style={{ color: textColor }}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="text-base font-semibold tracking-wide whitespace-nowrap">
              {code}
            </div>
            <div className="mt-0.5 text-[11px] leading-tight opacity-80">
              {name}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Overlay shown while a course is selected: the block expands to fill the
 * sidebar and splits, with a dividing line in the middle, into two choices —
 * Classroom Chat (stub for now) and Private Chat (enters the workspace).
 * Rendered as a single overlay (not per carousel copy) so the Private half can
 * carry a unique `layoutId` and morph cleanly into the workspace.
 */
function SplitPanel({
  course,
  onClassroom,
  onPrivate,
}: {
  course: Course;
  onClassroom: () => void;
  onPrivate: () => void;
}) {
  const reduced = useReducedMotion();
  const text = readableTextColor(course.color);
  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Classroom Chat — visible but a stub ("defined later"). */}
      <motion.button
        type="button"
        className="relative w-full flex-1 cursor-default"
        style={{ backgroundColor: course.color }}
        onClick={(e) => {
          e.stopPropagation();
          onClassroom();
        }}
      >
        {/* Scrim so it reads as the inactive / not-yet half. */}
        <div className="absolute inset-0 bg-black/35" aria-hidden />
        <div className="relative px-3 text-center" style={{ color: text }}>
          <div className="text-sm font-semibold tracking-wide">Classroom Chat</div>
          <div className="mt-1 text-[10px] tracking-[0.2em] uppercase opacity-70">
            soon
          </div>
        </div>
      </motion.button>

      {/* The dividing line in the middle. */}
      <motion.div
        className="h-px w-full origin-center bg-white/60"
        initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: reduced ? 0 : 0.12, duration: reduced ? 0 : 0.3, ease: "easeOut" }}
      />

      {/* Private Chat — the prototyped flow. Carries the morph layoutId. */}
      <motion.button
        type="button"
        layoutId={PRIVATE_PORTAL_LAYOUT_ID}
        className="relative w-full flex-1 cursor-pointer"
        style={{ backgroundColor: course.color }}
        onClick={(e) => {
          e.stopPropagation();
          onPrivate();
        }}
      >
        <div className="relative px-3 text-center" style={{ color: text }}>
          <div className="text-sm font-semibold tracking-wide">Private Chat</div>
          <div className="mt-1 text-[10px] leading-tight opacity-80">
            your own thinking space
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

export default function LeftSidebar() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const { phase, selectedCourse, selectCourse, choosePrivate, chooseClassroom, cancelSplit } =
    useJourney();
  const splitting = phase === "splitting" && selectedCourse !== null;

  const [hovered, setHovered] = useState(false);
  const [locked, setLocked] = useState(false);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  // While splitting, the sidebar stays expanded regardless of hover/lock.
  const expanded = hovered || locked || splitting;

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

  // While splitting, an outside click cancels the choice (back to welcome).
  useEffect(() => {
    if (!splitting) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        cancelSplit();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [splitting, cancelSplit]);

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
              code={course.code}
              name={course.name}
              color={course.color}
              blockKey={blockKey}
              hovered={hoveredBlock}
              onHover={setHoveredBlock}
              onSelect={() => selectCourse(course)}
            />
          );
        })}
      </motion.div>

      <AnimatePresence>
        {splitting && selectedCourse && (
          <SplitPanel
            course={selectedCourse}
            onClassroom={chooseClassroom}
            onPrivate={choosePrivate}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
