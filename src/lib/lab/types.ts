/**
 * Coere Lab: the shapes behind the student study at /lab (docs/lab.md).
 *
 * A student works two cases from one matched pair: one with Coere Connect on
 * and one with it paused, in an order set when they join. The cases live in
 * code, not the database, so a packet is reviewed like any other change and
 * every student reads the same words.
 */

/** Which AI a task asks for. Switching AIs between tasks is the point of the study. */
export type LabAi = "chatgpt" | "claude" | "either";

/** The two matched pairs. A student only ever sees the two cases of one pair. */
export type LabPair = "build" | "strategy";

/** With Coere Connect on, or with it paused (the baseline). */
export type LabCondition = "coere" | "baseline";

export interface LabTask {
  /** Stable within its case, like "t1". Stored with every submission. */
  id: string;
  /** Part 1 runs in one session, part 2 in a later one, so memory has to carry over. */
  part: 1 | 2;
  title: string;
  ai: LabAi;
  /** What to do, in a few sentences. New facts for part 2 arrive here. */
  ask: string;
  /** What to paste into the submission box. */
  deliverable: string;
  /** What a full marks answer gets right. Most lines check a detail from the packet. */
  rubric: string[];
}

export interface LabPerson {
  name: string;
  role: string;
  /** What this person cares about, which the tasks lean on. */
  note: string;
}

export interface LabCase {
  id: string;
  pair: LabPair;
  name: string;
  tagline: string;
  /** The story, a paragraph each. */
  brief: string[];
  facts: { label: string; value: string }[];
  /** A small table of numbers, when the case has data to work with. */
  table?: { caption: string; columns: string[]; rows: string[][] };
  people: LabPerson[];
  constraints: string[];
  goals: string[];
  tasks: LabTask[];
}

/** One student's place in the study, as /lab reads it. */
export interface LabAssignment {
  pair: LabPair;
  /** The two cases in the order the student works them. */
  cases: [string, string];
  /** The condition of the first case. The second gets the other one. */
  firstCondition: LabCondition;
}
