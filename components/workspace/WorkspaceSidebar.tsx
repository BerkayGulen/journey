"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useJourney } from "@/lib/journey-state";
import {
  activeMilestoneId,
  milestones,
  profile,
  resources,
} from "@/data/workspace";

/**
 * The workspace right sidebar: the design-process Milestones, a Resources
 * section, and the student's profile footer. Colors adapt to the current mode
 * so it stays legible on both the light (Socratic) and dark (Adversarial)
 * backgrounds.
 *
 * Collapsed by default — only a three-line handle shows at the top-right. The
 * user opens the full panel by clicking it; clicking the handle again (or the
 * close control) collapses it back. Once open, hovering expands the active
 * milestone (Problem Definition) to reveal its sub-steps.
 *
 * Mounted only during the conversation (kept out of the immersive idea-dump).
 */
export default function WorkspaceSidebar() {
  const { mode } = useJourney();
  const reduced = useReducedMotion();
  const adversarial = mode === "adversarial";
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const heading = adversarial ? "text-white/85" : "text-foreground/85";
  const item = adversarial ? "text-white/65" : "text-foreground/70";
  const sub = adversarial ? "text-white/40" : "text-foreground/45";
  const panel = adversarial
    ? "border-white/10 bg-white/[0.04]"
    : "border-foreground/10 bg-foreground/[0.03]";
  const avatarBorder = adversarial ? "border-white/30" : "border-foreground/25";
  const line = adversarial ? "bg-white/70" : "bg-foreground/55";

  return (
    <>
      {/* Collapsed handle — three lines, top-right. The only thing visible at
          rest; clicking it opens the panel. */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="ws-sidebar-handle"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open milestones"
            className="absolute right-7 top-7 z-20 hidden flex-col gap-[5px] p-1 outline-none md:flex"
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 12 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: 12 }}
            transition={{ duration: reduced ? 0.2 : 0.4, ease: "easeOut" }}
            whileHover={reduced ? undefined : { scale: 1.06 }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-[2px] w-6 rounded-full transition-colors duration-700 ${line}`}
              />
            ))}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="ws-sidebar-panel"
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: 24 }}
            transition={{ duration: reduced ? 0.2 : 0.6, ease: "easeOut" }}
            className={`absolute right-0 top-0 z-10 hidden h-full w-60 flex-col justify-between border-l px-6 py-8 backdrop-blur-md transition-colors duration-700 md:flex ${panel}`}
          >
            {/* Close control — collapses back to the three-line handle. */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close milestones"
              className={`absolute right-5 top-7 flex flex-col gap-[5px] p-1 outline-none transition-opacity duration-300 hover:opacity-100 ${
                adversarial ? "opacity-70" : "opacity-60"
              }`}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-[2px] w-6 rounded-full transition-colors duration-700 ${line}`}
                />
              ))}
            </button>

            <div className="flex flex-col gap-6">
        {/* Milestones */}
        <section>
          <h2
            className={`mb-3 text-sm font-semibold tracking-wide transition-colors duration-700 ${heading}`}
          >
            Milestones
          </h2>
          <ul className="flex flex-col gap-2">
            {milestones.map((m) => (
              <li key={m.id}>
                <span
                  className={`text-[13px] transition-colors duration-700 ${item} ${
                    m.id === activeMilestoneId ? "font-medium" : ""
                  }`}
                >
                  {m.label}
                </span>

                <AnimatePresence initial={false}>
                  {m.children && hovered && (
                    <motion.ul
                      key="children"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0 : 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      {m.children.map((c) => (
                        <li
                          key={c}
                          className={`mt-1.5 pl-3 text-[11px] italic transition-colors duration-700 ${sub}`}
                        >
                          {c}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </section>

        {/* Resources */}
        <section>
          <h2
            className={`mb-3 text-sm font-semibold tracking-wide transition-colors duration-700 ${heading}`}
          >
            Resources
          </h2>
          {resources.length > 0 && (
            <ul className="flex flex-col gap-2">
              {resources.map((r) => (
                <li
                  key={r}
                  className={`text-[13px] transition-colors duration-700 ${item}`}
                >
                  {r}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Profile footer */}
      <div className="flex items-center gap-3">
        <div
          className={`h-9 w-9 shrink-0 rounded-full border transition-colors duration-700 ${avatarBorder}`}
          aria-hidden
        />
        <div>
          <div
            className={`text-[13px] font-semibold transition-colors duration-700 ${item}`}
          >
            {profile.name}
          </div>
          <div
            className={`text-[10px] italic transition-colors duration-700 ${sub}`}
          >
            {profile.role}
          </div>
        </div>
      </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
