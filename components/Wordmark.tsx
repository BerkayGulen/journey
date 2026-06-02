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
      {/* The "Journey" logo (black ink, transparent bg) on the cream backdrop. */}
      <motion.img
        src="/icons/journeyLogo.png"
        alt="Journey"
        draggable={false}
        className="h-24 select-none sm:h-[10.5rem]"
        animate={
          hide
            ? { opacity: 0 }
            : reduced
              ? { opacity: 1, scale: 1 }
              : { scale: [1, 1.025, 1] }
        }
        transition={
          hide
            ? { duration: 0.3, ease: "easeOut" }
            : { duration: 6, ease: "easeInOut", repeat: Infinity }
        }
      />
    </div>
  );
}
