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
import { useCoarsePointer } from "@/lib/pointer";
import { useMediaQuery } from "@/lib/media";
import { readableTextColor } from "@/lib/geometry";
import type { Course } from "@/types";

const collapsedWidth = layout.leftCollapsedWidth;
const expandedWidth = Math.round(collapsedWidth * layout.leftExpandFactor);
// Narrower expansion on small / mobile screens so the panel doesn't dominate.
const narrowExpandedWidth = 170;
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
  forceLabel,
  scrollItem = false,
  onHover,
  onSelect,
}: {
  id: string;
  code: string;
  name: string;
  color: string;
  blockKey: string;
  hovered: string | null;
  /** Show the label regardless of hover (touch: sidebar expanded). */
  forceLabel: boolean;
  /** Mobile scroll-list mode: fixed-ish height block (no carousel grow). */
  scrollItem?: boolean;
  onHover: (key: string | null) => void;
  onSelect: () => void;
}) {
  const anchorRef = useAnchorRef(`course-${id}`);
  const grown = hovered === blockKey;
  const showLabel = grown || forceLabel;
  const textColor = readableTextColor(color);
  return (
    <motion.div
      ref={anchorRef}
      className="relative flex w-full cursor-pointer items-center overflow-hidden"
      // Scroll mode: grow to fill but never shrink below ~6.5rem, so the list
      // fills the panel when the courses fit and scrolls when they don't.
      style={
        scrollItem
          ? { backgroundColor: color, flexGrow: 1, flexShrink: 0, flexBasis: "6.5rem" }
          : { backgroundColor: color, flexGrow: grown ? 4 : 1, flexBasis: 0 }
      }
      animate={scrollItem ? undefined : { flexGrow: grown ? 4 : 1 }}
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
        {showLabel && (
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
      {/* Classroom Chat — the shared design studio. */}
      <motion.button
        type="button"
        className="relative w-full flex-1 cursor-pointer"
        style={{ backgroundColor: course.color }}
        onClick={(e) => {
          e.stopPropagation();
          onClassroom();
        }}
      >
        <div className="relative px-3 text-center" style={{ color: text }}>
          <div className="text-sm font-semibold tracking-wide">Classroom Chat</div>
          <div className="mt-1 text-[10px] leading-tight opacity-80">
            the shared studio
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

export default function LeftSidebar({
  onExpandedChange,
}: {
  /** Reports whether the sidebar is currently expanded (for the wordmark). */
  onExpandedChange?: (open: boolean) => void;
} = {}) {
  const reduced = useReducedMotion();
  const isTouch = useCoarsePointer();
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
  // Width follows the viewport (narrow screens), not the pointer type — so it
  // also shrinks in a narrow desktop window, not only on real touch devices.
  const narrow = useMediaQuery("(max-width: 639px)");
  const panelExpandedWidth = narrow ? narrowExpandedWidth : expandedWidth;

  // Surface the expanded state so the wordmark can hide behind it (mobile).
  useEffect(() => {
    onExpandedChange?.(expanded);
  }, [expanded, onExpandedChange]);

  // Touch has no hover: first tap expands the carousel + reveals labels,
  // second tap on a block selects it (desktop hover already expands first).
  const activate = (course: Course) => {
    if (isTouch && !expanded) {
      setLocked(true);
      return;
    }
    selectCourse(course);
  };

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

  // On a narrow screen, once expanded, drop the auto-scroll carousel for a
  // native, finger-scrollable list of all courses (so you can browse + tap).
  const scrollMode = narrow && expanded;

  return (
    <motion.div
      ref={containerRef}
      // Sits above the centered wordmark while expanded so it doesn't show
      // through the panel (notably on mobile, where the panel overlaps centre).
      className={`absolute left-0 top-0 h-full ${expanded ? "z-30" : "z-10"} ${
        scrollMode ? "overflow-y-auto" : "overflow-hidden"
      }`}
      style={{ width: collapsedWidth }}
      animate={{ width: expanded ? panelExpandedWidth : collapsedWidth }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      onHoverStart={() => {
        if (!isTouch) setHovered(true);
      }}
      onHoverEnd={() => {
        if (!isTouch) setHovered(false);
      }}
      onClick={() => setLocked(true)}
    >
      {scrollMode ? (
        <div className="flex min-h-full w-full flex-col">
          {currentCourses.map((course) => (
            <CourseBlock
              key={course.id}
              id={course.id}
              code={course.code}
              name={course.name}
              color={course.color}
              blockKey={course.id}
              hovered={hoveredBlock}
              forceLabel
              scrollItem
              onHover={() => {}}
              onSelect={() => activate(course)}
            />
          ))}
        </div>
      ) : (
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
                forceLabel={isTouch && expanded}
                onHover={(k) => {
                  if (!isTouch) setHoveredBlock(k);
                }}
                onSelect={() => activate(course)}
              />
            );
          })}
        </motion.div>
      )}

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
