import { anthropicError } from "./anthropic/errors";
import { limitWord, type GateRefusal, type SpentLimit } from "./gate-types";
import { json, problem } from "./http";

/**
 * A gate refusal in each route family's own shape: problem details on most
 * routes, Anthropic's error body on the proxy, and Jev's plain
 * `{error}` body (docs/accounts.md 8, 8.4, 8.5). `limit` names the spend
 * limit of a `usage_limit`; without it the month is meant.
 */

const LIMIT_TITLES: Record<"lifetime" | "daily", string> = { lifetime: "Lifetime limit reached", daily: "Daily limit reached" };

export function problemFor(refusal: GateRefusal, retryAfter?: number, limit?: SpentLimit): Response {
  const word = limit ? limitWord(limit) : "monthly";
  const title = refusal === "usage_limit" && word !== "monthly" ? LIMIT_TITLES[word] : undefined;
  return problem(refusal, refusal === "rate_limited" || refusal === "usage_limit" ? retryAfter : undefined, title);
}

export function anthropicFor(refusal: GateRefusal, retryAfter?: number, limit?: SpentLimit): Response {
  if (refusal === "rate_limited") return anthropicError("rate_limited", { retryAfter });
  return anthropicError(refusal, { limit });
}

const JEV_MESSAGE: Record<GateRefusal, string> = {
  signed_out: "signed_out",
  suspended: "account_suspended",
  rate_limited: "rate_limited",
  usage_limit: "usage_limit",
  unavailable: "unavailable",
};

const JEV_STATUS: Record<GateRefusal, number> = {
  signed_out: 401,
  suspended: 403,
  rate_limited: 429,
  usage_limit: 429,
  unavailable: 503,
};

export function jevFor(refusal: GateRefusal, retryAfter?: number): Response {
  const extra: Record<string, string> = {};
  if (retryAfter !== undefined && (refusal === "rate_limited" || refusal === "usage_limit")) {
    extra["retry-after"] = String(Math.max(1, Math.ceil(retryAfter)));
  }
  return json({ error: JEV_MESSAGE[refusal] }, JEV_STATUS[refusal], extra);
}
