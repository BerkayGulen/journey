"use client";

import { motion, useReducedMotion } from "motion/react";
import { hexToRgba } from "@/lib/geometry";
import type { SelectedWork } from "@/types";

/**
 * Selected Works — instructor-picked *learning moments* kept as a living archive
 * so peers can learn from the process. Studio works carry a board image + phase;
 * lecture (non-studio) works have neither yet, so they render a generated
 * colored placeholder cover instead. Clicking a card opens its discussion (and,
 * when a real board image exists, that board full-size).
 */
export default function SelectedWorks({
  works,
  onOpen,
}: {
  works: SelectedWork[];
  onOpen: (work: SelectedWork) => void;
}) {
  const reduced = useReducedMotion();

  if (works.length === 0) {
    return (
      <div className="absolute inset-0 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 pb-20 pt-28 sm:pt-32">
          <h2 className="font-hand text-4xl text-foreground">Selected Works</h2>
          <p className="mt-16 text-center text-sm italic text-foreground/40">Nothing posted yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-28 sm:pt-32">
        <h2 className="font-hand text-4xl text-foreground">Selected Works</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/55">
          Moments the instructors chose for what they teach — sharp observations, strong research,
          brave ideation, telling experiments. Not finished projects: the value is in the process.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              {/* Cover — the board image, or a generated colored placeholder. */}
              <div className="relative aspect-[3/2] overflow-hidden bg-black/[0.03]">
                {w.phase != null && (
                  <span
                    className="absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white"
                    style={{ backgroundColor: hexToRgba(w.color, 0.85) }}
                  >
                    Phase {w.phase}
                  </span>
                )}
                {w.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={w.image}
                    alt={`${w.studentName}${w.phaseLabel ? ` — ${w.phaseLabel}` : ""}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    draggable={false}
                  />
                ) : (
                  <PlaceholderCover work={w} />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                {w.phaseLabel && (
                  <span className="text-[11px] font-medium uppercase tracking-wide text-foreground/40">
                    {w.phaseLabel}
                  </span>
                )}
                <h3 className="mt-1 text-base font-medium leading-snug text-foreground">{w.title}</h3>
                <span className="mt-0.5 text-xs text-foreground/50">{w.studentName}</span>
                <span className="mt-auto pt-4 text-[11px] text-foreground/40">
                  {w.comments.length > 0
                    ? `${w.comments.length} comment${w.comments.length > 1 ? "s" : ""}`
                    : "Open to discuss"}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * A generated cover for works without a board image: a soft diagonal wash of the
 * work's accent color with the title set over it — a calm stand-in until a real
 * board image is provided.
 */
function PlaceholderCover({ work }: { work: SelectedWork }) {
  return (
    <div
      className="flex h-full w-full items-end p-5 transition-transform duration-500 group-hover:scale-[1.03]"
      style={{
        backgroundImage: `linear-gradient(135deg, ${hexToRgba(work.color, 0.92)} 0%, ${hexToRgba(
          work.color,
          0.6,
        )} 100%)`,
      }}
    >
      <span className="font-hand text-2xl leading-tight text-white/95">{work.title}</span>
    </div>
  );
}
