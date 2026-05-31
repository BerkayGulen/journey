import type { AiProvider } from "@/lib/ai/types";
import { mockProvider } from "@/lib/ai/mockProvider";

export type { AiProvider, SendMessageParams } from "@/lib/ai/types";

// ─────────────────────────────────────────────────────────────────────────
// AI INTEGRATION POINT
//
// The whole app reaches the AI only through `ai.streamMessage(...)`, which
// yields text chunks (AsyncIterable<string>). To plug in a real model:
//
//   1. Create a server-side Route Handler at `app/api/chat/route.ts` that holds
//      the API key (NEVER expose keys to this client component) and proxies the
//      provider (Gemini / OpenAI / …), returning a streamed response.
//   2. Write a `realProvider: AiProvider` whose `streamMessage` POSTs to that
//      route and adapts the response stream into the same `AsyncIterable<string>`
//      contract (read the ReadableStream, decode, yield chunks).
//   3. Swap the export below: `export const ai = realProvider;`
//
// Nothing else in the app changes — the streaming contract is identical, so the
// gradual "alive" reveal, mode handling, and message model all keep working.
// ─────────────────────────────────────────────────────────────────────────
export const ai: AiProvider = mockProvider;
