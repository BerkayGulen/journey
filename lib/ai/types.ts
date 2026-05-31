import type { AiMode, ChatMessage } from "@/types";

/**
 * Provider-agnostic AI contract. The whole app talks to the AI only through
 * this interface, so swapping the mock for a real provider (Gemini / OpenAI)
 * is a one-line change in `lib/ai/index.ts` — see the integration note there.
 */

/** Everything a provider needs to produce the next AI turn. */
export interface SendMessageParams {
  /** Human-readable course name, for prompt context. */
  courseName: string;
  /** Current AI register (shapes tone: questioning vs challenging). */
  mode: AiMode;
  /** Prior turns, oldest-first, for conversational context. */
  history: ChatMessage[];
  /** The latest student text we're responding to. */
  input: string;
  /** Abort an in-flight stream (e.g. the user navigates away). */
  signal?: AbortSignal;
}

export interface AiProvider {
  /**
   * Stream the reply as text chunks. Consumed with `for await (… of …)`, this
   * yields the "alive", gradual reveal the design calls for — and is the exact
   * same contract a real SSE/streaming endpoint exposes, so nothing downstream
   * changes when a real provider is wired in.
   */
  streamMessage(params: SendMessageParams): AsyncIterable<string>;
}
