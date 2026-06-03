import type {
  Assignment,
  AssignmentPhase,
  ClassroomContribution,
  ProjectBrief,
  SelectedWork,
  StudioCluster,
  StudioConnection,
  StudioObject,
} from "@/types";

/**
 * Classroom workspace — single source of truth for the shared design studio
 * (Studio Wall objects + their discussions, the private Assignment Space, the
 * Selected Works archive, the project brief, and the phase timeline). Mocked but
 * API-ready: swap for an API response without touching the components.
 *
 * Active project: IEU Industrial Design, Product Design Studio II (ID 202) —
 * "Amplifying Sound Through Form": design a PASSIVE, non-electronic mechanical
 * sound amplifier. The class is in Phase 4; earlier phases are complete, so the
 * studio reads as a living, actively-taught course.
 *
 * Coordinates (`x`/`y`) are wall pixels: the wall is a curated, pre-arranged
 * plane the student PANS across (no zoom/drag-rearrange). `studioConnections`
 * draw relationships with Journey's flowing line language.
 */

/** Overall wall plane size (px). Larger than the viewport → pannable. */
export const WALL = { width: 1840, height: 1240 } as const;

/** Four themed clusters (project phases / topics), each its own accent color. */
export const clusters: StudioCluster[] = [
  { id: "brief", label: "Project Brief", color: "#E36559" }, // Sangria
  { id: "precedents", label: "Precedents", color: "#23617E" }, // Odyssey
  { id: "research", label: "Acoustics & Theory", color: "#657652" }, // Palm
  { id: "materials", label: "Form & Material Tests", color: "#C6B63B" }, // Neon Pear
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
  obj("b1", "brief", "Amplifying Sound Through Form", "brief", 120, 130, 250, 160, "ID 202 · Studio II"),
  obj("b2", "note", "Phase schedule · Wk 4 · 7 · 11 · 14", "brief", 150, 360, 215, 120, "instructor"),
  obj("b3", "note", "What makes a horn 'work'?", "brief", 405, 300, 195, 120, "instructor"),

  // ── Precedents (top-right) ────────────────────────────────────────────
  obj("p1", "precedent", "Gramophone horn (1900s)", "precedents", 1040, 120, 230, 150, "design archive"),
  obj("p2", "image", "Tractrix horn profile", "precedents", 1340, 130, 200, 140, "acoustics"),
  obj("p3", "image", "Megaphone geometry", "precedents", 1100, 320, 210, 140, "field study"),
  obj("p4", "precedent", "String-body resonance (violin)", "precedents", 1400, 330, 220, 150, "case study"),

  // ── Acoustics & Theory (bottom-left) ──────────────────────────────────
  obj("r1", "paper", "Horns, chambers & resonance", "research", 120, 690, 240, 150, "Olson, 1957"),
  obj("r2", "paper", "Impedance matching basics", "research", 150, 900, 210, 140, "acoustics primer"),
  obj("r3", "book", "Room Acoustics", "research", 410, 760, 190, 170, "Kuttruff"),
  obj("r4", "website", "Directivity & frequency response", "research", 400, 980, 215, 120, "web"),

  // ── Form & Material Tests (bottom-right) ──────────────────────────────
  obj("m1", "image", "Foam reflection mockups", "materials", 1040, 720, 210, 140, "studio lab"),
  obj("m2", "video", "Casting a tractrix horn", "materials", 1340, 720, 230, 150, "video · 5:48"),
  obj("m3", "image", "3D-printed test horns", "materials", 1100, 930, 200, 130, "studio lab"),
  obj("m4", "note", "Material & surface effects", "materials", 1400, 940, 190, 120, "instructor"),
];

/**
 * Relationships between artifacts (drawn as flowing organic lines). They cross
 * cluster regions on purpose — knowledge is interconnected, not foldered.
 */
export const studioConnections: StudioConnection[] = [
  { fromId: "b1", toId: "p1" },
  { fromId: "b1", toId: "r1" },
  { fromId: "b1", toId: "r3" },
  { fromId: "r1", toId: "p2" },
  { fromId: "p1", toId: "p2" },
  { fromId: "p3", toId: "m1" },
  { fromId: "m1", toId: "m3" },
  { fromId: "p2", toId: "m2" },
  { fromId: "r2", toId: "r1" },
];

