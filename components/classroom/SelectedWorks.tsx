"use client";

import { motion, useReducedMotion } from "motion/react";
import { hexToRgba, readableTextColor } from "@/lib/geometry";
import type { SelectedWork } from "@/types";

/**
 * Selected Works — instructor-picked *learning moments* from earlier phases
 * (not final outcomes), kept as a living archive so peers can learn from the
 * process. A calm gallery; each card opens the work's detail + discussion.
 */
export default function SelectedWorks({
  works,
  onOpen,
}: {
  works: SelectedWork[];
  onOpen: (work: SelectedWork) => void;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-28 sm:pt-32">
        <h2 className="font-hand text-4xl italic text-foreground">Selected Works</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/55">
          Moments the instructors chose for what they teach — sharp observations, strong research,
          brave ideation, telling experiments. Not finished projects: the value is in the process.
          Open any to read its story and join the discussion.
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
              {/* Color "board" with the phase tag. */}
              <div
                className="flex h-32 items-start justify-between p-4"
                style={{ background: `linear-gradient(135deg, ${w.color}, ${hexToRgba(w.color, 0.7)})` }}
              >
                <span
                  className="rounded-full bg-black/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: readableTextColor(w.color) }}
                >
                  Phase {w.phase}
                </span>
                <span
                  className="text-[10px] font-medium uppercase tracking-[0.16em] opacity-80"
                  style={{ color: readableTextColor(w.color) }}
                >
                  {w.kind}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-foreground/40">
                  {w.phaseLabel}
                </span>
                <h3 className="mt-1 text-base font-medium leading-snug text-foreground">{w.title}</h3>
                <span className="mt-0.5 text-xs text-foreground/50">{w.studentName}</span>
                <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-foreground/60">
                  {w.description}
                </p>
                {w.instructorNote && (
                  <p className="mt-3 border-l-2 border-black/10 pl-3 text-[12px] italic leading-relaxed text-foreground/55">
                    “{w.instructorNote}”
                  </p>
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
