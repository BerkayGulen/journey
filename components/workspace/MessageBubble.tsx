"use client";

import { motion, useReducedMotion } from "motion/react";
import type { AiMode, ChatMessage } from "@/types";
import { hexToRgba } from "@/lib/geometry";

/**
 * A single conversation turn, styled by the *current* mode so the whole space
 * reads consistently when the register flips:
 *  - socratic    → soft, rounded, gently tinted, dark text on the light bg.
 *  - adversarial → sharp/angular, stronger border, light text on the dark bg.
 * The shape/color/text transitions animate (CSS) so the flip feels alive.
 *
 * Student bubbles carry the course color; AI bubbles the distinct AI hue.
 */
export default function MessageBubble({
  message,
  mode,
  studentColor,
  aiColor,
}: {
  message: ChatMessage;
  mode: AiMode;
  studentColor: string;
  aiColor: string;
}) {
  const reduced = useReducedMotion();
  const isStudent = message.role === "student";
  const socratic = mode === "socratic";
  const tint = isStudent ? studentColor : aiColor;

  const radius = socratic ? "1.6rem" : "0.3rem";
  // Argument mode keeps the sharp shape but a lighter fill/border, so the colors
  // sit quietly on the dark background instead of glowing.
  const bgAlpha = isStudent ? (socratic ? 0.18 : 0.15) : socratic ? 0.12 : 0.11;
  const borderAlpha = socratic ? 0.28 : 0.42;
  const textColor = socratic ? "rgba(26,26,26,0.9)" : "rgba(245,245,245,0.92)";

  return (
    <motion.div
      layout
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduced ? 0.2 : 0.5, ease: "easeOut" }}
      className={isStudent ? "flex justify-end" : "flex justify-start"}
    >
      <div
        className="max-w-[86%] px-5 py-3 text-[15px] leading-relaxed whitespace-pre-line backdrop-blur-sm transition-[background-color,border-color,border-radius,color] duration-700 ease-in-out"
        style={{
          borderRadius: radius,
          background: hexToRgba(tint, bgAlpha),
          border: `1px solid ${hexToRgba(tint, borderAlpha)}`,
          color: textColor,
        }}
      >
        {message.text}
        {message.streaming && (
          // Subtle "still thinking/typing" caret while the reply streams in.
          <motion.span
            aria-hidden
            className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] align-middle"
            style={{ background: textColor, opacity: reduced ? 0.6 : undefined }}
            animate={reduced ? undefined : { opacity: [1, 0.2, 1] }}
            transition={
              reduced ? undefined : { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }
          />
        )}
      </div>
    </motion.div>
  );
}
