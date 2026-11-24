import type { SpentLimit } from "./gate-types";
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

/** The most holds an account may have at once, about 100 calls in flight and room to spare. */
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
 * `refused: null` means reserve_spend could not be asked.
 */
export type Reservation =
  | { ok: true; holdId: string }
  | { ok: false; refused: SpentLimit }
  | { ok: false; refused: null }
  | { ok: false; refused: "pending" }
  | { ok: false; refused: "concurrency" };

/** A reserve_spend row as a Reservation. A refusal it does not know reads as the month, as before. */
export function readReservation(data: unknown): Reservation {
  const row = (Array.isArray(data) ? data[0] : data) as { hold_id?: unknown; refused?: unknown } | null | undefined;
  if (typeof row?.hold_id === "string" && row.hold_id) return { ok: true, holdId: row.hold_id };
  const refused = typeof row?.refused === "string" ? row.refused : null;
  if (refused === "pending" || refused === "concurrency") return { ok: false, refused };
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
