# Classroom Structure Update — Studio vs. Non-Studio courses

**Date:** 2026-06-07
**Status:** Approved (ready for implementation)

## Goal

Today every course opens the same Classroom (Studio Wall · Assignments ·
Selected Works), hardcoded for ID 202. Split Classroom into two structures:

- **Studio course** — **ID 202 (Product Design Studio II) only.** Keeps the full
  current Classroom. **No changes to the ID 202 implementation.**
- **Non-studio courses** — all others (FFD 202, ID 204, ID 208, GEEC 207,
  ITL 202). Remove the Studio Wall; add an **Announcements** notice board. Final
  nav: **Announcements · Assignments · Selected Works.**

## Approach

Gate everything new behind a course-type check so the studio path is identical to
today. Add new components for the two new surfaces (Announcements, non-studio
Assignments); extend two shared components (SelectedWorks, LayerNav) without
changing their ID 202 output; branch in ClassroomScreen.

## Data model

`types.ts`:
- `Course` gains `studio?: boolean`.
- New `Announcement { id, title, message, instructor, postedAt }` (epoch ms).
- `Assignment` gains optional `description?: string` and `focus?: string[]`
  (studio assignments ignore them).
- `SelectedWork.image` and `SelectedWork.phase` become optional → imageless works.

`data/courses.ts`:
- `id202` gets `studio: true`.
- `isStudioCourse(course)` helper.

`data/classroom.ts`:
- Existing ID 202 exports unchanged.
- `courseClassrooms: Record<courseId, { announcements: Announcement[];
  assignments: Assignment[]; selectedWorks: SelectedWork[] }>` for the five
  non-studio courses, populated from the request doc.
- Timestamps via `Date.UTC(...)` (pure → no SSR drift).

## Components

- **`Announcements.tsx`** (new) — read-only notice board. Heading "Announcements";
  cards sorted newest-first; each shows title, message, instructor name, posting
  date. No composer, no replies, no threads — a calm digital notice board in
  Journey's rounded-card language. Empty state: "Nothing posted yet."
- **`CourseAssignments.tsx`** (new) — non-studio Assignment Space. No phase
  timeline, no Project Brief button. Accordion list of buttons labeled
  "Assignment 1", "Assignment 2"… Click expands in place to reveal Project
  Details (description + focus list), submission history (Reviewed / In Review),
  private instructor feedback, and the upload-revision control. Reuses existing
  card/feedback styling. `AssignmentSpace.tsx` left untouched (studio only).
- **`SelectedWorks.tsx`** (extend) — when a work has no `image`, render a
  deterministic colored placeholder cover (gradient + title) and hide the Phase
  badge; disable the lightbox for placeholders. Add "Nothing posted yet" empty
  state. ID 202 (images + phases present) renders identically to today.
- **`LayerNav.tsx`** (extend) — items depend on course type. Studio:
  `Studio Wall · Assignments · Selected Works`. Non-studio:
  `Announcements · Assignments · Selected Works`. `ClassroomLayer` union gains
  `"announcements"`.
- **`ClassroomScreen.tsx`** (branch) — studio → current behavior. Non-studio →
  default layer `announcements`; render Announcements / CourseAssignments /
  SelectedWorks from `courseClassrooms[course.id]`; no Studio Wall, no studio
  hint; app-bar sublabel "Classroom · Lecture".

## Per-course content (from the request doc)

- **FFD 202** — 5 assignments (Illustrator Infographic, Photoshop Rendering,
  Exploded View, Presentation Board, Portfolio Page) with revisions + feedback;
  tailored announcements; Selected Works empty.
- **ID 204** — 3 assignments (Kitsch Object Analysis, Semiotic Analysis,
  Comparative Semiotic Analysis); 4 selected works (Ece Demir, Mert Kaya,
  Selin Arslan, Can Yıldız); tailored announcements.
- **ID 208** — 1 assignment (Chocolate Mold Design and Production, 3 submissions);
  no selected works; tailored announcements.
- **GEEC 207** — 2 assignments (Reading Reflection, Economic Transformation
  Presentation); no selected works; tailored announcements.
- **ITL 202** — 1 assignment (CV and Cover Letter); 3 selected works
  (Sofia Romano, Can Yıldız, Zeynep Kaya); tailored announcements.

Announcements are seeded from the 4 examples in the doc and varied per course
(each gets 2–4, with a course-appropriate instructor name).

## Decisions

- Non-studio Selected Works show a **generated colored placeholder cover** (no
  real photo) until board images are provided. (User-approved.)
- Assignment details **expand in place** (accordion), not a full page. (User-chosen.)
- Announcements are **tailored per course**. (User-chosen.)
- Courses with no specified Selected Works (FFD 202, ID 208, GEEC 207) show
  **"Nothing posted yet."**

## Out of scope

- No social feed, discussion board, or chat in Announcements.
- No student posting in Announcements (instructor-only, read-only for students).
- No changes to the Private Chat workspace, history, or welcome screen.
