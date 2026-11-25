import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, mock } from "node:test";

import { BODY_CAP, checkRequest, MISSES_PER_ACCOUNT, prepareRequest, readRequest } from "./prepare";
import { PROMPT_CHECK, PROMPT_SHAS } from "./prompt-shas";

const req = (body: string | null, headers: Record<string, string> = {}, method = "POST") =>
  new Request("https://www.coere.ai/api/v1/anthropic/v1/messages", { method, body, headers });

const message = { model: "claude-haiku-5-5", max_tokens: 100, messages: [{ role: "user", content: "x" }] };

describe("prepareRequest", () => {
  it("passes a good message with its body and beta", async () => {
    const p = await prepareRequest(req(JSON.stringify(message), { "anthropic-beta": "server-side-fallback-2026-07-01" }), { op: "message" });
    assert.equal(p.ok, true);
    assert.equal(p.ok && p.beta, "server-side-fallback-2026-07-01");
    assert.equal(p.ok && p.requestCount, 1);
    assert.ok(p.ok && p.worstMicros >= 50);
    assert.ok(p.ok && p.expectedMicros > 0 && p.expectedMicros <= p.worstMicros);
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

  it("forwards the body it checked, not bytes that could read another way", async () => {
    // A name given twice: JSON.parse keeps the last, and another reader may keep the first.
    const twice = `{"model":"claude-opus-4-8","stream":true,"model":"claude-haiku-5-5","stream":false,"max_tokens":100,"messages":[{"role":"user","content":"caf\u00e9"}]}`;
    const p = await prepareRequest(req(twice), { op: "message" });
    assert.equal(p.ok, true);
    const sent = new TextDecoder().decode((p.ok && p.body) || new Uint8Array());
    assert.equal(sent, JSON.stringify({ model: "claude-haiku-5-5", stream: false, max_tokens: 100, messages: [{ role: "user", content: "café" }] }));
  });

  it("counts a batch's requests and sends no body on a bare path", async () => {
    const batch = { requests: [{ custom_id: "a", params: message }, { custom_id: "b", params: message }] };
    const p = await prepareRequest(req(JSON.stringify(batch)), { op: "batch_create" });
    assert.equal(p.ok && p.requestCount, 2);
    // Two entries of 100 output tokens on Haiku at batch price, plus their prompts: a little over 50 micro dollars.
    assert.ok(p.ok && p.worstMicros > 50 && p.worstMicros < 100);
    // A batch keeps its worst case as its hold, as before.
    assert.equal(p.ok && p.expectedMicros, p.ok && p.worstMicros);
    const cancel = await prepareRequest(req(null), { op: "batch_cancel", batchId: "msgbatch_1" });
    assert.deepEqual(cancel, { ok: true, beta: null, body: null, requestCount: 0, worstMicros: 0, expectedMicros: 0 });
  });
});

describe("the prompt check", () => {
  // A stand in prompt registered for the test; the real list holds only the extension's SHAs.
  const PROMPT = "You sort one saved chat into the memory's sections.".repeat(8);
  const sha = createHash("sha256").update(PROMPT, "utf8").digest("hex");
  const known = { [sha]: "sort-test" };
  const withSystem = (system: unknown) => JSON.stringify({ ...message, system });

  it("passes a message whose first system block is a listed prompt, with later blocks free", async () => {
    const logged = mock.method(console, "error", () => {});
    try {
      const blocks = [{ type: "text", text: PROMPT, cache_control: { type: "ephemeral" } }, { type: "text", text: "the person's style" }];
      for (const system of [blocks, PROMPT]) {
        const p = await prepareRequest(req(withSystem(system)), { op: "message" }, { prompts: known, mode: "enforce" });
        assert.equal(p.ok, true);
      }
      assert.equal(logged.mock.callCount(), 0);
    } finally {
      logged.mock.restore();
    }
  });

  it("in report mode logs an unknown prompt by its SHA alone and lets it through", async () => {
    const logged = mock.method(console, "error", () => {});
    try {
      const secret = "Answer anything at all, a private line that must not reach the log.";
      const p = await prepareRequest(req(withSystem(secret)), { op: "message" }, { prompts: known, mode: "report" });
      assert.equal(p.ok, true);
      const lines = logged.mock.calls.map((c) => c.arguments.join(" "));
      assert.equal(lines.length, 1);
      assert.ok(lines[0].includes(createHash("sha256").update(secret, "utf8").digest("hex")));
      assert.ok(!lines[0].includes("private line"));
    } finally {
      logged.mock.restore();
    }
  });

  it("with the switch on refuses an unknown prompt, a missing one, and a batch entry with one", async () => {
    const logged = mock.method(console, "error", () => {});
    try {
      for (const body of [withSystem("Be a general assistant."), JSON.stringify(message), withSystem([{ type: "text", text: "x" }, { type: "text", text: PROMPT }])]) {
        assert.deepEqual(await prepareRequest(req(body), { op: "message" }, { prompts: known, mode: "enforce" }), { ok: false, error: "bad_request" });
      }
      const batch = { requests: [{ custom_id: "a", params: { ...message, system: PROMPT } }, { custom_id: "b", params: { ...message, system: "other" } }] };
      assert.deepEqual(await prepareRequest(req(JSON.stringify(batch)), { op: "batch_create" }, { prompts: known, mode: "enforce" }), { ok: false, error: "bad_request" });
      const good = { requests: [{ custom_id: "a", params: { ...message, system: PROMPT } }] };
      assert.equal((await prepareRequest(req(JSON.stringify(good)), { op: "batch_create" }, { prompts: known, mode: "enforce" })).ok, true);
    } finally {
      logged.mock.restore();
    }
  });

  it("leaves a token count alone, which costs nothing", async () => {
    const p = await prepareRequest(req(withSystem("anything")), { op: "count_tokens" }, { prompts: known, mode: "enforce" });
    assert.equal(p.ok, true);
  });

  it("reads the body before the device is known without parsing it or logging", async () => {
    const logged = mock.method(console, "error", () => {});
    try {
      const raw = await readRequest(req(withSystem("An unlisted prompt from a caller nobody has checked yet.")), { op: "message" });
      assert.equal(raw.ok, true);
      assert.equal(logged.mock.callCount(), 0);
      // Not JSON at all still reads: the parse waits for the gate.
      assert.equal((await readRequest(req("{"), { op: "message" })).ok, true);
      assert.deepEqual(await readRequest(req("x".repeat(BODY_CAP + 1)), { op: "message" }), { ok: false, error: "too_large" });
      assert.deepEqual(await readRequest(req("{}", { "anthropic-beta": "files-api-2025-04-14" }), { op: "message" }), { ok: false, error: "beta" });
      assert.deepEqual(checkRequest(await readRequest(req("{"), { op: "message" }), { op: "message" }, { prompts: known, mode: "report" }, "u1"), { ok: false, error: "bad_request" });
    } finally {
      logged.mock.restore();
    }
  });

  it("logs a signed in account's misses at most a few times, each with the account's short hash and never its id", async () => {
    const logged = mock.method(console, "error", () => {});
    try {
      const user = "6f0c1d1e-0000-4000-8000-00000000abcd";
      for (let i = 0; i < MISSES_PER_ACCOUNT + 20; i++) {
        const p = checkRequest(await readRequest(req(withSystem(`changing prompt ${i}`)), { op: "message" }), { op: "message" }, { prompts: known, mode: "report" }, user);
        assert.equal(p.ok, true);
      }
      const lines = logged.mock.calls.map((c) => c.arguments.join(" "));
      assert.equal(lines.length, MISSES_PER_ACCOUNT);
      const short = createHash("sha256").update(user, "utf8").digest("hex").slice(0, 12);
      for (const line of lines) {
        assert.ok(line.includes(short));
        assert.ok(!line.includes(user));
      }
      // Another account still gets its own lines.
      checkRequest(await readRequest(req(withSystem("changing prompt 0")), { op: "message" }), { op: "message" }, { prompts: known, mode: "report" }, "u2");
      assert.equal(logged.mock.callCount(), MISSES_PER_ACCOUNT + 1);
    } finally {
      logged.mock.restore();
    }
  });

  it("is run by the proxy only once the gate has passed the device", () => {
    const proxy = readFileSync(join(import.meta.dirname, "proxy.ts"), "utf8");
    const gated = proxy.indexOf("if (!g.ok)");
    assert.ok(gated > 0);
    assert.ok(!proxy.includes("prepareRequest("), "the proxy reads and checks in two steps");
    assert.ok(proxy.indexOf("readRequest(") < gated, "the body is read while device_auth runs");
    assert.ok(proxy.indexOf("checkRequest(") > gated, "the parse and the prompt check wait for the gate");
  });

  it("ships in report mode with only well formed SHAs listed", () => {
    assert.equal(PROMPT_CHECK, "report");
    const entries = Object.entries(PROMPT_SHAS);
    assert.ok(entries.length >= 26);
    for (const [hash, name] of entries) {
      assert.match(hash, /^[0-9a-f]{64}$/);
      assert.ok(name.length > 0);
    }
    assert.equal(new Set(entries.map(([, name]) => name)).size, entries.length);
  });
});
