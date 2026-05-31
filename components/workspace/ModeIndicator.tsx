"use client";

import { motion } from "motion/react";
import { useJourney } from "@/lib/journey-state";

/**
 * The mode trigger — deliberately just a word (no icon, no chrome). It flips
 * the AI's register; the environment (background + blob sharpness) is the real
 * signal of which mode is active. The label states the action it performs:
 *   - in Socratic    → "start argument"      (→ adversarial)
 *   - in Adversarial → "return to reflection" (→ socratic)
 */
export default function ModeIndicator() {
  const { mode, setMode } = useJourney();
  const adversarial = mode === "adversarial";

  return (
    <motion.button
      type="button"
      onClick={() => setMode(adversarial ? "socratic" : "adversarial")}
      className="absolute left-1/2 top-7 z-10 -translate-x-1/2 text-[11px] tracking-[0.3em] uppercase outline-none"
      initial={false}
      animate={{
        color: adversarial ? "rgba(245,245,245,0.65)" : "rgba(26,26,26,0.45)",
      }}
      whileHover={{ opacity: 1, scale: 1.02 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {adversarial ? "return to reflection" : "start argument"}
    </motion.button>
  );
}
