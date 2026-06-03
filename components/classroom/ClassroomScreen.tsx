"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useJourney } from "@/lib/journey-state";
import { readableTextColor } from "@/lib/geometry";
import {
  clusters,
  discussions as seedDiscussions,
  selectedWorks as seedSelected,
  studioObjects,
} from "@/data/classroom";
import { profile } from "@/data/workspace";
import type { ClassroomContribution, SelectedWork, StudioObject } from "@/types";
import PortalLogo from "@/components/classroom/PortalLogo";
import LayerNav, { type ClassroomLayer } from "@/components/classroom/LayerNav";
import StudioWall from "@/components/classroom/StudioWall";
import AssignmentSpace from "@/components/classroom/AssignmentSpace";
import SelectedWorks from "@/components/classroom/SelectedWorks";
import DiscussionPanel from "@/components/classroom/DiscussionPanel";

const clusterLabel = new Map(clusters.map((c) => [c.id, c.label]));
let contribSeq = 0;

/**
 * The Classroom workspace — a shared design studio for the selected course.
 * Knowledge is organized spatially (the Studio Wall); discussions stay attached
 * to objects; assignments are a private channel; exemplary learning moments live
 * in Selected Works. A fixed app bar (portal logo + layer nav) sits above the
 * content so scrolling layers pass cleanly beneath it. The portal logo (and
 * Escape) return to the welcome screen; Escape first closes an open discussion.
 * Student perspective.
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
  const [openSelectedId, setOpenSelectedId] = useState<string | null>(null);

  // Session-local copies so discussions/comments persist while the studio is open.
  const [objectThreads, setObjectThreads] = useState<Record<string, ClassroomContribution[]>>(
    () => structuredClone(seedDiscussions),
  );
  const [works, setWorks] = useState<SelectedWork[]>(() => structuredClone(seedSelected));

  const closePanels = useCallback(() => {
    setOpenObjectId(null);
    setOpenSelectedId(null);
  }, []);

  // Escape closes an open discussion first, otherwise returns to welcome.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openObjectId || openSelectedId) closePanels();
      else reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openObjectId, openSelectedId, closePanels, reset]);

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

  const addToSelected = (text: string) => {
    if (!openSelectedId) return;
    const id = openSelectedId;
    setWorks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, comments: [...w.comments, newContribution(text)] } : w)),
    );
  };

  const switchLayer = (next: ClassroomLayer) => {
    closePanels();
    setLayer(next);
  };

  const openObject = openObjectId ? studioObjects.find((o) => o.id === openObjectId) ?? null : null;
  const openSelected = openSelectedId ? works.find((w) => w.id === openSelectedId) ?? null : null;

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Calm drifting tint — very subtle, behind everything. */}
      <div className="bg-aurora pointer-events-none absolute inset-0 -z-0 opacity-60" aria-hidden />

      {/* Active layer fills the screen (behind the app bar). */}
      {layer === "wall" && (
        <StudioWall
          countFor={(id) => objectThreads[id]?.length ?? 0}
          onOpenObject={(o: StudioObject) => setOpenObjectId(o.id)}
        />
      )}
      {layer === "assignments" && <AssignmentSpace accent={accent} />}
      {layer === "selected" && (
        <SelectedWorks works={works} onOpen={(w) => setOpenSelectedId(w.id)} />
      )}

      {/* App bar — stays put while layers scroll beneath it. */}
      <header className="absolute inset-x-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-black/5 bg-background/85 px-4 backdrop-blur-md sm:px-7">
        {/* Portal logo — return to the welcome screen (also Escape). */}
        <motion.button
          type="button"
          onClick={reset}
          aria-label="Back to Journey"
          className="shrink-0 text-foreground/80 outline-none"
          initial={{ opacity: 0.85 }}
          whileHover={{ opacity: 1, rotate: reduced ? 0 : -6 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <PortalLogo className="h-9 w-9" />
        </motion.button>

        <div className="flex flex-1 justify-center">
          <LayerNav active={layer} accent={accent} onChange={switchLayer} />
        </div>

        {selectedCourse && (
          <div className="hidden shrink-0 text-right sm:block">
            <div className="text-xs font-semibold tracking-wide text-foreground/70">
              {selectedCourse.code}
            </div>
            <div className="text-[11px] text-foreground/40">Classroom · Studio</div>
          </div>
        )}
      </header>

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
        {openSelected && (
          <DiscussionPanel
            key={`sel-${openSelected.id}`}
            title={openSelected.title}
            subtitle={`${openSelected.studentName} · ${openSelected.kind}`}
            accent={openSelected.color}
            contributions={openSelected.comments}
            meta={{
              phase: openSelected.phase,
              phaseLabel: openSelected.phaseLabel,
              description: openSelected.description,
              instructorNote: openSelected.instructorNote,
              instructorName: openSelected.instructorName,
              tags: openSelected.tags,
              addedOn: openSelected.addedOn,
            }}
            onClose={closePanels}
            onAdd={addToSelected}
          />
        )}
      </AnimatePresence>

      {/* Hint, only on the wall. */}
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
