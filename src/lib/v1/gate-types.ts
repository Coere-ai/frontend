/** Why the gate refused a bearer request (see gate.ts). Kept apart so pure modules can name it. */
export type GateRefusal = "signed_out" | "unavailable" | "suspended" | "rate_limited" | "usage_limit";
