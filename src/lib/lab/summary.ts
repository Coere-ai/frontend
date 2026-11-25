import { conditionOf } from "./assign";
import { labCase } from "./cases";
import type { LabAssignment, LabCondition } from "./types";

/**
 * The study's numbers for /admin/lab and its CSV (docs/lab.md 6). Pure, so
 * every figure is tested. With 10 to 15 students these are signals to read,
 * not proof: the page shows counts beside every average for that reason.
 */

export interface SumParticipant extends LabAssignment {
  userId: string;
  username: string;
}

export interface SumWork {
  userId: string;
  caseId: string;
  taskId: string;
  startedAt: string;
  submittedAt: string | null;
  messages: number | null;
  reexplained: number | null;
  score: number | null;
}

/** One app_events row: what Coere did for the account, counts only. */
export interface SumEvent {
  userId: string;
  kind: string;
  count: number;
  createdAt: string;
}

/** Coere bringing memory into a chat, or the student reaching for it. These must not show up in a baseline case. */
export const COERE_USE_KINDS = ["context_import", "memory_search", "transfer"] as const;

export function minutesBetween(a: string, b: string | null): number | null {
  if (!b) return null;
  const ms = Date.parse(b) - Date.parse(a);
  return Number.isFinite(ms) && ms >= 0 ? Math.round(ms / 6000) / 10 : null;
}

function mean(xs: number[]): number | null {
  return xs.length ? Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10 : null;
}

export function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : Math.round(((s[m - 1]! + s[m]!) / 2) * 10) / 10;
}

/** The time a student spent in one case: first start to last hand in, or to now while it runs. */
export function caseWindow(work: readonly SumWork[], userId: string, caseId: string, now: string): { from: string; to: string } | null {
  const rows = work.filter((w) => w.userId === userId && w.caseId === caseId);
  if (!rows.length) return null;
  // Compared as moments, not strings: Postgres writes +00:00 and a JavaScript Date writes Z.
  const byTime = (a: string, b: string) => Date.parse(a) - Date.parse(b);
  const from = rows.map((r) => r.startedAt).sort(byTime)[0]!;
  const ends = rows.map((r) => r.submittedAt);
  const to = ends.every(Boolean) ? (ends as string[]).sort(byTime).at(-1)! : now;
  return { from, to };
}

/** How many times Coere was used for this student inside a window. */
export function coereUses(events: readonly SumEvent[], userId: string, w: { from: string; to: string } | null): number {
  if (!w) return 0;
  const from = Date.parse(w.from);
  const to = Date.parse(w.to);
  return events
    .filter((e) => e.userId === userId && (COERE_USE_KINDS as readonly string[]).includes(e.kind) && Date.parse(e.createdAt) >= from && Date.parse(e.createdAt) <= to)
    .reduce((s, e) => s + e.count, 0);
}

export interface ConditionStats {
  submitted: number;
  medianMinutes: number | null;
  meanReexplained: number | null;
  meanMessages: number | null;
  graded: number;
  meanScore: number | null;
}

export function conditionStats(rows: ReadonlyArray<SumWork & { condition: LabCondition }>, condition: LabCondition): ConditionStats {
  const done = rows.filter((r) => r.condition === condition && r.submittedAt);
  const nums = (pick: (r: SumWork) => number | null) => done.map(pick).filter((x): x is number => x !== null);
  const graded = nums((r) => r.score);
  return {
    submitted: done.length,
    medianMinutes: median(nums((r) => minutesBetween(r.startedAt, r.submittedAt))),
    meanReexplained: mean(nums((r) => r.reexplained)),
    meanMessages: mean(nums((r) => r.messages)),
    graded: graded.length,
    meanScore: mean(graded),
  };
}

/**
 * The fairer comparison: the same student, the same task shape, with and
 * without Coere. Each student who handed in task tN in both cases adds one
 * difference (Coere minus baseline). Negative minutes means Coere was faster.
 */
export function pairedDeltas(rows: ReadonlyArray<SumWork & { condition: LabCondition }>): { pairs: number; minutes: number | null; reexplained: number | null; scorePairs: number; score: number | null } {
  const mins: number[] = [];
  const re: number[] = [];
  const sc: number[] = [];
  const key = (r: SumWork) => `${r.userId}:${r.taskId}`;
  const base = new Map(rows.filter((r) => r.condition === "baseline" && r.submittedAt).map((r) => [key(r), r]));
  for (const c of rows.filter((r) => r.condition === "coere" && r.submittedAt)) {
    const b = base.get(key(c));
    if (!b) continue;
    const mc = minutesBetween(c.startedAt, c.submittedAt);
    const mb = minutesBetween(b.startedAt, b.submittedAt);
    if (mc !== null && mb !== null) mins.push(mc - mb);
    if (c.reexplained !== null && b.reexplained !== null) re.push(c.reexplained - b.reexplained);
    if (c.score !== null && b.score !== null) sc.push(c.score - b.score);
  }
  return { pairs: mins.length, minutes: mean(mins), reexplained: mean(re), scorePairs: sc.length, score: mean(sc) };
}

/** Each work row with its condition and part, for the tables, the deltas and the CSV. */
export function withConditions(people: readonly SumParticipant[], work: readonly SumWork[]): Array<SumWork & { condition: LabCondition; part: number | null }> {
  const byUser = new Map(people.map((p) => [p.userId, p]));
  return work.flatMap((w) => {
    const p = byUser.get(w.userId);
    const condition = p ? conditionOf(p, w.caseId) : null;
    if (!condition) return [];
    const part = labCase(w.caseId)?.tasks.find((t) => t.id === w.taskId)?.part ?? null;
    return [{ ...w, condition, part }];
  });
}

export type LabFlag = { userId: string; caseId: string; kind: "baseline_used_coere" | "coere_unused"; uses: number };

/** Cases that did not run as assigned, read from Coere's own counts. */
export function flags(people: readonly SumParticipant[], work: readonly SumWork[], events: readonly SumEvent[], now: string): LabFlag[] {
  const out: LabFlag[] = [];
  for (const p of people) {
    for (const caseId of p.cases) {
      const w = caseWindow(work, p.userId, caseId, now);
      if (!w) continue;
      const uses = coereUses(events, p.userId, w);
      const cond = conditionOf(p, caseId);
      if (cond === "baseline" && uses > 0) out.push({ userId: p.userId, caseId, kind: "baseline_used_coere", uses });
      if (cond === "coere" && uses === 0 && work.some((x) => x.userId === p.userId && x.caseId === caseId && x.submittedAt)) out.push({ userId: p.userId, caseId, kind: "coere_unused", uses });
    }
  }
  return out;
}

/** Net promoter score: share of 9 and 10 minus share of 0 to 6, from the Coere case's survey. */
export function nps(scores: number[]): number | null {
  if (!scores.length) return null;
  const pro = scores.filter((s) => s >= 9).length;
  const det = scores.filter((s) => s <= 6).length;
  return Math.round(((pro - det) / scores.length) * 100);
}
