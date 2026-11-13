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

/**
 * Every block of a request, the ones inside another included: the system
 * blocks, the tools, each message's content, a tool result's content and a
 * document made of blocks.
 */
export function allBlocks(params: Record<string, unknown>): Record<string, unknown>[] {
  const todo: unknown[] = [];
  const add = (list: unknown) => {
    if (Array.isArray(list)) for (const item of list) todo.push(item);
  };
  add(params.system);
  add(params.tools);
  if (Array.isArray(params.messages)) for (const m of params.messages) if (isRecord(m)) add(m.content);

  const blocks: Record<string, unknown>[] = [];
  while (todo.length > 0) {
    const block = todo.pop();
    if (!isRecord(block)) continue;
    blocks.push(block);
    add(block.content);
    if (isRecord(block.source)) add(block.source.content);
  }
  return blocks;
}

/** True when a block asks for a cache other than the 5 minute one, which the price table assumes. */
function hasLongCache(block: Record<string, unknown>): boolean {
  const cache = block.cache_control;
  return isRecord(cache) && cache.ttl !== undefined && cache.ttl !== "5m";
}

/**
 * True when a block's input is not sized by the request's own bytes, which
 * is all the spend reservation can count: a picture or a document Anthropic
 * fetches from an address or a stored file, and a PDF, read page by page at
 * up to thousands of tokens each however small the file. Text, blocks and a
 * picture's own base64 pass.
 */
function hasUnsizedSource(block: Record<string, unknown>): boolean {
  const source = block.source;
  if (!isRecord(source) || source.type === "text" || source.type === "content") return false;
  return !(block.type === "image" && source.type === "base64");
}

/**
 * True when the request asks for a way of running the model that Anthropic
 * bills above the price table: fast mode, at twice the price, or inference
 * held to one region, at a tenth more. `usage` reports the same tokens
 * either way, so the meter and the reservation would both come out low.
 */
function hasDearerRun(params: Record<string, unknown>): boolean {
  const { speed, inference_geo: geo } = params;
  return (speed !== undefined && speed !== "standard") || (geo !== undefined && geo !== "global");
}

/**
 * One request's params: an allowed model, max_tokens from 1 to 64,000, no
 * stream, nothing the meter cannot price (a server tool, a cache longer
 * than 5 minutes, which Anthropic bills at twice input, a fallback list,
 * fast mode or a region), and no input the reservation cannot size.
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
  // Only a missing or false `stream` passes: a value another reader could take for true would come back as a stream.
  if (stream !== undefined && stream !== false) return { ok: false, reason: "bad_request" };
  if (params.tools !== undefined && (!Array.isArray(params.tools) || params.tools.some(isServerTool))) return { ok: false, reason: "bad_request" };
  const blocks = allBlocks(params);
  // `cache_control` at the top of a request sets the cache for the whole prompt.
  if (hasLongCache(params) || blocks.some(hasLongCache) || blocks.some(hasUnsizedSource)) return { ok: false, reason: "bad_request" };
  // The extension only asks for the default fallback; a list could name a model outside the three.
  if (params.fallbacks !== undefined && params.fallbacks !== "default") return { ok: false, reason: "bad_request" };
  if (hasDearerRun(params)) return { ok: false, reason: "bad_request" };
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
