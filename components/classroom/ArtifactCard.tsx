"use client";

import { motion, useReducedMotion } from "motion/react";
import { useAnchorRef } from "@/lib/anchors";
import { hexToRgba } from "@/lib/geometry";
import type { StudioObject } from "@/types";

/** Calm, word-based label for each artifact kind (no productivity icons). */
const KIND_LABEL: Record<StudioObject["kind"], string> = {
  brief: "brief",
  paper: "paper",
  image: "image",
  video: "video",
  website: "link",
  book: "book",
  precedent: "precedent",
  note: "note",
};

/**
 * One artifact pinned to the Studio Wall — a soft "paper on the wall" card with
 * a small kind label, title, source, and a colored pin. It registers itself as
 * `studio-{id}` so the StudioCanvas can connect it. Clicking opens the
 * discussion attached to this object.
 */
export default function ArtifactCard({
  object,
  count,
  onOpen,
}: {
  object: StudioObject;
  /** Number of contributions attached (shows a quiet "n in discussion"). */
  count: number;
  onOpen: () => void;
}) {
  const reduced = useReducedMotion();
  const anchorRef = useAnchorRef(`studio-${object.id}`);
  return (
    <motion.button
      ref={anchorRef}
      type="button"
      onClick={onOpen}
      className="absolute z-10 flex flex-col rounded-2xl border border-black/5 bg-white/85 p-4 text-left shadow-[0_6px_24px_-12px_rgba(0,0,0,0.35)] outline-none backdrop-blur-sm"
      style={{
        left: object.x,
        top: object.y,
        width: object.w,
        height: object.h,
        borderTop: `3px solid ${object.color}`,
      }}
      whileHover={reduced ? undefined : { y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
    >
      {/* Pin dot */}
      <span
        className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: object.color }}
        aria-hidden
      />
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: object.color }}
      >
        {KIND_LABEL[object.kind]}
      </span>
      <span className="mt-1.5 text-[15px] font-medium leading-snug text-foreground">
        {object.title}
      </span>
      {object.source && (
        <span className="mt-auto pt-2 text-[11px] text-foreground/45">{object.source}</span>
      )}
      {count > 0 && (
        <span
          className="mt-1 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: hexToRgba(object.color, 0.14), color: object.color }}
        >
          {count} in discussion
        </span>
      )}
    </motion.button>
  );
}
