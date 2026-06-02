"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { layout } from "@/data/courses";
import { semesters } from "@/data/semesters";
import { useAnchorRef } from "@/lib/anchors";
import { useJourney } from "@/lib/journey-state";
import { useCoarsePointer } from "@/lib/pointer";
import { useMediaQuery } from "@/lib/media";
import { readableTextColor } from "@/lib/geometry";
import type { Semester } from "@/types";

const collapsedWidth = layout.rightCollapsedWidth;
// Wider than the slim desktop strip so labels fit on small / mobile screens.
const narrowExpandedWidth = 170;

/**
 * One semester block in the spine. Active (completed) semesters are full color,
 * clickable, and reveal their label on hover; locked ones are muted, show
 * "Locked", and cannot be clicked.
 */
function SemesterStrip({
  semester,
  hovered,
  forceLabel,
  onHover,
  onActivate,
}: {
  semester: Semester;
  hovered: boolean;
  /** Show the label regardless of hover (touch: panel expanded). */
  forceLabel: boolean;
  onHover: (id: string | null) => void;
  onActivate: (semester: Semester) => void;
}) {
  const anchorRef = useAnchorRef(`history-${semester.id}`);
  const reduced = useReducedMotion();
  const active = semester.active;
  const textColor = readableTextColor(semester.color);
  const label = active ? semester.label : "Locked";
  const showLabel = hovered || forceLabel;

  return (
    <motion.div
      ref={anchorRef}
      className="relative flex w-full items-center overflow-hidden"
      style={{
        backgroundColor: semester.color,
        opacity: active ? 1 : 0.35,
        cursor: active ? "pointer" : "not-allowed",
        flexBasis: 0,
      }}
      animate={{ flexGrow: hovered ? 4 : 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 28 }}
      onHoverStart={() => onHover(semester.id)}
      onHoverEnd={() => onHover(null)}
      onClick={() => onActivate(semester)}
    >
      <AnimatePresence>
        {showLabel && (
          <motion.div
            className="px-3 whitespace-nowrap"
            style={{ color: textColor }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="text-sm font-semibold tracking-wide">{label}</div>
            {active && (
              <div className="mt-0.5 text-[11px] leading-tight opacity-70">
                {semester.courses.length} courses
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Right sidebar — the student's academic history as eight semester blocks in a
 * shorter, bottom-anchored panel. Mirrors the left sidebar's interaction:
 * collapsed it shows thin color strips; on hover the panel widens and the
 * hovered block grows to reveal its label.
 */
export default function RightSidebar({
  onExpandedChange,
}: {
  /** Reports whether the sidebar is currently expanded (for the wordmark). */
  onExpandedChange?: (open: boolean) => void;
} = {}) {
  const isTouch = useCoarsePointer();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [locked, setLocked] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { openHistory } = useJourney();

  // Hover expands on desktop; a tap locks it open on touch.
  const expanded = hovered || locked;
  // Width follows the viewport (narrow screens), not the pointer type.
  const narrow = useMediaQuery("(max-width: 639px)");
  const expandedWidth = narrow ? narrowExpandedWidth : layout.rightExpandedWidth;

  // Surface the expanded state so the wordmark can hide behind it (mobile).
  useEffect(() => {
    onExpandedChange?.(expanded);
  }, [expanded, onExpandedChange]);

  // On touch, tapping outside the panel collapses it again.
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

  // Touch has no hover: first tap reveals the labels, second tap acts.
  const activate = (semester: Semester) => {
    if (isTouch && !expanded) {
      setLocked(true);
      return;
    }
    if (semester.active) openHistory(semester);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`absolute right-0 bottom-0 flex flex-col ${expanded ? "z-30" : "z-10"}`}
      style={{ width: collapsedWidth, height: `${layout.rightHeightRatio * 100}%` }}
      animate={{ width: expanded ? expandedWidth : collapsedWidth }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      onHoverStart={() => {
        if (!isTouch) setHovered(true);
      }}
      onHoverEnd={() => {
        if (isTouch) return;
        setHovered(false);
        setHoveredId(null);
      }}
    >
      {semesters.map((semester) => (
        <SemesterStrip
          key={semester.id}
          semester={semester}
          hovered={hoveredId === semester.id}
          forceLabel={isTouch && expanded}
          onHover={(id) => {
            if (!isTouch) setHoveredId(id);
          }}
          onActivate={activate}
        />
      ))}
    </motion.div>
  );
}
