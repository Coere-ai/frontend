import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { answerHeaders, upstreamHeaders } from "./headers";
import { checkBatchBody, checkBeta, checkParams } from "./params";
import { PROMPT_SHAS } from "./prompt-shas";
import { goneUpstream, matchAnthropicPath, outlivesCaller, upstreamSearch, upstreamUrl } from "./paths";
import { cutSignal, UPSTREAM_CUT_MS } from "./upstream-cut";
import { attemptsOf, byModel, createBatchTally, usageOf } from "./usage";

const seg = (p: string) => p.split("/");

describe("matchAnthropicPath", () => {
  it("knows the eight paths of 8.4", () => {
    assert.deepEqual(matchAnthropicPath("POST", seg("v1/messages")), { op: "message" });
    assert.deepEqual(matchAnthropicPath("POST", seg("v1/messages/count_tokens")), { op: "count_tokens" });
    assert.deepEqual(matchAnthropicPath("POST", seg("v1/messages/batches")), { op: "batch_create" });
    assert.deepEqual(matchAnthropicPath("GET", seg("v1/messages/batches")), { op: "batch_list" });
    assert.deepEqual(matchAnthropicPath("GET", seg("v1/messages/batches/msgbatch_01")), { op: "batch_get", batchId: "msgbatch_01" });
    assert.deepEqual(matchAnthropicPath("POST", seg("v1/messages/batches/msgbatch_01/cancel")), { op: "batch_cancel", batchId: "msgbatch_01" });
    assert.deepEqual(matchAnthropicPath("DELETE", seg("v1/messages/batches/msgbatch_01")), { op: "batch_delete", batchId: "msgbatch_01" });
    assert.deepEqual(matchAnthropicPath("GET", seg("v1/messages/batches/msgbatch_01/results")), { op: "batch_results", batchId: "msgbatch_01" });
  });

  it("refuses every other path and method", () => {
    for (const [m, p] of [
      ["GET", "v1/messages"],
      ["POST", "v1/models"],
      ["POST", "v1/complete"],
      ["GET", "v1/messages/count_tokens"],
      ["POST", "v1/messages/batches/msgbatch_01"],
      ["GET", "v1/messages/batches/msgbatch_01/cancel"],
      ["GET", "v1/messages/batches/msgbatch_01/results/x"],
      ["GET", "v1/messages/batches/a.b"],
      ["POST", "v2/messages"],
      ["POST", "v1/files"],
    ] as const) {
      assert.equal(matchAnthropicPath(m, seg(p)), null, `${m} ${p}`);
    }
  });

  it("sees a batch create and a batch delete through when the caller goes away", () => {
    // Once Anthropic has either, the proxy must store or forget the row, or the batch runs with nobody able to read it.
    assert.equal(outlivesCaller({ op: "batch_create" }), true);
    assert.equal(outlivesCaller({ op: "batch_delete", batchId: "msgbatch_01" }), true);
    // A message, a count and a results read stop with their caller, so a closed tab stops the spend.
    assert.equal(outlivesCaller({ op: "message" }), false);
    assert.equal(outlivesCaller({ op: "count_tokens" }), false);
    assert.equal(outlivesCaller({ op: "batch_results", batchId: "msgbatch_01" }), false);
    assert.equal(outlivesCaller({ op: "batch_get", batchId: "msgbatch_01" }), false);
    assert.equal(outlivesCaller({ op: "batch_cancel", batchId: "msgbatch_01" }), false);
  });

  it("counts a batch as gone when its delete worked, and when Anthropic no longer knows it", () => {
    const del = { op: "batch_delete", batchId: "msgbatch_01" } as const;
    assert.equal(goneUpstream(del, 200), true);
    // An earlier delete got through and its bookkeeping did not: the retry answers 404 and the row must still go.
    assert.equal(goneUpstream(del, 404), true);
    assert.equal(goneUpstream(del, 409), false);
    assert.equal(goneUpstream(del, 500), false);
    assert.equal(goneUpstream({ op: "batch_get", batchId: "msgbatch_01" }, 404), false);
    assert.equal(goneUpstream({ op: "batch_cancel", batchId: "msgbatch_01" }, 200), false);
  });

  it("keeps the SDK's query keys only", () => {
    assert.equal(upstreamSearch(new URLSearchParams("beta=true&limit=20&after_id=x&evil=1")), "?beta=true&limit=20&after_id=x");
    assert.equal(upstreamSearch(new URLSearchParams("")), "");
    assert.equal(upstreamUrl(seg("v1/messages"), "?beta=true"), "https://api.anthropic.com/v1/messages?beta=true");
  });
});

