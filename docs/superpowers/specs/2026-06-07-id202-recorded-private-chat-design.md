# ID 202 Recorded Private Chat (read-only demo)

**Date:** 2026-06-07
**Status:** Approved (ready for implementation)

## Goal

For **ID 202 (Product Design Studio II) only**, the Private Chat shows a
previously-recorded, **read-only** conversation between a student and Journey.
Reviewers scroll through it; they cannot send messages or modify it. It
demonstrates how Journey stores the student's process, how milestones are
generated, and how the AI questions in Socratic mode.

Every other course keeps the existing live Private Chat (idea-dump → streamed
AI conversation) unchanged. Only ID 202 changes.

## Decisions (user-approved)

- **All Socratic for now.** The provided transcript is entirely Socratic
  questioning; each message is tagged `mode: "socratic"`. The Socratic/Adversarial
  toggle stays active and "jumps to sections"; Adversarial currently has no
  section, so it surfaces a subtle transient note and stays Socratic. Per-message
  mode tagging means adversarial turns can be added later with no further code.
- **Open straight to the transcript.** ID 202 Private Chat skips the idea-dump
  intro (users can't type) and opens the read-only transcript directly.
- **Inline milestone markers.** Subtle markers appear in the transcript at insight
  points, tied to the existing Problem Definition sub-steps, alongside the
  existing Milestones sidebar.
- Background stays in the readable Socratic (light) register during the recorded
  demo (an all-Socratic transcript on the dark adversarial field would be
  unreadable). The dark register is still shown by other courses' live chat.

## Data — `data/recorded-chat.ts` (new)

- `recordedConversations: Record<courseId, RecordedItem[]>` — only `id202` has an
  entry. Gating on presence (not a hardcoded id) keeps the wiring generic.
- `types.ts` adds:
  - `RecordedMessage { kind: "message"; role: MessageRole; text: string; mode: AiMode }`
  - `RecordedMilestone { kind: "milestone"; label: string }`
  - `RecordedItem = RecordedMessage | RecordedMilestone`
- Full transcript from the request doc, messages tagged Socratic, student turns
  preserving line breaks. Three milestone markers:
  1. **Friction points** — after the student names how the environment interferes.
  2. **User group & context** — when "water-related environments" emerges.
  3. **Primary problem** — when reframed to "listening in water-related environments."

## State — `lib/journey-state.tsx`

- Add phase `"recorded"`.
- `choosePrivate()` → `entering`, then the entering effect routes to `"recorded"`
  if `recordedConversations[selectedCourse.id]` exists, else `"ideaDump"` as today.

## Components

- **`RecordedConversation.tsx`** (new) — scrollable, read-only column. Reuses the
  Socratic `MessageBubble` look (add `whitespace-pre-line` so multi-line student
  dumps render). Milestone markers render as a subtle centered chip. A small
  "recorded session · read-only" caption at the top. No composer.
- **`WorkspaceScreen.tsx`** — when `phase === "recorded"`: render
  `RecordedConversation` + Milestones sidebar + `ModeIndicator`; show the AI blob;
  no `ThinkingInput`.
- **Mode toggle** — `ModeIndicator` stays. `RecordedConversation` reacts to `mode`:
  scrolls to the first message of that mode; if a mode has no messages
  (Adversarial, for now), shows a transient note and reverts to Socratic.

## Out of scope

- No live AI in the ID 202 recorded view.
- No change to other courses' Private Chat, the Classroom, history, or welcome.
- No new milestone *sidebar* feature — inline markers + existing sidebar only.