// Deterministic timestamps (Date.UTC is pure → no SSR/hydration drift).
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
      text: "A megaphone barely flares yet it still focuses sound — is it the cone angle or the rigidity doing the work?",
      createdAt: t(2, 12, 9, 30),
    },
    {
      id: "d2",
      author: "Mert Çetin",
      role: "student",
      text: "Mostly directivity from the cone, I think — it doesn't amplify so much as stop sound spreading sideways.",
      createdAt: t(2, 12, 14, 5),
    },
    {
      id: "d3",
      author: "Prof. L. Kavak",
      role: "instructor",
      text: "Good distinction. Hold onto 'direct vs. amplify' — it'll shape your phase-4 form decisions.",
      createdAt: t(2, 13, 8, 15),
    },
  ],
  p1: [
    {
      id: "d4",
      author: "Prof. L. Kavak",
      role: "instructor",
      text: "Trace why early gramophones needed such a long horn. The answer is impedance matching — see Olson.",
      createdAt: t(2, 10, 11, 0),
    },
    {
      id: "d5",
      author: "Derin Korkmaz",
      role: "student",
      text: "The exponential flare is doing a lot — the curve isn't decorative, it's tuned to the frequency range.",
      createdAt: t(2, 11, 16, 40),
    },
  ],
  r1: [
    {
      id: "d6",
      author: "Alara Ayrac",
      role: "student",
      text: "Olson reframed it for me: the horn is a transformer between a tiny vibrating source and the open air.",
      createdAt: t(2, 14, 10, 20),
    },
  ],
  b1: [
    {
      id: "d7",
      author: "Prof. L. Kavak",
      role: "instructor",
      text: "Read the brief as a constraint, not a limit: no electronics forces you to design the acoustics, not buy them.",
      createdAt: t(1, 28, 9, 0),
    },
  ],
};

/**
 * The active studio project brief — the central assignment reference, opened
 * from the "Project Brief" button in the Assignment Space.
 */
export const projectBrief: ProjectBrief = {
  course: "ID 202 — Industrial Design Studio II",
  title: "Amplifying Sound Through Form",
  instructors: ["Assoc. Prof. Dr. X", "Asst. Prof. Dr. Y"],
  objective: [
    "The objective of this studio is to design a passive sound amplifier that enhances sound without using electricity or electronic components.",
    "Today, sound amplification is almost always associated with speakers, batteries, and digital technology. However, sound can also be amplified through geometry, material properties, and resonance. Before electronic amplification became common, people used physical forms such as horns, chambers, and resonant bodies to increase and direct sound.",
    "In this project, students are expected to explore the relationship between sound, form, material, and user experience through the design of a mechanically functioning sound amplifier.",
  ],
  phases: [
    {
      number: 1,
      title: "Research & Exploration",
      dueDate: "Week 4",
      weight: 20,
      summary:
        "Investigate existing examples of passive sound amplification and explore the fundamentals of acoustics.",
      deliverables: ["Research Board", "User & Context Analysis", "Material Exploration", "Desk Research"],
    },
    {
      number: 2,
      title: "Problem Definition & Concept Development",
      dueDate: "Week 7",
      weight: 20,
      summary:
        "Define a design opportunity and develop multiple concept directions — identify target user, usage scenario, design criteria, and product positioning.",
      deliverables: ["Design Brief", "User Scenario", "Minimum 3 Concept Alternatives", "Sketch Models"],
    },
    {
      number: 3,
      title: "Design Development",
      dueDate: "Week 11",
      weight: 20,
      summary:
        "Select one concept and develop its form, functionality, and user experience. Test acoustic performance and usability physically.",
      deliverables: ["Refined Concept", "Concept Sketches", "CAD Development", "Material Proposal", "Functional Mock-ups"],
    },
    {
      number: 4,
      title: "Final Project",
      dueDate: "Week 14",
      weight: 40,
      summary:
        "Present a fully developed passive sound amplifier demonstrating acoustics, form development, manufacturing considerations, and user interaction.",
      deliverables: [
        "Final Presentation Board",
        "Process Documentation",
        "Physical Prototype",
        "CAD Model",
        "Technical Drawings",
      ],
    },
  ],
};

/**
 * Where the class currently stands. Drives the Assignment Space timeline. (This
 * 5-step progression is the studio's working rhythm; the 4-phase grading brief
 * above is the formal reference — both per the project doc.)
 */
export const assignmentPhases: AssignmentPhase[] = [
  { number: 1, title: "Research", status: "completed" },
  { number: 2, title: "Research Synthesis", status: "completed" },
  { number: 3, title: "Concept Development", status: "completed" },
  { number: 4, title: "Design Development", status: "active" },
  { number: 5, title: "Final Presentation", status: "locked" },
];

/**
 * The student's OWN assignments (private Assignment Space). Peers' submissions
 * are never visible here — a private channel with the instructor only. Uploads
 * are mocked (session-only). "Research Synthesis" is listed first (the Project
 * Brief button sits directly above it).
 */
export const myAssignments: Assignment[] = [
  {
    id: "a1",
    title: "Research Synthesis",
    brief: "Synthesize your acoustic precedent study and user research into a one-page problem framing.",
    submissions: [
      { id: "s1", label: "Synthesis board v1", kind: "image", version: 1, createdAt: t(2, 6, 23, 10), status: "reviewed" },
      { id: "s2", label: "Synthesis board v2", kind: "image", version: 2, createdAt: t(2, 13, 21, 45), status: "reviewed" },
    ],
    feedback:
      "Strong framing in v2. The 'direct vs. amplify' distinction is the sharpest thing here — carry it into concept work.",
  },
  {
    id: "a2",
    title: "Concept Development",
    brief: "Three divergent amplifier concepts as boards, with sketch models. Show the acoustic logic of each.",
    submissions: [
      { id: "s3", label: "Three concepts v1", kind: "image", version: 1, createdAt: t(3, 2, 22, 30), status: "reviewed" },
    ],
    feedback: "Concept B (the folded path) is the most promising — least obvious, most to learn from. Push it.",
  },
  {
    id: "a3",
    title: "Design Development",
    brief: "Refine one concept: form, CAD, material proposal, and functional mock-ups tested for acoustic performance.",
    submissions: [
      { id: "s4", label: "Refined concept v1", kind: "image", version: 1, createdAt: t(4, 1, 20, 0), status: "in-review" },
    ],
  },
];

