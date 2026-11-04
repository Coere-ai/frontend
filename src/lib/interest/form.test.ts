import assert from "node:assert/strict";
import { test } from "node:test";

import { INTEREST_ERRORS, readInterest } from "./form";

test("an address is trimmed and stored lowercase with its product", () => {
  assert.deepEqual(readInterest("  Fan@Example.COM ", "connect"), { email: "fan@example.com", product: "connect" });
  assert.deepEqual(readInterest("lead@company.io", "teams"), { email: "lead@company.io", product: "teams" });
});

test("a missing or malformed address is refused with the field's error", () => {
  for (const raw of [undefined, null, "", "   ", "fan", "fan@", "@example.com", "fan@example", "a b@example.com", 42]) {
    assert.deepEqual(readInterest(raw, "connect"), { error: INTEREST_ERRORS.email }, String(raw));
  }
});

test("an address over 254 characters is refused", () => {
  assert.deepEqual(readInterest(`${"a".repeat(250)}@example.com`, "teams"), { error: INTEREST_ERRORS.email });
});

test("only the two products are taken, checked before the address", () => {
  for (const product of [undefined, null, "", "forge", "Connect", "connect ", { name: "connect" }]) {
    assert.deepEqual(readInterest("fan@example.com", product), { error: INTEREST_ERRORS.product }, String(product));
  }
});
