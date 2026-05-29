// Shared domain types for the Journey welcome screen.

/** A course in the student's current semester (left sidebar block). */
export interface Course {
  id: string;
  name: string;
  /** Persistent course color (hex). */
  color: string;
}

/** A previously-taken course (right sidebar history strip). */
export interface HistoryStrip {
  id: string;
  color: string;
}

/**
 * A connection drawn as an organic line from a current course block (left)
 * to a point in the course-history region (right).
 */
export interface ConnectionDef {
  /** Course id — source anchor (left block's right edge). */
  courseId: string;
  /** History strip id — target anchor (right strip's left edge). */
  historyId: string;
}

/** Which edge of an element an anchor point sits on. */
export type AnchorSide = "left" | "right";
