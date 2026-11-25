/**
 * The proxy's own end to a call that runs too long (docs/accounts.md 8.4).
 * The model route's maxDuration is 300 s, and Vercel cuts a longer call with
 * a bare 504 that the extension took for a passing server error and sent
 * again, up to six times, each billed by Anthropic and never metered. The
 * proxy now ends the upstream fetch at 285 s and answers a 504 marked
 * `duration` (limit-marker.ts), so the extension can split the work instead.
 */

/** 285 s: the route's 300 s less time to answer and settle the hold. */
export const UPSTREAM_CUT_MS = 285_000;

/** Why a forward ended without an answer: the cut, the caller going, or no connection. */
export type CutReason = "timeout" | "aborted" | "unreachable";

export interface UpstreamCut {
  /** The signal the fetch goes with; none for a call the proxy sees through after its caller goes. */
  signal: AbortSignal | undefined;
  /** True once the cut has ended the call. */
  cut: () => boolean;
  /** Why the call ended, read after it failed. */
  reason: () => CutReason;
}

export function cutSignal(caller: AbortSignal, o: { seenThrough: boolean; ms?: number }): UpstreamCut {
  if (o.seenThrough) return { signal: undefined, cut: () => false, reason: () => "unreachable" };
  const timer = AbortSignal.timeout(o.ms ?? UPSTREAM_CUT_MS);
  return {
    signal: AbortSignal.any([caller, timer]),
    cut: () => timer.aborted && !caller.aborted,
    reason: () => (caller.aborted ? "aborted" : timer.aborted ? "timeout" : "unreachable"),
  };
}

/**
 * Socket codes that mean the connection to Anthropic never opened: no
 * address, refused, unreachable, the connect timed out, or a certificate
 * the handshake would not take. The request was never sent, so nothing
 * was billed. A reset or a closed socket is not here: it may come after
 * Anthropic read the whole request.
 */
const NEVER_OPENED = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "UND_ERR_CONNECT_TIMEOUT",
  "CERT_HAS_EXPIRED",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "ERR_TLS_CERT_ALTNAME_INVALID",
]);

function opened(cause: unknown): boolean {
  if (cause instanceof AggregateError) return cause.errors.length === 0 || cause.errors.some(opened);
  const code = typeof cause === "object" && cause !== null ? (cause as { code?: unknown }).code : undefined;
  return typeof code !== "string" || !NEVER_OPENED.has(code);
}

/** True when fetch failed before its connection opened (undici puts the socket's error in `cause`). */
export function neverSent(error: unknown): boolean {
  if (!(error instanceof TypeError)) return false;
  const cause = (error as { cause?: unknown }).cause;
  return cause !== undefined && cause !== null && !opened(cause);
}
