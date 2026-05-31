"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useJourney } from "@/lib/journey-state";
import MessageBubble from "@/components/workspace/MessageBubble";
import ThinkingInput from "@/components/workspace/ThinkingInput";

/**
 * The conversation: a centered column of soft bubbles over the blob field, with
 * the "your thinking…" pill anchored at the bottom. New turns stack; the view
 * keeps the latest turn in sight as the AI reply streams in.
 */
export default function ConversationView({
  studentColor,
  aiColor,
}: {
  studentColor: string;
  aiColor: string;
}) {
  const { conversation, mode } = useJourney();
  const reduced = useReducedMotion();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep the newest content in view as messages arrive / stream.
  const lastText = conversation.messages[conversation.messages.length - 1]?.text;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "end",
    });
  }, [conversation.messages.length, lastText, reduced]);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 pt-[14vh] pb-8">
          {conversation.messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              mode={mode}
              studentColor={studentColor}
              aiColor={aiColor}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <ThinkingInput />
    </motion.div>
  );
}