describe("checkParams", () => {
  const ok = { model: "claude-sonnet-5-5", max_tokens: 16000, messages: [] };

  it("passes an allowed model under the cap", () => {
    assert.deepEqual(checkParams(ok), { ok: true });
    assert.deepEqual(checkParams({ ...ok, max_tokens: 64000 }), { ok: true });
    assert.deepEqual(checkParams({ model: "claude-haiku-5-5", messages: [] }), { ok: true });
  });

  it("refuses another model by name, and a big, odd or streamed request", () => {
    assert.deepEqual(checkParams({ ...ok, model: "claude-3-opus" }), { ok: false, reason: "model", model: "claude-3-opus" });
    assert.deepEqual(checkParams({ ...ok, max_tokens: 64001 }), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkParams({ ...ok, max_tokens: "10" }), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkParams({ ...ok, stream: true }), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkParams({ ...ok, model: 5 }), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkParams([]), { ok: false, reason: "bad_request" });
  });

  it("refuses max_tokens below 1, which would lower the spend reservation", () => {
    for (const maxTokens of [0, -1, -1_000_000_000_000]) {
      assert.deepEqual(checkParams({ ...ok, max_tokens: maxTokens }), { ok: false, reason: "bad_request" });
      assert.deepEqual(checkBatchBody({ requests: [{ custom_id: "a", params: ok }, { custom_id: "b", params: { ...ok, max_tokens: maxTokens } }] }), { ok: false, reason: "bad_request" });
    }
    assert.deepEqual(checkParams({ ...ok, max_tokens: 1 }), { ok: true });
  });

  it("refuses a stream asked for in any form, and passes one turned off", () => {
    // A value another reader could take for true would come back as a stream, which holds no usage to meter.
    for (const stream of [1, "true", {}, null]) assert.deepEqual(checkParams({ ...ok, stream }), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkParams({ ...ok, stream: false }), { ok: true });
  });

  it("passes the extension's own client tools and 5 minute cache", () => {
    const tool = { name: "save", input_schema: { type: "object" }, strict: true };
    const system = [{ type: "text", text: "s", cache_control: { type: "ephemeral" } }];
    assert.deepEqual(checkParams({ ...ok, system, tools: [tool, { ...tool, type: "custom" }] }), { ok: true });
    assert.deepEqual(checkParams({ ...ok, system: [{ ...system[0], cache_control: { type: "ephemeral", ttl: "5m" } }] }), { ok: true });
  });

  it("refuses server tools and the 1 hour cache, which the meter cannot price", () => {
    const long = { type: "ephemeral", ttl: "1h" };
    for (const bad of [
      { ...ok, tools: [{ type: "web_search_20250305", name: "web_search" }] },
      { ...ok, tools: "web_search" },
      { ...ok, system: [{ type: "text", text: "s", cache_control: long }] },
      { ...ok, tools: [{ name: "t", input_schema: {}, cache_control: long }] },
      { ...ok, messages: [{ role: "user", content: [{ type: "text", text: "x", cache_control: long }] }] },
      { ...ok, messages: [{ role: "user", content: [{ type: "tool_result", tool_use_id: "a", content: [{ type: "text", text: "x", cache_control: long }] }] }] },
    ]) {
      assert.deepEqual(checkParams(bad), { ok: false, reason: "bad_request" });
    }
  });

  it("refuses a 1 hour cache asked for the whole request, and passes the 5 minute one", () => {
    assert.deepEqual(checkParams({ ...ok, cache_control: { type: "ephemeral", ttl: "1h" } }), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkParams({ ...ok, cache_control: { type: "ephemeral" } }), { ok: true });
    assert.deepEqual(checkParams({ ...ok, cache_control: { type: "ephemeral", ttl: "5m" } }), { ok: true });
  });

  it("passes the fallback the extension asks for and refuses a list, which could name any model", () => {
    assert.deepEqual(checkParams({ ...ok, fallbacks: "default" }), { ok: true });
    for (const fallbacks of [[{ model: "claude-opus-4-8" }], [{ model: "claude-sonnet-5-5" }], [], "all", null]) {
      assert.deepEqual(checkParams({ ...ok, fallbacks }), { ok: false, reason: "bad_request" });
    }
  });

  it("refuses the dearer ways to run a model, which the price table does not hold", () => {
    assert.deepEqual(checkParams({ ...ok, model: "claude-opus-5-5", speed: "fast" }), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkParams({ ...ok, inference_geo: "us" }), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkParams({ ...ok, speed: "standard", inference_geo: "global" }), { ok: true });
  });

  // A picture as coere-v2 packages/memory/src/actions/models.ts sends it.
  const picture = { type: "image", source: { type: "base64", media_type: "image/png", data: "iVBORw0KGgo=" } };
  const turn = (...content: object[]) => ({ ...ok, messages: [{ role: "user", content }] });

  it("passes input that is in the request itself", () => {
    for (const good of [
      turn(picture, { type: "text", text: "{}" }),
      turn({ type: "document", source: { type: "text", media_type: "text/plain", data: "notes" } }),
      turn({ type: "document", source: { type: "content", content: [{ type: "text", text: "notes" }, picture] } }),
      turn({ type: "tool_result", tool_use_id: "a", content: [picture] }),
      // A search result's source is a label, not something Anthropic fetches.
      turn({ type: "search_result", source: "https://fernhill.test/brief", title: "Brief", content: [{ type: "text", text: "notes" }] }),
    ]) {
      assert.deepEqual(checkParams(good), { ok: true });
    }
  });

  it("refuses input Anthropic would fetch or page through, which the reservation cannot size", () => {
    const pdf = { type: "base64", media_type: "application/pdf", data: "JVBERi0=" };
    for (const source of [
      { type: "url", url: "https://files.fernhill.test/a.pdf" },
      { type: "file", file_id: "file_01" },
      pdf,
    ]) {
      assert.deepEqual(checkParams(turn({ type: "document", source })), { ok: false, reason: "bad_request" });
    }
    for (const bad of [
      turn({ type: "image", source: { type: "url", url: "https://files.fernhill.test/a.png" } }),
      turn({ type: "image", source: { type: "file", file_id: "file_01" } }),
      turn({ type: "tool_result", tool_use_id: "a", content: [{ type: "image", source: { type: "url", url: "https://files.fernhill.test/a.png" } }] }),
      turn({ type: "document", source: { type: "content", content: [{ type: "document", source: pdf }] } }),
    ]) {
      assert.deepEqual(checkParams(bad), { ok: false, reason: "bad_request" });
    }
    assert.deepEqual(checkBatchBody({ requests: [{ custom_id: "a", params: turn({ type: "document", source: { type: "url", url: "https://files.fernhill.test/a.pdf" } }) }] }), { ok: false, reason: "bad_request" });
  });

  it("checks every entry of a batch", () => {
    const entry = (params: object) => ({ custom_id: "a", params });
    assert.deepEqual(checkBatchBody({ requests: [entry(ok), entry(ok)] }), { ok: true, count: 2 });
    assert.deepEqual(checkBatchBody({ requests: [entry(ok), entry({ ...ok, model: "x" })] }), { ok: false, reason: "model", model: "x" });
    assert.deepEqual(checkBatchBody({ requests: [] }), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkBatchBody({}), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkBatchBody({ requests: [1] }), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkBatchBody({ requests: Array.from({ length: 500 }, () => entry(ok)) }), { ok: true, count: 500 });
    assert.deepEqual(checkBatchBody({ requests: Array.from({ length: 501 }, () => entry(ok)) }), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkBatchBody({ requests: [entry({ ...ok, max_tokens: 16_001 })] }), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkBatchBody({ requests: [entry({ model: "claude-haiku-5-5", messages: [] })] }), { ok: false, reason: "bad_request" });
  });
});

