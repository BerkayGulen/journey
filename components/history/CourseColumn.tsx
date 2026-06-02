"use client";

import { motion, useReducedMotion } from "motion/react";
import { readableTextColor } from "@/lib/geometry";
import GradeBreakdown from "@/components/history/GradeBreakdown";
import type { HistoryCourse } from "@/types";

/**
 * One full-height course column in the history detail view. Collapsed it shows
 * the course code/name and final grade; clicking widens it in place (neighbors
 * shrink) and reveals the project/assignment/exam breakdown — mirroring the
 * left sidebar's per-block grow.
 */
export default function CourseColumn({
  course,
  expanded,
  onToggle,
}: {
  course: HistoryCourse;
  expanded: boolean;
  onToggle: () => void;
}) {
  const reduced = useReducedMotion();
  const textColor = readableTextColor(course.color);

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      className="relative flex h-full cursor-pointer flex-col items-start overflow-hidden px-5 pb-7 pt-16 text-left outline-none"
      style={{ backgroundColor: course.color, color: textColor, flexBasis: 0 }}
      animate={{ flexGrow: expanded ? 4 : 1 }}
      transition={
        reduced
          ? { duration: 0 }
          : { type: "spring", stiffness: 210, damping: 30 }
      }
    >
      {/* Code + name, top. */}
      <div className="whitespace-nowrap">
        <div className="text-sm font-semibold tracking-wide">{course.code}</div>
        <div className="mt-1 max-w-[16rem] text-[12px] leading-snug whitespace-normal opacity-75">
          {course.name}
        </div>
      </div>

      {/* Final grade, centered in the column. */}
      <div className="flex flex-1 items-center">
        <span className="text-5xl font-light tracking-wide tabular-nums">
          {course.grade}
        </span>
      </div>

      {/* Breakdown, revealed when expanded. */}
      <GradeBreakdown course={course} expanded={expanded} textColor={textColor} />
    </motion.button>
  );
}
