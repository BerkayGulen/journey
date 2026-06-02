"use client";

import { motion, useReducedMotion } from "motion/react";
import { readableTextColor } from "@/lib/geometry";
import GradeBreakdown from "@/components/history/GradeBreakdown";
import type { HistoryCourse } from "@/types";

/**
 * Mobile counterpart of CourseColumn: a full-width horizontal band (course code/
 * name on the left, final grade on the right). Tapping expands the band downward
 * to reveal the grade breakdown. Used when the screen is too narrow for the
 * vertical-column layout; the detail view stacks these in a scrollable list.
 */
export default function CourseRow({
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
      layout={!reduced}
      className="flex w-full flex-none cursor-pointer flex-col justify-center overflow-hidden px-6 py-6 text-left outline-none"
      style={{ backgroundColor: course.color, color: textColor, minHeight: "5.5rem" }}
    >
      <div className="flex w-full items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-base font-semibold tracking-wide">{course.code}</div>
          <div className="mt-0.5 text-[13px] leading-snug opacity-75">
            {course.name}
          </div>
        </div>
        <span className="shrink-0 text-4xl font-light tracking-wide tabular-nums">
          {course.grade}
        </span>
      </div>

      <GradeBreakdown course={course} expanded={expanded} textColor={textColor} />
    </motion.button>
  );
}
