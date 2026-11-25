import assert from "node:assert/strict";
import { test } from "node:test";

import { codeMatches, LAB_ERRORS, readCount, readJoin, readSubmit, readSurvey } from "./form";

function form(values: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  return f;
}

test("a join code ignores case and spaces, and an empty code lets nobody in", () => {
  assert.equal(codeMatches(" guac 26 ", "GUAC26"), true);
  assert.equal(codeMatches("guac", "GUAC26"), false);
  assert.equal(codeMatches("", ""), false);
});

test("joining needs the code, the consent box and an experience level", () => {
  const ok = { code: "GUAC26", consent: "on", experience: "daily" };
  assert.deepEqual(readJoin(form(ok), "guac26"), { ok: true, value: { aiExperience: "daily", launchOptIn: false } });
  assert.deepEqual(readJoin(form({ ...ok, launch: "on" }), "guac26"), { ok: true, value: { aiExperience: "daily", launchOptIn: true } });
  assert.deepEqual(readJoin(form({ ...ok, code: "nope" }), "guac26"), { ok: false, error: LAB_ERRORS.code });
  assert.deepEqual(readJoin(form({ code: "GUAC26", experience: "daily" }), "guac26"), { ok: false, error: LAB_ERRORS.consent });
  assert.deepEqual(readJoin(form({ ...ok, experience: "hourly" }), "guac26"), { ok: false, error: LAB_ERRORS.experience });
});

test("a count is a whole number in range, and empty means not given", () => {
  assert.equal(readCount("7", 0, 50), 7);
  assert.equal(readCount("", 0, 50), null);
  for (const bad of ["-1", "51", "2.5", "x", "99999"]) assert.equal(readCount(bad, 0, 50), undefined, bad);
});

test("handing in needs an answer and the AI used", () => {
  const ok = { answer: " select 1 ", ai: "claude", messages: "4", reexplained: "1", helped: "5" };
  const coere = readSubmit(form(ok), "coere");
  assert.deepEqual(coere, { ok: true, value: { answer: "select 1", aiUsed: "claude", messages: 4, reexplained: 1, coereHelped: 5, notes: null } });
  const base = readSubmit(form(ok), "baseline");
  assert.equal(base.ok && base.value.coereHelped, null);
  assert.deepEqual(readSubmit(form({ ...ok, answer: "  " }), "coere"), { ok: false, error: LAB_ERRORS.answer });
  assert.deepEqual(readSubmit(form({ ...ok, ai: "bard" }), "coere"), { ok: false, error: LAB_ERRORS.ai });
  assert.deepEqual(readSubmit(form({ ...ok, reexplained: "lots" }), "coere"), { ok: false, error: LAB_ERRORS.number });
  assert.deepEqual(readSubmit(form({ ...ok, answer: "x".repeat(40001) }), "coere"), { ok: false, error: LAB_ERRORS.long });
});

test("the survey keeps Coere questions only for the Coere case", () => {
  const f = form({ context: "4", switching: "2", trust: "5", recommend: "9", wrong: "on", friction: " slow " });
  assert.deepEqual(readSurvey(f, "coere"), { context: 4, switching: 2, trust: 5, recommend: 9, wrongContext: true, friction: "slow" });
  assert.deepEqual(readSurvey(f, "baseline"), { context: 4, switching: 2, friction: "slow" });
});
