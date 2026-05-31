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
