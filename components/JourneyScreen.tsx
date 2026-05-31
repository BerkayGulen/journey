"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AnchorProvider } from "@/lib/anchors";
import { JourneyProvider, useJourney } from "@/lib/journey-state";
import ConnectionCanvas from "@/components/ConnectionCanvas";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import Wordmark from "@/components/Wordmark";
import WorkspaceScreen from "@/components/workspace/WorkspaceScreen";

/**
 * Phase-driven composition. The welcome layers and the Private Chat workspace
 * live in one continuous tree so the welcome→workspace cross-transition (and the
 * eventual block-split morph) animate smoothly. During `entering` both are
 * mounted — welcome stays put while the white workspace fades in over it — then
 * the welcome layers unmount once we reach the idea-dump.
 */
function Stage() {
  const { phase } = useJourney();
  const reduced = useReducedMotion();
  const dur = reduced ? 0 : 0.55;

  const showWelcome = phase === "welcome" || phase === "splitting" || phase === "entering";
  const showWorkspace =
    phase === "entering" || phase === "ideaDump" || phase === "conversing";

  return (
    <main className="relative h-full w-full overflow-hidden">
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome"
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            transition={{ duration: dur, ease: "easeInOut" }}
          >
            <div className="bg-aurora pointer-events-none absolute inset-0 -z-10" aria-hidden />
            <ConnectionCanvas />
            <LeftSidebar />
            <RightSidebar />
            <Wordmark />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWorkspace && (
          <motion.div
            key="workspace"
            className="absolute inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur, ease: "easeInOut" }}
          >
            <WorkspaceScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function JourneyScreen() {
  return (
    <JourneyProvider>
      <AnchorProvider>
        <Stage />
      </AnchorProvider>
    </JourneyProvider>
  );
}
