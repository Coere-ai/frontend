import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { answerHeaders, upstreamHeaders } from "./headers";
import { checkBatchBody, checkBeta, checkParams } from "./params";
import { matchAnthropicPath, upstreamSearch, upstreamUrl } from "./paths";
import { createBatchTally, usageOf } from "./usage";

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

  it("checks every entry of a batch", () => {
    const entry = (params: object) => ({ custom_id: "a", params });
    assert.deepEqual(checkBatchBody({ requests: [entry(ok), entry(ok)] }), { ok: true, count: 2 });
    assert.deepEqual(checkBatchBody({ requests: [entry(ok), entry({ ...ok, model: "x" })] }), { ok: false, reason: "model", model: "x" });
    assert.deepEqual(checkBatchBody({ requests: [] }), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkBatchBody({}), { ok: false, reason: "bad_request" });
    assert.deepEqual(checkBatchBody({ requests: [1] }), { ok: false, reason: "bad_request" });
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
    const out = answerHeaders(upstream);
    assert.deepEqual([...out.entries()].sort(), [
      ["cache-control", "no-store"],
      ["content-type", "application/json"],
      ["request-id", "req_1"],
      ["retry-after", "3"],
      ["x-robots-tag", "noindex"],
      ["x-should-retry", "true"],
    ]);
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
