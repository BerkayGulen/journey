"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useJourney } from "@/lib/journey-state";
import { readableTextColor } from "@/lib/geometry";
import {
  clusters,
  discussions as seedDiscussions,
  publishedWorks as seedPublished,
  studioObjects,
} from "@/data/classroom";
import { profile } from "@/data/workspace";
import type { ClassroomContribution, PublishedWork, StudioObject } from "@/types";
import JourneyLogo from "@/components/JourneyLogo";
import LayerNav, { type ClassroomLayer } from "@/components/classroom/LayerNav";
import StudioWall from "@/components/classroom/StudioWall";
import AssignmentSpace from "@/components/classroom/AssignmentSpace";
import PublishedArchive from "@/components/classroom/PublishedArchive";
import DiscussionPanel from "@/components/classroom/DiscussionPanel";

const clusterLabel = new Map(clusters.map((c) => [c.id, c.label]));
let contribSeq = 0;

/**
 * The Classroom workspace — a shared design studio for the selected course.
 * Knowledge is organized spatially (the Studio Wall), discussions stay attached
 * to objects (the Discussion panel), assignments are a private channel
 * (Assignment Space), and exemplary work lives in the Published archive. Escape
 * closes an open discussion, or returns to the welcome screen; the Journey logo
 * (top-left) returns home. Student perspective.
 */
export default function ClassroomScreen() {
  const { selectedCourse, reset } = useJourney();
  const reduced = useReducedMotion();

  // A legible accent: use the course color when it can carry light text;
  // otherwise fall back to a deep studio ink so chrome stays readable.
  const raw = selectedCourse?.color ?? "#23617E";
  const accent = readableTextColor(raw) === "#ffffff" ? raw : "#23617E";

  const [layer, setLayer] = useState<ClassroomLayer>("wall");
  const [openObjectId, setOpenObjectId] = useState<string | null>(null);
  const [openPublishedId, setOpenPublishedId] = useState<string | null>(null);

  // Session-local copies so discussions/comments persist while the studio is open.
  const [objectThreads, setObjectThreads] = useState<Record<string, ClassroomContribution[]>>(
    () => structuredClone(seedDiscussions),
  );
  const [works, setWorks] = useState<PublishedWork[]>(() => structuredClone(seedPublished));

  const closePanels = useCallback(() => {
    setOpenObjectId(null);
    setOpenPublishedId(null);
  }, []);

  // Escape closes an open discussion first, otherwise returns to welcome.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openObjectId || openPublishedId) closePanels();
      else reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openObjectId, openPublishedId, closePanels, reset]);

  const newContribution = (text: string): ClassroomContribution => {
    contribSeq += 1;
    return {
      id: `local${contribSeq}`,
      author: profile.name,
      role: "student",
      text,
      createdAt: Date.now(),
    };
  };

  const addToObject = (text: string) => {
    if (!openObjectId) return;
    const id = openObjectId;
    setObjectThreads((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), newContribution(text)],
    }));
  };

  const addToPublished = (text: string) => {
    if (!openPublishedId) return;
    const id = openPublishedId;
    setWorks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, comments: [...w.comments, newContribution(text)] } : w)),
    );
  };

  const switchLayer = (next: ClassroomLayer) => {
    closePanels();
    setLayer(next);
  };

  const openObject = openObjectId ? studioObjects.find((o) => o.id === openObjectId) ?? null : null;
  const openPublished = openPublishedId ? works.find((w) => w.id === openPublishedId) ?? null : null;

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Calm drifting tint — very subtle, behind everything. */}
      <div className="bg-aurora pointer-events-none absolute inset-0 -z-0 opacity-60" aria-hidden />

      {/* Active layer fills the screen. */}
      {layer === "wall" && (
        <StudioWall
          countFor={(id) => objectThreads[id]?.length ?? 0}
          onOpenObject={(o: StudioObject) => setOpenObjectId(o.id)}
        />
      )}
      {layer === "assignments" && <AssignmentSpace accent={accent} />}
      {layer === "published" && (
        <PublishedArchive works={works} onOpen={(w) => setOpenPublishedId(w.id)} />
      )}

      {/* Home — return to the welcome screen (also Escape). */}
      <motion.button
        type="button"
        onClick={reset}
        aria-label="Back to Journey"
        className="absolute left-7 top-5 z-30 flex items-center gap-2 outline-none"
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <span className="font-hand text-3xl italic text-foreground/60">←</span>
        <JourneyLogo tone="dark" className="h-11 sm:h-12" />
      </motion.button>

      {/* Course label (right), quiet. */}
      {selectedCourse && (
        <div className="pointer-events-none absolute right-7 top-6 z-20 hidden text-right sm:block">
          <div className="text-xs font-semibold tracking-wide text-foreground/70">
            {selectedCourse.code}
          </div>
          <div className="text-[11px] text-foreground/40">Classroom · Studio</div>
        </div>
      )}

      <LayerNav active={layer} accent={accent} onChange={switchLayer} />

      <AnimatePresence>
        {openObject && (
          <DiscussionPanel
            key={`obj-${openObject.id}`}
            title={openObject.title}
            subtitle={`${clusterLabel.get(openObject.clusterId) ?? ""}${openObject.source ? ` · ${openObject.source}` : ""}`}
            accent={openObject.color}
            contributions={objectThreads[openObject.id] ?? []}
            onClose={closePanels}
            onAdd={addToObject}
          />
        )}
        {openPublished && (
          <DiscussionPanel
            key={`pub-${openPublished.id}`}
            title={openPublished.title}
            subtitle={`Published work · ${openPublished.studentName}`}
            accent={openPublished.color}
            contributions={openPublished.comments}
            onClose={closePanels}
            onAdd={addToPublished}
          />
        )}
      </AnimatePresence>

      {/* Hint, only on the wall (calm, fades with reduced motion gating). */}
      {layer === "wall" && (
        <motion.div
          className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 font-hand text-base italic text-foreground/35"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 0.6 }}
        >
          drag to roam · click any piece to discuss
        </motion.div>
      )}
    </div>
  );
}
