import assert from "node:assert/strict";
import { test } from "node:test";

import { digitsOf, timeLeft } from "./countdown";

const at = Date.parse("2026-11-23T17:00:00Z");
const S = 1000;
const M = 60 * S;
const H = 60 * M;
const D = 24 * H;

test("twenty days out is exactly 20 days", () => {
  assert.deepEqual(timeLeft(at, at - 20 * D), { days: 20, hours: 0, minutes: 0, seconds: 0, done: false });
});

test("each part is split out", () => {
  assert.deepEqual(timeLeft(at, at - (3 * D + 4 * H + 5 * M + 6 * S)), { days: 3, hours: 4, minutes: 5, seconds: 6, done: false });
  assert.deepEqual(timeLeft(at, at - (23 * H + 59 * M + 59 * S)), { days: 0, hours: 23, minutes: 59, seconds: 59, done: false });
});

test("a part second counts as a whole one, so the last second still shows", () => {
  assert.deepEqual(timeLeft(at, at - 1), { days: 0, hours: 0, minutes: 0, seconds: 1, done: false });
  assert.deepEqual(timeLeft(at, at - 1500), { days: 0, hours: 0, minutes: 0, seconds: 2, done: false });
});

test("at and past the moment it is clamped at zero and done", () => {
  const zero = { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  assert.deepEqual(timeLeft(at, at), zero);
  assert.deepEqual(timeLeft(at, at + 1), zero);
  assert.deepEqual(timeLeft(at, at + 400 * D), zero);
});

test("a target that is not a number reads as done", () => {
  assert.equal(timeLeft(Number.NaN, at).done, true);
  assert.equal(timeLeft(at, Number.NaN).done, true);
});

test("more than 99 days keeps every digit", () => {
  assert.equal(timeLeft(at, at - 150 * D).days, 150);
  assert.deepEqual(digitsOf(150), ["1", "5", "0"]);
});

test("a part shows at least two digits", () => {
  assert.deepEqual(digitsOf(7), ["0", "7"]);
  assert.deepEqual(digitsOf(0), ["0", "0"]);
  assert.deepEqual(digitsOf(42), ["4", "2"]);
  assert.deepEqual(digitsOf(-3), ["0", "0"]);
});
