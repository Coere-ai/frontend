import "server-only";

import { gate, hitRate, noteUsageLimited } from "../gate";
import { messageLane } from "../lanes";
import { PENDING_RETRY_SECONDS, releaseHold, reserveSpend } from "../spend-holds";
import { anthropicFor } from "../refusals";
import { relayAnswer } from "./answers";
import { listOwnBatches } from "./batch-list";
import { ownsBatch } from "./batches";
import { anthropicError } from "./errors";
import { forwardToAnthropic } from "./forward";
import { matchAnthropicPath, upstreamSearch, upstreamUrl, type AnthropicOp } from "./paths";
import { prepareRequest } from "./prepare";

/**
 * The Anthropic proxy (docs/accounts.md 8.4), in the order its checks run:
 * the path, the device (token, suspended, per minute, and the spend limits
 * for calls that start new spend), the server's key, the
 * request itself (a message's per minute check comes here, once its model
 * names its lane), batch ownership, the hold on the call's worst case, then
 * the forward and the answer.
 */

/** Calls that start new spend, so the spend limits are checked first. Results of a batch already paid for are not held back. */
const STARTS_SPEND = new Set<AnthropicOp["op"]>(["message", "batch_create"]);

export async function proxyAnthropic(req: Request, segments: string[]): Promise<Response> {
  const started = Date.now();
  const op = matchAnthropicPath(req.method, segments);
  if (!op) return anthropicError("not_found");

  // A message's per minute bucket follows its model, read from the body, so its check waits for the body.
  const later = op.op === "message";
  const g = await gate(req, { metered: STARTS_SPEND.has(op.op), lane: later ? "later" : op.op === "count_tokens" ? "count" : "default" });
  if (!g.ok) return anthropicFor(g.refusal, g.retryAfter, g.limit);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return anthropicError("unavailable");

  const prepared = await prepareRequest(req, op);
  if (later) {
    const rate = hitRate(g.account, messageLane(prepared.ok ? prepared.model : undefined), req.headers);
    if (rate) return anthropicFor(rate.refusal, rate.retryAfter);
  }
  if (!prepared.ok) return anthropicError(prepared.error, { model: prepared.model });

  if ("batchId" in op) {
    const owned = await ownsBatch(g.account.userId, op.batchId);
    if (owned === null) return anthropicError("unavailable");
    if (!owned) return anthropicError("not_found");
  }

  if (op.op === "batch_list") {
    return listOwnBatches(g.account.userId, new URL(req.url).searchParams, { apiKey, version: req.headers.get("anthropic-version"), beta: prepared.beta });
  }

  // The gate saw spend already recorded; this holds the call's worst case
  // against what is left, counting every other call still in flight.
  let holdId: string | null = null;
  if (STARTS_SPEND.has(op.op)) {
    const held = await reserveSpend(g.account.userId, prepared.worstMicros, { batch: op.op === "batch_create" });
    if (!held.ok && !held.refused) return anthropicError("unavailable");
    // Other messages in flight fill the limit for now: a short wait, as a per minute refusal, so a
    // first build keeps going as their holds go instead of stopping for an hour on a spent limit.
    if (!held.ok && held.refused === "pending") return anthropicError("rate_limited", { retryAfter: PENDING_RETRY_SECONDS });
    if (!held.ok) {
      noteUsageLimited(g.account, req.headers);
      return anthropicError("usage_limit", { limit: held.refused ?? undefined });
    }
    holdId = held.holdId;
  }
  try {
    const url = upstreamUrl(segments, upstreamSearch(new URL(req.url).searchParams));
    const up = await forwardToAnthropic(req, { url, apiKey, beta: prepared.beta, body: prepared.body });
    if (!up) return anthropicError("upstream");
    return await relayAnswer(up, {
      account: g.account,
      op,
      started,
      requestCount: prepared.requestCount,
      model: prepared.model ?? null,
      worstMicros: prepared.worstMicros,
      upstream: { apiKey, version: req.headers.get("anthropic-version"), beta: prepared.beta },
    });
  } finally {
    // A message's cost is recorded and a batch's reservation stored by now.
    if (holdId) await releaseHold(holdId);
  }
}
