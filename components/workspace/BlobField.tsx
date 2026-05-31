"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { AiMode } from "@/types";
import { hexToRgba } from "@/lib/geometry";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** One slow shared cycle for both blobs, so they stay phase-locked ("in sync"). */
const DANCE_SECONDS = 24;

/**
 * Choreographed motion for the two blobs. They share one tempo and trace
 * mirrored paths: swaying side to side in opposition, leaning *toward* each
 * other near the middle of each cycle (cores converge → the colors blend most —
 * the "meeting" beat of the conversation), then drifting apart, with a gentle
 * swirl and breathing. The student leads from above, the AI answers from below.
 */
const studentDance = {
  x: [0, 64, 0, -64, 0],
  y: [0, 28, 52, 28, 0], // drifts down toward the AI, peaking mid-cycle
  rotate: [0, 5, 0, -5, 0],
  scale: [1, 1.04, 1.07, 1.04, 1],
};
const aiDance = {
  x: [0, -64, 0, 64, 0], // mirror of the student
  y: [0, -28, -52, -28, 0], // rises up toward the student, peaking mid-cycle
  rotate: [0, -5, 0, 5, 0],
  scale: [1, 1.05, 1.08, 1.05, 1],
};
const danceTransition = {
  duration: DANCE_SECONDS,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

/**
 * Tween a 0→1 "morph" value when `active` flips, easing over ~1.4s. Drives the
 * soft↔sharp blob morph for the Socratic↔Adversarial transition. Reduced motion
 * jumps straight to the target.
 */
function useMorph(active: boolean, reduced: boolean | null): number {
  const [morph, setMorph] = useState(active ? 1 : 0);
  const valRef = useRef(morph);
  const rafRef = useRef(0);

  useEffect(() => {
    const to = active ? 1 : 0;
    if (reduced) {
      valRef.current = to;
      rafRef.current = requestAnimationFrame(() => setMorph(to));
      return () => cancelAnimationFrame(rafRef.current);
    }
    const from = valRef.current;
    if (from === to) return;
    let start = 0;
    const dur = 1400;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min(1, (ts - start) / dur);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOut
      const v = from + (to - from) * e;
      valRef.current = v;
      setMorph(v);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, reduced]);

  return morph;
}

/**
 * The amorphous color field behind the workspace.
 *  - Student blob = selected course color; AI blob = distinct hue, enters from
 *    below and then *dances in sync* with the student blob (see the dance defs).
 *  - Socratic: low-frequency turbulence + heavy blur → soft, round, gooey.
 *  - Adversarial: high-frequency turbulence, more octaves, ~no blur → jagged,
 *    pointed, tense. The morph animates these filter scalars over the flip.
 *  - Blend mode switches multiply (light bg) → screen (dark bg).
 */
export default function BlobField({
  studentColor,
  aiColor,
  showAi,
  mode,
}: {
  studentColor: string;
  aiColor: string;
  showAi: boolean;
  mode: AiMode;
}) {
  const reduced = useReducedMotion();
  const morph = useMorph(mode === "adversarial", reduced);

  // Filter scalars interpolated soft (0) → sharp (1).
  const baseFreq = lerp(0.009, 0.052, morph).toFixed(4);
  const octaves = Math.round(lerp(2, 4, morph));
  const dispScale = lerp(42, 82, morph);
  const blur = lerp(14, 1.4, morph);
  const blend = morph > 0.5 ? "screen" : "multiply";

  const gradient = (color: string, cy: number) =>
    `radial-gradient(circle at 50% ${cy}%, ${hexToRgba(
      color,
      lerp(0.85, 0.95, morph),
    )} 0%, ${hexToRgba(color, lerp(0.45, 0.6, morph))} 33%, ${hexToRgba(
      color,
      0,
    )} 69%)`;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* SVG filter (morphs soft→sharp via interpolated scalars). */}
      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <defs>
          <filter id="blob-filter" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseFreq}
              numOctaves={octaves}
              seed={7}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={dispScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
      </svg>

      {/* Student blob — leads from upper-center, dancing. */}
      <motion.div
        className="absolute left-1/2 top-[40%] h-[56vh] w-[60vw] -translate-x-1/2 -translate-y-1/2"
        style={{
          filter: "url(#blob-filter)",
          mixBlendMode: blend,
          background: gradient(studentColor, 45),
        }}
        animate={reduced ? undefined : studentDance}
        transition={reduced ? undefined : danceTransition}
      />

      {/* AI blob — enters from below (entrance on the wrapper), then the inner
          element dances in sync with the student. */}
      <AnimatePresence>
        {showAi && (
          <motion.div
            key="ai-blob"
            className="absolute left-1/2 top-[60%] h-[52vh] w-[56vw] -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, y: reduced ? 0 : 240 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 200 }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    opacity: { duration: 1.3, ease: "easeOut" },
                    y: { type: "spring", stiffness: 52, damping: 18 },
                  }
            }
          >
            <motion.div
              className="h-full w-full"
              style={{
                filter: "url(#blob-filter)",
                mixBlendMode: blend,
                background: gradient(aiColor, 55),
              }}
              animate={reduced ? undefined : aiDance}
              transition={reduced ? undefined : danceTransition}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
