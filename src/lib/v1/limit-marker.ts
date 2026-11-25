/**
 * Which system refused a call, on every 429 the model routes answer
 * (/api/v1/anthropic and /api/v1/jev), and on the proxy's 504 for a call it
 * cut for running too long. The extension used to guess from the
 * retry-after alone, and read any wait of 10 s or less as spend held by other
 * calls, so Anthropic's own short 429s and the site's per minute refusals kept
 * a build looping at full speed. With the marker it can slow down the right
 * way for each.
 *
 * The value is one of a fixed few and carries nothing about the person:
 *
 * - `spend-pending`: the spend limit is full of calls still in flight, whose
 *   holds go as they answer (retry-after 10).
 * - `per-minute`: a per minute lane is spent (retry-after 30 at most).
 * - `concurrency`: the live holds cap, too many calls at once (retry-after 2).
 * - `upstream`: Anthropic's or Jev's own 429, passed through with its own
 *   retry-after.
 * - `duration`: on a 504, the proxy ended the call at its 285 s cut
 *   (anthropic/upstream-cut.ts), before Vercel's 300 s route ceiling would
 *   have cut it with no marker. The same call will be cut again, so the
 *   extension splits the work or stops rather than sending it as it is.
 *
 * An extension that does not know the header ignores it, and a 429 without
 * it reads as an ordinary rate limit.
 */

export const LIMIT_HEADER = "x-coere-limit";

export type LimitSource = "spend-pending" | "per-minute" | "concurrency" | "upstream" | "duration";

export const LIMIT_SOURCES: readonly LimitSource[] = ["spend-pending", "per-minute", "concurrency", "upstream", "duration"];

/**
 * Marks an upstream answer passed through as the upstream's own limit when it
 * is a 429. Whatever the upstream itself sent under the name is replaced, so
 * the value is always one of ours.
 */
export function markUpstream(headers: Headers, status: number): Headers {
  headers.delete(LIMIT_HEADER);
  if (status === 429) headers.set(LIMIT_HEADER, "upstream");
  return headers;
}
