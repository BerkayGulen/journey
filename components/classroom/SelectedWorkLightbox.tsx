"use client";

import { motion, useReducedMotion } from "motion/react";
import type { SelectedWork } from "@/types";

/**
 * Full-size viewer for a Selected Work board. The board image carries the whole
 * record (description, instructor note, tags), so this just presents it large.
 * Click the backdrop, the ×, or press Escape (handled by ClassroomScreen) to close.
 */
export default function SelectedWorkLightbox({
  work,
  onClose,
}: {
  work: SelectedWork;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.25 }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 font-hand text-2xl leading-none text-white outline-none transition-colors hover:bg-white/25"
      >
        ×
      </button>

      <motion.img
        src={work.image}
        alt={`${work.studentName} — ${work.phaseLabel}`}
        draggable={false}
        className="max-h-[88vh] max-w-full rounded-xl object-contain shadow-2xl"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0 : 0.3, ease: "easeOut" }}
        // Clicking the image itself shouldn't close (only the backdrop / ×).
        onClick={(e) => e.stopPropagation()}
      />
      <div className="mt-4 text-center text-sm text-white/70">
        {work.studentName} · {work.phaseLabel}
      </div>
    </motion.div>
  );
}
