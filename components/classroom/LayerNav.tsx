"use client";

import { motion } from "motion/react";

export type ClassroomLayer = "wall" | "announcements" | "assignments" | "selected";

const STUDIO_ITEMS: { id: ClassroomLayer; label: string }[] = [
  { id: "wall", label: "Studio Wall" },
  { id: "assignments", label: "Assignments" },
  { id: "selected", label: "Selected Works" },
];

const LECTURE_ITEMS: { id: ClassroomLayer; label: string }[] = [
  { id: "announcements", label: "Announcements" },
  { id: "assignments", label: "Assignments" },
  { id: "selected", label: "Selected Works" },
];

/**
 * Minimal text-only navigation between the Classroom's layers — no dashboard
 * chrome. A thin underline marks the active layer (shared `layoutId` so it
 * glides between items). Studio courses lead with the Studio Wall; non-studio
 * (lecture) courses lead with Announcements. Rendered inline inside the app bar
 * (the header positions it); it carries no positioning of its own.
 */
export default function LayerNav({
  active,
  accent,
  studio,
  onChange,
}: {
  active: ClassroomLayer;
  accent: string;
  studio: boolean;
  onChange: (layer: ClassroomLayer) => void;
}) {
  const items = studio ? STUDIO_ITEMS : LECTURE_ITEMS;
  return (
    <nav className="flex items-center gap-5 sm:gap-7">
      {items.map((item) => {
        const on = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className="relative px-1 py-1 text-sm whitespace-nowrap outline-none transition-colors"
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
