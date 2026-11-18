// The AI behind the site's Claude proxy for the welcome pictures, where a
// memory build runs live: coere-v2's fake Claude, over plain http on
// localhost. A run has no Anthropic key, so the host proxy hands each
// /api/v1/anthropic/ call here instead of to the site (lib/host-proxy.mjs).
// The fake reads each chat with its own rules, so what the build finds
// comes from Maya's made up chats. Runs under tsx, since it loads
// coere-v2's TypeScript source:
//
//   npx tsx scripts/screenshots/lib/fake-ai.mjs <coere-v2 dir>
//
// It prints "port <n>" once it listens, and stops when its input closes.

import { createServer } from "node:http";
import { join } from "node:path";

const coereV2 = process.argv[2];
const src = (p) => import(join(coereV2, p));
const { createFakeClaude } = await src("tests/fake-claude/server.ts");
const { loadScenarios } = await src("tests/fake-claude/scenarios/index.ts");
const { FAKE_KEY } = await src("tests/fake-claude/rules.ts");
const fake = createFakeClaude({ scenarios: await loadScenarios(), now: Date.now });

/**
 * Each answer waits as a real one would, Sonnet's longest, so the build
 * stays on screen long enough to see each chat taken. coere-v2's own live
 * build spec slows it the same way.
 */
function delayFor(body) {
  const model = /"model"\s*:\s*"([^"]+)"/.exec(body)?.[1] ?? "";
  return model.includes("sonnet") ? 6000 : model.includes("haiku") ? 250 : 0;
}

/** The headers an answer keeps, as the site's proxy keeps them. */
const KEPT = ["content-type", "request-id", "retry-after", "x-should-retry"];

const server = createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  const headers = { "x-api-key": FAKE_KEY, "anthropic-version": req.headers["anthropic-version"] ?? "2023-06-01" };
  for (const name of ["content-type", "anthropic-beta"]) if (req.headers[name]) headers[name] = req.headers[name];
  const wait = req.method === "POST" ? delayFor(body) : 0;
  if (wait) await new Promise((r) => setTimeout(r, wait));
  const answer = await fake.fetch(`https://api.anthropic.com${req.url}`, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "DELETE" ? undefined : body,
  });
  const out = {};
  for (const name of KEPT) {
    const v = answer.headers.get(name);
    if (v !== null) out[name] = v;
  }
  // Counts only, never a body: what was asked and how it was answered.
  if (process.env.SHOTS_VERBOSE) console.error(`fake AI ${req.method} ${req.url} ${/"model"\s*:\s*"([^"]+)"/.exec(body)?.[1] ?? ""} ${answer.status}`);
  res.writeHead(answer.status, out);
  res.end(Buffer.from(await answer.arrayBuffer()));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
console.log(`port ${server.address().port}`);
process.stdin.resume();
process.stdin.on("end", () => process.exit(0));
