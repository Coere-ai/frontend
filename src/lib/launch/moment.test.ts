import assert from "node:assert/strict";
import { test } from "node:test";

import { checkLaunchInput, DAY_MS, daysFromNow, fromLocalInput, MOMENT_ERRORS, parseMoment, readLaunchSetting, shiftDays, toLocalInput } from "./moment";

const now = Date.parse("2026-11-04T10:15:42.500Z");
const fallback = { at: "2026-11-23T17:00:00.000Z", show: true };

test("a full ISO moment with its zone is stored in UTC", () => {
  assert.equal(parseMoment("2026-11-23T17:00:00Z"), "2026-11-23T17:00:00.000Z");
  assert.equal(parseMoment("2026-11-23T17:00Z"), "2026-11-23T17:00:00.000Z");
  assert.equal(parseMoment("2026-11-23T09:00:00.000-08:00"), "2026-11-23T17:00:00.000Z");
  assert.equal(parseMoment(" 2026-11-23T17:00:00Z "), "2026-11-23T17:00:00.000Z");
});

test("anything else is not a moment", () => {
  for (const raw of [undefined, null, 42, "", "tomorrow", "2026-11-23", "2026-11-23T17:00", "2026-11-23 17:00:00Z", "2026-13-01T00:00Z", "2026-02-30T00:00Zx", { at: "x" }]) {
    assert.equal(parseMoment(raw), null, String(raw));
  }
});

test("a moment outside 2025 to 2100 is refused", () => {
  assert.equal(parseMoment("2024-12-31T23:59:59Z"), null);
  assert.equal(parseMoment("2100-01-01T00:00:00Z"), null);
  assert.equal(parseMoment("2099-12-31T23:59:00Z"), "2099-12-31T23:59:00.000Z");
});

test("a stored value is read back, or the fallback stands in", () => {
  assert.deepEqual(readLaunchSetting({ at: "2026-12-01T09:00:00.000Z", show: false }, fallback), { at: "2026-12-01T09:00:00.000Z", show: false });
  assert.deepEqual(readLaunchSetting({ at: "2026-12-01T09:00:00Z" }, fallback), { at: "2026-12-01T09:00:00.000Z", show: true });
  for (const raw of [null, undefined, "x", [], {}, { at: "soon", show: true }]) {
    assert.deepEqual(readLaunchSetting(raw, fallback), fallback, JSON.stringify(raw));
  }
});

test("a future moment saves", () => {
  assert.deepEqual(checkLaunchInput({ at: "2026-11-23T17:00:00.000Z", show: true, confirmPast: false }, now), {
    ok: true,
    setting: { at: "2026-11-23T17:00:00.000Z", show: true },
    past: false,
  });
});

test("a malformed moment or switch is refused", () => {
  assert.deepEqual(checkLaunchInput({ at: "next week", show: true, confirmPast: false }, now), { ok: false, error: MOMENT_ERRORS.moment });
  assert.deepEqual(checkLaunchInput({ at: 1764000000000, show: true, confirmPast: false }, now), { ok: false, error: MOMENT_ERRORS.moment });
  assert.deepEqual(checkLaunchInput({ at: "1999-01-01T00:00:00Z", show: true, confirmPast: true }, now), { ok: false, error: MOMENT_ERRORS.range });
  assert.deepEqual(checkLaunchInput({ at: "2026-11-23T17:00:00Z", show: "yes", confirmPast: false }, now), { ok: false, error: MOMENT_ERRORS.show });
});

test("a past moment needs the operator's confirm", () => {
  const past = { at: "2026-11-01T00:00:00Z", show: true };
  assert.deepEqual(checkLaunchInput({ ...past, confirmPast: false }, now), { ok: false, error: MOMENT_ERRORS.past, needsConfirm: true });
  assert.deepEqual(checkLaunchInput({ ...past, confirmPast: "true" }, now), { ok: false, error: MOMENT_ERRORS.past, needsConfirm: true });
  assert.deepEqual(checkLaunchInput({ ...past, confirmPast: true }, now), { ok: true, setting: { at: "2026-11-01T00:00:00.000Z", show: true }, past: true });
  assert.equal(checkLaunchInput({ at: new Date(now).toISOString(), show: true, confirmPast: false }, now).ok, false);
});

test("the quick buttons move by whole days", () => {
  const at = Date.parse("2026-11-23T17:00:00Z");
  assert.equal(new Date(shiftDays(at, 1)).toISOString(), "2026-11-24T17:00:00.000Z");
  assert.equal(new Date(shiftDays(at, 7)).toISOString(), "2026-11-30T17:00:00.000Z");
  assert.equal(new Date(shiftDays(at, -1)).toISOString(), "2026-11-22T17:00:00.000Z");
});

test("20 days from now lands on the minute", () => {
  assert.equal(new Date(daysFromNow(now, 20)).toISOString(), "2026-11-24T10:15:00.000Z");
  assert.equal(daysFromNow(now, 20) - daysFromNow(now, 0), 20 * DAY_MS);
});

test("the picker's local value reads back to the same minute", () => {
  const at = Date.parse("2026-11-23T17:00:00Z");
  assert.match(toLocalInput(at), /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  assert.equal(fromLocalInput(toLocalInput(at)), at);
  assert.equal(fromLocalInput(toLocalInput(now)), daysFromNow(now, 0));
});

test("an empty or impossible picker value is null", () => {
  for (const value of ["", "2026-11-23", "2026-11-23T7:00", "2026-02-30T10:00", "2026-11-23T17:00:00"]) {
    assert.equal(fromLocalInput(value), null, value);
  }
});
