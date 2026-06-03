"use client";

import { motion } from "motion/react";

export type ClassroomLayer = "wall" | "assignments" | "published";

const ITEMS: { id: ClassroomLayer; label: string }[] = [
  { id: "wall", label: "Studio Wall" },
  { id: "assignments", label: "Assignments" },
  { id: "published", label: "Published" },
];

/**
 * Minimal text-only navigation between the Classroom's layers — no dashboard
 * chrome. A thin underline marks the active layer (shared `layoutId` so it
 * glides between items).
 */
export default function LayerNav({
  active,
  accent,
  onChange,
}: {
  active: ClassroomLayer;
  accent: string;
  onChange: (layer: ClassroomLayer) => void;
}) {
  return (
    <nav className="absolute left-1/2 top-16 z-20 flex -translate-x-1/2 items-center gap-5 sm:top-6 sm:gap-7">
      {ITEMS.map((item) => {
        const on = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className="relative px-1 py-1 text-sm outline-none transition-colors"
            style={{ color: on ? "#1a1a1a" : "rgba(26,26,26,0.45)" }}
          >
            {item.label}
            {on && (
              <motion.span
                layoutId="layer-underline"
                className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full"
                style={{ backgroundColor: accent }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