describe("checkBeta", () => {
  it("passes allowed values and refuses any other", () => {
    assert.equal(checkBeta(null), null);
    assert.equal(checkBeta(""), null);
    assert.equal(checkBeta("message-batches-2024-09-24"), "message-batches-2024-09-24");
    assert.equal(checkBeta("server-side-fallback-2026-07-01, token-counting-2024-11-01"), "server-side-fallback-2026-07-01,token-counting-2024-11-01");
    assert.equal(checkBeta("message-batches-2024-09-24,files-api-2025-04-14"), false);
  });
});

describe("headers", () => {
  it("forwards only the listed headers and the server's key", () => {
    const incoming = new Headers({
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      authorization: "Bearer coere_dev_x",
      "x-api-key": "coere-account",
      "anthropic-dangerous-direct-browser-access": "true",
      "x-stainless-os": "Linux",
      cookie: "a=b",
    });
    const out = upstreamHeaders(incoming, { apiKey: "sk-server", beta: "message-batches-2024-09-24" });
    assert.deepEqual([...out.entries()].sort(), [
      ["anthropic-beta", "message-batches-2024-09-24"],
      ["anthropic-version", "2023-06-01"],
      ["content-type", "application/json"],
      ["x-api-key", "sk-server"],
    ]);
  });

  it("keeps only the four answer headers", () => {
    const upstream = new Headers({
      "content-type": "application/json",
      "request-id": "req_1",
      "retry-after": "3",
      "x-should-retry": "true",
      "anthropic-ratelimit-requests-remaining": "10",
      "set-cookie": "x=y",
      "anthropic-organization-id": "org",
    });
    const out = answerHeaders(upstream, 200);
    assert.deepEqual([...out.entries()].sort(), [
      ["cache-control", "no-store"],
      ["content-type", "application/json"],
      ["request-id", "req_1"],
      ["retry-after", "3"],
      ["x-robots-tag", "noindex"],
      ["x-should-retry", "true"],
    ]);
  });

  it("marks Anthropic's own 429 as upstream and keeps its retry-after", () => {
    const upstream = new Headers({ "content-type": "application/json", "retry-after": "7", "x-coere-limit": "per-minute" });
    const limited = answerHeaders(upstream, 429);
    assert.equal(limited.get("x-coere-limit"), "upstream");
    assert.equal(limited.get("retry-after"), "7");
    // Any other answer carries no marker, whatever the upstream sent under the name.
    assert.equal(answerHeaders(upstream, 200).get("x-coere-limit"), null);
    assert.equal(answerHeaders(upstream, 529).get("x-coere-limit"), null);
  });
});

