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
