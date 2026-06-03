import type {
  Assignment,
  ClassroomContribution,
  PublishedWork,
  StudioCluster,
  StudioConnection,
  StudioObject,
} from "@/types";

/**
 * Classroom workspace — the single source of truth for the shared design studio
 * (Studio Wall objects, the discussions attached to them, the private Assignment
 * Space, and the Published Work archive). Mocked but API-ready: swap these for an
 * API response without touching the components.
 *
 * Example course: IEU Industrial Design, Product Design Studio II (2nd-year
 * spring). The studio project — "Everyday Tools, Reconsidered" — continues the
 * household-object thread from the Private Chat example.
 *
 * Coordinates (`x`/`y`) are in wall pixels: the wall is a curated, pre-arranged
 * plane the student PANS across (no zoom, no drag). Clusters occupy four regions;
 * `studioConnections` draw relationships with Journey's flowing line language.
 */

/** Overall wall plane size (px). Larger than the viewport → pannable. */
export const WALL = { width: 1840, height: 1240 } as const;

/** Four themed clusters (project phases / topics), each its own accent color. */
export const clusters: StudioCluster[] = [
  { id: "brief", label: "Project Brief", color: "#E36559" }, // Sangria
  { id: "precedents", label: "Precedents", color: "#23617E" }, // Odyssey
  { id: "research", label: "Research & Theory", color: "#657652" }, // Palm
  { id: "materials", label: "Materials & Process", color: "#C6B63B" }, // Neon Pear
];

const clusterColor = new Map(clusters.map((c) => [c.id, c.color]));
function obj(
  id: string,
  kind: StudioObject["kind"],
  title: string,
  clusterId: string,
  x: number,
  y: number,
  w: number,
  h: number,
  source?: string,
): StudioObject {
  return { id, kind, title, source, clusterId, x, y, w, h, color: clusterColor.get(clusterId) ?? "#888" };
}

/** Artifacts pinned to the wall, grouped spatially by cluster region. */
export const studioObjects: StudioObject[] = [
  // ── Project Brief (top-left) ──────────────────────────────────────────
  obj("b1", "brief", "Everyday Tools, Reconsidered", "brief", 120, 130, 250, 160, "Studio II brief"),
  obj("b2", "note", "Semester schedule & milestones", "brief", 150, 360, 210, 120, "instructor"),
  obj("b3", "note", "Learning objectives", "brief", 400, 300, 200, 120, "instructor"),

  // ── Precedents (top-right) ────────────────────────────────────────────
  obj("p1", "precedent", "Dieter Rams — ten principles", "precedents", 1040, 120, 230, 160, "Braun"),
  obj("p2", "image", "Muji kettle study", "precedents", 1340, 130, 200, 140, "MoMA collection"),
  obj("p3", "image", "Dyson teardown photos", "precedents", 1100, 330, 210, 140, "iFixit"),
  obj("p4", "precedent", "OXO Good Grips — origin", "precedents", 1400, 340, 220, 150, "case study"),

  // ── Research & Theory (bottom-left) ───────────────────────────────────
  obj("r1", "paper", "Affordances & everyday objects", "research", 120, 690, 240, 150, "Norman, 1988"),
  obj("r2", "paper", "Emotionally durable design", "research", 150, 900, 210, 140, "Chapman, 2005"),
  obj("r3", "book", "The Design of Everyday Things", "research", 410, 760, 190, 170, "Norman"),
  obj("r4", "website", "core77.com — process diaries", "research", 400, 980, 210, 120, "web"),

  // ── Materials & Process (bottom-right) ────────────────────────────────
  obj("m1", "image", "Recycled polymer samples", "materials", 1040, 720, 210, 140, "material lab"),
  obj("m2", "video", "Injection molding walkthrough", "materials", 1340, 720, 230, 150, "video · 6:12"),
  obj("m3", "image", "Anodized aluminum finishes", "materials", 1100, 930, 200, 130, "material lab"),
  obj("m4", "note", "Process constraints", "materials", 1400, 940, 190, 120, "instructor"),
];

/**
 * Relationships between artifacts (drawn as flowing organic lines). They cross
 * cluster regions on purpose — knowledge is interconnected, not foldered.
 */
export const studioConnections: StudioConnection[] = [
  { fromId: "b1", toId: "p1" },
  { fromId: "b1", toId: "r1" },
  { fromId: "b1", toId: "r3" },
  { fromId: "r1", toId: "r3" },
  { fromId: "p4", toId: "r1" },
  { fromId: "p3", toId: "m2" },
  { fromId: "m1", toId: "m2" },
  { fromId: "p2", toId: "m3" },
  { fromId: "r2", toId: "p1" },
];

// Deterministic timestamps (Date.UTC is pure — no Date.now at module scope, so
// no SSR/hydration drift). Rendered as a short absolute date in the panel.
const t = (m: number, d: number, h = 10, min = 0) => Date.UTC(2026, m, d, h, min);

