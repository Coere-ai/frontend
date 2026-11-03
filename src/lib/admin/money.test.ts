import assert from "node:assert/strict";
import { test } from "node:test";

import { dollarField, parseDollars, storageMonthMicros } from "./money";

test("dollars typed by the operator become micro dollars", () => {
  assert.deepEqual(parseDollars("12"), { ok: true, micros: 12_000_000 });
  assert.deepEqual(parseDollars("12.5"), { ok: true, micros: 12_500_000 });
  assert.deepEqual(parseDollars(" $1,000.25 "), { ok: true, micros: 1_000_250_000 });
  assert.deepEqual(parseDollars("0"), { ok: true, micros: 0 });
});

test("a blank limit means the plan's", () => {
  assert.deepEqual(parseDollars(""), { ok: true, micros: null });
  assert.deepEqual(parseDollars("   "), { ok: true, micros: null });
  assert.deepEqual(parseDollars(null), { ok: true, micros: null });
});

test("anything else is refused", () => {
  for (const bad of ["-5", "abc", "1.234", "1e6", "100001", 5]) assert.equal(parseDollars(bad).ok, false, String(bad));
  assert.equal(parseDollars("100000").ok, true);
});

test("a limit reads back as the amount it was typed as", () => {
  assert.equal(dollarField(null), "");
  assert.equal(dollarField(12_000_000), "12");
  assert.equal(dollarField(12_500_000), "12.50");
  assert.equal(dollarField(7_050_000), "7.05");
});

test("storage costs $0.021 per GB month", () => {
  assert.equal(storageMonthMicros(1024 ** 3), 21_000);
  assert.equal(storageMonthMicros(0), 0);
  assert.equal(storageMonthMicros(-5), 0);
  assert.equal(storageMonthMicros(Number.NaN), 0);
  assert.equal(storageMonthMicros(512 * 1024 ** 2), 10_500);
});
