# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> The line above imports `AGENTS.md`: this is **Next.js 16** — APIs and conventions
> may differ from training data. Check `node_modules/next/dist/docs/` before using
> unfamiliar Next APIs.

## What this is

**Journey** — an interactive welcome/entry screen for a web-based AI learning platform.
It is deliberately *not* a SaaS dashboard: no cards/tables/icons. The whole identity is two
collapsed color-block sidebars connected by organic, animated, cursor-reactive lines, with a
centered "Journey" wordmark. There is a single screen (`app/page.tsx` → `JourneyScreen`).

Stack: Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 (no
`tailwind.config` — theme lives in `app/globals.css` via `@theme`) · `motion` v12 (Framer
Motion, imported from `motion/react`).

## Commands

- `npm run dev` — dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build (also the only TypeScript type-check; there is no separate `tsc` script)
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- `npm start` — serve a production build

No test framework is set up. Verification of this visual app is done with **Playwright
screenshots**: install once with `python -m pip install playwright && python -m playwright
install chromium`, then drive `http://localhost:3000` headless and screenshot
(move the mouse to exercise hover/expand/cursor-bend states). Read the PNG back to inspect.
Drive scripts (output to `scripts/shots/`, gitignored): `scripts/drive.py` (welcome→workspace),
`drive_history.py` (history sidebar + detail), `drive_classroom.py` (welcome→classroom studio: pan
+ artifact discussion + assignments + published; takes `--reduced`), `drive_mobile.py` (390×844 +
`has_touch`; asserts no horizontal overflow), `drive_reduced.py` (reduced-motion). The back control is an image, not
text — select it with `get_by_label("Back to Journey")`, not `get_by_text`.

Windows gotcha: stray `node` processes can lock `.next` and cause Turbopack
`os error 1224` ("user-mapped section open"). Fix: kill node (`taskkill /F /IM node.exe /T`)
and `rm -rf .next`. Don't run `npm run build` and `npm run dev` against the same `.next` at once.

## Core architecture — read before editing the visuals

**DOM is the single source of truth for geometry; the canvas follows it.** This is the key
idea that ties the components together:

- Sidebar blocks/strips are real DOM elements animated by Framer Motion. Each registers its
  element with the **AnchorRegistry** (`lib/anchors.tsx`, a React context holding
  `Map<id, Set<HTMLElement>>`).
- `ConnectionCanvas` runs one `requestAnimationFrame` loop that reads each anchor's
  `getBoundingClientRect()` every frame and draws the bezier lines. Because Framer Motion
  transforms (sidebar hover-expand, carousel scroll, per-block grow) show up in the rects,
  **the lines track all of it automatically** — there is no separate sync code. Do not try to
  duplicate the layout math in the canvas.
