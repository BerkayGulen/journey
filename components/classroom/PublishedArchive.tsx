"use client";

import { motion, useReducedMotion } from "motion/react";
import { hexToRgba, readableTextColor } from "@/lib/geometry";
import type { PublishedWork } from "@/types";

/**
 * The Published Work Archive — exemplary projects the instructor published to
 * the whole class. A calm gallery (not a feed); each card opens the work's
 * discussion, where students can comment. Permanent learning resources.
 */
export default function PublishedArchive({
  works,
  onOpen,
}: {
  works: PublishedWork[];
  onOpen: (work: PublishedWork) => void;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-28 sm:pt-32">
        <h2 className="font-hand text-4xl italic text-foreground">Published Work</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/55">
          Work selected from past reviews, kept as a living archive for the whole class to learn
          from. Open any project to read its story and join the discussion.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((w, i) => (
            <motion.button
              key={w.id}
              type="button"
              onClick={() => onOpen(w)}
              className="group flex flex-col overflow-hidden rounded-3xl border border-black/[0.07] bg-white/70 text-left outline-none backdrop-blur-sm"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : i * 0.05, ease: "easeOut" }}
              whileHover={reduced ? undefined : { y: -4 }}
            >
              {/* Color "thumbnail" board. */}
              <div
                className="flex h-36 items-end p-4"
                style={{ background: `linear-gradient(135deg, ${w.color}, ${hexToRgba(w.color, 0.7)})` }}
              >
                <span
                  className="text-xs font-medium uppercase tracking-[0.16em] opacity-80"
                  style={{ color: readableTextColor(w.color) }}
                >
                  {w.kind}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-medium leading-snug text-foreground">{w.title}</h3>
                <span className="mt-0.5 text-xs text-foreground/50">{w.studentName}</span>
                {w.note && (
                  <p className="mt-3 text-[13px] leading-relaxed text-foreground/60">{w.note}</p>
                )}
                <span className="mt-auto pt-4 text-[11px] text-foreground/40">
                  {w.comments.length > 0
                    ? `${w.comments.length} comment${w.comments.length > 1 ? "s" : ""}`
                    : "Open to comment"}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
