"use client";

import { motion } from "motion/react";

/**
 * The circular "Journey" mark (the round logo), used as the portal-home control
 * everywhere off the main welcome screen — the Classroom app bar, the Private
 * Chat workspace, and the history detail. The asset is black ink on a
 * transparent background (`public/icons/logo.png`, keyed from `logo.jpg` by
 * `scripts/make_mark_png.py`), so it drops cleanly onto any surface:
 *   - tone "dark"  → black ink, for LIGHT backgrounds (as-is).
 *   - tone "light" → white ink, for DARK backgrounds (CSS invert).
 *
 * The hero welcome wordmark is the handwriting "Journey" image (`Wordmark`) and
 * is intentionally NOT replaced by this mark.
 */
export default function JourneyMark({
  tone = "dark",
  className = "",
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const ink = tone === "light" ? "[filter:invert(1)]" : "";
  return (
    <motion.img
      src="/icons/logo.png"
      alt="Journey"
      draggable={false}
      className={`pointer-events-none select-none ${ink} ${className}`}
    />
  );
}
