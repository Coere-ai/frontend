import "server-only";

import { upstreamHeaders } from "./headers";

/**
 * One request to Anthropic with Coere's key. The caller's abort signal goes
 * along, so a closed extension tab stops the upstream call too. A failed
 * connection answers null and never throws.
 */
export async function forwardToAnthropic(
  req: Request,
  o: { url: string; apiKey: string; beta: string | null; body: Uint8Array | null },
): Promise<Response | null> {
  try {
    return await fetch(o.url, {
      method: req.method,
      headers: upstreamHeaders(req.headers, { apiKey: o.apiKey, beta: o.beta }),
      body: o.body && o.body.byteLength > 0 ? (o.body as BodyInit) : undefined,
      signal: req.signal,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return null;
  }
}

/**
 * Cancels a batch with Coere's key, for a batch the proxy could not record
 * as its caller's: nobody could read its results, so it should not run on.
 * Best effort; a failure is only logged.
 */
export async function cancelUpstreamBatch(id: string, o: { apiKey: string; version: string | null; beta: string | null }): Promise<void> {
  const headers = new Headers({ "x-api-key": o.apiKey, "anthropic-version": o.version ?? "2023-06-01" });
  if (o.beta) headers.set("anthropic-beta", o.beta);
  try {
    const res = await fetch(`https://api.anthropic.com/v1/messages/batches/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      headers,
      cache: "no-store",
      redirect: "manual",
    });
    if (!res.ok) console.error("unrecorded batch not cancelled", res.status);
    await res.body?.cancel().catch(() => {});
  } catch {
    console.error("unrecorded batch not cancelled");
  }
}
