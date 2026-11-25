import "server-only";

import { upstreamHeaders } from "./headers";
import { cutSignal, neverSent, type CutReason } from "./upstream-cut";

/**
 * One request to Anthropic with Coere's key. The caller's abort signal goes
 * along unless `seenThrough` is set, so a closed extension tab stops the
 * upstream call too, and so does the proxy's 285 s cut (upstream-cut.ts).
 * A failed connection never throws: the answer says why the call ended,
 * `unsent` when the connection never opened, and `cut` says later whether
 * the cut ended the body's read.
 */
export type Forwarded = { ok: true; res: Response; cut: () => boolean } | { ok: false; why: CutReason | "unsent" };

export async function forwardToAnthropic(
  req: Request,
  o: { url: string; apiKey: string; beta: string | null; body: Uint8Array | null; seenThrough: boolean },
): Promise<Forwarded> {
  const cut = cutSignal(req.signal, { seenThrough: o.seenThrough });
  try {
    const res = await fetch(o.url, {
      method: req.method,
      headers: upstreamHeaders(req.headers, { apiKey: o.apiKey, beta: o.beta }),
      body: o.body && o.body.byteLength > 0 ? (o.body as BodyInit) : undefined,
      signal: cut.signal,
      cache: "no-store",
      redirect: "manual",
    });
    return { ok: true, res, cut: cut.cut };
  } catch (error) {
    return { ok: false, why: neverSent(error) ? "unsent" : cut.reason() };
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
