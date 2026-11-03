import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BODY_CAP, prepareRequest } from "./prepare";

const req = (body: string | null, headers: Record<string, string> = {}, method = "POST") =>
  new Request("https://www.coere.ai/api/v1/anthropic/v1/messages", { method, body, headers });

const message = { model: "claude-haiku-5-5", max_tokens: 100, messages: [{ role: "user", content: "x" }] };

describe("prepareRequest", () => {
  it("passes a good message with its body and beta", async () => {
    const p = await prepareRequest(req(JSON.stringify(message), { "anthropic-beta": "server-side-fallback-2026-07-01" }), { op: "message" });
    assert.equal(p.ok, true);
    assert.equal(p.ok && p.beta, "server-side-fallback-2026-07-01");
    assert.equal(p.ok && p.requestCount, 1);
  });

  it("refuses a beta, a big body, a bad body and a model", async () => {
    assert.deepEqual(await prepareRequest(req("{}", { "anthropic-beta": "files-api-2025-04-14" }), { op: "message" }), { ok: false, error: "beta" });
    assert.deepEqual(await prepareRequest(req("x".repeat(BODY_CAP + 1)), { op: "message" }), { ok: false, error: "too_large" });
    assert.deepEqual(await prepareRequest(req("{"), { op: "message" }), { ok: false, error: "bad_request" });
    assert.deepEqual(await prepareRequest(req(JSON.stringify({ ...message, model: "claude-x" })), { op: "count_tokens" }), {
      ok: false,
      error: "model",
      model: "claude-x",
    });
  });

  it("counts a batch's requests and sends no body on a bare path", async () => {
    const batch = { requests: [{ custom_id: "a", params: message }, { custom_id: "b", params: message }] };
    const p = await prepareRequest(req(JSON.stringify(batch)), { op: "batch_create" });
    assert.equal(p.ok && p.requestCount, 2);
    const cancel = await prepareRequest(req(null), { op: "batch_cancel", batchId: "msgbatch_1" });
    assert.deepEqual(cancel, { ok: true, beta: null, body: null, requestCount: 0 });
  });
});
