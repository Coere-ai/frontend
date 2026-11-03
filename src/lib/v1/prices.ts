/**
 * What a Claude or Jev call costs (docs/accounts.md section 11). A copy of
 * coere-v2's `packages/memory/src/ai/prices.ts`, so the site meters exactly
 * what the extension's own counter would. When that table changes, change
 * this one in the same week.
 *
 * Prices are US dollars per million tokens, which is also micro dollars per
 * token, so a cost in micro dollars is tokens times the price.
 */

/** Dollars per million tokens for one kind of token. */
export interface ModelPrice {
  input: number;
  output: number;
  cacheRead: number;
  /** A 5 minute cache write, 1.25 times input. Coere never asks for the 1 hour cache. */
  cacheWrite: number;
}

export interface PriceEntry {
  base: ModelPrice;
  /** Prices for a request whose whole prompt passes 100K tokens, where a model has them. */
  above100k?: ModelPrice;
}

/** The table's date: a price change is a new table with a new date. */
export const PRICE_TABLE_DATE = "2026-10-22";

const price = (input: number, output: number, cacheRead: number): ModelPrice => ({
  input,
  output,
  cacheRead,
  cacheWrite: input * 1.25,
});

export const PRICES: Readonly<Record<string, PriceEntry>> = {
  "claude-opus-5-5": { base: price(4, 20, 0.2) },
  "claude-sonnet-5-5": { base: price(2, 10, 0.2) },
  "claude-haiku-5-5": { base: price(0.1, 0.5, 0.01), above100k: price(0.5, 2.5, 0.05) },
  // Jev bills input only. Both versions are listed, since the answer may name the older one.
  "jev-1.14.0": { base: price(0.042, 0, 0) },
  "jev-1.13.0": { base: price(0.042, 0, 0) },
};

/** A model with no price is priced as this one, the dearest, so the limit can only stop early. */
const FALLBACK_MODEL = "claude-opus-5-5";

const LONG_PROMPT_TOKENS = 100_000;

/** The tokens of one call, as `usage` reports them. */
export interface TokenCounts {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export function hasPrice(model: string): boolean {
  return Object.hasOwn(PRICES, model);
}

function entryFor(model: string): PriceEntry {
  return PRICES[model] ?? (PRICES[FALLBACK_MODEL] as PriceEntry);
}

/**
 * The cost of one call in whole micro dollars. Output includes thinking. The
 * long prompt tier is judged on the whole prompt, cache reads and writes
 * included; a batch is half of every part.
 */
export function costMicros(model: string, t: TokenCounts, via: "direct" | "batch"): number {
  const entry = entryFor(model);
  const prompt = t.input + t.cacheRead + t.cacheWrite;
  const p = entry.above100k && prompt > LONG_PROMPT_TOKENS ? entry.above100k : entry.base;
  const full = t.input * p.input + t.output * p.output + t.cacheRead * p.cacheRead + t.cacheWrite * p.cacheWrite;
  return Math.round(via === "batch" ? full / 2 : full);
}
