"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { hexToRgba } from "@/lib/geometry";
import type { HistoryCourse } from "@/types";

/**
 * The project/assignment/exam grade breakdown, revealed when a course expands.
 * Shared by the column (wide) and row (mobile) layouts so both stay in sync.
 */
export default function GradeBreakdown({
  course,
  expanded,
  textColor,
}: {
  course: HistoryCourse;
  expanded: boolean;
  /** Text color of the surrounding block (drives the divider tint). */
  textColor: string;
}) {
  const reduced = useReducedMotion();
  const divider = hexToRgba(textColor, 0.18);

  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          className="w-full max-w-[20rem] overflow-hidden"
          initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: reduced ? 0 : 0.32, ease: "easeOut" }}
        >
          <div className="mt-3 text-[10px] tracking-[0.25em] uppercase opacity-60">
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
                    <span className="ml-1 text-[11px] opacity-60">· {c.weight}%</span>
                  )}
                </span>
                <span className="font-medium tabular-nums">{c.grade}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
