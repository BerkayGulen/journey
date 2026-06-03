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

// ── Classroom workspace (shared design studio) ────────────────────────────

/** Who a Classroom participant is. Drives the small role tag on contributions. */
export type ParticipantRole = "student" | "instructor";

/** The kind of artifact pinned to the Studio Wall (sets its small glyph/label). */
export type StudioObjectKind =
  | "brief"
  | "paper"
  | "image"
  | "video"
  | "website"
  | "book"
  | "precedent"
  | "note";

/** A themed grouping of Studio Wall objects (project phase / topic / objective). */
export interface StudioCluster {
  id: string;
  label: string;
  /** Cluster accent color (hex) — tints its objects and halo. */
  color: string;
}

/**
 * One object pinned to the Studio Wall. Position (`x`/`y`) and size (`w`/`h`)
 * are in wall coordinates (px) — the wall is a curated, pre-arranged plane the
 * student pans across. Connections between objects are drawn with Journey's
 * flowing line language (see `studioConnections`).
 */
export interface StudioObject {
  id: string;
  kind: StudioObjectKind;
  title: string;
  /** Optional source / author / origin line (e.g. "MoMA", "instructor"). */
  source?: string;
  clusterId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Persistent object color (hex) — usually the cluster's color. */
  color: string;
}

/** A relationship between two Studio Wall objects, drawn as an organic line. */
export interface StudioConnection {
  fromId: string;
  toId: string;
}

/**
 * One contribution in a contextual discussion. Discussions stay attached to the
 * object they're about (an artifact or a published work) — not a global feed.
 */
export interface ClassroomContribution {
  id: string;
  author: string;
  role: ParticipantRole;
  text: string;
  /** Epoch ms — rendered as a relative timestamp. */
  createdAt: number;
}

/** Review state of a student's assignment submission. */
export type SubmissionStatus = "submitted" | "in-review" | "reviewed";

/** One uploaded version of an assignment (revisions stack up over time). */
export interface Submission {
  id: string;
  /** What was uploaded, e.g. "Concept boards v2". */
  label: string;
  kind: StudioObjectKind;
  /** 1-based revision number. */
  version: number;
  createdAt: number;
  status: SubmissionStatus;
}

/**
 * A student's own assignment in the private Assignment Space. The student sees
 * ONLY their own submissions; peers' work is never visible here.
 */
export interface Assignment {
  id: string;
  title: string;
  brief: string;
  submissions: Submission[];
  /** Optional private instructor feedback (only on the student's own work). */
  feedback?: string;
}

/**
 * An exemplary student project the instructor has published to the whole class.
 * Becomes a permanent learning resource; students can comment on it.
 */
export interface PublishedWork {
  id: string;
  studentName: string;
  title: string;
  kind: StudioObjectKind;
  /** Thumbnail/accent color (hex). */
  color: string;
  /** Optional instructor note accompanying the published work. */
  note?: string;
  comments: ClassroomContribution[];
}
