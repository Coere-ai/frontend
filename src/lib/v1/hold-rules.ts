import type { SpentLimit } from "./gate-types";
import { PRICES, type TokenCounts } from "./prices";
import { refusedLimit } from "./spend";

/**
 * The numbers reserve_spend is called with, and how its answer reads
 * (docs/accounts.md 8.10). Kept apart from spend-holds.ts, which talks to
 * the database, so the tests can read them.
 */

/**
 * How long a hold counts when its call never lets it go: the proxy route's
 * 300 second maxDuration and a minute more. It was 900, so each call Vercel
 * cut off at 300 s kept its hold for ten minutes after, and a few of them
 * filled the first build allowance. If the route moves to 800 seconds on
 * Vercel Pro, this goes to 860 (and the extension's timeout to 830 s).
 */
export const HOLD_SECONDS = 360;

/**
 * How far all of an account's calls in flight together may pass a limit if
 * every one used its worst case: $5. reserve_spend weighs the limit by each
 * call's expected cost, so this is what bounds the rest.
 */
export const OVERRUN_MICROS = 5_000_000;

/** The most holds an account may have at once. Haiku calls meet it; Sonnet calls meet the overrun bound first. */
export const MAX_LIVE_HOLDS = 128;

/** The retry-after a pending refusal names: about how long a message call takes to answer. */
export const PENDING_RETRY_SECONDS = 10;

/** The retry-after a concurrency refusal names: a hold goes every few hundred milliseconds in a busy build. */
export const CONCURRENCY_RETRY_SECONDS = 2;

/**
 * `pending`: the call fits the limit on its own, and only the expected cost
 * of other calls still in flight fills it. Their holds go as each answers, so
 * the proxy asks for a short wait instead of reporting a spent limit, which
 * the extension holds for an hour.
 *
 * `concurrency`: the account has MAX_LIVE_HOLDS calls in flight, or their
 * worst cases together could pass a limit by more than OVERRUN_MICROS. A
 * wait of a moment, until some of them answer.
 *
 * `site_budget`: the account is in its first build and today's first build
 * spend across the whole site has reached budget.first_build_daily
 * (site_settings). Answered as a spent limit, so the extension holds its
 * queue and tries again hourly.
 *
 * `refused: null` means reserve_spend could not be asked.
 */
export type Reservation =
  | { ok: true; holdId: string }
  | { ok: false; refused: SpentLimit }
  | { ok: false; refused: null }
  | { ok: false; refused: "pending" }
  | { ok: false; refused: "concurrency" }
  | { ok: false; refused: "site_budget" };

/** A reserve_spend row as a Reservation. A refusal it does not know reads as the month, as before. */
export function readReservation(data: unknown): Reservation {
  const row = (Array.isArray(data) ? data[0] : data) as { hold_id?: unknown; refused?: unknown } | null | undefined;
  if (typeof row?.hold_id === "string" && row.hold_id) return { ok: true, holdId: row.hold_id };
  const refused = typeof row?.refused === "string" ? row.refused : null;
  if (refused === "pending" || refused === "concurrency" || refused === "site_budget") return { ok: false, refused };
  return { ok: false, refused: refusedLimit(refused) };
}

/** The arguments of the seven argument reserve_spend. */
export function reserveArgs(userId: string, cost: { worstMicros: number; expectedMicros: number }, o: { batch: boolean }) {
  const worst = Math.max(0, Math.ceil(cost.worstMicros));
  return {
    p_user: userId,
    p_amount: worst,
    p_ttl_seconds: HOLD_SECONDS,
    p_batch: o.batch,
    // A batch's hold is its worst case, and an expected cost is never read above it.
    p_expected: o.batch ? worst : Math.min(worst, Math.max(0, Math.ceil(cost.expectedMicros))),
    p_overrun: OVERRUN_MICROS,
    p_max_live: MAX_LIVE_HOLDS,
  };
}

/** PostgREST's code for a function it does not know: the migration has not run yet. */
export const UNKNOWN_FUNCTION = "PGRST202";

/** Whether an error means the function is not there yet: a migration has not run. */
export function isUnknownFunction(error: { code?: string } | null | undefined): boolean {
  return error?.code === UNKNOWN_FUNCTION;
}

/** Whether reserve_spend's error means the seven argument function is not there yet, so the four argument one is asked. */
export function wantsWorstOnly(error: { code?: string } | null | undefined): boolean {
  return isUnknownFunction(error);
}

/** The four argument reserve_spend's arguments, which hold the worst case alone. */
export function worstOnlyArgs(args: ReturnType<typeof reserveArgs>) {
  return { p_user: args.p_user, p_amount: args.p_amount, p_ttl_seconds: HOLD_SECONDS, p_batch: args.p_batch };
}

/**
 * What happened to a call that holds spend, for what becomes of its hold.
 *
 * - `settled`: settle_call recorded the cost and let the hold go itself.
 * - `stored`: store_batch stored a new batch, whose reservation now counts
 *   in the hold's place, and let the hold go in the same transaction.
 * - `upstream_error`: Anthropic answered an error, which it does not bill.
 * - `not_stored`: the batch was cancelled because it could not be stored.
 * - `unsent`: the connection to Anthropic never opened (neverSent in
 *   upstream-cut.ts), so Anthropic never had the request.
 * - `aborted`, `timeout`, `unreachable`: the call ended without an answer,
 *   after the request may have reached Anthropic.
 * - `read_failed`: the answer's body could not be read.
 * - `record_failed`: the cost was known but could not be recorded, after a
 *   second try.
 */
