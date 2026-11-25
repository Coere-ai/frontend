import assert from "node:assert/strict";
import { test } from "node:test";

import { assignFor } from "./assign";
import { caseWindow, coereUses, conditionStats, flags, median, minutesBetween, pairedDeltas, withConditions, type SumParticipant, type SumWork } from "./summary";

const a0 = assignFor(0); // build pair, first case with Coere
const ann: SumParticipant = { userId: "u1", username: "ann", ...a0 };
const at = (m: number) => new Date(Date.UTC(2026, 10, 25, 10, m)).toISOString();

function row(caseId: string, taskId: string, start: number, end: number | null, extra: Partial<SumWork> = {}): SumWork {
  return { userId: "u1", caseId, taskId, startedAt: at(start), submittedAt: end === null ? null : at(end), messages: null, reexplained: null, score: null, ...extra };
}

test("minutes and medians round to one place and refuse nonsense", () => {
  assert.equal(minutesBetween(at(0), at(15)), 15);
  assert.equal(minutesBetween(at(10), at(0)), null);
  assert.equal(minutesBetween(at(0), null), null);
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(median([]), null);
});

test("a case window runs from the first start to the last hand in, or to now", () => {
  const work = [row(a0.cases[0], "t1", 0, 20), row(a0.cases[0], "t2", 25, 50)];
  assert.deepEqual(caseWindow(work, "u1", a0.cases[0], at(59)), { from: at(0), to: at(50) });
  assert.deepEqual(caseWindow([...work, row(a0.cases[0], "t3", 55, null)], "u1", a0.cases[0], at(59)), { from: at(0), to: at(59) });
  assert.equal(caseWindow(work, "u1", "nope", at(59)), null);
});

test("only Coere's own memory uses inside the window count", () => {
  const events = [
    { userId: "u1", kind: "context_import", count: 3, createdAt: at(10) },
    { userId: "u1", kind: "extract_chat", count: 9, createdAt: at(10) },
    { userId: "u1", kind: "transfer", count: 1, createdAt: at(70) },
    { userId: "u2", kind: "context_import", count: 5, createdAt: at(10) },
  ];
  assert.equal(coereUses(events, "u1", { from: at(0), to: at(50) }), 3);
});

test("stats and paired deltas compare the same student on the same task", () => {
  const [coereCase, baseCase] = a0.cases;
  const work = [
    row(coereCase, "t1", 0, 10, { reexplained: 0, score: 90 }),
    row(baseCase, "t1", 0, 30, { reexplained: 3, score: 70 }),
    row(baseCase, "t2", 0, 20, { reexplained: 2 }),
  ];
  const rows = withConditions([ann], work);
  assert.deepEqual(conditionStats(rows, "coere"), { submitted: 1, medianMinutes: 10, meanReexplained: 0, meanMessages: null, graded: 1, meanScore: 90 });
  assert.equal(conditionStats(rows, "baseline").medianMinutes, 25);
  assert.deepEqual(pairedDeltas(rows), { pairs: 1, minutes: -20, reexplained: -3, scorePairs: 1, score: 20 });
});

test("flags a baseline case that used Coere and a Coere case that never did", () => {
  const [coereCase, baseCase] = a0.cases;
  const work = [row(coereCase, "t1", 0, 10), row(baseCase, "t1", 100, 130)];
  const events = [{ userId: "u1", kind: "memory_search", count: 2, createdAt: at(110) }];
  assert.deepEqual(flags([ann], work, events, at(200)), [
    { userId: "u1", caseId: coereCase, kind: "coere_unused", uses: 0 },
    { userId: "u1", caseId: baseCase, kind: "baseline_used_coere", uses: 2 },
  ]);
});

test("net promoter score is promoters minus detractors, in percent", async () => {
  const { nps } = await import("./summary");
  assert.equal(nps([10, 9, 8, 6]), 25);
  assert.equal(nps([]), null);
});
