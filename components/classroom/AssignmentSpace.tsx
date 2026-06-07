"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { assignmentPhases, myAssignments, projectBrief } from "@/data/classroom";
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
 * the instructor. The student sees ONLY their own work. Holds the central
 * Project Brief reference, a phase timeline showing where the class stands, and
 * the student's own submissions (mocked, session-only uploads).
 */
export default function AssignmentSpace({ accent }: { accent: string }) {
  const reduced = useReducedMotion();
  const [assignments, setAssignments] = useState<Assignment[]>(myAssignments);
  const [briefOpen, setBriefOpen] = useState(false);

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

  if (briefOpen) {
    return <ProjectBriefView accent={accent} onBack={() => setBriefOpen(false)} />;
  }

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 pb-20 pt-28 sm:pt-32">
        <h2 className="font-hand text-4xl text-foreground">Assignment Space</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-foreground/55">
          A private space between you and your instructor. Only your own work appears here —
          no one else sees your submissions before reviews.
        </p>

        {/* Phase timeline — where the class currently stands. */}
        <PhaseTimeline accent={accent} />

        {/* Project Brief — the central assignment reference (above Research Synthesis). */}
        <button
          type="button"
          onClick={() => setBriefOpen(true)}
          className="mt-10 flex w-full items-center justify-between rounded-2xl px-6 py-4 text-left outline-none transition-transform hover:-translate-y-0.5"
          style={{ backgroundColor: accent, color: "#fff" }}
        >
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.18em]">Project Brief</span>
            <span className="mt-0.5 block text-xs opacity-80">{projectBrief.title}</span>
          </span>
          <span className="font-hand text-2xl opacity-90">open →</span>
        </button>

        <div className="mt-6 space-y-6">
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

/** A calm timeline communicating where the class currently is. */
function PhaseTimeline({ accent }: { accent: string }) {
  return (
    <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4 rounded-3xl border border-black/[0.07] bg-white/50 px-6 py-5">
      {assignmentPhases.map((p) => {
        const active = p.status === "active";
        const locked = p.status === "locked";
        return (
          <div key={p.number} className="flex min-w-[7rem] flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold"
                style={
                  locked
                    ? { border: "1.5px solid rgba(26,26,26,0.2)", color: "rgba(26,26,26,0.3)" }
                    : { backgroundColor: active ? accent : hexToRgba(accent, 0.25), color: active ? "#fff" : accent }
                }
              >
                {p.number}
              </span>
              <span
                className="text-[11px] font-medium uppercase tracking-wide"
                style={{ color: active ? accent : locked ? "rgba(26,26,26,0.3)" : "rgba(26,26,26,0.5)" }}
              >
                {active ? "Current" : locked ? "Locked" : "Completed"}
              </span>
            </div>
            <span
              className="text-[13px] leading-snug"
              style={{ color: locked ? "rgba(26,26,26,0.35)" : "#1a1a1a", fontWeight: active ? 600 : 400 }}
            >
              {p.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Full-page reading view of the project brief; "← Back" returns to the list. */
function ProjectBriefView({ accent, onBack }: { accent: string; onBack: () => void }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="absolute inset-0 overflow-y-auto"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.35, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-2xl px-6 pb-20 pt-28 sm:pt-32">
        <button
          type="button"
          onClick={onBack}
          className="font-hand text-xl text-foreground/55 outline-none transition-colors hover:text-foreground"
        >
          ← Back
        </button>

        <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
          {projectBrief.course}
        </div>
        <h2 className="mt-1 text-3xl font-medium text-foreground">{projectBrief.title}</h2>
        <p className="mt-2 text-sm text-foreground/50">{projectBrief.instructors.join(" · ")}</p>

        <div className="mt-6 space-y-3">
          {projectBrief.objective.map((para, i) => (
            <p key={i} className="text-[14px] leading-relaxed text-foreground/75">
              {para}
            </p>
          ))}
        </div>

        <div className="mt-10 space-y-5">
          {projectBrief.phases.map((ph) => (
            <section key={ph.number} className="rounded-3xl border border-black/[0.07] bg-white/70 p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">
                  Phase {ph.number} · {ph.title}
                </h3>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  style={{ backgroundColor: hexToRgba(accent, 0.14), color: accent }}
                >
                  {ph.dueDate} · {ph.weight}%
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground/65">{ph.summary}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {ph.deliverables.map((d) => (
                  <li
                    key={d}
                    className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[11px] text-foreground/60"
                  >
                    {d}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
