"use client";

import { motion, useReducedMotion } from "motion/react";

export default function Wordmark() {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <motion.span
        className="font-hand text-7xl tracking-wide text-foreground/85 select-none"
        animate={reduced ? undefined : { scale: [1, 1.025, 1], opacity: [0.82, 1, 0.82] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
      >
        Journey
      </motion.span>
    </div>
  );
}
