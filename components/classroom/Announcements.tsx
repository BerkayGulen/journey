"use client";

import { motion, useReducedMotion } from "motion/react";
import { hexToRgba } from "@/lib/geometry";
import type { Announcement } from "@/types";

const fmtDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Announcements — a non-studio course's read-only notice board (replaces the
 * Studio Wall for lecture courses). Instructor posts only; students cannot
 * write here. Deliberately NOT a feed, board, or chat: calm, minimal cards in
 * Journey's visual language, newest first. Each shows title, message, the
 * posting instructor, and the date.
 */
export default function Announcements({
  announcements,
  accent,
}: {
  announcements: Announcement[];
  accent: string;
}) {
  const reduced = useReducedMotion();
  const sorted = [...announcements].sort((a, b) => b.postedAt - a.postedAt);

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 pb-20 pt-28 sm:pt-32">
        <h2 className="font-hand text-4xl italic text-foreground">Announcements</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/55">
          Course notices from your instructor — schedule changes, deadlines, and shared files.
          A notice board, not a conversation.
        </p>

        {sorted.length === 0 ? (
          <p className="mt-16 text-center text-sm italic text-foreground/40">Nothing posted yet.</p>
        ) : (
          <div className="mt-10 space-y-5">
            {sorted.map((a, i) => (
              <motion.article
                key={a.id}
                className="rounded-3xl border border-black/[0.07] bg-white/70 p-6 backdrop-blur-sm"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : i * 0.06, ease: "easeOut" }}
              >
                {/* A slim accent rule keys the card to the course color. */}
                <span
                  className="block h-[3px] w-9 rounded-full"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
                <h3 className="mt-4 text-lg font-medium leading-snug text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{a.message}</p>

                <div className="mt-5 flex items-center gap-2 text-[11px] text-foreground/45">
                  <span
                    className="rounded-full px-2 py-0.5 font-medium uppercase tracking-wide"
                    style={{ backgroundColor: hexToRgba(accent, 0.12), color: accent }}
                  >
                    Instructor
                  </span>
                  <span className="text-foreground/60">{a.instructor}</span>
                  <span aria-hidden>·</span>
                  <span>{fmtDate.format(a.postedAt)}</span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
