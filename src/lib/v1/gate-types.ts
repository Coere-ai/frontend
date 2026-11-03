/** Why the gate refused a bearer request (see gate.ts). Kept apart so pure modules can name it. */
export type GateRefusal = "signed_out" | "unavailable" | "suspended" | "rate_limited" | "usage_limit";

/** Which limit a `usage_limit` refusal is about. Both answer `usage_limit`; the wording names the one spent. */
export type SpentLimit = "monthly" | "lifetime";