export type HoldEvent =
  | "settled"
  | "upstream_error"
  | "stored"
  | "not_stored"
  | "unsent"
  | "aborted"
  | "timeout"
  | "unreachable"
  | "read_failed"
  | "record_failed";

/**
 * A hold goes only once its call's cost is known: recorded, or nothing to
 * record. When Anthropic may have billed a call whose cost was never
 * recorded, the hold stays and runs out at HOLD_SECONDS, so that spend
 * keeps counting against the limits instead of vanishing at once. Whether
 * Anthropic bills a call its caller aborted is still to be measured; if it
 * does, the hold's expected cost should be charged on abort.
 *
 * A batch create whose forward failed lets its hold go. Anthropic may hold
 * the batch if the connection broke after the request went, but the proxy
 * never stored it, so no one can read its results or gain from it, and its
 * worst case may be more than the person has left. Its hold is kept only
 * when the answer came and its body could not be read.
 */
export function holdOutcome(event: HoldEvent, o: { batch?: boolean } = {}): "none" | "release" | "keep" {
  switch (event) {
    case "settled":
    case "stored":
      return "none";
    case "upstream_error":
    case "not_stored":
    case "unsent":
      return "release";
    case "aborted":
    case "timeout":
    case "unreachable":
      return o.batch ? "release" : "keep";
    default:
      return "keep";
  }
}

/**
 * Lets a hold go whose call cost nothing or whose cost is counted elsewhere.
 * The delete is tried, then the hold's charge is set to nothing, then the
 * delete once more: a hold left behind is charged when it runs out, and a
 * charge of nothing keeps that from charging a call Anthropic never billed.
 * True when the hold went or will charge nothing.
 */
export async function letHoldGo(steps: { remove: () => Promise<boolean>; zero: () => Promise<boolean> }): Promise<boolean> {
  const tried = async (step: () => Promise<boolean>) => {
    try {
      return await step();
    } catch {
      return false;
    }
  };
  if (await tried(steps.remove)) return true;
  const zeroed = await tried(steps.zero);
  return (await tried(steps.remove)) || zeroed;
}

/**
 * The most output a model can make in a second, well above any rate
 * measured on the account, for bounding what a call that ended early could
 * have been billed.
 */
export const MAX_OUTPUT_TOKENS_PER_SECOND = 300;

/**
 * What a kept hold is charged when it runs out unreleased (charge_micros;
 * reserve_spend records it as spend before it deletes the hold), or null
 * for its worst case. An expired hold used to be deleted for free, so a
 * call that outran the route could be repeated forever with nothing
 * charged. The proxy's 285 s cut, a lost record and a killed function
 * charge the worst case. A call that ended early (its caller went, a
 * connection that broke, a failed read) is charged its expected cost and
 * the most output it could have made in the time it ran, never above its
 * worst case, so a person who closes a tab mid build is not charged every
 * call's worst case. A cost known but not recorded is charged as it is.
 * A batch create's hold is kept only on a failed read, and is charged its
 * worst case, which is also its expected cost.
 */
export function keptCharge(
  event: HoldEvent,
  call: { model: string | null; worstMicros: number; expectedMicros: number; elapsedMs: number; knownMicros?: number; batch?: boolean },
): number | null {
  if (holdOutcome(event, { batch: call.batch }) !== "keep") return null;
  if (event === "record_failed") return call.knownMicros === undefined ? null : Math.max(0, Math.ceil(call.knownMicros));
  if (event === "timeout") return null;
  const perToken = (PRICES[call.model ?? ""] ?? PRICES["claude-opus-5-5"])!.base.output;
  const made = Math.ceil(Math.max(0, call.elapsedMs) / 1000) * MAX_OUTPUT_TOKENS_PER_SECOND * perToken;
  return Math.ceil(Math.min(call.worstMicros, call.expectedMicros + made));
}

/** One model's share of a call, as settle_call and meter_batch take it. */
export interface UsageShare {
  model: string;
  tokens: TokenCounts;
  costMicros: number;
}

/** The arguments of settle_call: the call's usage rows, then its hold, if it has one. */
export function settleArgs(
  account: { userId: string; deviceId: string },
  holdId: string | null,
  kind: "message" | "count_tokens",
  rows: UsageShare[],
  o: { status: number; durationMs: number; requestId: string | null },
) {
  return {
    p_hold: holdId,
    p_user: account.userId,
    p_device: account.deviceId,
    p_kind: kind,
    p_rows: rows.map((r) => ({
      model: r.model || null,
      input: r.tokens.input,
      output: r.tokens.output,
      cacheWrite: r.tokens.cacheWrite,
      cacheRead: r.tokens.cacheRead,
      costMicros: r.costMicros,
    })),
    p_status: o.status,
    p_duration_ms: Math.max(0, Math.round(o.durationMs)),
    p_request_id: o.requestId?.slice(0, 120) ?? null,
  };
}
