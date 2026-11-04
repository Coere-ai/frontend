/**
 * Which per minute bucket a call counts against (docs/accounts.md 8.10).
 * The plan's requests_per_minute guards against a runaway loop, but the
 * extension's Jev classifier sends one small call per item with 16 in
 * flight, and count_tokens is free: counted with everything else, a first
 * memory build ran into the limit in seconds and its items fell through to
 * dearer Haiku calls refused the same way. Those two get their own bucket
 * per device, ten times the plan's and at least 1,000 a minute; the spend
 * limits still bound what Jev costs.
 */

export type Lane = "default" | "jev" | "count";

const BULK_FACTOR = 10;
const BULK_FLOOR = 1_000;

export function laneBucket(lane: Lane, deviceId: string, requestsPerMinute: number): { key: string; limit: number } {
  if (lane === "default") return { key: deviceId, limit: requestsPerMinute };
  return { key: `${lane}:${deviceId}`, limit: Math.max(requestsPerMinute * BULK_FACTOR, BULK_FLOOR) };
}

/**
 * The longest retry-after a per minute refusal names. Jev's client and the
 * runtime give an item up when told to wait longer than 30 seconds, so the
 * answer never says more; a retry that comes early is refused again with
 * what is left of the window.
 */
export const MAX_RATE_RETRY_SECONDS = 30;

export function rateRetryAfter(seconds: number): number {
  return Math.min(seconds, MAX_RATE_RETRY_SECONDS);
}
