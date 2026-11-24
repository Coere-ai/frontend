import { costMicros } from "../prices";
import { allBlocks, MAX_TOKENS_CAP } from "./params";

/**
 * The most a request can cost, before it is forwarded, for the spend
 * reservation (docs/accounts.md 8.10). Spend is recorded only after
 * Anthropic answers, so without this one call, or many at once, could run
 * far past a limit that still read as unspent.
 *
 * Input is counted as one token per two bytes of the request's JSON: real
 * text runs three to four bytes a token, so this sits well above any real
 * count. A picture counts by its size in pixels, not in bytes, so each adds
 * a full size picture's tokens on top of its base64. Every input token is
 * priced as a cache write, the dearest kind. Output is the request's
 * max_tokens, or the proxy's cap when it names none. A batch is half price.
 */

const BYTES_PER_TOKEN = 2;
/** Above the 4,784 tokens a picture of the largest size counts, which a plain one reaches in a few hundred bytes. */
const PICTURE_TOKENS = 5_000;

const encoder = new TextEncoder();

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** The request's max_tokens, never below 0 so one entry of a batch cannot lower the others' share, or the proxy's cap. */
function maxTokensOf(params: Record<string, unknown>): number {
  return typeof params.max_tokens === "number" ? Math.max(0, params.max_tokens) : MAX_TOKENS_CAP;
}

/** Input tokens counted at `bytesPerToken`, with a full size picture's tokens for each picture. */
function inputTokensOf(params: Record<string, unknown>, bytesPerToken: number): number {
  const pictures = allBlocks(params).filter((b) => b.type === "image").length;
  return Math.ceil(encoder.encode(JSON.stringify(params)).byteLength / bytesPerToken) + pictures * PICTURE_TOKENS;
}

const modelOf = (params: Record<string, unknown>): string => (typeof params.model === "string" ? params.model : "");

/** One request's worst case. `params` has already passed checkParams. */
export function worstCaseMicros(params: Record<string, unknown>, via: "direct" | "batch"): number {
  const input = inputTokensOf(params, BYTES_PER_TOKEN);
  return costMicros(modelOf(params), { input: 0, output: maxTokensOf(params), cacheRead: 0, cacheWrite: input }, via);
}

/**
 * What a request will most likely cost, which reserve_spend weighs against
 * the limit while it runs. The worst case alone filled the $10 first build
 * allowance with about 47 Sonnet calls in flight before anything was spent,
 * although a real call writes a few hundred output tokens. So the limit is
 * weighed by this, and the worst cases only bound how far all the calls in
 * flight together could pass it (OVERRUN_MICROS in hold-rules.ts).
 *
 * Input is three bytes a token, still above real text's three to four, every
 * token priced as a cache write; output is max_tokens up to
 * HOLD_OUTPUT_TOKENS. Never above the worst case.
 */
export const HOLD_OUTPUT_TOKENS = 2_000;
const EXPECTED_BYTES_PER_TOKEN = 3;

export function expectedCaseMicros(params: Record<string, unknown>, via: "direct" | "batch"): number {
  const input = inputTokensOf(params, EXPECTED_BYTES_PER_TOKEN);
  const output = Math.min(maxTokensOf(params), HOLD_OUTPUT_TOKENS);
  return Math.min(costMicros(modelOf(params), { input: 0, output, cacheRead: 0, cacheWrite: input }, via), worstCaseMicros(params, via));
}

/** A batch's worst case: every entry's, at batch price. The body has already passed checkBatchBody. */
export function batchWorstCaseMicros(body: unknown): number {
  if (!isRecord(body) || !Array.isArray(body.requests)) return 0;
  let total = 0;
  for (const entry of body.requests) if (isRecord(entry) && isRecord(entry.params)) total += worstCaseMicros(entry.params, "batch");
  return total;
}
