/**
 * Static content for the Private Chat workspace right sidebar (Milestones /
 * Resources / profile). Single source of truth — swap for real project data
 * later without touching the component.
 */

export interface MilestoneNode {
  id: string;
  label: string;
  /** Sub-steps revealed when the sidebar is expanded (hovered). */
  children?: string[];
}

/** Design-process milestones; Problem Definition is the one in progress. */
export const milestones: MilestoneNode[] = [
  {
    id: "problem-definition",
    label: "Problem Definition",
    children: [
      "friction points",
      "user group",
      "primary problem",
      "secondary problems",
      "5w1h questions",
    ],
  },
  { id: "user-research", label: "User Research" },
  { id: "market-technology", label: "Market & Technology" },
  { id: "concept-development", label: "Concept Development" },
];

/** The milestone the student is currently working through. */
export const activeMilestoneId = "problem-definition";

/** Resources list (empty for now — the heading is shown as a placeholder). */
export const resources: string[] = [];

/** Profile shown in the sidebar footer. */
export const profile = {
  name: "Alara Ayrac",
  role: "Sophomore ID Student",
} as const;
