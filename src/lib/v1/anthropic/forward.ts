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
