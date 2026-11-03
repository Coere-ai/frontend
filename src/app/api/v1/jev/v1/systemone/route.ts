import { readJson } from "@/lib/v1/body";
import { gate } from "@/lib/v1/gate";
import { json } from "@/lib/v1/http";
import { JEV_BODY_CAP, JEV_URL, jevAnswerHeaders, jevModel, jevUsage } from "@/lib/v1/jev-rules";
import { recordUsage } from "@/lib/v1/meter";
import { costMicros } from "@/lib/v1/prices";
import { jevFor } from "@/lib/v1/refusals";

// POST /api/v1/jev/v1/systemone (docs/accounts.md 8.5)
//
// The extension's Jev calls with Coere's key. With no JEV_API_KEY set it
// answers 403, which sends the extension's classifier to Haiku at once.
// Errors are a plain {error} body, as Jev's client reads them.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const started = Date.now();
  const g = await gate(req, { metered: true });
  if (!g.ok) return jevFor(g.refusal, g.retryAfter);
  const key = process.env.JEV_API_KEY;
  if (!key) return json({ error: "unavailable" }, 403);

  const body = await readJson(req, JEV_BODY_CAP);
  if (!body.ok) return json({ error: body.reason }, body.reason === "too_large" ? 413 : 400);
  const model = jevModel(body.value);
  if (!model) return json({ error: "model" }, 400);

  let up: Response;
  try {
    up = await fetch(JEV_URL, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: body.bytes as BodyInit,
      signal: req.signal,
      cache: "no-store",
    });
  } catch {
    return json({ error: "upstream_unreachable" }, 502);
  }
  // Jev refusing Coere's own key must not read as the person being signed out.
  if (up.status === 401 || up.status === 403) {
    console.error("jev refused the server key", up.status);
    return json({ error: "unavailable" }, 403);
  }
  const text = await up.text();
  if (up.ok) {
    let answer: unknown = null;
    try {
      answer = JSON.parse(text);
    } catch {}
    const usage = jevUsage(answer, model);
    const tokens = { input: usage.input, output: 0, cacheRead: 0, cacheWrite: 0 };
    await recordUsage(g.account, {
      kind: "jev",
      model: usage.model,
      tokens,
      costMicros: costMicros(usage.model, tokens, "direct"),
      status: up.status,
      durationMs: Date.now() - started,
      requestId: null,
    });
  }
  return new Response(text, { status: up.status, headers: jevAnswerHeaders(up.headers) });
}
