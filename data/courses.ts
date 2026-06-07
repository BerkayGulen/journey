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
  { id: "ffd202", code: "FFD 202", name: "Advanced Design Presentation Techniques", color: "#8B162B" }, // Crimson Ink
  { id: "id202", code: "ID 202", name: "Product Design Studio II", color: "#F9B6B8", studio: true }, // Dusty Rose — the studio course
  { id: "id204", code: "ID 204", name: "Semiotics in Industrial Design", color: "#C6B63B" }, // Neon Pear
  { id: "id208", code: "ID 208", name: "Manufacturing Technologies", color: "#0E4943" }, // Emerald
  { id: "geec207", code: "GEEC 207", name: "Economic History", color: "#BAD2E8" }, // Arctic Blue
  { id: "itl202", code: "ITL 202", name: "Italian Language IV", color: "#F37521" }, // Burnt Sienna
];

/**
 * Whether a course opens the full design-studio Classroom (Studio Wall etc.).
 * Only ID 202 is a studio course; everything else is a lecture/non-studio
 * course (Announcements · Assignments · Selected Works).
 */
export function isStudioCourse(course: Course | null | undefined): boolean {
  return course?.studio === true;
}

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
  /** Right (history) sidebar: slim collapsed strip; expanded wide enough for labels. */
  rightCollapsedWidth: leftCollapsedWidth / 2, // 32
  rightExpandedWidth: 150,
  /** Fraction of screen height the right sidebar occupies (anchored to the bottom). */
  rightHeightRatio: 1,
} as const;
