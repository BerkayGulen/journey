"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AiMode, ChatMessage, Conversation, Course } from "@/types";
import { ai } from "@/lib/ai";

/**
 * Journey state machine — the single top-level orchestrator for moving from the
 * welcome screen into the Private Chat workspace and through its phases. Kept as
 * a context (like `lib/anchors.tsx`) so every layer can read phase/mode and the
 * signature transitions (block split → enter → idea-dump) animate within one
 * continuous React tree.
 *
 * `phase` is the screen/stage; `mode` is the AI's register and is orthogonal —
 * it only matters while `conversing`.
 */
export type JourneyPhase =
  | "welcome" // initial screen (sidebars + canvas + wordmark)
  | "splitting" // a course block is showing its Classroom / Private halves
  | "entering" // Private chosen — welcome animating out, workspace in
  | "ideaDump" // immersive intro: student blob + free-form brain dump
  | "conversing"; // turns exchanged with the AI

/** How long the welcome→workspace cross-transition is given to play. */
const ENTER_MS = 650;

/**
 * Shared Framer Motion layoutId for the "Private Chat" half of the split block.
 * The workspace blob reuses it so the chosen half morphs into the workspace
 * instead of hard-cutting.
 */
export const PRIVATE_PORTAL_LAYOUT_ID = "private-portal";

interface JourneyValue {
  phase: JourneyPhase;
  mode: AiMode;
  selectedCourse: Course | null;
  conversation: Conversation;
  /** True while an AI turn is streaming in (locks input, drives "alive" feel). */
  isSending: boolean;

  // Transitions are verbs (not raw setters) so intent is explicit and the
  // animated layers can hang their enter/exit off these calls.
  selectCourse(course: Course): void; // welcome → splitting
  choosePrivate(): void; // splitting → entering → ideaDump
  chooseClassroom(): void; // stub (Classroom Chat defined later)
  cancelSplit(): void; // splitting → welcome
  submitFirstDump(text: string): void; // ideaDump → conversing
  sendTurn(text: string): void; // conversing: append student turn + AI reply
  setMode(mode: AiMode): void; // socratic ↔ adversarial
  reset(): void; // back to welcome
}

const JourneyContext = createContext<JourneyValue | null>(null);

function emptyConversation(courseId = ""): Conversation {
  return { courseId, messages: [], mode: "socratic" };
}

let messageSeq = 0;
function newId(): string {
  // Stable, dependency-free id (avoids Math.random / crypto availability quirks).
  messageSeq += 1;
  return `m${messageSeq}`;
}

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<JourneyPhase>("welcome");
  const [mode, setModeState] = useState<AiMode>("socratic");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [conversation, setConversation] = useState<Conversation>(emptyConversation());
  const [isSending, setIsSending] = useState(false);

  // Abort controller for the in-flight AI stream (cancelled on reset/unmount).
  const streamAbort = useRef<AbortController | null>(null);

  // ── Welcome → workspace ────────────────────────────────────────────────
  const selectCourse = useCallback((course: Course) => {
    setSelectedCourse(course);
    setConversation(emptyConversation(course.id));
    setModeState("socratic");
    setPhase("splitting");
  }, []);

  const cancelSplit = useCallback(() => {
    setPhase("welcome");
    setSelectedCourse(null);
  }, []);

  const choosePrivate = useCallback(() => {
    setPhase("entering");
  }, []);

  const chooseClassroom = useCallback(() => {
    // TODO(classroom): Classroom Chat flow is defined later in the brief.
    // For now this is a no-op stub — selecting it does not leave the welcome.
    cancelSplit();
  }, [cancelSplit]);

  // The `entering` phase exists purely to give the cross-transition a window;
  // advance to the idea-dump once it has had time to play.
  useEffect(() => {
    if (phase !== "entering") return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = setTimeout(() => setPhase("ideaDump"), reduced ? 0 : ENTER_MS);
    return () => clearTimeout(id);
  }, [phase]);

  // ── Conversation ─────────────────────────────────────────────────────────

  /** Append a student message; returns the message so callers can chain. */
  const appendStudent = useCallback((text: string, msgMode: AiMode): ChatMessage => {
    const msg: ChatMessage = {
      id: newId(),
      role: "student",
      text,
      mode: msgMode,
      createdAt: Date.now(),
    };
    setConversation((c) => ({ ...c, messages: [...c.messages, msg] }));
    return msg;
  }, []);

  /** Stream one AI turn, appending chunks to a new streaming message. */
  const runAiStream = useCallback(
    async (input: string, history: ChatMessage[], turnMode: AiMode) => {
      const aiMsg: ChatMessage = {
        id: newId(),
        role: "ai",
        text: "",
        mode: turnMode,
        createdAt: Date.now(),
        streaming: true,
      };
      setConversation((c) => ({ ...c, messages: [...c.messages, aiMsg] }));

      const abort = new AbortController();
      streamAbort.current = abort;
      setIsSending(true);
      try {
        for await (const chunk of ai.streamMessage({
          courseName: selectedCourse?.name ?? "",
          mode: turnMode,
          history,
          input,
          signal: abort.signal,
        })) {
          setConversation((c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === aiMsg.id ? { ...m, text: m.text + chunk } : m,
            ),
          }));
        }
        setConversation((c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === aiMsg.id ? { ...m, streaming: false } : m,
          ),
        }));
      } catch {
        // Aborted (or provider error): drop the empty/partial streaming flag.
        setConversation((c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === aiMsg.id ? { ...m, streaming: false } : m,
          ),
        }));
      } finally {
        if (streamAbort.current === abort) streamAbort.current = null;
        setIsSending(false);
      }
    },
    [selectedCourse],
  );

  const submitFirstDump = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const studentMsg = appendStudent(trimmed, "socratic");
      setPhase("conversing");
      // The opening AI turn responds to the brain-dump in Socratic mode.
      void runAiStream(trimmed, [studentMsg], "socratic");
    },
    [appendStudent, runAiStream],
  );

  const sendTurn = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;
      const studentMsg = appendStudent(trimmed, mode);
      const history = [...conversation.messages, studentMsg];
      void runAiStream(trimmed, history, mode);
    },
    [appendStudent, conversation.messages, isSending, mode, runAiStream],
  );

  const setMode = useCallback((next: AiMode) => {
    setModeState(next);
    setConversation((c) => ({ ...c, mode: next }));
  }, []);

  const reset = useCallback(() => {
    streamAbort.current?.abort();
    streamAbort.current = null;
    setIsSending(false);
    setPhase("welcome");
    setSelectedCourse(null);
    setConversation(emptyConversation());
    setModeState("socratic");
  }, []);

  // Abort any in-flight stream if the provider tree unmounts.
  useEffect(() => () => streamAbort.current?.abort(), []);

  const value = useMemo<JourneyValue>(
    () => ({
      phase,
      mode,
      selectedCourse,
      conversation,
      isSending,
      selectCourse,
      choosePrivate,
      chooseClassroom,
      cancelSplit,
      submitFirstDump,
      sendTurn,
      setMode,
      reset,
    }),
    [
      phase,
      mode,
      selectedCourse,
      conversation,
      isSending,
      selectCourse,
      choosePrivate,
      chooseClassroom,
      cancelSplit,
      submitFirstDump,
      sendTurn,
      setMode,
      reset,
    ],
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

/** Access the Journey state machine. Throws if used outside the provider. */
export function useJourney(): JourneyValue {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be used within a <JourneyProvider>");
  return ctx;
}
