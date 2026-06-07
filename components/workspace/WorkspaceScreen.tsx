"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useJourney } from "@/lib/journey-state";
import { aiInk } from "@/lib/geometry";
import JourneyMark from "@/components/JourneyMark";
import BlobField from "@/components/workspace/BlobField";
import IdeaDumpIntro from "@/components/workspace/IdeaDumpIntro";
import ConversationView from "@/components/workspace/ConversationView";
import RecordedConversation from "@/components/workspace/RecordedConversation";
import ModeIndicator from "@/components/workspace/ModeIndicator";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";

/**
 * The Private Chat workspace. Owns the background (which darkens toward black in
 * Adversarial mode) and the amorphous blob field, and swaps the foreground by
 * phase:
 *   - ideaDump   → the open brain-dump space (IdeaDumpIntro)
 *   - conversing → the conversation (soft/sharp bubbles + streamed reply + the
 *                  "your thinking…" input), with the mode trigger + sidebar.
 *   - recorded   → a read-only pre-recorded transcript (ID 202 demo): no input,
 *                  the mode toggle jumps between sections; visuals stay Socratic.
 *
 * A faint "journey" wordmark (top-left) and the Escape key both return to the
 * welcome screen via `reset()`.
 */
export default function WorkspaceScreen() {
  const { phase, mode, selectedCourse, conversation, reset } = useJourney();
  const reduced = useReducedMotion();
  const recorded = phase === "recorded";
  // The recorded demo stays in the readable Socratic (light) register regardless
  // of the toggle — its transcript is all Socratic, so darkening would leave dark
  // bubble text on a dark field. The toggle still drives section jumps.
  const adversarial = mode === "adversarial" && !recorded;
  const studentColor = selectedCourse?.color ?? "#E6447F";
  const aiColor = aiInk(studentColor);

  // Chat-like phases share the mode trigger + Milestones sidebar.
  const chatActive = phase === "conversing" || recorded;
  // The AI blob appears once the AI has joined (recorded transcripts always have it).
  const aiPresent = recorded || conversation.messages.some((m) => m.role === "ai");

  // Milestones sidebar open-state is lifted here so the top-right course label
  // can step aside while the (near-transparent) panel is open.
  const [milestonesOpen, setMilestonesOpen] = useState(false);

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
        mode={recorded ? "socratic" : mode}
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

      {/* Course identity — top-right, matching the Classroom app bar. Shown for
          every course across the whole Private Chat (idea-dump → conversation →
          recorded), and hidden only while the Milestones panel owns the column. */}
      {(phase === "ideaDump" || chatActive) && selectedCourse && !milestonesOpen && (
        <motion.div
          className="absolute right-7 top-6 z-20 hidden text-right sm:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.4, ease: "easeInOut" }}
        >
          <div
            className={`text-xs font-semibold tracking-wide transition-colors duration-700 ${
              adversarial ? "text-white/80" : "text-foreground/70"
            }`}
          >
            {selectedCourse.code}
          </div>
          <div
            className={`max-w-[15rem] truncate text-[11px] transition-colors duration-700 ${
              adversarial ? "text-white/55" : "text-foreground/55"
            }`}
          >
            {selectedCourse.name}
          </div>
          <div
            className={`text-[11px] transition-colors duration-700 ${
              adversarial ? "text-white/35" : "text-foreground/40"
            }`}
          >
            Private Chat
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {phase === "ideaDump" && <IdeaDumpIntro key="idea-dump" />}

        {phase === "conversing" && (
          <ConversationView
            key="conversing"
            studentColor={studentColor}
            aiColor={aiColor}
          />
        )}

        {recorded && (
          <RecordedConversation
            key="recorded"
            studentColor={studentColor}
            aiColor={aiColor}
          />
        )}
      </AnimatePresence>

      {chatActive && <ModeIndicator />}

      <AnimatePresence>
        {chatActive && (
          <WorkspaceSidebar
            key="ws-sidebar"
            open={milestonesOpen}
            onOpenChange={setMilestonesOpen}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
