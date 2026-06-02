"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useJourney } from "@/lib/journey-state";
import CourseColumn from "@/components/history/CourseColumn";

/**
 * Full-page academic-history detail view. The whole screen fills with
 * full-height course columns (one per course, in its color). Clicking a column
 * widens it and reveals its grade breakdown. Escape or the faint "Journey"
 * wordmark (top-left) returns to the welcome screen — the same return-home
 * affordance the workspace uses.
 */
export default function HistoryDetail() {
  const { selectedSemester, reset } = useJourney();
  const reduced = useReducedMotion();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Escape returns to the welcome screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset]);

  if (!selectedSemester) return null;
  const { courses, label } = selectedSemester;

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Columns fill the page. */}
      <div className="flex h-full w-full">
        {courses.map((course, i) => (
          <motion.div
            key={course.id}
            className="flex h-full"
            style={{ flexGrow: 1, flexBasis: 0 }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduced ? 0 : 0.5,
              delay: reduced ? 0 : i * 0.05,
              ease: "easeOut",
            }}
          >
            <CourseColumn
              course={course}
              expanded={expandedId === course.id}
              onToggle={() =>
                setExpandedId((cur) => (cur === course.id ? null : course.id))
              }
            />
          </motion.div>
        ))}
      </div>

      {/* Home — return to the welcome screen (also Escape). Faint wordmark,
          consistent with the workspace's minimal identity. `mix-blend-difference`
          keeps it legible over any column color without adding a card/scrim. */}
      <motion.button
        type="button"
        onClick={reset}
        aria-label="Back to Journey"
        className="absolute left-7 top-6 z-20 font-hand text-xl italic text-white outline-none mix-blend-difference"
        initial={{ opacity: 0.7 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        ← Journey
      </motion.button>

      {/* Semester label — minimal type, top-right; blend-mode keeps it readable. */}
      <div className="pointer-events-none absolute right-7 top-6 z-20 font-hand text-xl italic text-white opacity-70 mix-blend-difference">
        {label}
      </div>
    </div>
  );
}
