import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { readBeaconBody } from "./beacon-body";

/** A body of `total` bytes sent 1 KB at a time with no declared length, counting what was read. */
function streamed(total: number, fill = "x") {
  let sent = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= total) return controller.close();
      const n = Math.min(1024, total - sent);
      sent += n;
      controller.enqueue(new TextEncoder().encode(fill.repeat(n)));
    },
  });
  const req = new Request("https://www.coere.ai/api/site/track", { method: "POST", body, duplex: "half" } as RequestInit);
  return { req, read: () => sent };
}

describe("readBeaconBody", () => {
  it("stops a 1 MB body at the cap instead of buffering it whole", async () => {
    const { req, read } = streamed(1024 * 1024);
    assert.equal(await readBeaconBody(req, 8192), null);
    // The cap and at most a chunk or two of read ahead.
    assert.ok(read() <= 8192 + 2 * 1024, `read ${read()} bytes`);
  });

  it("refuses a declared length past the cap before reading", async () => {
    const { req, read } = streamed(64 * 1024);
    const declared = new Request(req, { headers: { "content-length": String(64 * 1024) } });
    assert.equal(await readBeaconBody(declared, 8192), null);
    assert.ok(read() <= 2 * 1024, `read ${read()} bytes`);
  });

  it("reads a small beacon, and answers null for anything that is not JSON", async () => {
    const ok = new Request("https://www.coere.ai/api/site/track", { method: "POST", body: JSON.stringify({ type: "view" }) });
    assert.deepEqual(await readBeaconBody(ok, 8192), { type: "view" });
    const bad = new Request("https://www.coere.ai/api/site/track", { method: "POST", body: "{" });
    assert.equal(await readBeaconBody(bad, 8192), null);
    assert.equal(await readBeaconBody(new Request("https://www.coere.ai/api/site/track", { method: "POST" }), 8192), null);
  });
});
