import type { Course, HistoryStrip, ConnectionDef } from "@/types";

/**
 * Mock data for the Journey welcome screen. This is intentionally the single
 * source of truth for course colors/counts so it can later be swapped for an
 * API response without touching the components.
 */

/** Current semester — 7 persistent color blocks (palette from the design). */
export const currentCourses: Course[] = [
  { id: "c1", name: "Course 1", color: "#E63329" }, // red
  { id: "c2", name: "Course 2", color: "#E6447F" }, // pink
  { id: "c3", name: "Course 3", color: "#E3C400" }, // yellow
  { id: "c4", name: "Course 4", color: "#185C46" }, // dark green
  { id: "c5", name: "Course 5", color: "#9DBDE6" }, // light blue
  { id: "c6", name: "Course 6", color: "#243C8E" }, // navy
  { id: "c7", name: "Course 7", color: "#5A2A0E" }, // brown
];

/** Color cycle used to generate the (thinner) history strips. */
const historyPalette = [
  "#E63329",
  "#E6447F",
  "#E3C400",
  "#185C46",
  "#9DBDE6",
  "#243C8E",
  "#1A237E",
  "#5A2A0E",
];

/**
 * Previous courses / lesson history — ~20 very thin strips occupying the lower
 * quarter of the right sidebar (e.g. a 2nd-year student who has taken 20 courses).
 */
export const historyCourses: HistoryStrip[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: `h${i + 1}`,
    color: historyPalette[i % historyPalette.length],
  }),
);

/**
 * Organic lines connecting current course blocks (left) to points in the
 * history region (right). Not 1:1 — each current course maps to one history
 * strip, spread across the history band.
 */
export const connections: ConnectionDef[] = currentCourses.map((course, i) => {
  // Spread the 7 targets across the 20 history strips.
  const targetIndex = Math.round((i / (currentCourses.length - 1)) * (historyCourses.length - 1));
  return { courseId: course.id, historyId: historyCourses[targetIndex].id };
});

/** Layout constants shared by the sidebars and the connection canvas. */
export const layout = {
  /** Collapsed width of the left (current courses) sidebar, in px. */
  leftCollapsedWidth: 64,
  /** Multiplier applied to the left sidebar width when expanded (2.5–3x). */
  leftExpandFactor: 2.75,
  /** Collapsed width of the right (history) sidebar, in px. */
  rightCollapsedWidth: 26,
  /** Multiplier applied to the right sidebar width when previewed. */
  rightExpandFactor: 2.5,
  /** Fraction of screen height the history strips occupy (from the bottom). */
  historyHeightRatio: 0.25,
} as const;
