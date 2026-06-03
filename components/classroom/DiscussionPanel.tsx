"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { hexToRgba } from "@/lib/geometry";
import type { ClassroomContribution } from "@/types";

const fmtDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/**
 * The Discussion Layer, realized contextually: a calm side sheet showing the
 * conversation attached to one object (an artifact or a published work).
 * Contributions are stacked annotations — name, Student/Instructor role,
 * timestamp, text — NOT chat bubbles. A quiet composer adds a thought.
 */
export default function DiscussionPanel({
  title,
  subtitle,
  accent,
  contributions,
  onClose,
  onAdd,
}: {
  title: string;
  subtitle?: string;
  accent: string;
  contributions: ClassroomContribution[];
  onClose: () => void;
  onAdd: (text: string) => void;
}) {
  const reduced = useReducedMotion();
  const [draft, setDraft] = useState("");

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft("");
  };

  return (
    <>
      {/* Click-away scrim. */}
      <motion.div
        className="absolute inset-0 z-40 bg-black/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.25 }}
        onClick={onClose}
        aria-hidden
      />

      <motion.aside
        className="absolute right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-black/10 bg-background/95 backdrop-blur-md"
        initial={reduced ? { opacity: 0 } : { x: "100%" }}
        animate={reduced ? { opacity: 1 } : { x: 0 }}
        exit={reduced ? { opacity: 0 } : { x: "100%" }}
        transition={{ type: reduced ? "tween" : "spring", stiffness: 280, damping: 32, duration: reduced ? 0 : undefined }}
      >
        {/* Header — what the discussion is attached to. */}
        <header className="flex items-start justify-between gap-4 px-7 pb-5 pt-7">
          <div>
            <div className="text-lg font-medium leading-snug text-foreground">{title}</div>
            {subtitle && <div className="mt-1 text-xs text-foreground/45">{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close discussion"
            className="-mr-1 -mt-1 rounded-full px-2 py-1 font-hand text-2xl italic leading-none text-foreground/50 outline-none transition-colors hover:text-foreground"
          >
            ×
          </button>
        </header>

        {/* Thread — stacked annotations, separated by hairlines (no bubbles). */}
        <div className="flex-1 overflow-y-auto px-7">
          {contributions.length === 0 ? (
            <p className="py-6 font-hand text-xl italic text-foreground/40">
              No discussion yet — start one.
            </p>
          ) : (
            <ul className="divide-y divide-black/[0.06]">
              {contributions.map((c) => (
                <li key={c.id} className="py-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-foreground">{c.author}</span>
                    <RoleTag role={c.role} accent={accent} />
                    <span className="ml-auto text-[11px] text-foreground/40">
                      {fmtDate.format(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-foreground/80">{c.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Composer. */}
        <div className="border-t border-black/10 px-7 py-5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="add a thought…"
            className="w-full resize-none rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-foreground/35 focus:border-black/20"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-foreground/35">Enter to add · Shift+Enter for a line break</span>
            <button
              type="button"
              onClick={submit}
              disabled={!draft.trim()}
              className="rounded-full px-4 py-1.5 text-xs font-medium text-white outline-none transition-opacity disabled:opacity-40"
              style={{ backgroundColor: accent }}
            >
              Add
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function RoleTag({ role, accent }: { role: ClassroomContribution["role"]; accent: string }) {
  const instructor = role === "instructor";
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
      style={
        instructor
          ? { backgroundColor: hexToRgba(accent, 0.16), color: accent }
          : { backgroundColor: "rgba(0,0,0,0.05)", color: "rgba(26,26,26,0.55)" }
      }
    >
      {instructor ? "Instructor" : "Student"}
    </span>
  );
}
