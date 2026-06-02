import type { Grade, GradeComponent, HistoryCourse, Semester } from "@/types";

/**
 * Academic history — the single source of truth for the right "semester spine"
 * and the full-page history detail view. The example student (IEU Industrial
 * Design) is in 2nd-year spring, so the first three semesters are completed
 * (`active`) and the rest are locked (muted, not clickable).
 *
 * Grades/breakdowns are clean, editable dummy data — swap for an API response
 * without touching the components.
 */

/** Per-course column palette, cycled within each semester for varied columns. */
const columnPalette = [
  "#8B162B", // Crimson Ink
  "#F37521", // Burnt Sienna
  "#C6B63B", // Neon Pear
  "#185C46", // Pine
  "#BAD2E8", // Arctic Blue
  "#F9B6B8", // Dusty Rose
  "#243C8E", // Indigo
  "#00C49B", // Teal
];

/** Build a course with a cycled color and a small dummy grade breakdown. */
function course(
  id: string,
  code: string,
  name: string,
  i: number,
  grade: Grade,
  breakdown: GradeComponent[],
): HistoryCourse {
  return { id, code, name, color: columnPalette[i % columnPalette.length], grade, breakdown };
}

/** A reusable studio-style breakdown (project-heavy). */
const studioBreakdown: GradeComponent[] = [
  { label: "Project", grade: "AA", weight: 50 },
  { label: "Midterm Jury", grade: "BA", weight: 25 },
  { label: "Final Jury", grade: "BB", weight: 25 },
];

/** A reusable lecture-style breakdown (exam-heavy). */
const lectureBreakdown: GradeComponent[] = [
  { label: "Assignments", grade: "BA", weight: 30 },
  { label: "Midterm", grade: "BB", weight: 30 },
  { label: "Final", grade: "AA", weight: 40 },
];

const firstYearFall: HistoryCourse[] = [
  course("eng101", "ENG 101", "Academic Skills in English I", 0, "BA", lectureBreakdown),
  course("ffd101", "FFD 101", "Art and Design Studio 1", 1, "AA", studioBreakdown),
  course("ffd111", "FFD 111", "Drawing and Representation", 2, "BA", studioBreakdown),
  course("ffd121", "FFD 121", "History of Art and Design 1", 3, "BB", lectureBreakdown),
  course("id115", "ID 115", "Human Factors", 4, "CB", lectureBreakdown),
  course("iue100", "IUE 100", "Orientation and Career Planning", 5, "AA", [
    { label: "Participation", grade: "AA", weight: 100 },
  ]),
  course("gehu204", "GEHU 204", "Fundamentals of Philosophy", 6, "BB", lectureBreakdown),
  course("itl103a", "ITL 103", "Italian Language I", 7, "BA", lectureBreakdown),
];

const firstYearSpring: HistoryCourse[] = [
  course("eng102", "ENG 102", "Academic Skills in English II", 0, "BA", lectureBreakdown),
  course("ffd102", "FFD 102", "Art and Design Studio 2", 1, "AA", studioBreakdown),
  course("ffd104", "FFD 104", "Computer Aided Technical Drawing", 2, "BB", studioBreakdown),
  course("ffd122", "FFD 122", "History of Art and Design 2", 3, "BA", lectureBreakdown),
  course("ffd142", "FFD 142", "Model Making", 4, "AA", studioBreakdown),
  course("gehu203", "GEHU 203", "Modern World History", 5, "CB", lectureBreakdown),
  course("itl103b", "ITL 103", "Italian Language II", 6, "BB", lectureBreakdown),
];

const secondYearFall: HistoryCourse[] = [
  course("id201", "ID 201", "Product Design Studio I", 0, "AA", studioBreakdown),
  course("id203", "ID 203", "Computer Aided Industrial Design", 1, "BA", studioBreakdown),
  course("id207", "ID 207", "Materials for Industrial Design", 2, "BB", lectureBreakdown),
  course(
    "id211",
    "ID 211",
    "Sketching and Rendering Techniques in Industrial Design",
    3,
    "BA",
    studioBreakdown,
  ),
  course("id301", "ID 301", "History and Theory of Industrial Design", 4, "CB", lectureBreakdown),
  course("itl103c", "ITL 103", "Italian Language III", 5, "BB", lectureBreakdown),
];

export const semesters: Semester[] = [
  {
    id: "s1",
    label: "1st Year Fall",
    shortLabel: "1st Fall",
    year: 1,
    term: "fall",
    color: "#F4D892", // Butter
    active: true,
    courses: firstYearFall,
  },
  {
    id: "s2",
    label: "1st Year Spring",
    shortLabel: "1st Spring",
    year: 1,
    term: "spring",
    color: "#F286A3", // Guava
    active: true,
    courses: firstYearSpring,
  },
  {
    id: "s3",
    label: "2nd Year Fall",
    shortLabel: "2nd Fall",
    year: 2,
    term: "fall",
    color: "#E89C73", // Sunset
    active: true,
    courses: secondYearFall,
  },
  {
    id: "s4",
    label: "2nd Year Spring",
    shortLabel: "2nd Spring",
    year: 2,
    term: "spring",
    color: "#E36559", // Sangria
    active: false,
    courses: [],
  },
  {
    id: "s5",
    label: "3rd Year Fall",
    shortLabel: "3rd Fall",
    year: 3,
    term: "fall",
    color: "#C0B05B", // Moss
    active: false,
    courses: [],
  },
  {
    id: "s6",
    label: "3rd Year Spring",
    shortLabel: "3rd Spring",
    year: 3,
    term: "spring",
    color: "#657652", // Palm
    active: false,
    courses: [],
  },
  {
    id: "s7",
    label: "4th Year Fall",
    shortLabel: "4th Fall",
    year: 4,
    term: "fall",
    color: "#94BEBB", // Lagoon
    active: false,
    courses: [],
  },
  {
    id: "s8",
    label: "4th Year Spring",
    shortLabel: "4th Spring",
    year: 4,
    term: "spring",
    color: "#23617E", // Odyssey
    active: false,
    courses: [],
  },
];
