"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useJourney } from "@/lib/journey-state";
import { aiInk } from "@/lib/geometry";
import JourneyMark from "@/components/JourneyMark";
import BlobField from "@/components/workspace/BlobField";
import IdeaDumpIntro from "@/components/workspace/IdeaDumpIntro";
import ConversationView from "@/components/workspace/ConversationView";
import ModeIndicator from "@/components/workspace/ModeIndicator";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";

/**
 * The Private Chat workspace. Owns the background (which darkens toward black in
 * Adversarial mode) and the amorphous blob field, and swaps the foreground by
 * phase:
 *   - ideaDump   → the open brain-dump space (IdeaDumpIntro)
 *   - conversing → the conversation (soft/sharp bubbles + streamed reply + the
 *                  "your thinking…" input), with the mode trigger + sidebar.
 *
 * A faint "journey" wordmark (top-left) and the Escape key both return to the
 * welcome screen via `reset()`.
 */
export default function WorkspaceScreen() {
  const { phase, mode, selectedCourse, conversation, reset } = useJourney();
  const reduced = useReducedMotion();
  const adversarial = mode === "adversarial";
  const studentColor = selectedCourse?.color ?? "#E6447F";
  const aiColor = aiInk(studentColor);

  // The AI blob appears once the AI has joined the conversation.
  const aiPresent = conversation.messages.some((m) => m.role === "ai");

  // Escape returns to the welcome screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset]);

  return (
    <motion.div
      className="relative h-full w-full overflow-hidden"
      animate={{ backgroundColor: adversarial ? "#0a0a0a" : "#ffffff" }}
      transition={{ duration: reduced ? 0 : 1.4, ease: "easeInOut" }}
    >
      <BlobField
        studentColor={studentColor}
        aiColor={aiColor}
        showAi={aiPresent}
        mode={mode}
      />

      {/* Home — return to the welcome screen (also Escape). The Journey logo,
          keyed light/dark to the current (socratic/adversarial) background. */}
      <motion.button
        type="button"
        onClick={reset}
        aria-label="Back to Journey"
        className="absolute left-7 top-6 z-20 outline-none"
        initial={{ opacity: 0.75 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <JourneyMark tone={adversarial ? "light" : "dark"} className="h-10 w-10 sm:h-12 sm:w-12" />
      </motion.button>

      <AnimatePresence mode="wait">
        {phase === "ideaDump" && <IdeaDumpIntro key="idea-dump" />}

        {phase === "conversing" && (
          <ConversationView
            key="conversing"
            studentColor={studentColor}
            aiColor={aiColor}
          />
        )}
      </AnimatePresence>

      {phase === "conversing" && <ModeIndicator />}

      <AnimatePresence>
        {phase === "conversing" && <WorkspaceSidebar key="ws-sidebar" />}
      </AnimatePresence>
    </motion.div>
  );
}
