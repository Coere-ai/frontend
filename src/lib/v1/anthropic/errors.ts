import { limitWord, type SpentLimit } from "../gate-types";
import { API_HEADERS } from "../http";
import { CONCURRENCY_RETRY_SECONDS, PENDING_RETRY_SECONDS, type Reservation } from "../hold-rules";
import { LIMIT_HEADER, type LimitSource } from "../limit-marker";

/**
 * Errors on the Anthropic routes in Anthropic's own shape (docs/accounts.md
 * 8.4), so the memory runtime's error classes read them as they read the
 * real API's. A spent limit is the 400 Anthropic itself sends for a spent
 * account: the runtime reads a message starting "You have reached your
 * specified" as a spend limit, holds the queue and tries again every hour,
 * so an operator raising the limit lets work go on within the hour.
 */

export type AnthropicCase =
  | "signed_out"
  | "suspended"
  | "usage_limit"
  | "rate_limited"
  | "model"
  | "beta"
  | "too_large"
  | "unavailable"
  | "not_found"
  | "bad_request"
  | "upstream";

interface ErrorShape {
  status: number;
  type: string;
  message: string;
}

/** The status and body of each case. `model` names the refused model; `limit` the spent limit (the month by default). */
export function anthropicErrorShape(c: AnthropicCase, model?: string, limit: SpentLimit = "monthly"): ErrorShape {
  switch (c) {
    case "signed_out":
      return { status: 401, type: "authentication_error", message: "signed_out" };
    case "suspended":
      return { status: 403, type: "permission_error", message: "account_suspended" };
    case "usage_limit":
      return {
        status: 400,
        type: "invalid_request_error",
        message: `You have reached your specified ${limitWord(limit)} usage limit on coere.ai.`,
      };
    case "rate_limited":
      return { status: 429, type: "rate_limit_error", message: "rate_limited" };
    case "model":
      return { status: 404, type: "not_found_error", message: `model: ${model ?? ""}` };
    case "beta":
      return {
        status: 400,
        type: "invalid_request_error",
        message: "Unexpected value(s) for the `anthropic-beta` header.",
      };
    case "too_large":
      return { status: 413, type: "request_too_large", message: "request_too_large" };
    case "unavailable":
      return { status: 503, type: "api_error", message: "unavailable" };
    case "not_found":
      return { status: 404, type: "not_found_error", message: "not_found" };
    case "bad_request":
      return { status: 400, type: "invalid_request_error", message: "bad_request" };
    case "upstream":
      return { status: 502, type: "api_error", message: "upstream_unreachable" };
  }
}

/** The body Anthropic sends: `{type:'error', error:{type, message}}`. */
export function anthropicErrorBody(c: AnthropicCase, model?: string, limit?: SpentLimit) {
  const { type, message } = anthropicErrorShape(c, model, limit);
  return { type: "error", error: { type, message } };
}

/**
 * The answer. A refusal the client should not retry says so in
 * `x-should-retry`, and a rate limit carries `retry-after` in seconds and
 * names what refused it in `x-coere-limit` (limit-marker.ts): `source`, or
 * the per minute lane when none is given, since that is the gate's refusal.
 */
export function anthropicError(
  c: AnthropicCase,
  o: { model?: string; retryAfter?: number; limit?: SpentLimit; source?: LimitSource } = {},
): Response {
  const shape = anthropicErrorShape(c, o.model, o.limit);
  const headers = new Headers({ ...API_HEADERS, "content-type": "application/json" });
  if (o.retryAfter !== undefined) headers.set("retry-after", String(Math.max(1, Math.ceil(o.retryAfter))));
  if (shape.status === 429) headers.set(LIMIT_HEADER, o.source ?? "per-minute");
  if (c !== "rate_limited" && c !== "unavailable" && c !== "upstream") headers.set("x-should-retry", "false");
  return new Response(JSON.stringify(anthropicErrorBody(c, o.model, o.limit)), { status: shape.status, headers });
}

/**
 * The answer to a call whose hold reserve_spend refused. Other messages in
 * flight filling the limit is a short wait as a rate limit, so a first build
 * keeps going as their holds go instead of stopping for an hour on a spent
 * limit. Too many calls in flight, or worst cases that could pass the limit
 * by more than the overrun, is a shorter one. `null` means reserve_spend
 * could not be asked.
 */
export function holdRefusedAnswer(refused: Extract<Reservation, { ok: false }>["refused"]): Response {
  if (refused === null) return anthropicError("unavailable");
  if (refused === "pending") return anthropicError("rate_limited", { retryAfter: PENDING_RETRY_SECONDS, source: "spend-pending" });
  if (refused === "concurrency") return anthropicError("rate_limited", { retryAfter: CONCURRENCY_RETRY_SECONDS, source: "concurrency" });
  return anthropicError("usage_limit", { limit: refused });
}
