import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { expectedCaseMicros, worstCaseMicros } from "./anthropic/worst-case";
import {
  CONCURRENCY_RETRY_SECONDS,
  holdOutcome,
  keptCharge,
  MAX_OUTPUT_TOKENS_PER_SECOND,
  settleArgs,
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

describe("holdOutcome", () => {
  it("lets a hold go only once the call's cost is known", () => {
    // Anthropic answered an error, which it does not bill, or a batch's reservation now counts in its place.
    assert.equal(holdOutcome("upstream_error"), "release");
    assert.equal(holdOutcome("stored"), "release");
    assert.equal(holdOutcome("not_stored"), "release");
    // settle_call recorded the cost and let the hold go in the same transaction.
    assert.equal(holdOutcome("settled"), "none");
  });

  it("keeps the hold to run out when the cost may have been billed and was not recorded", () => {
    for (const event of ["aborted", "timeout", "unreachable", "read_failed", "record_failed"] as const) {
      assert.equal(holdOutcome(event), "keep", event);
    }
  });
});

describe("settleArgs", () => {
  const tokens = { input: 1000, output: 400, cacheRead: 2000, cacheWrite: 0 };

  it("carries the hold and one row per model, as settle_call takes them", () => {
    const args = settleArgs({ userId: "u1", deviceId: "d1" }, "h1", "message", [
      { model: "claude-opus-5-5", tokens: { ...tokens, output: 10 }, costMicros: 4200 },
      { model: "claude-sonnet-5-5", tokens, costMicros: 6200 },
    ], { status: 200, durationMs: 1234.6, requestId: "r".repeat(200) });
    assert.deepEqual(args, {
      p_hold: "h1",
      p_user: "u1",
      p_device: "d1",
      p_kind: "message",
      p_rows: [
        { model: "claude-opus-5-5", input: 1000, output: 10, cacheWrite: 0, cacheRead: 2000, costMicros: 4200 },
        { model: "claude-sonnet-5-5", input: 1000, output: 400, cacheWrite: 0, cacheRead: 2000, costMicros: 6200 },
      ],
      p_status: 200,
      p_duration_ms: 1235,
      p_request_id: "r".repeat(120),
    });
  });

  it("sends no hold for a call that has none, and null for a model the answer did not name", () => {
    const args = settleArgs({ userId: "u1", deviceId: "d1" }, null, "count_tokens", [{ model: "", tokens, costMicros: 0 }], { status: 200, durationMs: -5, requestId: null });
    assert.equal(args.p_hold, null);
    assert.equal(args.p_rows[0]?.model, null);
    assert.equal(args.p_duration_ms, 0);
    assert.equal(args.p_request_id, null);
  });
});

describe("the site's first build budget", () => {
  it("reads reserve_spend's site_budget refusal as its own", () => {
    assert.deepEqual(readReservation([{ hold_id: null, refused: "site_budget" }]), { ok: false, refused: "site_budget" });
  });
});

describe("keptCharge", () => {
  // A Sonnet call: about $0.087 expected and $0.26 at worst. Sonnet output is $10 a million, 10 micro dollars a token.
  const call = { model: "claude-sonnet-5-5", worstMicros: 260_000, expectedMicros: 87_000 };

  it("charges a call the proxy cut, or one whose fate is unknown, its worst case when its hold runs out", () => {
    assert.equal(keptCharge("timeout", { ...call, elapsedMs: 285_000 }), null);
    assert.equal(keptCharge("record_failed", { ...call, elapsedMs: 5_000 }), null);
  });

  it("charges a call that ended early no more than it could have made in the time it ran", () => {
    // Ten seconds at most MAX_OUTPUT_TOKENS_PER_SECOND tokens a second, beside the expected cost.
    assert.equal(keptCharge("aborted", { ...call, elapsedMs: 10_000 }), 87_000 + 10 * MAX_OUTPUT_TOKENS_PER_SECOND * 10);
    assert.equal(keptCharge("read_failed", { ...call, elapsedMs: 0 }), 87_000);
    assert.equal(keptCharge("unreachable", { ...call, elapsedMs: 1_500 }), 87_000 + 2 * MAX_OUTPUT_TOKENS_PER_SECOND * 10);
  });

  it("never charges above the worst case, so an abort just before the cut costs what the cut would", () => {
    assert.equal(keptCharge("aborted", { ...call, elapsedMs: 280_000 }), 260_000);
  });

  it("charges a known cost that could not be recorded at that cost", () => {
    assert.equal(keptCharge("record_failed", { ...call, elapsedMs: 5_000, knownMicros: 91_234 }), 91_234);
  });

  it("is only asked for holds that are kept", () => {
    for (const event of ["settled", "upstream_error", "stored", "not_stored"] as const) assert.equal(keptCharge(event, { ...call, elapsedMs: 1 }), null);
  });
});
