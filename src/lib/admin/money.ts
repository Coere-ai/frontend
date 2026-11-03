/**
 * Dollar amounts the operator types for an account's limits, and the
 * storage price. Money is kept as integer micro dollars (docs/accounts.md
 * 2). Pure, so the tests pin what each input stores.
 */

const MICROS = 1_000_000;

/** The most a limit may be: a typo of extra zeros should not open an account to any spend. */
export const MAX_LIMIT_DOLLARS = 100_000;

export type DollarInput = { ok: true; micros: number | null } | { ok: false; error: string };

/**
 * "12", "12.5", "$1,000.25" become micro dollars. Blank becomes null, which
 * means the plan's limit. Anything else, a negative amount, more than two
 * decimals or more than the cap, is refused with words that say why.
 */
export function parseDollars(raw: unknown): DollarInput {
  if (raw === null || raw === undefined) return { ok: true, micros: null };
  if (typeof raw !== "string") return { ok: false, error: "Type an amount in dollars." };
  const text = raw.trim().replace(/^\$/, "").replace(/,/g, "").trim();
  if (text === "") return { ok: true, micros: null };
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return { ok: false, error: "Type an amount in dollars, like 25 or 12.50." };
  const [whole, cents = ""] = text.split(".");
  const micros = Number(whole) * MICROS + Number(cents.padEnd(2, "0")) * 10_000;
  if (micros > MAX_LIMIT_DOLLARS * MICROS) return { ok: false, error: `A limit can be at most $${MAX_LIMIT_DOLLARS.toLocaleString("en-US")}.` };
  return { ok: true, micros };
}

/** Micro dollars as the plain amount a form field shows ("12.50"), or blank for none. */
export function dollarField(micros: number | null): string {
  if (micros === null || !Number.isFinite(micros)) return "";
  const cents = Math.round(micros / 10_000);
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

/** Storage's price, USD per GB month (docs/accounts.md 9). A GB here is 1,024 MiB, as Supabase bills it. */
export const STORAGE_USD_PER_GB_MONTH = 0.021;
const GB = 1024 ** 3;

/** What `bytes` held for a whole month costs, in micro dollars, rounded to the nearest one. */
export function storageMonthMicros(bytes: number): number {
  const b = Number.isFinite(bytes) && bytes > 0 ? bytes : 0;
  return Math.round((b / GB) * STORAGE_USD_PER_GB_MONTH * MICROS);
}
