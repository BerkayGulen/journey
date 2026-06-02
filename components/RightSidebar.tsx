"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { layout } from "@/data/courses";
import { semesters } from "@/data/semesters";
import { useAnchorRef } from "@/lib/anchors";
import { useJourney } from "@/lib/journey-state";
import { readableTextColor } from "@/lib/geometry";
import type { Semester } from "@/types";

const collapsedWidth = layout.rightCollapsedWidth;
const expandedWidth = layout.rightExpandedWidth;

/**
 * One semester block in the spine. Active (completed) semesters are full color,
 * clickable, and reveal their label on hover; locked ones are muted, show
 * "Locked", and cannot be clicked.
 */
function SemesterStrip({
  semester,
  hovered,
  onHover,
  onOpen,
}: {
  semester: Semester;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onOpen: (semester: Semester) => void;
}) {
  const anchorRef = useAnchorRef(`history-${semester.id}`);
  const reduced = useReducedMotion();
  const active = semester.active;
  const textColor = readableTextColor(semester.color);
  const label = active ? semester.label : "Locked";

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
      onClick={() => {
        if (active) onOpen(semester);
      }}
    >
      <AnimatePresence>
        {hovered && (
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
export default function RightSidebar() {
  const [expanded, setExpanded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { openHistory } = useJourney();

  return (
    <motion.div
      className="absolute right-0 bottom-0 z-10 flex flex-col"
      style={{ width: collapsedWidth, height: `${layout.rightHeightRatio * 100}%` }}
      animate={{ width: expanded ? expandedWidth : collapsedWidth }}
      transition={{ type: "spring", stiffness: 260, damping: 32 }}
      onHoverStart={() => setExpanded(true)}
      onHoverEnd={() => {
        setExpanded(false);
        setHoveredId(null);
      }}
    >
      {semesters.map((semester) => (
        <SemesterStrip
          key={semester.id}
          semester={semester}
          hovered={hoveredId === semester.id}
          onHover={setHoveredId}
          onOpen={openHistory}
        />
      ))}
    </motion.div>
  );
}
