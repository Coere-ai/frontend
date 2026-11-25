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
  | "upstream"
  | "duration";

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
    case "duration":
      // The proxy ended the call at its 285 s cut (upstream-cut.ts): the work is too long for one call.
      return { status: 504, type: "timeout_error", message: "duration" };
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
 * A call cut at the proxy's 285 s limit is marked `duration`.
 */
export function anthropicError(
  c: AnthropicCase,
  o: { model?: string; retryAfter?: number; limit?: SpentLimit; source?: LimitSource } = {},
): Response {
  const shape = anthropicErrorShape(c, o.model, o.limit);
  const headers = new Headers({ ...API_HEADERS, "content-type": "application/json" });
  if (o.retryAfter !== undefined) headers.set("retry-after", String(Math.max(1, Math.ceil(o.retryAfter))));
  if (shape.status === 429) headers.set(LIMIT_HEADER, o.source ?? "per-minute");
  if (c === "duration") headers.set(LIMIT_HEADER, "duration");
  if (c !== "rate_limited" && c !== "unavailable" && c !== "upstream") headers.set("x-should-retry", "false");
  return new Response(JSON.stringify(anthropicErrorBody(c, o.model, o.limit)), { status: shape.status, headers });
}

/**
 * The answer to a call whose hold reserve_spend refused. Other messages in
 * flight filling the limit is a short wait as a rate limit, so a first build
 * keeps going as their holds go instead of stopping for an hour on a spent
 * limit. Too many calls in flight, or worst cases that could pass the limit
 * by more than the overrun, is a shorter one. The site's first build budget
 * is a spent limit for the day. `null` means reserve_spend could not be asked.
 */
export function holdRefusedAnswer(refused: Extract<Reservation, { ok: false }>["refused"]): Response {
  if (refused === null) return anthropicError("unavailable");
  if (refused === "pending") return anthropicError("rate_limited", { retryAfter: PENDING_RETRY_SECONDS, source: "spend-pending" });
  if (refused === "concurrency") return anthropicError("rate_limited", { retryAfter: CONCURRENCY_RETRY_SECONDS, source: "concurrency" });
  if (refused === "site_budget") return anthropicError("usage_limit", { limit: "daily" });
  return anthropicError("usage_limit", { limit: refused });
}

/** Anthropic's own error types for a 429 or a 5xx; anything else reads as the status's default. */
const UPSTREAM_TYPES = new Set(["rate_limit_error", "overloaded_error", "api_error", "timeout_error"]);

/**
 * The body to pass on for Anthropic's own 429 or 5xx: its error type, which
 * the runtime classes errors by along with the status, with a fixed
 * message. Anthropic's 429 message names Coere's organization and its per
 * minute limit, facts about Coere's whole account that the answer headers
 * already keep back. Null for any other status: a 4xx describes the
 * caller's own request and passes as it is.
 */
export function upstreamErrorText(status: number, body: string): string | null {
  if (status !== 429 && status < 500) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = null;
  }
  const error = typeof parsed === "object" && parsed !== null ? (parsed as { error?: { type?: unknown } }).error : undefined;
  const sent = typeof error?.type === "string" && UPSTREAM_TYPES.has(error.type) ? error.type : null;
  const type = sent ?? (status === 429 ? "rate_limit_error" : status === 529 ? "overloaded_error" : "api_error");
  const message = status === 429 ? "rate_limited" : status === 529 || type === "overloaded_error" ? "overloaded" : "upstream_error";
  return JSON.stringify({ type: "error", error: { type, message } });
}
