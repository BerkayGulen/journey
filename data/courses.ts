import type { Course, HistoryStrip, ConnectionDef } from "@/types";

/**
 * Mock data for the Journey welcome screen. This is intentionally the single
 * source of truth for course colors/counts so it can later be swapped for an
 * API response without touching the components.
 */

/**
 * Current semester — example program of an IEU (İzmir University of Economics)
 * Industrial Design student, 2nd year spring (4th semester / 4. yarıyıl).
 * Each block has a persistent color; the code appears on hover.
 */
export const currentCourses: Course[] = [
  { id: "ffd202", code: "FFD 202", name: "İleri Tasarım Sunum Teknikleri", color: "#8B162B" }, // Crimson Ink
  { id: "id202", code: "ID 202", name: "Ürün Tasarım Stüdyosu II", color: "#F9B6B8" }, // Dusty Rose
  { id: "id204", code: "ID 204", name: "Endüstriyel Tasarımda Göstergebilim", color: "#C6B63B" }, // Neon Pear
  { id: "id208", code: "ID 208", name: "Üretim Teknolojileri", color: "#F6F3CF" }, // Cosmic Latte
  { id: "pool003", code: "POOL 003", name: "GED - Sosyal Bilimler A: İktisadi Bilimler", color: "#BAD2E8" }, // Arctic Blue
  { id: "sfl202", code: "SFL 202", name: "İkinci Yabancı Diller IV", color: "#F37521" }, // Burnt Sienna
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
  /** Multiplier applied to the left sidebar width when expanded. */
  leftExpandFactor: 3.25,
  /** Collapsed width of the right (history) sidebar, in px. */
  rightCollapsedWidth: 26,
  /** Multiplier applied to the right sidebar width when previewed. */
  rightExpandFactor: 2.5,
  /** Fraction of screen height the history strips occupy (from the bottom). */
  historyHeightRatio: 0.25,
} as const;
