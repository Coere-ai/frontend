import "server-only";

import type { DeviceAccount } from "../device-auth";
import type { HoldEvent } from "../hold-rules";
import { NO_TOKENS } from "../meter";
import { costMicros } from "../prices";
import { settleCall } from "../spend-holds";
import { forgetBatch, meterBatch, storeBatch } from "./batches";
import { anthropicError, upstreamErrorText } from "./errors";
import { cancelUpstreamBatch } from "./forward";
import { answerHeaders } from "./headers";
import { goneUpstream, type AnthropicOp } from "./paths";
import { meteredResults } from "./results-stream";
import { serverAccountError } from "./server-errors";
import { attemptsOf, byModel } from "./usage";

/**
 * What the proxy does with Anthropic's answer, by path (docs/accounts.md
 * 8.4): meter a message and let its hold go (settle_call), store a new
 * batch as the caller's, forget a deleted one, and meter batch results as
 * they stream through. Only the kept answer headers go back, with
 * Anthropic's own 429 marked as `upstream` (limit-marker.ts), and its 429
 * and 5xx bodies with a fixed message. The answer comes with what happened
 * to the call, which says what becomes of its hold (holdOutcome).
 */

interface AnswerContext {
  account: DeviceAccount;
  op: AnthropicOp;
  started: number;
  requestCount: number;
  /** The model the request asked for, for a fallback attempt that names none. */
  model: string | null;
  /** A new batch's worst case, stored as its reservation. */
  worstMicros: number;
  /** What a follow up call to Anthropic needs: Coere's key and the caller's version and beta. */
  upstream: { apiKey: string; version: string | null; beta: string | null };
  /** The call's hold, which settle_call lets go with a message's usage rows. */
  holdId: string | null;
  /** True once the proxy's 285 s cut ended the call (upstream-cut.ts). */
  cut: () => boolean;
}

export interface Relayed {
  res: Response;
  event: HoldEvent;
  /** A cost known but not recorded, which the kept hold is charged when it runs out. */
  knownMicros?: number;
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

/** The answer's body, or why it could not be read: the proxy's cut, or anything else. */
async function readText(up: Response, c: AnswerContext): Promise<{ ok: true; text: string } | { ok: false; relayed: Relayed }> {
  try {
    return { ok: true, text: await up.text() };
  } catch {
    if (c.cut()) return { ok: false, relayed: { res: anthropicError("duration"), event: "timeout" } };
    return { ok: false, relayed: { res: anthropicError("upstream"), event: "read_failed" } };
  }
}

export async function relayAnswer(up: Response, c: AnswerContext): Promise<Relayed> {
  const headers = answerHeaders(up.headers, up.status);
  const requestId = up.headers.get("request-id");
  const status = up.status;
  const op = c.op;

  // An error is read whole, once: it may be about Coere's own account (a
  // refused key, no credit, Coere's spend limit), which must not reach the
  // extension as the person's own billing or sign in trouble.
  let failure: string | null = null;
  if (!up.ok) {
    const read = await readText(up, c);
    if (!read.ok) return read.relayed;
    failure = read.text;
    const server = serverAccountError(status, failure);
    if (server) {
      console.error("anthropic refused coere's account", server);
      return { res: anthropicError("unavailable"), event: "upstream_error" };
    }
    // Anthropic's own 429 and 5xx carry facts about Coere's whole account; a fixed message goes on instead.
    const fixed = upstreamErrorText(status, failure);
    if (fixed !== null) {
      failure = fixed;
      headers.set("content-type", "application/json");
    }
  }

  if (op.op === "batch_results") {
    if (failure !== null || !up.body) return { res: new Response(failure, { status, headers }), event: "upstream_error" };
    const body = meteredResults(up.body, async (totals) => {
      // A batch whose every item failed costs nothing, and is marked metered all the same.
      const rows = [...totals].map(([model, t]) => ({ model, tokens: t.tokens, costMicros: t.costMicros }));
      const metered = await meterBatch(c.account, op.batchId, rows, { status, durationMs: Date.now() - c.started, requestId });
      // Thrown so the read breaks rather than ends, and the extension reads again instead of deleting the batch.
      if (!metered) throw new Error("batch not metered");
    });
    return { res: new Response(body, { status, headers }), event: "settled" };
  }

  if (failure !== null) {
    // A 404 to a delete: the batch went at Anthropic on an earlier try, so its row goes now.
    if (op.op === "batch_delete" && goneUpstream(op, status)) await forgetBatch(c.account.userId, op.batchId);
    return { res: new Response(failure, { status, headers }), event: "upstream_error" };
  }
  const read = await readText(up, c);
  if (!read.ok) return read.relayed;
  const text = read.text;
  const data = parse(text);
  const answered = () => ({ res: new Response(text, { status, headers }) });
  const timing = () => ({ status, durationMs: Date.now() - c.started, requestId });

  if (op.op === "message") {
    // One row per model that ran, so a declined fallback attempt is paid for too.
    const models = byModel(attemptsOf(data, c.model));
    if (models.size === 0) models.set(c.model ?? "", NO_TOKENS);
    const rows = [...models].map(([model, tokens]) => ({ model, tokens, costMicros: costMicros(model, tokens, "direct") }));
    // The rows and the hold's release are one round trip; the person's answer waits for it, so the limits never lose sight of the cost.
    const settled = await settleCall(c.account, c.holdId, "message", rows, timing());
    if (!settled) console.error("message cost not recorded, hold kept to run out");
    if (settled) return { ...answered(), event: "settled" };
    return { ...answered(), event: "record_failed", knownMicros: rows.reduce((sum, r) => sum + r.costMicros, 0) };
  }
  if (op.op === "count_tokens") {
    // Counting is free; the row counts the request without adding tokens to the totals.
    await settleCall(c.account, null, "count_tokens", [{ model: "", tokens: NO_TOKENS, costMicros: 0 }], timing());
    return { ...answered(), event: "settled" };
  }
  if (op.op === "batch_create") {
    if (!isRecord(data) || typeof data.id !== "string") return { ...answered(), event: "not_stored" };
    if (!(await storeBatch(c.account, data.id, c.requestCount, c.worstMicros))) {
      // Unrecorded, the batch would run and bill while every read of it
      // answered 404. Stop it and answer 503, so the extension submits again.
      await cancelUpstreamBatch(data.id, c.upstream);
      return { res: anthropicError("unavailable"), event: "not_stored" };
    }
    return { ...answered(), event: "stored" };
  }
  if (op.op === "batch_delete") await forgetBatch(c.account.userId, op.batchId);
  return { ...answered(), event: "settled" };
}