describe("usage", () => {
  it("reads a message's four counts", () => {
    assert.deepEqual(
      usageOf({ usage: { input_tokens: 10, output_tokens: 5, cache_creation_input_tokens: 3, cache_read_input_tokens: 2 } }),
      { input: 10, output: 5, cacheWrite: 3, cacheRead: 2 },
    );
    assert.deepEqual(usageOf({ usage: { input_tokens: 7, output_tokens: -1, cache_read_input_tokens: null } }), {
      input: 7,
      output: 0,
      cacheWrite: 0,
      cacheRead: 0,
    });
    assert.equal(usageOf({}), null);
  });

  // The shape of coere-v2 tests/fake-claude/rules.ts viaFallback: Opus declined, Sonnet served.
  const fallback = {
    model: "claude-sonnet-5-5",
    usage: {
      input_tokens: 1000,
      output_tokens: 400,
      iterations: [
        { type: "message", model: "claude-opus-5-5", input_tokens: 1000, output_tokens: 10 },
        { type: "fallback_message", model: "claude-sonnet-5-5", input_tokens: 1000, output_tokens: 400 },
      ],
    },
  };

  it("prices each fallback attempt at its own model, the declined one included", () => {
    const attempts = attemptsOf(fallback, "claude-opus-5-5");
    assert.deepEqual(attempts, [
      { model: "claude-opus-5-5", tokens: { input: 1000, output: 10, cacheWrite: 0, cacheRead: 0 } },
      { model: "claude-sonnet-5-5", tokens: { input: 1000, output: 400, cacheWrite: 0, cacheRead: 0 } },
    ]);
    assert.equal(byModel(attempts).size, 2);
  });

  it("uses the asked model for an iteration that names none, and the top level without iterations", () => {
    const bare = { model: "claude-sonnet-5-5", usage: { input_tokens: 5, output_tokens: 1, iterations: [{ input_tokens: 5, output_tokens: 1 }] } };
    assert.equal(attemptsOf(bare, "claude-opus-5-5")[0]?.model, "claude-opus-5-5");
    assert.deepEqual(attemptsOf({ model: "claude-haiku-5-5", usage: { input_tokens: 3, output_tokens: 2 } }, "claude-haiku-5-5"), [
      { model: "claude-haiku-5-5", tokens: { input: 3, output: 2, cacheWrite: 0, cacheRead: 0 } },
    ]);
    assert.deepEqual(attemptsOf({}, "claude-opus-5-5"), []);
  });

  it("meters a fallback inside batch results too", () => {
    const text = JSON.stringify({ custom_id: "c", result: { type: "succeeded", message: fallback } });
    const tally = createBatchTally();
    tally.push(new TextEncoder().encode(text));
    const totals = tally.end();
    assert.equal(totals.get("claude-opus-5-5")?.costMicros, 2100);
    assert.equal(totals.get("claude-opus-5-5")?.items, 0);
    assert.equal(totals.get("claude-sonnet-5-5")?.items, 1);
  });

  it("tallies batch results by model at half price, across any chunking", () => {
    const line = (model: string, input: number, output: number) =>
      JSON.stringify({ custom_id: "c", result: { type: "succeeded", message: { model, usage: { input_tokens: input, output_tokens: output } } } });
    const text = [
      line("claude-sonnet-5-5", 1000, 500),
      JSON.stringify({ custom_id: "d", result: { type: "errored", error: { type: "error" } } }),
      line("claude-sonnet-5-5", 1000, 500),
      line("claude-haiku-5-5", 120_000, 0),
      "not json",
    ].join("\n");
    const bytes = new TextEncoder().encode(text);
    const tally = createBatchTally();
    for (let i = 0; i < bytes.length; i += 7) tally.push(bytes.subarray(i, i + 7));
    const totals = tally.end();
    assert.deepEqual(totals.get("claude-sonnet-5-5"), {
      tokens: { input: 2000, output: 1000, cacheRead: 0, cacheWrite: 0 },
      costMicros: 7000,
      items: 2,
    });
    assert.equal(totals.get("claude-haiku-5-5")?.costMicros, 30_000);
    assert.equal(totals.size, 2);
  });
});