/**
 * Contextual discussions, keyed by Studio Wall object id. Each contribution
 * carries a name, a Student/Instructor role, and a timestamp — the discussion
 * stays attached to the object it's about (not a global feed).
 */
export const discussions: Record<string, ClassroomContribution[]> = {
  p3: [
    {
      id: "d1",
      author: "Alara Ayrac",
      role: "student",
      text: "Why was this manufacturing process selected over a simpler one? The part count looks high for a handheld.",
      createdAt: t(4, 12, 9, 30),
    },
    {
      id: "d2",
      author: "Mert Çetin",
      role: "student",
      text: "I think it's about the motor housing tolerances — molding gives them tighter fits than casting.",
      createdAt: t(4, 12, 14, 5),
    },
    {
      id: "d3",
      author: "Prof. Selin Aydın",
      role: "instructor",
      text: "Good thread. Trace it back to the brief: which principle is this teardown evidence for?",
      createdAt: t(4, 13, 8, 15),
    },
  ],
  p1: [
    {
      id: "d4",
      author: "Prof. Selin Aydın",
      role: "instructor",
      text: "Pick one principle and argue where a product you own fails it. Bring it to Thursday's pin-up.",
      createdAt: t(4, 10, 11, 0),
    },
    {
      id: "d5",
      author: "Deniz Korkmaz",
      role: "student",
      text: "“As little design as possible” keeps catching me — most of my sketches are doing too much.",
      createdAt: t(4, 11, 16, 40),
    },
  ],
  r1: [
    {
      id: "d6",
      author: "Alara Ayrac",
      role: "student",
      text: "The affordance idea reframed my whole problem — the cord isn't a feature to style, it's a false affordance.",
      createdAt: t(4, 14, 10, 20),
    },
  ],
  b1: [
    {
      id: "d7",
      author: "Prof. Selin Aydın",
      role: "instructor",
      text: "Read the brief as a question, not a spec. What is an 'everyday tool' actually asking of its user?",
      createdAt: t(3, 28, 9, 0),
    },
  ],
};

/**
 * The student's OWN assignments (private Assignment Space). Peers' submissions
 * are never visible here — this is a private channel with the instructor only.
 */
export const myAssignments: Assignment[] = [
  {
    id: "a1",
    title: "Research Synthesis",
    brief: "Synthesize your precedent study and user research into a one-page problem framing.",
    submissions: [
      { id: "s1", label: "Synthesis board v1", kind: "image", version: 1, createdAt: t(4, 6, 23, 10), status: "reviewed" },
      { id: "s2", label: "Synthesis board v2", kind: "image", version: 2, createdAt: t(4, 13, 21, 45), status: "reviewed" },
    ],
    feedback:
      "Strong framing in v2. The false-affordance angle is the sharpest thing here — build the concept work on it.",
  },
  {
    id: "a2",
    title: "Concept Development",
    brief: "Present three divergent concepts as boards. Sketches and quick models welcome.",
    submissions: [
      { id: "s3", label: "Concept sketches v1", kind: "image", version: 1, createdAt: t(4, 20, 22, 30), status: "in-review" },
    ],
  },
  {
    id: "a3",
    title: "Final Prototype & Boards",
    brief: "Working prototype, process documentation, and final presentation boards for the jury.",
    submissions: [],
  },
];

/**
 * Exemplary student work the instructor published to the whole class. Permanent
 * learning resources; students can open and comment on them.
 */
export const publishedWorks: PublishedWork[] = [
  {
    id: "pw1",
    studentName: "Deniz Korkmaz",
    title: "Modular Kitchen Scale",
    kind: "image",
    color: "#E89C73",
    note: "Published for its restraint — every part earns its place. A clear answer to Rams' tenth principle.",
    comments: [
      {
        id: "c1",
        author: "Alara Ayrac",
        role: "student",
        text: "The way the tray doubles as the lid is so quiet. How did you land on that?",
        createdAt: t(4, 26, 12, 0),
      },
    ],
  },
  {
    id: "pw2",
    studentName: "Eylül Demir",
    title: "Foldable Drying Rack",
    kind: "image",
    color: "#94BEBB",
    note: "Excellent material reasoning — the recycled-polymer hinge study is exemplary process work.",
    comments: [],
  },
  {
    id: "pw3",
    studentName: "Can Yıldız",
    title: "Tactile Measuring Cup",
    kind: "image",
    color: "#C6B63B",
    note: "An affordance-led project done right: you can read the volume without looking.",
    comments: [
      {
        id: "c2",
        author: "Prof. Selin Aydın",
        role: "instructor",
        text: "Note the iteration trail in Can's boards — three honest dead-ends before the ridges worked.",
        createdAt: t(4, 27, 9, 30),
      },
    ],
  },
  {
    id: "pw4",
    studentName: "Mira Aslan",
    title: "Repairable Hand Blender",
    kind: "image",
    color: "#8B162B",
    note: "Designed for disassembly. A strong stance on emotional durability — keep, don't discard.",
    comments: [],
  },
];
