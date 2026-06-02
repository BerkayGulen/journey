"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { hexToRgba, readableTextColor } from "@/lib/geometry";
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
  const divider = hexToRgba(textColor, 0.18);

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
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            className="w-full max-w-[20rem] overflow-hidden"
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reduced ? 0 : 0.32, ease: "easeOut" }}
          >
            <div className="text-[10px] tracking-[0.25em] uppercase opacity-60">
              Breakdown
            </div>
            <ul className="mt-2">
              {course.breakdown.map((c) => (
                <li
                  key={c.label}
                  className="flex items-baseline justify-between gap-4 border-t py-2 text-sm"
                  style={{ borderColor: divider }}
                >
                  <span className="opacity-80">
                    {c.label}
                    {c.weight != null && (
                      <span className="ml-1 text-[11px] opacity-60">
                        · {c.weight}%
                      </span>
                    )}
                  </span>
                  <span className="font-medium tabular-nums">{c.grade}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
