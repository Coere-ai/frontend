/**
 * The Anthropic paths the extension uses, and nothing else (docs/accounts.md
 * 8.4). The route hands in the method and the path segments after
 * `/api/v1/anthropic/`; anything not listed here answers 404.
 */

export type AnthropicOp =
  | { op: "message" }
  | { op: "count_tokens" }
  | { op: "batch_create" }
  | { op: "batch_list" }
  | { op: "batch_get"; batchId: string }
  | { op: "batch_cancel"; batchId: string }
  | { op: "batch_delete"; batchId: string }
  | { op: "batch_results"; batchId: string };

/** A batch id as Anthropic makes them (`msgbatch_` and letters); anything stranger is not a path we forward. */
const BATCH_ID = /^[A-Za-z0-9_-]{1,128}$/;

export function matchAnthropicPath(method: string, segments: readonly string[]): AnthropicOp | null {
  const [v1, messages, third, fourth, fifth, ...rest] = segments;
  if (v1 !== "v1" || messages !== "messages" || rest.length > 0) return null;
  if (third === undefined) return method === "POST" ? { op: "message" } : null;
  if (third === "count_tokens") return method === "POST" && fourth === undefined ? { op: "count_tokens" } : null;
  if (third !== "batches") return null;
  if (fourth === undefined) {
    if (method === "POST") return { op: "batch_create" };
    if (method === "GET") return { op: "batch_list" };
    return null;
  }
  if (!BATCH_ID.test(fourth)) return null;
  const batchId = fourth;
  if (fifth === undefined) {
    if (method === "GET") return { op: "batch_get", batchId };
    if (method === "DELETE") return { op: "batch_delete", batchId };
    return null;
  }
  if (fifth === "cancel" && method === "POST") return { op: "batch_cancel", batchId };
  if (fifth === "results" && method === "GET") return { op: "batch_results", batchId };
  return null;
}

/**
 * True for a call the proxy sees through after its caller has gone. Once
 * Anthropic has a batch create or a batch delete, the proxy must store or
 * forget the row: a new batch with no row runs and bills with nobody able
 * to read it, and the extension, finding it in no list, sends its requests
 * again. Every other call stops with its caller, so a closed tab stops the
 * spend.
 */
export function outlivesCaller(op: AnthropicOp): boolean {
  return op.op === "batch_create" || op.op === "batch_delete";
}

/**
 * True when Anthropic's answer to a delete means the batch is gone there:
 * the delete worked, or it answers 404 because an earlier delete got
 * through and the proxy's own bookkeeping did not. Either way the proxy
 * forgets its row, or the row, and a reservation not yet metered, would
 * stay behind a batch the extension already counts as gone.
 */
export function goneUpstream(op: AnthropicOp, status: number): boolean {
  return op.op === "batch_delete" && ((status >= 200 && status < 300) || status === 404);
}

/** The upstream address: the same path and query on Anthropic's host. */
export function upstreamUrl(segments: readonly string[], search: string): string {
  return `https://api.anthropic.com/${segments.map(encodeURIComponent).join("/")}${search}`;
}

/** The query keys the SDK sends on these paths; anything else is dropped. */
const QUERY_KEYS = new Set(["beta", "limit", "after_id", "before_id"]);

export function upstreamSearch(params: URLSearchParams): string {
  const kept = new URLSearchParams();
  for (const [k, v] of params) if (QUERY_KEYS.has(k)) kept.append(k, v);
  const s = kept.toString();
  return s ? `?${s}` : "";
}
