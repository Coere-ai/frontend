import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createAttemptLimiter } from "@/lib/auth/attempts";

import { sha256Hex } from "./code";
import { CODES_PER_ACCOUNT, storeConnectCode, type CodeRequest } from "./store-code";

/** A stand in for the database: device_codes as an array, with the two calls the store makes. */
function fakeDb(fail: { insert?: boolean } = {}) {
  const rows: Array<Record<string, string>> = [];
  const db = {
    from(table: string) {
      assert.equal(table, "device_codes");
      return {
        delete: () => ({
          lt: async (column: string, value: string) => {
            for (let i = rows.length - 1; i >= 0; i--) if (rows[i][column] < value) rows.splice(i, 1);
            return { error: null };
          },
        }),
        insert: async (row: Record<string, string>) => {
          if (fail.insert) return { error: { code: "XX000" } };
          rows.push(row);
          return { error: null };
        },
      };
    },
  };
  return { rows, db: db as unknown as Parameters<typeof storeConnectCode>[0] };
}

const REQUEST: CodeRequest = { userId: "u1", challenge: "c".repeat(43), extensionId: "a".repeat(32), deviceName: "Chrome on macOS" };
const limiter = () => createAttemptLimiter({ max: CODES_PER_ACCOUNT, windowMs: 15 * 60_000 });

describe("storeConnectCode", () => {
  it("stores only the code's hash, bound to the account, the challenge and the extension, for 5 minutes", async () => {
    const { rows, db } = fakeDb();
    const now = Date.parse("2026-11-18T10:00:00.000Z");
    const made = await storeConnectCode(db, REQUEST, { limiter: limiter(), now });
    assert.equal(made.ok, true);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].code_hash, made.ok ? sha256Hex(made.code) : "");
    assert.equal(rows[0].user_id, "u1");
    assert.equal(rows[0].challenge, REQUEST.challenge);
    assert.equal(rows[0].extension_id, REQUEST.extensionId);
    assert.equal(rows[0].expires_at, "2026-11-18T10:05:00.000Z");
  });

  it("clears every expired code before it stores a new one, so the table holds only live codes", async () => {
    const { rows, db } = fakeDb();
    const start = Date.parse("2026-11-18T10:00:00.000Z");
    await storeConnectCode(db, REQUEST, { limiter: limiter(), now: start });
    await storeConnectCode(db, { ...REQUEST, userId: "u2" }, { limiter: limiter(), now: start + 60_000 });
    await storeConnectCode(db, { ...REQUEST, userId: "u3" }, { limiter: limiter(), now: start + 5 * 60_000 + 1 });
    assert.deepEqual(rows.map((r) => r.user_id), ["u2", "u3"]);
  });

  it("refuses an account past its codes for the quarter hour, without writing a row", async () => {
    const { rows, db } = fakeDb();
    const counted = limiter();
    for (let i = 0; i < CODES_PER_ACCOUNT; i++) assert.equal((await storeConnectCode(db, REQUEST, { limiter: counted, now: 0 })).ok, true);
    assert.deepEqual(await storeConnectCode(db, REQUEST, { limiter: counted, now: 0 }), { ok: false, reason: "limited" });
    assert.equal((await storeConnectCode(db, { ...REQUEST, userId: "u2" }, { limiter: counted, now: 0 })).ok, true);
    assert.equal(rows.length, CODES_PER_ACCOUNT + 1);
  });

  it("answers unavailable when the row cannot be stored", async () => {
    const { db } = fakeDb({ insert: true });
    assert.deepEqual(await storeConnectCode(db, REQUEST, { limiter: limiter(), now: 0 }), { ok: false, reason: "unavailable" });
  });
});
