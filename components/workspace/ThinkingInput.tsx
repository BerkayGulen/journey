"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useJourney } from "@/lib/journey-state";

/**
 * The bottom "thinking" input — a soft pill with the placeholder "your
 * thinking…". Fades in once the conversation has begun. Enter sends the turn;
 * the input is disabled while the AI is still streaming a reply.
 */
export default function ThinkingInput() {
  const { sendTurn, isSending, mode } = useJourney();
  const [value, setValue] = useState("");
  const reduced = useReducedMotion();
  const adversarial = mode === "adversarial";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isSending) return;
    sendTurn(trimmed);
    setValue("");
  }

  return (
    <motion.form
      onSubmit={submit}
      className="mx-auto mb-[5vh] w-full max-w-2xl px-6"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      // Eases in just after the first reply starts, per the design.
      transition={{ delay: reduced ? 0 : 0.6, duration: reduced ? 0.2 : 0.6, ease: "easeOut" }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="your thinking…"
        aria-label="Your thinking"
        spellCheck={false}
        disabled={isSending}
        className={`w-full rounded-full px-6 py-3 text-[15px] shadow-sm outline-none backdrop-blur-md transition-colors duration-700 ease-in-out placeholder:italic disabled:opacity-50 ${
          adversarial
            ? "border border-white/20 bg-white/10 text-neutral-100 placeholder:text-white/30"
            : "border border-foreground/10 bg-white/55 text-foreground/90 placeholder:text-foreground/35"
        }`}
      />
    </motion.form>
  );
}
