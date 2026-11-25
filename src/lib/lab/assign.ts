import { LAB_PAIRS } from "./cases";
import type { LabAssignment, LabCase, LabCondition, LabPair, LabTask } from "./types";

/**
 * The crossover. Each student works one case with Coere and the matched case
 * without it. Pair, case order and condition order each flip on a different
 * bit of the join number, so every 8 students cover all 8 combinations once.
 * With 10 to 15 students that keeps each case close to half with Coere and
 * half without, which a coin flip per student would not.
 */
export function assignFor(joinIndex: number): LabAssignment {
  const n = Math.max(0, Math.floor(joinIndex));
  const pair: LabPair = n % 2 === 0 ? "build" : "strategy";
  const [a, b] = LAB_PAIRS[pair];
  const swap = Math.floor(n / 2) % 2 === 1;
  const firstCondition: LabCondition = Math.floor(n / 4) % 2 === 0 ? "coere" : "baseline";
  return { pair, cases: swap ? [b.id, a.id] : [a.id, b.id], firstCondition };
}

/** The condition a case runs under for this student, or null when it is not theirs. */
export function conditionOf(a: LabAssignment, caseId: string): LabCondition | null {
  if (a.cases[0] === caseId) return a.firstCondition;
  if (a.cases[1] === caseId) return a.firstCondition === "coere" ? "baseline" : "coere";
  return null;
}

/**
 * The study runs in stages the operator opens one session at a time:
 * 1 is the first case's part 1, 2 its part 2, 3 the second case's part 1,
 * 4 its part 2. Gating by stage, not by a student's own pace, is what makes
 * part 2 land in a later session, so memory has to carry across a gap.
 */
export const LAB_STAGES = 4;

export function stageOfTask(a: LabAssignment, caseId: string, task: Pick<LabTask, "part">): number | null {
  const slot = a.cases.indexOf(caseId);
  return slot < 0 ? null : slot * 2 + task.part;
}

export function taskOpen(a: LabAssignment, caseId: string, task: Pick<LabTask, "part">, stage: number): boolean {
  const s = stageOfTask(a, caseId, task);
  return s !== null && s <= stage;
}

/** Whether any of a case's tasks are open yet, so its page can be read. */
export function caseOpen(a: LabAssignment, c: LabCase, stage: number): boolean {
  return c.tasks.some((t) => taskOpen(a, c.id, t, stage));
}

export function readStage(raw: unknown): number {
  const v = typeof raw === "object" && raw !== null ? (raw as { stage?: unknown }).stage : undefined;
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= LAB_STAGES ? v : 0;
}
