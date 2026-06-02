import type { Course, ConnectionDef } from "@/types";
import { semesters } from "@/data/semesters";

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

/**
 * Organic lines connecting current course blocks (left) to semester blocks in
 * the history spine (right). Not 1:1 — each current course maps to one semester,
 * spread across the full-height spine so the fan covers it top-to-bottom.
 */
export const connections: ConnectionDef[] = currentCourses.map((course, i) => {
  const targetIndex = Math.round((i / (currentCourses.length - 1)) * (semesters.length - 1));
  return { courseId: course.id, historyId: semesters[targetIndex].id };
});

/** Collapsed width of the left (current courses) sidebar, in px. */
const leftCollapsedWidth = 64;
/** Multiplier applied to the left sidebar width when expanded. */
const leftExpandFactor = 3.25;

/** Layout constants shared by the sidebars and the connection canvas. */
export const layout = {
  leftCollapsedWidth,
  leftExpandFactor,
  /** Right (history) sidebar widths — half the left sidebar's, collapsed & expanded. */
  rightCollapsedWidth: leftCollapsedWidth / 2, // 32
  rightExpandedWidth: (leftCollapsedWidth * leftExpandFactor) / 2, // 104
  /** Fraction of screen height the right sidebar occupies (anchored to the bottom). */
  rightHeightRatio: 1,
} as const;
