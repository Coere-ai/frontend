/**
 * The checks on each request's params before it is forwarded
 * (docs/accounts.md 8.4): one for a message, each entry for a batch. They
 * keep Coere's key to the models and sizes the extension uses, and refuse a
 * stream, since metering reads the whole answer.
 */

export const ALLOWED_MODELS: ReadonlySet<string> = new Set([
  "claude-opus-5-5",
  "claude-sonnet-5-5",
  "claude-haiku-5-5",
]);

export const ALLOWED_BETAS: ReadonlySet<string> = new Set([
  "message-batches-2024-09-24",
  "token-counting-2024-11-01",
  "server-side-fallback-2026-07-01",
]);

export const MAX_TOKENS_CAP = 64_000;
/**
 * A batch's ceilings: the extension's own (BATCH_MAX_REQUESTS and
 * MAX_TOKENS in coere-v2's memory runtime). A batch may start past a spend
 * limit's headroom (docs/accounts.md 8.10), so these bound how far its
 * worst case can reach.
 */
export const MAX_BATCH_REQUESTS = 500;
export const BATCH_MAX_TOKENS = 16_000;

export type ParamsCheck =
  | { ok: true }
  | { ok: false; reason: "model"; model: string }
  | { ok: false; reason: "bad_request" };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * True when a tool is one Anthropic runs and bills per use (web search,
 * code execution and the like). Those fees are not in `usage`'s token
 * counts, so the meter could not price them; the extension only sends its
 * own client tools, which have no `type` or `custom`.
 */
function isServerTool(tool: unknown): boolean {
  return !isRecord(tool) || (tool.type !== undefined && tool.type !== "custom");
}

/** True when a block asks for a cache other than the 5 minute one, which the price table assumes. */
function hasLongCache(block: unknown): boolean {
  if (!isRecord(block)) return false;
  const cache = block.cache_control;
  if (isRecord(cache) && cache.ttl !== undefined && cache.ttl !== "5m") return true;
  // A tool result holds blocks of its own.
  return Array.isArray(block.content) && block.content.some(hasLongCache);
}

/** Every block that can carry `cache_control`: the system blocks, the tools and each message's content. */
function cacheBlocks(params: Record<string, unknown>): unknown[] {
  const blocks: unknown[] = [];
  if (Array.isArray(params.system)) blocks.push(...params.system);
  if (Array.isArray(params.tools)) blocks.push(...params.tools);
  if (Array.isArray(params.messages)) {
    for (const m of params.messages) if (isRecord(m) && Array.isArray(m.content)) blocks.push(...m.content);
  }
  return blocks;
}

/**
 * One request's params: an allowed model, max_tokens from 1 to 64,000, no
 * stream, and nothing the meter cannot price (a server tool, or a cache
 * longer than 5 minutes, which Anthropic bills at twice input).
 */
export function checkParams(params: unknown): ParamsCheck {
  if (!isRecord(params)) return { ok: false, reason: "bad_request" };
  const { model, max_tokens: maxTokens, stream } = params;
  if (typeof model !== "string") return { ok: false, reason: "bad_request" };
  if (!ALLOWED_MODELS.has(model)) return { ok: false, reason: "model", model: model.slice(0, 80) };
  // A value below 1 would lower the spend reservation: a batch adds its entries' worst cases up.
  if (maxTokens !== undefined && (typeof maxTokens !== "number" || !Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > MAX_TOKENS_CAP)) {
    return { ok: false, reason: "bad_request" };
  }
  if (stream === true) return { ok: false, reason: "bad_request" };
  if (params.tools !== undefined && (!Array.isArray(params.tools) || params.tools.some(isServerTool))) return { ok: false, reason: "bad_request" };
  if (cacheBlocks(params).some(hasLongCache)) return { ok: false, reason: "bad_request" };
  return { ok: true };
}

/** A batch create body: at most 500 entries, each passing with max_tokens at most 16,000; the count is kept for the batch row. */
export function checkBatchBody(body: unknown): ParamsCheck & { count?: number } {
  if (!isRecord(body) || !Array.isArray(body.requests)) return { ok: false, reason: "bad_request" };
  const requests = body.requests as unknown[];
  if (requests.length === 0 || requests.length > MAX_BATCH_REQUESTS) return { ok: false, reason: "bad_request" };
  for (const entry of requests) {
    if (!isRecord(entry)) return { ok: false, reason: "bad_request" };
    const check = checkParams(entry.params);
    if (!check.ok) return check;
    const maxTokens = (entry.params as Record<string, unknown>).max_tokens;
    if (typeof maxTokens !== "number" || maxTokens > BATCH_MAX_TOKENS) return { ok: false, reason: "bad_request" };
  }
  return { ok: true, count: requests.length };
}

/**
 * The `anthropic-beta` header to forward: null when absent, the header when
 * every comma separated value is allowed, false when any is not.
 */
export function checkBeta(header: string | null): string | null | false {
  if (header === null) return null;
  const values = header.split(",").map((v) => v.trim()).filter(Boolean);
  if (values.length === 0) return null;
  return values.every((v) => ALLOWED_BETAS.has(v)) ? values.join(",") : false;
}
