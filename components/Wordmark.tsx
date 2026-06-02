"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCoarsePointer } from "@/lib/pointer";

export default function Wordmark({
  /** True while a welcome sidebar is expanded — hides the wordmark on mobile. */
  hiddenForSidebar = false,
}: {
  hiddenForSidebar?: boolean;
}) {
  const reduced = useReducedMotion();
  const isTouch = useCoarsePointer();
  // On touch the expanded sidebar overlaps the centre; hide the wordmark so it
  // doesn't peek out beside the panel. Desktop is unaffected.
  const hide = isTouch && hiddenForSidebar;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <motion.span
        className="font-hand text-5xl tracking-wide text-foreground/85 select-none sm:text-7xl"
        animate={
          hide
            ? { opacity: 0 }
            : reduced
              ? { opacity: 1 }
              : { scale: [1, 1.025, 1], opacity: [0.82, 1, 0.82] }
        }
        transition={
          hide
            ? { duration: 0.3, ease: "easeOut" }
            : { duration: 6, ease: "easeInOut", repeat: Infinity }
        }
      >
        Journey
      </motion.span>
    </div>
  );
}
