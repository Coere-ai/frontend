import { parseDollars } from "./money";

/**
 * What the operator types for spend limits, checked before any write: an
 * account's own four limits on /admin/users, each plan's on /admin/limits,
 * and which overrides "clear" names. Pure, so the tests pin what each form
 * may store; the server actions only call these and write the result.
 */

/** The four spend limits, in the order the forms show them. */
export const LIMIT_KINDS = ["daily", "first_build", "monthly", "lifetime"] as const;
export type LimitKind = (typeof LIMIT_KINDS)[number];

/** Each kind's column, the same name on plans and profiles. */
export const LIMIT_COLUMNS: Record<LimitKind, string> = {
  daily: "daily_limit_micros",
  first_build: "first_build_limit_micros",
  monthly: "monthly_limit_micros",
  lifetime: "lifetime_limit_micros",
};

/** Each kind's form field and the words a refusal starts with. */
const FIELDS: Record<LimitKind, { name: string; label: string }> = {
  daily: { name: "daily", label: "Daily limit" },
  first_build: { name: "firstBuild", label: "First build allowance" },
  monthly: { name: "monthly", label: "Monthly limit" },
  lifetime: { name: "lifetime", label: "Lifetime limit" },
};

export const fieldName = (kind: LimitKind): string => FIELDS[kind].name;

export type Limits = Record<LimitKind, number | null>;
export type LimitsInput = { ok: true; limits: Limits } | { ok: false; error: string };

type Get = (name: string) => unknown;

function readAll(get: Get, required: readonly LimitKind[]): LimitsInput {
  const limits = {} as Limits;
  for (const kind of LIMIT_KINDS) {
    const { name, label } = FIELDS[kind];
    const parsed = parseDollars(get(name));
    if (!parsed.ok) return { ok: false, error: `${label}: ${parsed.error}` };
    if (parsed.micros === null && required.includes(kind)) return { ok: false, error: `${label}: type an amount in dollars, like 2 or 2.50.` };
    limits[kind] = parsed.micros;
  }
  return { ok: true, limits };
}

/**
 * An account's own limits. Blank is null, which means the plan's, for every
 * one of the four. A blank lifetime limit on the plan means none at all.
 */
export function readAccountLimits(get: Get): LimitsInput {
  return readAll(get, []);
}

/**
 * A plan's limits. The daily, first build and monthly limits must be
 * amounts, since an account with none of its own falls back to them; a
 * blank lifetime limit means the plan has none.
 */
export function readPlanLimits(get: Get): LimitsInput {
  return readAll(get, ["daily", "first_build", "monthly"]);
}

/** One amount that must be there, for "set the daily limit on every plan". */
export function readRequiredDollars(raw: unknown, label: string): { ok: true; micros: number } | { ok: false; error: string } {
  const parsed = parseDollars(raw);
  if (!parsed.ok) return { ok: false, error: `${label}: ${parsed.error}` };
  if (parsed.micros === null) return { ok: false, error: `${label}: type an amount in dollars, like 2 or 2.50.` };
  return { ok: true, micros: parsed.micros };
}

export function isLimitKind(raw: unknown): raw is LimitKind {
  return typeof raw === "string" && (LIMIT_KINDS as readonly string[]).includes(raw);
}

/**
 * "Clear every account's own <kind> limit", which needs the operator's
 * confirm, since it changes every account that has one at once.
 */
export function checkClear(kind: unknown, confirmed: unknown): { ok: true; column: string } | { ok: false; error: string } {
  if (!isLimitKind(kind)) return { ok: false, error: "That limit does not exist. Reload the page." };
  if (confirmed !== true) return { ok: false, error: "Confirm first: this clears the limit on every account that has its own." };
  return { ok: true, column: LIMIT_COLUMNS[kind] };
}

/** A plan id as the plans table holds them. */
export function isPlanId(raw: unknown): raw is string {
  return typeof raw === "string" && /^[a-z0-9_-]{1,40}$/.test(raw);
}