/**
 * Instructor-selected learning moments from completed phases (NOT final
 * outcomes) — chosen for educational value so peers can learn from the process.
 * The class is in Phase 4, so these come from Phases 1–3.
 */
export const selectedWorks: SelectedWork[] = [
  {
    id: "sw1",
    studentName: "Aylin Demir",
    title: "User Observation Map",
    kind: "note",
    phase: 1,
    phaseLabel: "User Observation",
    description:
      "A well-documented observation map showing how people instinctively cup their hands around phones and laptops when trying to increase volume.",
    color: "#E89C73",
    instructorNote: "Excellent behavioral insight that can inform physical amplification strategies.",
    instructorName: "Prof. L. Kavak",
    tags: ["behavior", "sound", "observation", "user research"],
    addedOn: t(2, 12),
    comments: [
      {
        id: "swc1",
        author: "Alara Ayrac",
        role: "student",
        text: "The hand-cupping gesture is such an honest starting point — people already build tiny horns without thinking.",
        createdAt: t(2, 26, 12, 0),
      },
    ],
  },
  {
    id: "sw2",
    studentName: "Derin Korkmaz",
    title: "Horn Geometry Study",
    kind: "paper",
    phase: 2,
    phaseLabel: "Research Synthesis",
    description:
      "A comparative study of horn geometries (exponential, tractrix, conical, rectangular, folded) and their acoustic amplification principles.",
    color: "#657652",
    instructorNote: "Strong visual organization and synthesis of technical research.",
    instructorName: "Prof. L. Kavak",
    tags: ["research", "acoustics", "horn design", "amplification"],
    addedOn: t(2, 12),
    comments: [],
  },
  {
    id: "sw3",
    studentName: "Maya Chen",
    title: "Amplifier Concept Exploration",
    kind: "image",
    phase: 3,
    phaseLabel: "Sketch Exploration",
    description:
      "A sketch sheet containing over 40 amplifier concepts exploring folding, spiraling, and directional sound pathways.",
    color: "#23617E",
    instructorNote: "Exceptional breadth of ideation before committing to a concept.",
    instructorName: "Prof. L. Kavak",
    tags: ["sketch", "ideation", "amplifier", "concept generation"],
    addedOn: t(2, 12),
    comments: [
      {
        id: "swc2",
        author: "Prof. L. Kavak",
        role: "instructor",
        text: "Note how many ideas Maya let go of — quantity here bought the confidence to commit later.",
        createdAt: t(2, 27, 9, 30),
      },
    ],
  },
  {
    id: "sw4",
    studentName: "Can Yıldız",
    title: "Foam Reflection Mock-ups",
    kind: "image",
    phase: 3,
    phaseLabel: "Form Development",
    description:
      "A sequence of physical foam mock-ups testing sound reflection angles, directionality, and amplification through rapid prototyping.",
    color: "#C6B63B",
    instructorNote: "Excellent use of rapid prototyping to test assumptions.",
    instructorName: "Prof. L. Kavak",
    tags: ["prototyping", "foam model", "acoustics", "testing"],
    addedOn: t(2, 10),
    comments: [],
  },
  {
    id: "sw5",
    studentName: "Selin Arı",
    title: "Material Resonance Tests",
    kind: "image",
    phase: 1,
    phaseLabel: "Material Exploration",
    description:
      "A tactile catalogue tapping woods, metals, and ceramics to compare how each material rings, sustains, and colors a tone.",
    color: "#8B162B",
    instructorNote: "A curious, hands-on approach — let the material findings steer the form, not the reverse.",
    instructorName: "Prof. L. Kavak",
    tags: ["material", "resonance", "exploration"],
    addedOn: t(1, 30),
    comments: [],
  },
  {
    id: "sw6",
    studentName: "Kerem Aksoy",
    title: "Gramophone Precedent Analysis",
    kind: "precedent",
    phase: 2,
    phaseLabel: "Precedent Analysis",
    description:
      "A teardown of an early gramophone, annotating how the horn length and flare tune the perceived loudness across frequencies.",
    color: "#94BEBB",
    instructorNote: "Reads the object like an engineer and a historian at once — exactly the right depth.",
    instructorName: "Prof. L. Kavak",
    tags: ["precedent", "history", "horn", "analysis"],
    addedOn: t(2, 4),
    comments: [],
  },
];
