import type {
  Assignment,
  AssignmentPhase,
  ClassroomContribution,
  CourseClassroom,
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
 * The class is in Phase 4, so these come from Phases 1–3. Each is a full board
 * image (the description, instructor note, and tags are baked into the image);
 * clicking opens it full-size.
 */
export const selectedWorks: SelectedWork[] = [
  {
    id: "sw1",
    studentName: "Aylin Demir",
    title: "User Observation Map",
    phase: 1,
    phaseLabel: "User Observation",
    image: "/assets/aylin-demir.jpeg",
    color: "#E89C73",
    description:
      "A well-documented observation map showing how people instinctively cup their hands around phones and laptops when trying to increase volume.",
    instructorNote: "Excellent behavioral insight that can inform physical amplification strategies.",
    instructorName: "Prof. L. Kavak",
    tags: ["behavior", "sound", "observation", "user research"],
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
    phase: 2,
    phaseLabel: "Research Synthesis",
    image: "/assets/derin-korkmaz.jpeg",
    color: "#657652",
    description:
      "A comparative study of horn geometries (exponential, tractrix, conical, rectangular, folded) and their acoustic amplification principles.",
    instructorNote: "Strong visual organization and synthesis of technical research.",
    instructorName: "Prof. L. Kavak",
    tags: ["research", "acoustics", "horn design", "amplification"],
    comments: [],
  },
  {
    id: "sw3",
    studentName: "Maya Chen",
    title: "Amplifier Concept Exploration",
    phase: 3,
    phaseLabel: "Sketch Exploration",
    image: "/assets/maya-chen.jpeg",
    color: "#23617E",
    description:
      "A sketch sheet containing over 40 amplifier concepts exploring folding, spiraling, and directional sound pathways.",
    instructorNote: "Exceptional breadth of ideation before committing to a concept.",
    instructorName: "Prof. L. Kavak",
    tags: ["sketch", "ideation", "amplifier", "concept generation"],
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
    phase: 3,
    phaseLabel: "Form Development",
    image: "/assets/can-yildiz.jpeg",
    color: "#C6B63B",
    description:
      "A sequence of physical foam mock-ups testing sound reflection angles, directionality, and amplification through rapid prototyping.",
    instructorNote: "Excellent use of rapid prototyping to test assumptions.",
    instructorName: "Prof. L. Kavak",
    tags: ["prototyping", "foam model", "acoustics", "testing"],
    comments: [],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// NON-STUDIO (lecture) courses
//
// Everything above belongs to the ID 202 design studio and is left untouched.
// The record below drives every OTHER course's simplified Classroom:
// Announcements (read-only notice board) · Assignments · Selected Works.
// Mocked but API-ready — keyed by course id (see data/courses.ts).
// ──────────────────────────────────────────────────────────────────────────

/** A lecture selected work — no board image (renders a placeholder cover). */
function work(
  id: string,
  studentName: string,
  title: string,
  color: string,
  instructorName: string,
  instructorNote: string,
): SelectedWork {
  return { id, studentName, title, color, instructorName, instructorNote, comments: [] };
}

export const courseClassrooms: Record<string, CourseClassroom> = {
  // ── FFD 202 · Advanced Design Presentation ───────────────────────────────
  ffd202: {
    announcements: [
      {
        id: "ffd-an1",
        title: "Assignment Deadline Reminder",
        message:
          "The Exploded View Diagram assignment is due this Friday at 23:59. Late submissions will not be accepted.",
        instructor: "Dr. Ayşe Kaya",
        postedAt: t(4, 6, 9, 0),
      },
      {
        id: "ffd-an2",
        title: "Reference Files Uploaded",
        message:
          "The lecture slides and example files from this week's session have been uploaded to Assignments.",
        instructor: "Dr. Ayşe Kaya",
        postedAt: t(3, 28, 16, 30),
      },
      {
        id: "ffd-an3",
        title: "Lecture Rescheduled",
        message:
          "Due to a faculty meeting, this week's lecture will take place on Thursday at 14:30 instead of Wednesday at 10:30.",
        instructor: "Dr. Ayşe Kaya",
        postedAt: t(3, 20, 11, 0),
      },
    ],
    assignments: [
      {
        id: "ffd-a1",
        title: "Adobe Illustrator Product Infographic",
        brief: "Vector infographic of an everyday product.",
        description:
          "Create a vector-based infographic explaining the structure, components, and usage of an everyday product using Adobe Illustrator.",
        focus: ["vector illustration", "visual hierarchy", "typography", "information organization"],
        submissions: [
          { id: "ffd-a1-s1", label: "Product infographic v1", kind: "image", version: 1, createdAt: t(2, 24, 21, 0), status: "reviewed" },
          { id: "ffd-a1-s2", label: "Product infographic v2", kind: "image", version: 2, createdAt: t(3, 3, 20, 30), status: "reviewed" },
        ],
        feedback:
          "The overall composition is clear. Improve consistency between icon styles and increase contrast in the secondary information layer.",
      },
      {
        id: "ffd-a2",
        title: "Photoshop Rendering Enhancement",
        brief: "Improve a product rendering in Photoshop.",
        description: "Improve a provided product rendering using Adobe Photoshop.",
        focus: ["material enhancement", "lighting adjustments", "shadow correction", "reflections", "background composition"],
        submissions: [
          { id: "ffd-a2-s1", label: "Rendering enhancement v1", kind: "image", version: 1, createdAt: t(3, 8, 22, 0), status: "reviewed" },
          { id: "ffd-a2-s2", label: "Rendering enhancement v2", kind: "image", version: 2, createdAt: t(3, 15, 19, 45), status: "reviewed" },
        ],
        feedback:
          "Good material definition. Continue refining reflections and contact shadows to improve realism.",
      },
      {
        id: "ffd-a3",
        title: "Exploded View Diagram",
        brief: "Professional exploded-view diagram of a product.",
        description:
          "Create a professional exploded-view diagram of a product using Adobe Illustrator and Photoshop.",
        focus: ["diagram clarity", "labeling systems", "visual communication", "technical representation"],
        submissions: [
          { id: "ffd-a3-s1", label: "Exploded view board v1", kind: "image", version: 1, createdAt: t(3, 22, 23, 10), status: "reviewed" },
        ],
        feedback:
          "Strong technical communication. Increase spacing between annotations and improve readability at smaller scales.",
      },
      {
        id: "ffd-a4",
        title: "Presentation Board Layout",
        brief: "Presentation board for an existing project.",
        description: "Prepare a professional presentation board for an existing design project.",
        focus: ["typography", "layout hierarchy", "image placement", "visual storytelling", "board composition"],
        submissions: [
          { id: "ffd-a4-s1", label: "Board layout draft", kind: "image", version: 1, createdAt: t(3, 29, 21, 30), status: "reviewed" },
          { id: "ffd-a4-s2", label: "Final board layout", kind: "image", version: 2, createdAt: t(4, 5, 20, 0), status: "in-review" },
        ],
        feedback:
          "The visual hierarchy is successful. Reduce text density and allow more breathing space around key visuals.",
      },
      {
        id: "ffd-a5",
        title: "Portfolio Page Design",
        brief: "Portfolio-quality project page.",
        description:
          "Design a portfolio-quality project page that communicates a design project clearly and professionally.",
        focus: ["portfolio structure", "project storytelling", "visual consistency", "professional presentation"],
        submissions: [
          { id: "ffd-a5-s1", label: "Portfolio page final", kind: "image", version: 1, createdAt: t(4, 9, 22, 15), status: "reviewed" },
        ],
        feedback:
          "Professional presentation quality. The project narrative is easy to follow and visually balanced.",
      },
    ],
    selectedWorks: [],
  },

  // ── ID 204 · Design Semiotics for Industrial Design ──────────────────────
  id204: {
    announcements: [
      {
        id: "id204-an1",
        title: "Assignment Deadline Reminder",
        message:
          "The Semiotic Analysis of a Designed Object is due next Wednesday at 23:59.",
        instructor: "Prof. Deniz Aydın",
        postedAt: t(4, 4, 10, 0),
      },
      {
        id: "id204-an2",
        title: "Reference Files Uploaded",
        message:
          "This week's reading list and the lecture slides on signification and kitsch have been uploaded to Assignments.",
        instructor: "Prof. Deniz Aydın",
        postedAt: t(3, 25, 15, 0),
      },
      {
        id: "id204-an3",
        title: "Lecture Rescheduled",
        message:
          "Due to a faculty meeting, this week's lecture will take place on Thursday at 14:30 instead of Wednesday at 10:30.",
        instructor: "Prof. Deniz Aydın",
        postedAt: t(3, 18, 11, 0),
      },
    ],
    assignments: [
      {
        id: "id204-a1",
        title: "Kitsch Object Analysis",
        brief: "Symbolic reading of a kitsch object.",
        description:
          'Select an object that can be interpreted as "kitsch" and prepare a visual and written analysis discussing its symbolic meaning, cultural associations, aesthetic characteristics, and role in popular culture.',
        focus: ["Meaning in everyday objects", "Popular culture", "Kitsch", "Signification"],
        submissions: [
          { id: "id204-a1-s1", label: "Kitsch Analysis Submission", kind: "paper", version: 1, createdAt: t(2, 20, 20, 0), status: "reviewed" },
        ],
        feedback:
          "Strong discussion of cultural associations. Expand your analysis of how aesthetic choices contribute to the object's perceived value.",
      },
      {
        id: "id204-a2",
        title: "Semiotic Analysis of a Designed Object",
        brief: "Detailed semiotic analysis of a product.",
        description:
          "Conduct a detailed semiotic analysis of a designed object using concepts discussed throughout the semester.",
        focus: ["signs", "codes", "denotation", "connotation", "meaning construction"],
        submissions: [
          { id: "id204-a2-s1", label: "Analysis Draft", kind: "paper", version: 1, createdAt: t(3, 10, 21, 0), status: "reviewed" },
          { id: "id204-a2-s2", label: "Analysis Final", kind: "paper", version: 2, createdAt: t(3, 24, 19, 30), status: "reviewed" },
        ],
        feedback:
          "Good application of semiotic terminology. The distinction between denotation and connotation could be discussed more clearly.",
      },
      {
        id: "id204-a3",
        title: "Comparative Semiotic Analysis",
        brief: "Compare how two products communicate meaning.",
        description:
          "Compare two products from the same category and analyze how meaning is communicated differently through form, material, symbolism, and cultural references.",
        submissions: [
          { id: "id204-a3-s1", label: "Comparative Analysis Submission", kind: "paper", version: 1, createdAt: t(4, 7, 22, 0), status: "in-review" },
        ],
        feedback:
          "Interesting comparison. Strengthen the discussion of user interpretation and cultural context.",
      },
    ],
    selectedWorks: [
      work("id204-w1", "Ece Demir", "Kitsch Analysis", "#C6B63B", "Prof. Deniz Aydın",
        "An insightful reading of how nostalgia and cultural memory contribute to perceived meaning."),
      work("id204-w2", "Mert Kaya", "Exhibition Board", "#23617E", "Prof. Deniz Aydın",
        "Excellent visual organization and strong integration of theory and presentation."),
      work("id204-w3", "Selin Arslan", "Analysis Assignment 1", "#657652", "Prof. Deniz Aydın",
        "One of the strongest applications of semiotic concepts in the class."),
      work("id204-w4", "Can Yıldız", "Comparative Semiotic Analysis", "#E36559", "Prof. Deniz Aydın",
        "Clear and well-supported interpretation of product language and symbolic communication."),
    ],
  },

  // ── ID 208 · Production Technologies II ──────────────────────────────────
  id208: {
    announcements: [
      {
        id: "id208-an1",
        title: "Assignment Deadline Reminder",
        message:
          "The Final Production Presentation documentation is due this Friday at 23:59.",
        instructor: "Dr. Emre Şahin",
        postedAt: t(4, 8, 9, 30),
      },
      {
        id: "id208-an2",
        title: "Classroom Change",
        message:
          "Next week's session will be held in the Manufacturing Lab (Workshop A) instead of the lecture hall.",
        instructor: "Dr. Emre Şahin",
        postedAt: t(3, 30, 13, 0),
      },
      {
        id: "id208-an3",
        title: "Reference Files Uploaded",
        message:
          "Reference documents on molding processes and tooling have been uploaded to Assignments.",
        instructor: "Dr. Emre Şahin",
        postedAt: t(3, 22, 16, 0),
      },
    ],
    assignments: [
      {
        id: "id208-a1",
        title: "Chocolate Mold Design and Production",
        brief: "Hands-on mold-based production project.",
        description:
          "Students were asked to apply molding production principles through a hands-on manufacturing exercise. The project required students to design a concept for a molded chocolate product and produce physical chocolates using mold-based production techniques. Students researched molding processes, developed chocolate concepts, selected appropriate mold geometries, produced physical outcomes, and documented the manufacturing process. Final deliverables: Concept Development Presentation, Mold Design Documentation, Production Process Documentation, Physical Chocolate Samples, and a Final Presentation Board.",
        focus: [
          "product geometry",
          "mold design",
          "manufacturing constraints",
          "part release considerations",
          "material behavior",
          "production feasibility",
        ],
        submissions: [
          { id: "id208-a1-s1", label: "Concept Proposal Presentation", kind: "paper", version: 1, createdAt: t(2, 18, 20, 0), status: "reviewed" },
          { id: "id208-a1-s2", label: "Mold Development Documentation", kind: "paper", version: 2, createdAt: t(3, 12, 21, 30), status: "reviewed" },
          { id: "id208-a1-s3", label: "Final Production Presentation", kind: "paper", version: 3, createdAt: t(4, 9, 22, 0), status: "reviewed" },
        ],
        feedback:
          "The project demonstrates a strong understanding of mold design principles and manufacturing constraints. The chosen geometry successfully balances aesthetic qualities with production feasibility. The documentation clearly communicates the development process and production considerations.",
      },
    ],
    selectedWorks: [],
  },

  // ── GEEC 207 · Economic History ──────────────────────────────────────────
  geec207: {
    announcements: [
      {
        id: "geec-an1",
        title: "Assignment Deadline Reminder",
        message: "The Economic History Reading Reflection is due this Friday at 23:59.",
        instructor: "Prof. Selim Demir",
        postedAt: t(4, 3, 10, 0),
      },
      {
        id: "geec-an2",
        title: "Reference Files Uploaded",
        message:
          "The lecture slides on the emergence of capitalism and the assigned readings have been uploaded to Assignments.",
        instructor: "Prof. Selim Demir",
        postedAt: t(3, 26, 15, 30),
      },
      {
        id: "geec-an3",
        title: "Lecture Rescheduled",
        message:
          "Due to a faculty meeting, this week's lecture will take place on Thursday at 14:30 instead of Wednesday at 10:30.",
        instructor: "Prof. Selim Demir",
        postedAt: t(3, 17, 11, 0),
      },
    ],
    assignments: [
      {
        id: "geec-a1",
        title: "Economic History Reading Reflection",
        brief: "Reflection connecting historical economics to today.",
        description:
          "Students are required to select a topic discussed during the first half of the semester and prepare a written reflection connecting historical economic developments with contemporary society. The objective is to demonstrate understanding of how historical economic processes shaped modern economic institutions.",
        focus: [
          "Ancient economic systems",
          "Medieval Europe",
          "Non-market societies",
          "Overseas expansion",
          "The emergence of capitalism",
        ],
        submissions: [
          { id: "geec-a1-s1", label: "Reading Reflection Final Submission", kind: "paper", version: 1, createdAt: t(3, 14, 21, 0), status: "reviewed" },
        ],
        feedback:
          "The paper demonstrates a solid understanding of the historical material. The discussion of long-term economic change is particularly strong. Consider incorporating more examples from the course readings.",
      },
      {
        id: "geec-a2",
        title: "Economic Transformation Presentation",
        brief: "Analyze a major historical economic transformation.",
        description:
          "Students prepare a presentation analyzing a major historical economic transformation discussed during the semester. The presentation should explain the historical context, driving forces, and long-term consequences of the selected transformation.",
        focus: [
          "The Industrial Revolution",
          "The emergence of market society",
          "European overseas expansion",
          "Globalization",
          "Twentieth-century economic development",
        ],
        submissions: [
          { id: "geec-a2-s1", label: "Final Presentation Slides", kind: "paper", version: 1, createdAt: t(4, 6, 20, 30), status: "reviewed" },
        ],
        feedback:
          "The presentation successfully connects historical developments with contemporary economic structures. The visual timeline and use of supporting evidence strengthen the overall argument.",
      },
    ],
    selectedWorks: [],
  },

  // ── ITL 202 · Italian IV ─────────────────────────────────────────────────
  itl202: {
    announcements: [
      {
        id: "itl-an1",
        title: "Reference Files Uploaded",
        message: "Example CVs and cover letters in Italian have been uploaded to Assignments.",
        instructor: "Dott.ssa Giulia Bianchi",
        postedAt: t(4, 2, 16, 0),
      },
      {
        id: "itl-an2",
        title: "Classroom Change",
        message: "Next week's lesson will be held in classroom C-210.",
        instructor: "Dott.ssa Giulia Bianchi",
        postedAt: t(3, 27, 13, 30),
      },
      {
        id: "itl-an3",
        title: "Lecture Rescheduled",
        message:
          "This week's lesson will take place on Thursday at 14:30 instead of Wednesday at 10:30.",
        instructor: "Dott.ssa Giulia Bianchi",
        postedAt: t(3, 19, 11, 0),
      },
    ],
    assignments: [
      {
        id: "itl-a1",
        title: "CV and Cover Letter in Italian",
        brief: "CV + motivation letter in Italian.",
        description:
          "Prepare a curriculum vitae (CV) and a motivation letter in Italian for a fictional internship or job application.",
        focus: [
          "introduce themselves",
          "describe educational background",
          "discuss skills and interests",
          "express future plans",
          "write formally in Italian",
        ],
        submissions: [
          { id: "itl-a1-s1", label: "CV_and_Cover_Letter_Final.pdf", kind: "paper", version: 1, createdAt: t(4, 1, 22, 0), status: "reviewed" },
        ],
        feedback:
          "Your CV structure is clear and easy to follow. The motivation letter demonstrates good use of future tense structures and formal language. Pay attention to article usage and agreement in longer sentences.",
      },
    ],
    selectedWorks: [
      work("itl-w1", "Sofia Romano", "CV and Cover Letter", "#23617E", "Dott.ssa Giulia Bianchi",
        "Excellent use of formal Italian and professional vocabulary throughout the application documents."),
      work("itl-w2", "Can Yıldız", "CV and Cover Letter", "#657652", "Dott.ssa Giulia Bianchi",
        "Strong organization and clear expression of future goals."),
      work("itl-w3", "Zeynep Kaya", "CV and Cover Letter", "#8B162B", "Dott.ssa Giulia Bianchi",
        "Very natural writing style and effective use of professional language structures."),
    ],
  },
};
