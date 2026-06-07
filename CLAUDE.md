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
+ artifact discussion + assignments + selected works; takes `--reduced`), `drive_course_types.py`
(studio vs non-studio Classroom: announcements/accordion assignments/placeholder selected-works +
empty states; uses `reduced_motion` to freeze the sidebar carousel so courses sit at fixed y
positions — see the script header), `drive_mobile.py` (390×844 +
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
- `data/classroom.ts` — **single source of truth** for the Classroom. **Two course kinds** (see
  `Course.studio` + `isStudioCourse()` in `data/courses.ts`): the **studio** course (ID 202 only)
  and the **lecture** (non-studio) courses (everything else).
  - **Studio (ID 202)** — the full shared design studio. Active project = **"Amplifying Sound
    Through Form"** (passive sound amplifier; class is in Phase 4). Exports: `clusters` (4 themed
    groups), `studioObjects` (artifacts placed spatially in wall px via `x/y/w/h`),
    `studioConnections` (object→object pairs the studio canvas draws), `discussions` (keyed by
    object id), `projectBrief` (the central reference: objective + 4 graded phases),
    `assignmentPhases` (the 5-step timeline with `completed`/`active`/`locked`), `myAssignments`
    (the student's OWN work only), `selectedWorks` (instructor-picked *learning moments* from
    earlier phases — NOT final outcomes; renamed from "Published Work" — don't reintroduce that
    term — each points to a full board `image` in `public/assets/`). `WALL` = the pannable plane
    size. **Leave this untouched** — the studio is intentionally frozen.
  - **Lecture courses** — `courseClassrooms: Record<courseId, CourseClassroom>` (keyed by course
    id) holds each non-studio course's `announcements` (instructor-only notice board, read-only),
    `assignments`, and `selectedWorks`. `Assignment` gained optional `description` + `focus`
    (lecture detail); `SelectedWork.image`/`phase` are optional (lecture works have no board image →
    a generated colored placeholder cover, no phase badge).
  - Timestamps use `Date.UTC(...)` (pure → no SSR drift), formatted as a short date. Mocked but
    API-ready.
- **Two logos.** (1) The handwriting "Journey" wordmark — only the hero welcome screen
  (`Wordmark.tsx` renders `/icons/journeyLogo.png` directly; `JourneyLogo.tsx` is the same asset as a
  tintable component, currently unused). (2) `components/JourneyMark.tsx` — the **round** "Journey"
  mark (`/icons/logo.png`), the portal-home / back control **everywhere off the main page**: the
  Classroom app bar, the Private Chat workspace, and the history detail (no back arrow anywhere — the
  mark is the control). Both PNGs are transparent (white keyed out: `scripts/make_logo_png.py` for
  the wordmark, `scripts/make_mark_png.py` for the round mark) and tint per surface via `tone`
  ("dark" = black ink for light bgs; "light" = `[filter:invert(1)]` → white ink for dark bgs). Use the
  transparent PNG + invert, never blend modes, so it reads on any background.
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
- `components/history/` — `HistoryDetail` (full-page semester view; Escape or the top-left Journey
  logo returns — no back arrow).
  **Responsive:** wide screens render full-height `CourseColumn`s (widen-in-place on click);
  narrow/mobile (`< sm`, via `useMediaQuery` in `lib/media.ts`) switch to a scrollable vertical
  list of `CourseRow`s (horizontal bands that expand downward). `GradeBreakdown` is the shared
  expand panel used by both. Mounted by `JourneyScreen` when `phase === "history"`.
- `components/classroom/` — the **Classroom workspace** (a shared *design studio*, NOT a chat feed),
  entered from the top half of the course split (`chooseClassroom()` → `phase === "classroom"`).
  The split's Classroom half uses `darken(course.color)` (deeper = collective) vs. the Private half's
  original color — `darken` lives in `lib/geometry.ts`. `ClassroomScreen` owns local layer nav +
  open-discussion state (kept out of the global machine, like history) and Escape (closes an open
  panel first, else `reset()`), and renders a fixed **app bar** (`<header absolute top-0 z-30>` with
  an opaque/blurred bg) so scrolling layers pass cleanly beneath it — left = `PortalLogo` (the
  circular **placeholder** home/portal mark, clickable → `reset()`; **no back arrow, no wordmark** —
  swap the SVG in `PortalLogo.tsx` when the real asset lands), center = `LayerNav` (inline, text-only),
  right = course label (`hidden sm:block`, three lines: course **code**, course **name**, then
  `Classroom · Studio`/`Classroom · Lecture`). **`ClassroomScreen` branches on `isStudioCourse`:**
  - **Studio (ID 202)** — three layers: **Studio Wall** (`StudioWall` = a curated, pre-arranged
    plane you *pan* by dragging the background — no zoom/rearrange; `ArtifactCard`s register
    `studio-{id}` and `StudioCanvas` draws the flowing lines, reading live panned rects exactly like
    `ConnectionCanvas`), **Assignment Space** (`AssignmentSpace` = private/own-only, with a prominent
    **Project Brief** button → full `ProjectBriefView` reading overlay, a **phase timeline**, and
    mocked uploads), **Selected Works** (`SelectedWorks` = gallery of student *board images* from
    `public/assets/`; clicking a card opens a `DiscussionPanel` with the board image + note + thread;
    clicking the image opens `SelectedWorkLightbox` full-size). Default layer = Studio Wall. This path
    is unchanged from the original ID 202 implementation.
  - **Lecture (all other courses)** — three layers from `courseClassrooms[course.id]`: **Announcements**
    (`Announcements` = read-only instructor notice board, newest-first, title/message/instructor/date;
    NOT a feed/board/chat — no composer), **Assignment Space** (`CourseAssignments` = accordion of
    "Assignment N" buttons that expand in place to Project Details + focus chips + submissions +
    private feedback + upload; **no** phase timeline or Project Brief), **Selected Works** (same
    `SelectedWorks` component; imageless works render a generated colored placeholder cover and no
    phase badge; empty → "Nothing posted yet."). Default layer = Announcements. `LayerNav` takes a
    `studio` boolean to pick `STUDIO_ITEMS` vs `LECTURE_ITEMS`.
  - **Discussion** (`DiscussionPanel`) is a contextual side sheet — stacked **annotations with role
    tags + a composer, NOT chat bubbles** — used by Studio Wall objects (plain) and Selected Works
    (optional `meta` block: board image, phase, description, instructor note, tags; all optional, so
    lecture works show just the note + thread). **Accent legibility:** `ClassroomScreen` falls back to
    a deep ink when `readableTextColor(courseColor) !== "#fff"` (light course colors can't carry
    white chrome).

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
