import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { expectedCaseMicros, worstCaseMicros } from "./anthropic/worst-case";
import {
  CONCURRENCY_RETRY_SECONDS,
  HOLD_SECONDS,
  MAX_LIVE_HOLDS,
  OVERRUN_MICROS,
  PENDING_RETRY_SECONDS,
  readReservation,
  reserveArgs,
  UNKNOWN_FUNCTION,
  wantsWorstOnly,
  worstOnlyArgs,
} from "./hold-rules";

describe("the hold numbers", () => {
  it("lets a hold go a minute after the route's 300 second ceiling", () => {
    // src/app/api/v1/anthropic/[...path]/route.ts sets maxDuration to 300.
    assert.equal(HOLD_SECONDS, 300 + 60);
  });

  it("bounds the overrun at $5 and the calls in flight at 128", () => {
    assert.equal(OVERRUN_MICROS, 5_000_000);
    assert.equal(MAX_LIVE_HOLDS, 128);
  });

  it("asks for 10 s on a pending refusal and 2 s on a concurrency one", () => {
    assert.equal(PENDING_RETRY_SECONDS, 10);
    assert.equal(CONCURRENCY_RETRY_SECONDS, 2);
  });
});

describe("reserveArgs", () => {
  it("sends the worst case, the expected cost, the time and both bounds", () => {
    assert.deepEqual(reserveArgs("u1", { worstMicros: 260_000.2, expectedMicros: 87_000.4 }, { batch: false }), {
      p_user: "u1",
      p_amount: 260_001,
      p_ttl_seconds: 360,
      p_batch: false,
      p_expected: 87_001,
      p_overrun: 5_000_000,
      p_max_live: 128,
    });
  });

  it("never sends an expected cost above the worst case or below 0", () => {
    assert.equal(reserveArgs("u1", { worstMicros: 100, expectedMicros: 1_000 }, { batch: false }).p_expected, 100);
    assert.equal(reserveArgs("u1", { worstMicros: 100, expectedMicros: -5 }, { batch: false }).p_expected, 0);
    assert.equal(reserveArgs("u1", { worstMicros: -5, expectedMicros: -5 }, { batch: false }).p_amount, 0);
  });

  it("holds a batch at its worst case", () => {
    assert.equal(reserveArgs("u1", { worstMicros: 40_000, expectedMicros: 1 }, { batch: true }).p_expected, 40_000);
  });
});

describe("readReservation", () => {
  it("reads a hold, a pending wait, a concurrency wait and each spent limit", () => {
    assert.deepEqual(readReservation([{ hold_id: "h1", refused: null }]), { ok: true, holdId: "h1" });
    assert.deepEqual(readReservation({ hold_id: "h2", refused: null }), { ok: true, holdId: "h2" });
    assert.deepEqual(readReservation([{ hold_id: null, refused: "pending" }]), { ok: false, refused: "pending" });
    assert.deepEqual(readReservation([{ hold_id: null, refused: "concurrency" }]), { ok: false, refused: "concurrency" });
    for (const limit of ["lifetime", "first_build", "monthly", "daily"] as const) {
      assert.deepEqual(readReservation([{ hold_id: null, refused: limit }]), { ok: false, refused: limit });
    }
  });

  it("reads anything else as the month, as before", () => {
    assert.deepEqual(readReservation([]), { ok: false, refused: "monthly" });
    assert.deepEqual(readReservation(null), { ok: false, refused: "monthly" });
    assert.deepEqual(readReservation([{ hold_id: null, refused: "weird" }]), { ok: false, refused: "monthly" });
  });

  it("falls back on PostgREST's unknown function code", () => {
    assert.equal(UNKNOWN_FUNCTION, "PGRST202");
    assert.equal(wantsWorstOnly({ code: "PGRST202" }), true);
  });

  it("does not fall back on any other error, or none", () => {
    assert.equal(wantsWorstOnly(null), false);
    assert.equal(wantsWorstOnly(undefined), false);
    assert.equal(wantsWorstOnly({ code: "PGRST203" }), false);
    assert.equal(wantsWorstOnly({ code: "57014" }), false);
    assert.equal(wantsWorstOnly({}), false);
  });

  it("asks the four argument reserve_spend for the worst case alone", () => {
    const message = reserveArgs("u1", { worstMicros: 260_000, expectedMicros: 87_000 }, { batch: false });
    assert.deepEqual(worstOnlyArgs(message), { p_user: "u1", p_amount: 260_000, p_ttl_seconds: HOLD_SECONDS, p_batch: false });
    const batch = reserveArgs("u2", { worstMicros: 40_000, expectedMicros: 1 }, { batch: true });
    assert.deepEqual(worstOnlyArgs(batch), { p_user: "u2", p_amount: 40_000, p_ttl_seconds: HOLD_SECONDS, p_batch: true });
  });
});

describe("what a build fits at once", () => {
  // The same rules as reserve_spend, with nothing spent yet, for calls all alike.
  const fits = (worst: number, expected: number, limit: number) => {
    let n = 0;
    while (n < MAX_LIVE_HOLDS && (n + 1) * expected <= limit && (n + 1) * worst <= limit + OVERRUN_MICROS) n += 1;
    return n;
  };
  // A Sonnet extraction: about 20k tokens of prompt.
  const call = (maxTokens: number) => ({ model: "claude-sonnet-5-5", max_tokens: maxTokens, messages: [{ role: "user", content: "word ".repeat(16_000) }] });

  it("fits about 57 Sonnet calls at 16,000 max_tokens in the $10 first build, where the worst case alone fit 38", () => {
    const c = call(16_000);
    const worst = worstCaseMicros(c, "direct");
    const before = Math.floor(10_000_000 / worst);
    const now = fits(worst, expectedCaseMicros(c, "direct"), 10_000_000);
    assert.equal(before, 38);
    assert.equal(now, 57);
  });

  it("fits about 82 at 8,192 max_tokens", () => {
    const c = call(8_192);
    assert.equal(fits(worstCaseMicros(c, "direct"), expectedCaseMicros(c, "direct"), 10_000_000), 82);
  });

  it("fits the live holds cap of Haiku calls at once", () => {
    const c = { ...call(4_096), model: "claude-haiku-5-5" };
    assert.equal(fits(worstCaseMicros(c, "direct"), expectedCaseMicros(c, "direct"), 10_000_000), MAX_LIVE_HOLDS);
  });
});
