import "server-only";

import type { DeviceAccount } from "../device-auth";
import { NO_TOKENS, recordUsage } from "../meter";
import { costMicros } from "../prices";
import { claimMetering, ownedBatchIds, storeBatch } from "./batches";
import { anthropicError } from "./errors";
import { answerHeaders } from "./headers";
import type { AnthropicOp } from "./paths";
import { meteredResults } from "./results-stream";
import { serverAccountError } from "./server-errors";
import { attemptsOf, byModel } from "./usage";

/**
 * What the proxy does with Anthropic's answer, by path (docs/accounts.md
 * 8.4): meter a message, store a new batch as the caller's, cut a batch list
 * to the caller's own, and meter batch results as they stream through. Only
 * the kept answer headers go back.
 */

interface AnswerContext {
  account: DeviceAccount;
  op: AnthropicOp;
  started: number;
  requestCount: number;
  /** The model the request asked for, for a fallback attempt that names none. */
  model: string | null;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function parse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function relayAnswer(up: Response, c: AnswerContext): Promise<Response> {
  const headers = answerHeaders(up.headers);
  const requestId = up.headers.get("request-id");
  const status = up.status;
  const op = c.op;

  // An error is read whole, once: it may be about Coere's own account (a
  // refused key, no credit, Coere's spend limit), which must not reach the
  // extension as the person's own billing or sign in trouble.
  const failure = up.ok ? null : await up.text();
  if (failure !== null) {
    const server = serverAccountError(status, failure);
    if (server) {
      console.error("anthropic refused coere's account", server);
      return anthropicError("unavailable");
    }
  }

  if (op.op === "batch_results") {
    if (failure !== null || !up.body) return new Response(failure, { status, headers });
    const body = meteredResults(up.body, async (totals) => {
      if (totals.size === 0 || !(await claimMetering(c.account.userId, op.batchId))) return;
      for (const [model, t] of totals) {
        await recordUsage(c.account, {
          kind: "batch_result",
          model,
          tokens: t.tokens,
          costMicros: t.costMicros,
          status,
          durationMs: Date.now() - c.started,
          requestId,
        });
      }
    });
    return new Response(body, { status, headers });
  }

  if (failure !== null) return new Response(failure, { status, headers });
  const text = await up.text();
  const data = parse(text);

  if (op.op === "message") {
    // One row per model that ran, so a declined fallback attempt is paid for too.
    const models = byModel(attemptsOf(data, c.model));
    if (models.size === 0) models.set(c.model ?? "", NO_TOKENS);
    for (const [model, tokens] of models) {
      await recordUsage(c.account, {
        kind: "message",
        model: model || null,
        tokens,
        costMicros: costMicros(model, tokens, "direct"),
        status,
        durationMs: Date.now() - c.started,
        requestId,
      });
    }
  } else if (op.op === "count_tokens") {
    // Counting is free; the row counts the request without adding tokens to the totals.
    await recordUsage(c.account, { kind: "count_tokens", model: null, tokens: NO_TOKENS, costMicros: 0, status, durationMs: Date.now() - c.started, requestId });
  } else if (op.op === "batch_create" && isRecord(data) && typeof data.id === "string") {
    await storeBatch(c.account, data.id, c.requestCount);
  } else if (op.op === "batch_list" && isRecord(data) && Array.isArray(data.data)) {
    const items = data.data.filter(isRecord);
    const ids = items.map((b) => b.id).filter((id): id is string => typeof id === "string");
    const own = await ownedBatchIds(c.account.userId, ids);
    const cut = { ...data, data: items.filter((b) => typeof b.id === "string" && own.has(b.id)) };
    return new Response(JSON.stringify(cut), { status, headers });
  }
  return new Response(text, { status, headers });
}
