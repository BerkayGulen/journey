// Shared domain types for the Journey welcome screen.

/** A course in the student's current semester (left sidebar block). */
export interface Course {
  id: string;
  /** Course code shown on hover, e.g. "ID 202". */
  code: string;
  name: string;
  /** Persistent course color (hex). */
  color: string;
}

// ── Academic history (right sidebar = semester spine) ─────────────────────

/** A passing/failing letter grade in the IEU system. */
export type Grade = "AA" | "BA" | "BB" | "CB" | "CC" | "DC" | "DD" | "FF";

/** One weighted component of a course's grade (project / midterm / final / …). */
export interface GradeComponent {
  label: string;
  grade: Grade;
  /** Optional weight in percent, e.g. 40 for a final worth 40%. */
  weight?: number;
}

/** A completed course shown as a full-height column in the history detail view. */
export interface HistoryCourse {
  id: string;
  /** Course code, e.g. "ID 201". */
  code: string;
  name: string;
  /** Persistent column color (hex). */
  color: string;
  /** Final passing grade, e.g. "AA". */
  grade: Grade;
  /** Project / assignment / exam breakdown revealed when the column expands. */
  breakdown: GradeComponent[];
}

/**
 * One semester block in the right "history" spine. The first three are
 * `active` (completed, clickable, full color); the rest are locked (muted).
 */
export interface Semester {
  id: string;
  /** Full label shown on hover, e.g. "1st Year Fall". */
  label: string;
  /** Compact label for tight contexts, e.g. "1st Fall". */
  shortLabel: string;
  year: 1 | 2 | 3 | 4;
  term: "fall" | "spring";
  /** Persistent semester color (hex). */
  color: string;
  /** True when completed — clickable and full color; locked/muted otherwise. */
  active: boolean;
  /** Courses taken that semester (empty for locked semesters). */
  courses: HistoryCourse[];
}

/**
 * A connection drawn as an organic line from a current course block (left)
 * to a semester block in the history spine (right).
 */
export interface ConnectionDef {
  /** Course id — source anchor (left block's right edge). */
  courseId: string;
  /** Semester id — target anchor (right strip's left edge). */
  historyId: string;
}

/** Which edge of an element an anchor point sits on. */
export type AnchorSide = "left" | "right";

// ── Private Chat workspace ────────────────────────────────────────────────

/**
 * The AI's conversational + visual register. Orthogonal to the workspace phase:
 * - "socratic"    — soft, fluid, blended colors; gentle questioning.
 * - "adversarial" — background darkens, shapes sharpen/angular; challenges.
 */
export type AiMode = "socratic" | "adversarial";

/** Who authored a chat message. */
export type MessageRole = "student" | "ai";

/** A single turn in the Private Chat conversation. */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  /** Full final text (grows while `streaming` is true). */
  text: string;
  /** Mode this message belongs to — drives its bubble shape/color. */
  mode: AiMode;
  createdAt: number;
  /** True while an AI message is still streaming in (gradual reveal). */
  streaming?: boolean;
}

/** The ongoing Private Chat conversation for a selected course. */
export interface Conversation {
  courseId: string;
  messages: ChatMessage[];
  mode: AiMode;
}
