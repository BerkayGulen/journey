"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useJourney } from "@/lib/journey-state";
import { useMediaQuery } from "@/lib/media";
import JourneyMark from "@/components/JourneyMark";
import CourseColumn from "@/components/history/CourseColumn";
import CourseRow from "@/components/history/CourseRow";

/**
 * Full-page academic-history detail view. On wide screens it fills with
 * full-height course columns (one per course, in its color) that widen on
 * click; on narrow / mobile screens it switches to a scrollable vertical list
 * of horizontal course rows that expand downward — same data, layout that
 * fits the viewport. Escape or the faint "← Journey" wordmark returns to
 * welcome.
 */
export default function HistoryDetail() {
  const { selectedSemester, reset } = useJourney();
  const reduced = useReducedMotion();
  // Below Tailwind's `sm` the columns get too thin to read → switch to rows.
  const narrow = useMediaQuery("(max-width: 639px)");
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

  const toggle = (id: string) =>
    setExpandedId((cur) => (cur === id ? null : id));

  if (narrow) {
    // Mobile: an opaque header bar (back + semester) that stays put, above a
    // separate scroll area — so scrolling rows never overlap the controls.
    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <header className="relative z-20 flex h-12 shrink-0 items-center justify-between bg-background px-4">
          <motion.button
            type="button"
            onClick={reset}
            aria-label="Back to Journey"
            className="flex items-center outline-none"
            initial={{ opacity: 0.85 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <JourneyMark tone="dark" className="h-8 w-8" />
          </motion.button>
          <span className="font-hand text-base text-foreground/55">{label}</span>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              className="flex w-full flex-none"
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: reduced ? 0 : 0.45,
                delay: reduced ? 0 : i * 0.05,
                ease: "easeOut",
              }}
            >
              <CourseRow
                course={course}
                expanded={expandedId === course.id}
                onToggle={() => toggle(course.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Wide: full-height columns that widen in place on click; controls overlay
  // the (non-scrolling) columns.
  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
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
              onToggle={() => toggle(course.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Home — back arrow + Journey logo, keyed light over the (dark) first column. */}
      <motion.button
        type="button"
        onClick={reset}
        aria-label="Back to Journey"
        className="absolute left-7 top-4 z-20 flex items-center outline-none"
        initial={{ opacity: 0.75 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <JourneyMark tone="light" className="h-12 w-12" />
      </motion.button>

      <div className="pointer-events-none absolute right-7 top-5 z-20 font-hand text-xl text-white">
        {label}
      </div>
    </div>
  );
}
