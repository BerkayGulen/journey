"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { myAssignments } from "@/data/classroom";
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
 * The Assignment Space — a PRIVATE submission channel between the student and
 * the instructor. The student sees ONLY their own work; peers' submissions are
 * never visible here. Uploads are mocked (session-only): they stack a new
 * revision onto the assignment.
 */
export default function AssignmentSpace({ accent }: { accent: string }) {
  const reduced = useReducedMotion();
  const [assignments, setAssignments] = useState<Assignment[]>(myAssignments);

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
          no one else sees your submissions before reviews.
        </p>

        <div className="mt-10 space-y-6">
          {assignments.map((a, i) => (
            <motion.section
              key={a.id}
              className="rounded-3xl border border-black/[0.07] bg-white/70 p-6 backdrop-blur-sm"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : i * 0.06, ease: "easeOut" }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-medium text-foreground">{a.title}</h3>
                <span className="shrink-0 text-[11px] text-foreground/40">
                  {a.submissions.length === 0
                    ? "not submitted"
                    : `${a.submissions.length} revision${a.submissions.length > 1 ? "s" : ""}`}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">{a.brief}</p>

              {/* Revision trail. */}
              {a.submissions.length > 0 && (
                <ul className="mt-4 space-y-2">
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
              )}

              {/* Private instructor feedback (only on your own work). */}
              {a.feedback && (
                <div
                  className="mt-4 rounded-2xl border-l-2 px-4 py-3"
                  style={{ borderColor: accent, backgroundColor: hexToRgba(accent, 0.06) }}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
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
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}
