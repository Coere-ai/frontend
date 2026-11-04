/** Why the gate refused a bearer request (see gate.ts). Kept apart so pure modules can name it. */
export type GateRefusal = "signed_out" | "unavailable" | "suspended" | "rate_limited" | "usage_limit";

/**
 * Which limit a `usage_limit` refusal is about. Each answers `usage_limit`;
 * the wording names the one spent. `first_build` is the allowance of the free
 * first memory build, which stands in for the daily limit until that build
 * finishes, and is worded as the daily one so nothing new shows.
 */
export type SpentLimit = "monthly" | "lifetime" | "daily" | "first_build";

/** The word a refusal uses for a spent limit: "You have reached your specified <word> usage limit". */
export function limitWord(limit: SpentLimit): "monthly" | "lifetime" | "daily" {
  return limit === "first_build" ? "daily" : limit;
}
