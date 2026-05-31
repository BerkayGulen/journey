import type { AiProvider, SendMessageParams } from "@/lib/ai/types";

/**
 * Mock AI provider. Produces a *gradual* reply by yielding small text chunks
 * with short delays, so the UI can reveal it word-by-word ("alive, not instant").
 * The replies are drawn from small pools and vary by turn so the prototype never
 * feels like a single canned script — but no network/key is involved.
 *
 * Replace this with a real provider via `lib/ai/index.ts` (see note there).
 */

const SOCRATIC_POOL = [
  "Say more about that. What's underneath the first thing you reached for?",
  "You're describing a symptom. What do you think is actually causing it?",
  "If you had to keep only one of these threads, which would you keep — and what would you lose?",
  "Where does this stop being annoying and start being a real problem for someone?",
  "Whose problem is this, exactly? Picture one person — what's their day like?",
];

const ADVERSARIAL_POOL = [
  "That's an assumption, not a finding. What evidence do you actually have for it?",
  "I could argue the opposite. Convince me your framing is the right one.",
  "You've shifted the problem to fit your solution. Defend the original problem.",
  "Every option you listed avoids the hardest constraint. Why?",
  "If a critic said this idea solves nothing, what would your strongest reply be?",
];

/** Resolve after `ms`, or reject early if the abort signal fires. */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** Pick a reply that varies by turn without per-frame randomness concerns. */
function pickReply(params: SendMessageParams): string {
  const priorAiTurns = params.history.filter((m) => m.role === "ai").length;
  if (params.mode === "socratic") {
    return SOCRATIC_POOL[priorAiTurns % SOCRATIC_POOL.length];
  }
  return ADVERSARIAL_POOL[priorAiTurns % ADVERSARIAL_POOL.length];
}

export const mockProvider: AiProvider = {
  async *streamMessage(params: SendMessageParams): AsyncIterable<string> {
    const reply = pickReply(params);

    // Reduced motion → no gradual reveal; emit the whole reply at once.
    if (prefersReducedMotion()) {
      yield reply;
      return;
    }

    // A small "thinking" beat before the first words land.
    await sleep(420, params.signal);

    // Stream word-by-word, keeping spaces attached so the consumer can simply
    // append. Vary the cadence a little for a more organic feel.
    const words = reply.split(" ");
    for (let i = 0; i < words.length; i++) {
      const chunk = i === 0 ? words[i] : ` ${words[i]}`;
      yield chunk;
      // Longer pause after sentence-ending punctuation.
      const trailing = /[.?!,—]$/.test(words[i]) ? 120 : 0;
      await sleep(34 + trailing, params.signal);
    }
  },
};
