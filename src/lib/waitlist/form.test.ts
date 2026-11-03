import assert from "node:assert/strict";
import { test } from "node:test";

import { readWaitlistEmail, WAITLIST_ERRORS } from "./form";

test("an address is trimmed and stored lowercase", () => {
  assert.deepEqual(readWaitlistEmail("  Dev@Example.COM "), { email: "dev@example.com" });
});

test("a missing or malformed address is refused with the field's error", () => {
  for (const raw of [undefined, null, "", "   ", "dev", "dev@", "@example.com", "dev@example", "a b@example.com"]) {
    assert.deepEqual(readWaitlistEmail(raw), { error: WAITLIST_ERRORS.email }, String(raw));
  }
});

test("an address over 254 characters is refused", () => {
  assert.deepEqual(readWaitlistEmail(`${"a".repeat(250)}@example.com`), { error: WAITLIST_ERRORS.email });
});

test("a file or other form value is refused", () => {
  assert.deepEqual(readWaitlistEmail({ name: "x" }), { error: WAITLIST_ERRORS.email });
});
