import type { RecordedItem } from "@/types";

/**
 * Recorded, read-only Private Chat transcripts — keyed by course id. Only the
 * ID 202 studio has one: a previously-recorded conversation between a student
 * and Journey, shown (scroll-only, no input) to demonstrate how Journey stores
 * the design process, how milestones are generated, and how the AI questions in
 * Socratic mode. Gating is on PRESENCE in this record (not a hardcoded id), so
 * any course given a transcript here gets the read-only demo automatically.
 *
 * Every turn is tagged `mode: "socratic"` (the whole session is Socratic). The
 * mode tag is per-message so adversarial turns can be appended later and the
 * Socratic/Adversarial toggle will jump to / restyle them with no code change.
 */

// Authoring helpers (keep the transcript readable). Student dumps preserve their
// line breaks via "\n" (rendered with `whitespace-pre-line`).
const s = (text: string): RecordedItem => ({ kind: "message", role: "student", text, mode: "socratic" });
const j = (text: string): RecordedItem => ({ kind: "message", role: "ai", text, mode: "socratic" });
const milestone = (label: string): RecordedItem => ({ kind: "milestone", label });

const id202Transcript: RecordedItem[] = [
  s(
    "Everything in my head right now:\n" +
      "The brief says mechanical amplifier. The first thing that comes to mind is a speaker, but obviously I can't use electronics. Then I think about gramophones. But I don't want to just make a gramophone for phones because that feels obvious.\n" +
      "I keep thinking about how people actually use sound. I use my phone while cooking. Sometimes while showering. Sometimes while drawing. Sometimes with friends.\n" +
      "I don't know if the problem is actually volume.\n" +
      "I don't know where to start.",
  ),
  j("You mentioned several situations.\nWhy those situations specifically?"),
  s("I don't know.\nThey're just the first examples that came to mind."),
  j("What makes them memorable?"),
  s("Maybe because they're situations where I actually notice the sound."),
  j("What causes you to notice it?"),
  s("Because I can't hear it properly."),
  j("Can you hear it properly while sitting at your desk?"),
  s("Usually yes."),
  j("What changes in the situations you mentioned?"),
  s(
    "Well...\n" +
      "When I'm drawing I'm further away from the phone.\n" +
      "When I'm cooking there are other sounds.\n" +
      "The shower is noisy too.",
  ),
  j("So what are you describing?"),
  s("Situations where the environment interferes somehow."),
  j("Interferes with what?"),
  s("With listening."),
  j("Are all those environments equally difficult?"),
  s("No.\nThe shower is probably the worst."),
  j("Why?"),
  s("Because of the water noise."),
  j("What else?"),
  s("The phone is usually farther away.\nAnd I don't want to touch it because my hands are wet."),
  j("Interesting.\nWhat about cooking?"),
  s(
    "Similar actually.\n" +
      "My hands are occupied.\n" +
      "Sometimes they're dirty.\n" +
      "The phone is sitting somewhere across the counter.\n" +
      "There are sounds from pans, oil, running water.",
  ),
  j("What similarities do you see between these situations?"),
  s(
    "Both involve water.\n" +
      "Both involve environmental noise.\n" +
      "Both involve distance.\n" +
      "Both make it inconvenient to interact with the device.",
  ),
  milestone("Friction points"),
  j("Which of those observations feels most significant?"),
  s("The water thing is interesting.\nI hadn't really noticed that before."),
  j("Why is it interesting?"),
  s(
    "Because I wasn't thinking about a user group.\n" +
      "I was thinking about situations.\n" +
      "And the situations seem related.",
  ),
  j("Related how?"),
  s(
    "They're not random.\n" +
      "Kitchen.\n" +
      "Bathroom.\n" +
      "Maybe laundry rooms.\n" +
      "Maybe outdoor washing areas.\n" +
      "They're all places where water is involved.",
  ),
  milestone("User group & context"),
  j("What challenges does water create?"),
  s(
    "You don't want to handle electronics.\n" +
      "Your hands are occupied.\n" +
      "You're moving around.\n" +
      "The environment is noisy.",
  ),
  j("Does increasing volume solve all of those challenges?"),
  s("No.\nNot really."),
  j("Which challenge does it solve?"),
  s("Only hearing."),
  j("What challenges remain?"),
  s("Accessibility.\nPlacement.\nConvenience.\nDistance.\nInteraction."),
  j("Then what problem are you actually trying to solve?"),
  s("Maybe not amplification.\nMaybe listening in water-related environments."),
  milestone("Primary problem"),
  j("What's the difference?"),
  s("Amplification is a feature.\nListening in water-related environments is a situation."),
  j("Which one is closer to a design problem?"),
  s("The situation.\nDefinitely the situation."),
  j("Why?"),
  s(
    "Because now I have a context.\n" +
      "I have users.\n" +
      "I have constraints.\n" +
      "I have a reason why someone would need the product.\n" +
      "Before I just had a technology.",
  ),
  j("How confident are you in this direction?"),
  s(
    "More confident than I was thirty minutes ago.\n" +
      "At least now I'm investigating a real situation instead of just trying to make something louder.",
  ),
];

export const recordedConversations: Record<string, RecordedItem[]> = {
  id202: id202Transcript,
};