describe("the upstream cut", () => {
  it("ends a call at 285 s, before Vercel's 300 s route ceiling would cut it unmarked", () => {
    assert.equal(UPSTREAM_CUT_MS, 285_000);
    assert.ok(UPSTREAM_CUT_MS < 300_000);
  });

  it("follows the caller's abort and the cut, and tells them apart", async () => {
    const caller = new AbortController();
    const cut = cutSignal(caller.signal, { seenThrough: false, ms: 20 });
    assert.ok(cut.signal);
    assert.equal(cut.reason(), "unreachable");
    await new Promise((resolve) => setTimeout(resolve, 60));
    assert.equal(cut.signal?.aborted, true);
    assert.equal(cut.cut(), true);
    assert.equal(cut.reason(), "timeout");

    const gone = new AbortController();
    const early = cutSignal(gone.signal, { seenThrough: false, ms: 10_000 });
    gone.abort();
    assert.equal(early.signal?.aborted, true);
    assert.equal(early.cut(), false);
    assert.equal(early.reason(), "aborted");
  });

  it("is not set on a call the proxy sees through, which must be stored or forgotten once Anthropic has it", () => {
    const caller = new AbortController();
    const through = cutSignal(caller.signal, { seenThrough: true, ms: 1 });
    assert.equal(through.signal, undefined);
    caller.abort();
    assert.equal(through.cut(), false);
  });
});

/**
 * Every prompt coere-v2 pins hashes to a SHA prompt-shas.ts lists, read from
 * a coere-v2 checkout beside this one (or COERE_V2_DIR) when there is one.
 * A prompt file there is one exported constant with no imports.
 */
describe("the prompt list against coere-v2", () => {
  const base = process.env.COERE_V2_DIR ?? join(import.meta.dirname, "..", "..", "..", "..", "..", "coere-v2");
  const dirs = [join(base, "packages", "memory", "src", "prompts"), join(base, "packages", "solution", "src", "prompts")];
  const there = dirs.every((dir) => existsSync(dir));

  it("lists every prompt the extension sends", { skip: there ? false : "no coere-v2 checkout here" }, async () => {
    let seen = 0;
    for (const dir of dirs) {
      for (const name of readdirSync(dir)) {
        if (!name.endsWith(".ts") || name.includes(".test.")) continue;
        const path = join(dir, name);
        if (/^import /m.test(readFileSync(path, "utf8"))) continue;
        const mod = (await import(path)) as Record<string, unknown>;
        for (const [key, value] of Object.entries(mod)) {
          if (typeof value !== "string" || value.length < 200) continue;
          seen += 1;
          const hash = createHash("sha256").update(value, "utf8").digest("hex");
          assert.ok(hash in PROMPT_SHAS, `${name} ${key} is not in prompt-shas.ts`);
        }
      }
    }
    assert.ok(seen >= 26, `read ${seen} prompts`);
  });
});
