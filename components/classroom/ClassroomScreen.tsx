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
import JourneyMark from "@/components/JourneyMark";
import LayerNav, { type ClassroomLayer } from "@/components/classroom/LayerNav";
import StudioWall from "@/components/classroom/StudioWall";
import AssignmentSpace from "@/components/classroom/AssignmentSpace";
import SelectedWorks from "@/components/classroom/SelectedWorks";
import SelectedWorkLightbox from "@/components/classroom/SelectedWorkLightbox";
import DiscussionPanel from "@/components/classroom/DiscussionPanel";

const clusterLabel = new Map(clusters.map((c) => [c.id, c.label]));
let contribSeq = 0;

/**
 * The Classroom workspace — a shared design studio for the selected course.
 * Knowledge is organized spatially (the Studio Wall); discussions stay attached
 * to objects; assignments are a private channel; instructor-picked learning
 * moments live in Selected Works (a board image + the discussion around it,
 * clickable to view full-size). A fixed app bar (portal mark + layer nav) sits
 * above the content so scrolling layers pass cleanly beneath it. The portal mark
 * (and Escape) return to the welcome screen; Escape first closes a full-size
 * board, then an open discussion. Student perspective.
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
  const [fullImage, setFullImage] = useState(false);

  // Session-local copies so discussions/comments persist while the studio is open.
  const [objectThreads, setObjectThreads] = useState<Record<string, ClassroomContribution[]>>(
    () => structuredClone(seedDiscussions),
  );
  const [works, setWorks] = useState<SelectedWork[]>(() => structuredClone(seedSelected));

  const closePanels = useCallback(() => {
    setOpenObjectId(null);
    setOpenSelectedId(null);
    setFullImage(false);
  }, []);

  // Escape closes a full-size board first, then an open discussion, else returns
  // to the welcome screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (fullImage) setFullImage(false);
      else if (openObjectId || openSelectedId) closePanels();
      else reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullImage, openObjectId, openSelectedId, closePanels, reset]);

  const newContribution = (text: string): ClassroomContribution => {
    contribSeq += 1;
    return { id: `local${contribSeq}`, author: profile.name, role: "student", text, createdAt: Date.now() };
  };

  const addToObject = (text: string) => {
    if (!openObjectId) return;
    const id = openObjectId;
    setObjectThreads((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), newContribution(text)] }));
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
        {/* Portal mark — return to the welcome screen (also Escape). */}
        <motion.button
          type="button"
          onClick={reset}
          aria-label="Back to Journey"
          className="shrink-0 outline-none"
          initial={{ opacity: 0.85 }}
          whileHover={{ opacity: 1, rotate: reduced ? 0 : -6 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <JourneyMark tone="dark" className="h-9 w-9" />
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

      {/* Contextual discussion (Studio Wall artifacts). */}
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
      </AnimatePresence>

      {/* Selected Work — the board image + its discussion. */}
      <AnimatePresence>
        {openSelected && (
          <DiscussionPanel
            key={`sel-${openSelected.id}`}
            title={openSelected.title}
            subtitle={`${openSelected.studentName} · ${openSelected.phaseLabel}`}
            accent={openSelected.color}
            contributions={openSelected.comments}
            meta={{
              phase: openSelected.phase,
              phaseLabel: openSelected.phaseLabel,
              image: openSelected.image,
              description: openSelected.description,
              instructorNote: openSelected.instructorNote,
              instructorName: openSelected.instructorName,
              tags: openSelected.tags,
            }}
            onImageClick={() => setFullImage(true)}
            onClose={closePanels}
            onAdd={addToSelected}
          />
        )}
      </AnimatePresence>

      {/* Full-size Selected Work board (opened from the panel image). */}
      <AnimatePresence>
        {openSelected && fullImage && (
          <SelectedWorkLightbox
            key={`full-${openSelected.id}`}
            work={openSelected}
            onClose={() => setFullImage(false)}
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
