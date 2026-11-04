import "server-only";

import { gate } from "../gate";
import { anthropicFor } from "../refusals";
import { relayAnswer } from "./answers";
import { ownsBatch } from "./batches";
import { anthropicError } from "./errors";
import { forwardToAnthropic } from "./forward";
import { matchAnthropicPath, upstreamSearch, upstreamUrl, type AnthropicOp } from "./paths";
import { prepareRequest } from "./prepare";

/**
 * The Anthropic proxy (docs/accounts.md 8.4), in the order its checks run:
 * the path, the device (token, suspended, per minute, and the lifetime and
 * monthly limits for calls that start new spend), the server's key, the request itself,
 * batch ownership, then the forward and the answer.
 */

/** Calls that start new spend, so the spend limits are checked first. Results of a batch already paid for are not held back. */
const STARTS_SPEND = new Set<AnthropicOp["op"]>(["message", "batch_create"]);

export async function proxyAnthropic(req: Request, segments: string[]): Promise<Response> {
  const started = Date.now();
  const op = matchAnthropicPath(req.method, segments);
  if (!op) return anthropicError("not_found");

  const g = await gate(req, { metered: STARTS_SPEND.has(op.op) });
  if (!g.ok) return anthropicFor(g.refusal, g.retryAfter, g.limit);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return anthropicError("unavailable");

  const prepared = await prepareRequest(req, op);
  if (!prepared.ok) return anthropicError(prepared.error, { model: prepared.model });

  if ("batchId" in op && !(await ownsBatch(g.account.userId, op.batchId))) return anthropicError("not_found");

  const url = upstreamUrl(segments, upstreamSearch(new URL(req.url).searchParams));
  const up = await forwardToAnthropic(req, { url, apiKey, beta: prepared.beta, body: prepared.body });
  if (!up) return anthropicError("upstream");
  return relayAnswer(up, { account: g.account, op, started, requestCount: prepared.requestCount, model: prepared.model ?? null });
}
