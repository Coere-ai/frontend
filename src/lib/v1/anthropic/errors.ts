import { API_HEADERS } from "../http";

/**
 * Errors on the Anthropic routes in Anthropic's own shape (docs/accounts.md
 * 8.4), so the memory runtime's error classes read them as they read the
 * real API's. The spend cap case carries `error_code
 * enforced_spend_limit_reached`, which the runtime treats as a cap and holds
 * until the next month.
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
  details?: { error_code: string };
}

/** The status and body of each case. `model` names the refused model in its message. */
export function anthropicErrorShape(c: AnthropicCase, model?: string): ErrorShape {
  switch (c) {
    case "signed_out":
      return { status: 401, type: "authentication_error", message: "signed_out" };
    case "suspended":
      return { status: 403, type: "permission_error", message: "account_suspended" };
    case "usage_limit":
      return {
        status: 429,
        type: "rate_limit_error",
        message: "usage_limit",
        details: { error_code: "enforced_spend_limit_reached" },
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

/** The body Anthropic sends: `{type:'error', error:{type, message, details?}}`. */
export function anthropicErrorBody(c: AnthropicCase, model?: string) {
  const { type, message, details } = anthropicErrorShape(c, model);
  return { type: "error", error: details ? { type, message, details } : { type, message } };
}

/**
 * The answer. A refusal the client should not retry says so in
 * `x-should-retry`, and a rate limit carries `retry-after` in seconds.
 */
export function anthropicError(c: AnthropicCase, o: { model?: string; retryAfter?: number } = {}): Response {
  const shape = anthropicErrorShape(c, o.model);
  const headers = new Headers({ ...API_HEADERS, "content-type": "application/json" });
  if (o.retryAfter !== undefined) headers.set("retry-after", String(Math.max(1, Math.ceil(o.retryAfter))));
  if (c !== "rate_limited" && c !== "unavailable" && c !== "upstream") headers.set("x-should-retry", "false");
  return new Response(JSON.stringify(anthropicErrorBody(c, o.model)), { status: shape.status, headers });
}
