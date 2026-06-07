"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useJourney } from "@/lib/journey-state";
import { recordedConversations } from "@/data/recorded-chat";
import MessageBubble from "@/components/workspace/MessageBubble";
import type { AiMode, ChatMessage, RecordedItem } from "@/types";

/**
 * A previously-recorded, READ-ONLY Private Chat (ID 202 demo). Reviewers scroll
 * through a stored student↔Journey conversation; they cannot send or edit. It
 * reuses the live chat's Socratic bubble look (each turn styled by its own
 * recorded mode) and threads inline "milestone generated" markers so the demo
 * shows how Journey captures the design process.
 *
 * The Socratic/Adversarial toggle (`ModeIndicator`) stays active and acts as a
 * section jump: switching mode scrolls to the first turn recorded in that mode.
 * This transcript is all Socratic, so switching to Adversarial flashes a note
 * and snaps back — once adversarial turns are added, the jump works unchanged.
 */
export default function RecordedConversation({
  studentColor,
  aiColor,
}: {
  studentColor: string;
  aiColor: string;
}) {
  const { selectedCourse, mode, setMode } = useJourney();
  const reduced = useReducedMotion();

  const items: RecordedItem[] = useMemo(
    () => recordedConversations[selectedCourse?.id ?? ""] ?? [],
    [selectedCourse],
  );

  // First transcript index per mode (drives the toggle's section jump).
  const firstIndexByMode = useMemo(() => {
    const map: Partial<Record<AiMode, number>> = {};
    items.forEach((it, i) => {
      if (it.kind === "message" && map[it.mode] === undefined) map[it.mode] = i;
    });
    return map;
  }, [items]);

  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [note, setNote] = useState<string | null>(null);
  const noteTimer = useRef<number | undefined>(undefined);
  const didMount = useRef(false);

  const flashNote = (msg: string) => {
    setNote(msg);
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(null), 2600);
  };

  // Jump to the section recorded in the selected mode (skip the initial mount so
  // we don't auto-scroll on open). Missing mode → flash a note and snap back. The
  // note/mode updates are deferred so they don't run synchronously in the effect.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    const idx = firstIndexByMode[mode];
    if (idx === undefined) {
      const t = window.setTimeout(() => {
        flashNote(`No ${mode} section in this conversation yet — it's all Socratic.`);
        setMode("socratic");
      }, 0);
      return () => window.clearTimeout(t);
    }
    itemRefs.current[idx]?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  }, [mode, firstIndexByMode, setMode, reduced]);

  useEffect(() => () => window.clearTimeout(noteTimer.current), []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 pb-[12vh] pt-[14vh]">
          {/* Read-only caption. */}
          <div className="mb-2 flex justify-center">
            <span className="rounded-full border border-foreground/10 bg-white/55 px-3 py-1 text-[11px] tracking-wide text-foreground/45 backdrop-blur-sm">
              recorded session · read-only
            </span>
          </div>

          {items.map((item, i) =>
            item.kind === "milestone" ? (
              <div
                key={`ms-${i}`}
                className="my-1 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.18em] text-foreground/40"
              >
                <span className="h-px w-8 bg-foreground/15" aria-hidden />
                <span>✦ milestone · {item.label}</span>
                <span className="h-px w-8 bg-foreground/15" aria-hidden />
              </div>
            ) : (
              <div key={`m-${i}`} ref={(el) => { itemRefs.current[i] = el; }}>
                <MessageBubble
                  message={recordedToMessage(item, i)}
                  mode={item.mode}
                  studentColor={studentColor}
                  aiColor={aiColor}
                />
              </div>
            ),
          )}
        </div>
      </div>

      {/* Transient note (e.g. when jumping to a mode with no section yet). */}
      <AnimatePresence>
        {note && (
          <motion.div
            key="rec-note"
            className="pointer-events-none absolute bottom-[6vh] left-1/2 -translate-x-1/2 rounded-full border border-foreground/10 bg-white/80 px-4 py-2 text-xs text-foreground/60 shadow-sm backdrop-blur-md"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          >
            {note}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Adapt a recorded message to the ChatMessage shape MessageBubble renders. */
function recordedToMessage(
  item: Extract<RecordedItem, { kind: "message" }>,
  i: number,
): ChatMessage {
  return { id: `rec-${i}`, role: item.role, text: item.text, mode: item.mode, createdAt: 0 };
}
