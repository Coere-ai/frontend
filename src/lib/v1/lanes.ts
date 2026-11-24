/**
 * Which per minute bucket a call counts against (docs/accounts.md 8.10).
 *
 * The plan's requests_per_minute was the guard against a runaway loop, and
 * every call met it. A memory build now runs up to about 100 model calls at
 * once, which needs about 300 starts a minute, so counted with everything
 * else a build met the plan's 60 in seconds and starved the account, settings
 * and memory calls behind it. Each kind of traffic now has its own bucket per
 * device:
 *
 * - `default` keeps the plan's limit, for the account, settings, events and
 *   memory routes only, so a build never holds back sync or the dashboard.
 * - `message` is a model call that is not Haiku, and the batch calls: five
 *   times the plan's and at least 600 a minute.
 * - `haiku` is a Haiku message, which sorts every chat of a build: thirty
 *   times the plan's and at least 2,000 a minute.
 * - `jev` and `count` (count_tokens is free) keep ten times the plan's and at
 *   least 1,000.
 *
 * The guard against a runaway loop on the model calls then rests on the
 * spend limits and the live holds cap in reserve_spend (spend-holds.ts).
 */

export type Lane = "default" | "message" | "jev" | "count" | "haiku";

/**
 * The lane of a message by its model. A body that names no model, or could
 * not be read, counts as an ordinary message.
 */
export function messageLane(model: string | undefined): Lane {
  return model?.startsWith("claude-haiku") ? "haiku" : "message";
}

/** Each bulk lane's limit: the plan's requests_per_minute times `factor`, and never below `floor`. */
const BULK: Readonly<Record<Exclude<Lane, "default">, { factor: number; floor: number }>> = {
  message: { factor: 5, floor: 600 },
  haiku: { factor: 30, floor: 2_000 },
  jev: { factor: 10, floor: 1_000 },
  count: { factor: 10, floor: 1_000 },
};

export function laneBucket(lane: Lane, deviceId: string, requestsPerMinute: number): { key: string; limit: number } {
  if (lane === "default") return { key: deviceId, limit: requestsPerMinute };
  const { factor, floor } = BULK[lane];
  return { key: `${lane}:${deviceId}`, limit: Math.max(requestsPerMinute * factor, floor) };
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