- One id can map to **multiple elements**: the left sidebar renders each course block twice
  (`[...currentCourses, ...currentCourses]`) for a seamless infinite carousel, so both copies
  register under `course-{id}`. The canvas draws each copy weighted by `edgeFade` (computed from
  the block's *center* y) so the two copies **crossfade** as the loop wraps instead of jumping.

Coordinate system: the canvas is `position: fixed; inset-0` covering the viewport, so
`getBoundingClientRect()` viewport coordinates equal canvas CSS-pixel coordinates. The 2D
context is scaled by `devicePixelRatio` for crispness.

Stacking (z-index): aurora background `-z-10` → canvas `z-0` → sidebars `z-10` → wordmark `z-20`.

### Where things live

- `data/courses.ts` — **single source of truth** for current-semester course data and layout
  constants (`currentCourses`, derived `connections`, and the `layout` widths). Holds a real
  example program (IEU Industrial Design, 2nd-year spring). Add/remove a course here and the
  left sidebar + connections adapt automatically.
- `data/semesters.ts` — **single source of truth** for academic history: `semesters` (8 entries,
  first 3 `active`/completed, rest locked), each active one carrying its `courses` with `grade` +
  `breakdown`. Feeds the right sidebar spine, the history detail view, and the `connections`
  targets (line endpoints, anchored as `history-{semester.id}`). Holds **two separate palettes**:
  `semesters[].color` = the 8 right-spine block colors (Butter/Guava/Sunset/Sangria/Moss/Palm/
  Lagoon/Odyssey); `columnPalette` = the per-course colors of the history-detail columns. Don't conflate.
- `data/classroom.ts` — **single source of truth** for the Classroom workspace (the shared design
  studio): `clusters` (4 themed groups), `studioObjects` (artifacts placed spatially in wall px via
  `x/y/w/h`), `studioConnections` (object→object pairs the studio canvas draws), `discussions`
  (keyed by object id), `myAssignments` (the student's OWN work only), `publishedWorks`. `WALL`
  = the pannable plane size. Timestamps use `Date.UTC(...)` (pure → no SSR drift), formatted as a
  short date in the panel. Mocked but API-ready.
- `components/JourneyLogo.tsx` — the handwriting "Journey" wordmark image, used everywhere the word
  appears (hero `Wordmark`, the workspace + history back buttons). The asset is a transparent-bg PNG
  (`public/icons/journeyLogo.png`, generated from the supplied JPEG by `scripts/make_logo_png.py`,
  which keys the white out). Tinted per surface via `tone` ("dark" = black ink for light bgs; "light"
  = `[filter:invert(1)]` → white ink for dark bgs). A raster logo with a white bg won't blend cleanly
  on dark/colored surfaces — use the transparent PNG, not blend modes.
- `lib/geometry.ts` — pure math/color helpers: `controlPoints` (the two bezier control points
  are **independent** per end — that asymmetry is what makes the lines look amorphous),
  `hash01` (deterministic per-line seed → each line gets stable amplitude/phase/speed/offset),
  `edgeFade`, edge-point helpers, and color utils (`hexToRgba`, `readableTextColor`, `aiInk`).
- `components/` — `JourneyScreen` (phase-driven composition + `AnchorProvider` + aurora div),
  `LeftSidebar` (carousel + hover-expand + click-lock + per-block grow + course-code label),
  `RightSidebar` (8 history blocks in a shorter, bottom-anchored panel — `layout.rightHeightRatio`;
  mirrors the left's interaction: hover widens the panel + the hovered block grows to reveal its
  label; active blocks open the history view, locked blocks muted/`not-allowed`),
  `ConnectionCanvas`, `Wordmark`.
- `components/history/` — `HistoryDetail` (full-page semester view + Escape/`← Journey` return).
  **Responsive:** wide screens render full-height `CourseColumn`s (widen-in-place on click);
  narrow/mobile (`< sm`, via `useMediaQuery` in `lib/media.ts`) switch to a scrollable vertical
  list of `CourseRow`s (horizontal bands that expand downward). `GradeBreakdown` is the shared
  expand panel used by both. Mounted by `JourneyScreen` when `phase === "history"`.
- `components/classroom/` — the **Classroom workspace** (a shared *design studio*, NOT a chat feed),
  entered from the top half of the course split (`chooseClassroom()` → `phase === "classroom"`,
  inheriting the selected course's color). `ClassroomScreen` owns local layer nav + open-discussion
  state (kept out of the global machine, like history) and Escape (closes an open panel first, else
  `reset()`). Four layers: **Studio Wall** (`StudioWall` = a curated, pre-arranged plane you *pan*
  by dragging the background — no zoom/rearrange; `ArtifactCard`s register `studio-{id}` and
  `StudioCanvas` draws the flowing lines between related objects, reading live panned rects exactly
  like `ConnectionCanvas`), **Discussion** (`DiscussionPanel` = a contextual side sheet attached to
  the clicked object — stacked **annotations with role tags, NOT chat bubbles**; shared by wall +
  published), **Assignment Space** (`AssignmentSpace` = private, the student's OWN submissions only,
  mocked uploads), **Published** (`PublishedArchive` = class-visible gallery, opens the same panel
  to comment). `LayerNav` is text-only. **Accent legibility:** light course colors can't carry white
  chrome — `ClassroomScreen` falls back to a deep ink when `readableTextColor(courseColor) !== "#fff"`.

### Conventions

- Animation must respect `prefers-reduced-motion`: the canvas wave, wordmark breathing, aurora
  gradient, and carousel scroll all check it (`useReducedMotion` / `matchMedia`). Keep new
  motion gated the same way.
- Per-line "personality" is precomputed once in `ConnectionCanvas` (`lineParams`, keyed by
  `connection * 2 + edge`) using `hash01` — never `Math.random` (would flicker per frame).
- Path alias `@/*` → repo root. `next.config.ts` pins `turbopack.root` (a stray `yarn.lock`
  in the home dir would otherwise misdetect the workspace) and hides the dev indicator.
- **Responsive sizing follows the viewport, not the pointer.** Gate "mobile" sizes on
  `useMediaQuery("(max-width: 639px)")` (`lib/media.ts`), NOT `useCoarsePointer()`/`(hover: none)`.
  A resized desktop window still reports `hover: hover`, so pointer-gated sizes appear to "do
  nothing" when testing in a browser. Use `useCoarsePointer` (`lib/pointer.ts`) ONLY for
  hover-vs-tap behavior (the tap-to-expand sidebars).
- `mix-blend-mode` is cancelled by `opacity < 1` on the same element (opacity creates isolation).
  For text/logos that must read on any background, prefer a transparent asset + `invert`, or keep
  opacity at 1 — don't rely on `mix-blend-difference` on a faded element.
- **Mobile/responsive** (work done on the `mobile-responsive` branch): the design is unchanged
  on desktop. Touch has no hover, so the hover-reveal sidebars use a tap-to-expand pattern —
  `useCoarsePointer()` (`lib/pointer.ts`, `(hover: none)`) gates the hover handlers off and shows
  all labels (`forceLabel`) when expanded; first tap expands, second tap acts. The workspace
  Milestones sidebar is `hidden md:flex`, the wordmark scales down (`text-5xl sm:text-7xl`), and
  the history view swaps columns→rows below `sm`. Verify mobile with `scripts/drive_mobile.py`
  (phone viewport + `has_touch`); it also asserts no horizontal overflow.
