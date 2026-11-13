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

/** One request's worst case. `params` has already passed checkParams. */
export function worstCaseMicros(params: Record<string, unknown>, via: "direct" | "batch"): number {
  const model = typeof params.model === "string" ? params.model : "";
  const pictures = allBlocks(params).filter((b) => b.type === "image").length;
  const input = Math.ceil(encoder.encode(JSON.stringify(params)).byteLength / BYTES_PER_TOKEN) + pictures * PICTURE_TOKENS;
  // Never below 0, so one entry of a batch cannot lower the others' share.
  const output = typeof params.max_tokens === "number" ? Math.max(0, params.max_tokens) : MAX_TOKENS_CAP;
  return costMicros(model, { input: 0, output, cacheRead: 0, cacheWrite: input }, via);
}

/** A batch's worst case: every entry's, at batch price. The body has already passed checkBatchBody. */
export function batchWorstCaseMicros(body: unknown): number {
  if (!isRecord(body) || !Array.isArray(body.requests)) return 0;
  let total = 0;
  for (const entry of body.requests) if (isRecord(entry) && isRecord(entry.params)) total += worstCaseMicros(entry.params, "batch");
  return total;
}
