import { conditionOf, taskOpen } from "./assign";
import type { LabAssignment, LabCase, LabCondition } from "./types";

/**
 * Where a student stands on each task and case, from their rows and the
 * open stage. Pure, so the pages and the tests read it the same way.
 */

export type TaskStatus = "locked" | "ready" | "started" | "submitted";

export interface WorkLike {
  caseId: string;
  taskId: string;
  submittedAt: string | null;
  answer: string | null;
}

export function taskStatus(a: LabAssignment, c: LabCase, taskId: string, stage: number, work: readonly WorkLike[]): TaskStatus {
  const task = c.tasks.find((t) => t.id === taskId);
  if (!task || !taskOpen(a, c.id, task, stage)) return "locked";
  const row = work.find((w) => w.caseId === c.id && w.taskId === taskId);
  if (!row) return "ready";
  return row.submittedAt ? "submitted" : "started";
}

export interface CaseProgress {
  caseId: string;
  slot: 1 | 2;
  condition: LabCondition;
  done: number;
  open: number;
  total: number;
  /** Every task handed in, so the survey shows. */
  finished: boolean;
}

export function caseProgress(a: LabAssignment, c: LabCase, stage: number, work: readonly WorkLike[]): CaseProgress {
  const statuses = c.tasks.map((t) => taskStatus(a, c, t.id, stage, work));
  const done = statuses.filter((s) => s === "submitted").length;
  return {
    caseId: c.id,
    slot: a.cases[0] === c.id ? 1 : 2,
    condition: conditionOf(a, c.id) ?? "baseline",
    done,
    open: statuses.filter((s) => s !== "locked").length,
    total: c.tasks.length,
    finished: done === c.tasks.length,
  };
}
