import assert from "node:assert/strict";
import { test } from "node:test";

import { assignFor, conditionOf, readStage, stageOfTask, taskOpen } from "./assign";
import { LAB_CASES, LAB_PAIRS } from "./cases";
import { starterPrompt } from "./starter";

test("every 8 students cover all 8 combinations once", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 8; i++) {
    const a = assignFor(i);
    seen.add(`${a.pair}:${a.cases.join(",")}:${a.firstCondition}`);
  }
  assert.equal(seen.size, 8);
  assert.deepEqual(assignFor(8), assignFor(0));
});

test("each case is close to half with Coere across 12 students", () => {
  const withCoere = new Map<string, number>();
  const total = new Map<string, number>();
  for (let i = 0; i < 12; i++) {
    const a = assignFor(i);
    for (const id of a.cases) {
      total.set(id, (total.get(id) ?? 0) + 1);
      if (conditionOf(a, id) === "coere") withCoere.set(id, (withCoere.get(id) ?? 0) + 1);
    }
  }
  for (const [id, n] of total) assert.ok(Math.abs((withCoere.get(id) ?? 0) * 2 - n) <= 2, id);
});

test("the two cases of a student always get different conditions", () => {
  for (let i = 0; i < 16; i++) {
    const a = assignFor(i);
    assert.notEqual(conditionOf(a, a.cases[0]), conditionOf(a, a.cases[1]));
    assert.equal(conditionOf(a, "nope"), null);
  }
});

test("stages open part 1 then part 2 of the first case, then the second case", () => {
  const a = assignFor(0);
  assert.equal(stageOfTask(a, a.cases[0], { part: 1 }), 1);
  assert.equal(stageOfTask(a, a.cases[0], { part: 2 }), 2);
  assert.equal(stageOfTask(a, a.cases[1], { part: 1 }), 3);
  assert.equal(stageOfTask(a, a.cases[1], { part: 2 }), 4);
  assert.equal(taskOpen(a, a.cases[0], { part: 2 }, 1), false);
  assert.equal(taskOpen(a, a.cases[1], { part: 1 }, 3), true);
  assert.equal(taskOpen(a, "nope", { part: 1 }, 4), false);
});

test("a stored stage is read only when it is a whole number in range", () => {
  assert.equal(readStage({ stage: 3 }), 3);
  for (const bad of [null, {}, { stage: 5 }, { stage: -1 }, { stage: 1.5 }, { stage: "2" }]) assert.equal(readStage(bad), 0);
});

test("matched cases have the same task shape", () => {
  for (const [a, b] of Object.values(LAB_PAIRS)) {
    assert.deepEqual(
      a.tasks.map((t) => [t.id, t.part, t.ai]),
      b.tasks.map((t) => [t.id, t.part, t.ai]),
    );
    assert.equal(a.constraints.length, b.constraints.length);
  }
});

test("case ids are unique and every task has a rubric", () => {
  assert.equal(new Set(LAB_CASES.map((c) => c.id)).size, LAB_CASES.length);
  for (const c of LAB_CASES) for (const t of c.tasks) assert.ok(t.rubric.length >= 3, `${c.id}/${t.id}`);
});

test("the starter chat carries every rule and number a later task checks", () => {
  for (const c of LAB_CASES) {
    const s = starterPrompt(c);
    for (const x of c.constraints) assert.ok(s.includes(x), `${c.id}: ${x}`);
    for (const p of c.people) assert.ok(s.includes(p.note), `${c.id}: ${p.name}`);
    for (const row of c.table?.rows ?? []) assert.ok(s.includes(row.join(" | ")), `${c.id}: ${row[0]}`);
  }
});

test("no case copy uses dashes as punctuation", () => {
  for (const c of LAB_CASES) assert.ok(!/[–—]|\s--\s/.test(JSON.stringify(c)), c.id);
});
