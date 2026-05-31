"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useJourney } from "@/lib/journey-state";

/**
 * The idea-dump intro: an open, chrome-less space (no chat box, no buttons)
 * where the student types a messy brain-dump of everything in their head. The
 * pre-filled italic placeholder invites free writing; Enter submits, Shift+Enter
 * adds a line. On submit the dump becomes the first turn of the conversation.
 */
export default function IdeaDumpIntro() {
  const { submitFirstDump } = useJourney();
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // Focus the open space so the student can simply start writing.
  useEffect(() => {
    const id = setTimeout(() => ref.current?.focus(), 200);
    return () => clearTimeout(id);
  }, []);

  // Grow the textarea with its content (no scrollbar, stays centered).
  function autosize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitFirstDump(value);
    }
  }

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      // Clicking anywhere in the open space focuses the writing area.
      onMouseDown={(e) => {
        if (e.target !== ref.current) {
          e.preventDefault();
          ref.current?.focus();
        }
      }}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          autosize(e.target);
        }}
        onKeyDown={handleKeyDown}
        rows={1}
        spellCheck={false}
        placeholder="everything in my head right now…"
        aria-label="Write everything in your head right now"
        className="max-h-[60vh] w-full max-w-xl resize-none overflow-hidden bg-transparent text-center text-lg leading-relaxed text-foreground/90 outline-none placeholder:text-foreground/35 placeholder:italic"
      />
    </motion.div>
  );
}
