"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { hexToRgba } from "@/lib/geometry";
import type { Assignment, Submission, SubmissionStatus } from "@/types";

const fmtDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  submitted: "submitted",
  "in-review": "in review",
  reviewed: "reviewed",
};

let uploadSeq = 0;

/**
 * The non-studio (lecture) Assignment Space. Same private student↔instructor
 * channel and visual language as the studio's, but WITHOUT the studio's phase
 * timeline or single Project Brief: each assignment is its own collapsed
 * "Assignment N" button that expands in place to reveal its Project Details
 * (description + focus), submission history, and private instructor feedback.
 */
export default function CourseAssignments({
  assignments: seed,
  accent,
}: {
  assignments: Assignment[];
  accent: string;
}) {
  const reduced = useReducedMotion();
  const [assignments, setAssignments] = useState<Assignment[]>(seed);
  // First assignment open by default so the space doesn't read as empty.
  const [openId, setOpenId] = useState<string | null>(seed[0]?.id ?? null);

  const upload = (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const version = a.submissions.length + 1;
        uploadSeq += 1;
        const next: Submission = {
          id: `up${uploadSeq}`,
          label: `Revision v${version}`,
          kind: "image",
          version,
          createdAt: Date.now(),
          status: "in-review",
        };
        return { ...a, submissions: [...a.submissions, next] };
      }),
    );
  };

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 pb-20 pt-28 sm:pt-32">
        <h2 className="font-hand text-4xl italic text-foreground">Assignment Space</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/55">
          A private space between you and your instructor. Only your own work appears here —
          open an assignment to see its details, your submissions, and feedback.
        </p>

        <div className="mt-10 space-y-4">
          {assignments.map((a, i) => {
            const open = a.id === openId;
            return (
              <motion.section
                key={a.id}
                className="overflow-hidden rounded-3xl border border-black/[0.07] bg-white/70 backdrop-blur-sm"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : i * 0.06, ease: "easeOut" }}
              >
                {/* Collapsed control — reads "Assignment N", title beneath it. */}
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : a.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-4 px-6 py-5 text-left outline-none"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ backgroundColor: open ? accent : hexToRgba(accent, 0.14), color: open ? "#fff" : accent }}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: accent }}
                    >
                      Assignment {i + 1}
                    </span>
                    <span className="mt-0.5 block truncate text-[15px] font-medium text-foreground">
                      {a.title}
                    </span>
                  </span>
                  <motion.span
                    className="shrink-0 text-foreground/35"
                    animate={{ rotate: open ? 90 : 0 }}
                    transition={{ duration: reduced ? 0 : 0.25 }}
                    aria-hidden
                  >
                    →
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="details"
                      initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0 : 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-black/[0.06] px-6 pb-6 pt-5">
                        <div
                          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                          style={{ color: accent }}
                        >
                          Project Details
                        </div>
                        {a.description && (
                          <p className="mt-2 text-sm leading-relaxed text-foreground/75">{a.description}</p>
                        )}

                        {a.focus && a.focus.length > 0 && (
                          <ul className="mt-4 flex flex-wrap gap-1.5">
                            {a.focus.map((f) => (
                              <li
                                key={f}
                                className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[11px] text-foreground/60"
                              >
                                {f}
                              </li>
                            ))}
                          </ul>
                        )}

                        {a.submissions.length > 0 && (
                          <>
                            <div className="mt-6 text-[11px] font-medium text-foreground/45">
                              {a.submissions.length} submission{a.submissions.length > 1 ? "s" : ""}
                            </div>
                            <ul className="mt-2 space-y-2">
                              {a.submissions.map((s) => (
                                <li
                                  key={s.id}
                                  className="flex items-center gap-3 rounded-xl bg-black/[0.03] px-4 py-2.5"
                                >
                                  <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: accent }}
                                    aria-hidden
                                  />
                                  <span className="text-sm text-foreground/80">{s.label}</span>
                                  <span className="ml-auto text-[11px] text-foreground/40">
                                    {fmtDate.format(s.createdAt)}
                                  </span>
                                  <span
                                    className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                                    style={{ backgroundColor: hexToRgba(accent, 0.14), color: accent }}
                                  >
                                    {STATUS_LABEL[s.status]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}

                        {a.feedback && (
                          <div
                            className="mt-4 rounded-2xl border-l-2 px-4 py-3"
                            style={{ borderColor: accent, backgroundColor: hexToRgba(accent, 0.06) }}
                          >
                            <div
                              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                              style={{ color: accent }}
                            >
                              Private feedback · Instructor
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-foreground/75">{a.feedback}</p>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => upload(a.id)}
                          className="mt-5 rounded-full border px-4 py-1.5 text-xs font-medium outline-none transition-colors"
                          style={{ borderColor: hexToRgba(accent, 0.5), color: accent }}
                        >
                          {a.submissions.length === 0 ? "Upload submission" : "Upload revision"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
