import "server-only";

import { gate, hitRate, noteConcurrencyLimited, noteUsageLimited } from "../gate";
import { holdOutcome, keptCharge, type HoldEvent } from "../hold-rules";
import { messageLane } from "../lanes";
import { releaseHold, reserveSpend, setHoldCharge } from "../spend-holds";
import { anthropicFor } from "../refusals";
import { parseBearer } from "../token";
import { relayAnswer } from "./answers";
import { listOwnBatches } from "./batch-list";
import { ownsBatch } from "./batches";
import { anthropicError, holdRefusedAnswer } from "./errors";
import { forwardToAnthropic } from "./forward";
import { matchAnthropicPath, outlivesCaller, upstreamSearch, upstreamUrl, type AnthropicOp } from "./paths";
import { prepareRequest } from "./prepare";

/**
 * The Anthropic proxy (docs/accounts.md 8.4), in the order its checks run:
 * the path, the device (token, suspended, per minute, and the spend limits
 * for calls that start new spend), the server's key, the
 * request itself (a message's per minute check comes here, once its model
 * names its lane), batch ownership, the hold on the call's cost, then
 * the forward and the answer. Every 429 says which of these refused it in
 * `x-coere-limit` (limit-marker.ts), and so does the 504 for a call cut at
 * 285 s (`duration`). The body is read while the device check runs, once
 * the header has a token's shape, so that lookup hides behind the upload.
 * A message's usage and its hold's release are one settle_call before the
 * answer goes; a hold whose call may have been billed unrecorded is kept to
 * run out (holdOutcome in hold-rules.ts), and is charged as spend when it
 * does (keptCharge), so a call that outruns the route is never free.
 */

/** Calls that start new spend, so the spend limits are checked first. Results of a batch already paid for are not held back. */
const STARTS_SPEND = new Set<AnthropicOp["op"]>(["message", "batch_create"]);

export async function proxyAnthropic(req: Request, segments: string[]): Promise<Response> {
  const started = Date.now();
  const op = matchAnthropicPath(req.method, segments);
  if (!op) return anthropicError("not_found");

  // A message's per minute bucket follows its model, read from the body, so its check waits for the body.
  const later = op.op === "message";
  // Read while device_auth runs. Never rejects, so a refusal below may leave it to finish on its own.
  const reading = parseBearer(req.headers.get("authorization")) ? prepareRequest(req, op) : null;
  // The batch calls count in the message lane, so the plan's own lane is left to the account, settings and memory routes.
  const g = await gate(req, { metered: STARTS_SPEND.has(op.op), lane: later ? "later" : op.op === "count_tokens" ? "count" : "message" });
  if (!g.ok) return anthropicFor(g.refusal, g.retryAfter, g.limit);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return anthropicError("unavailable");

  const prepared = await (reading ?? prepareRequest(req, op));
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

  // The gate saw spend already recorded; this holds the call's cost against
  // what is left, counting every other call still in flight.
  let holdId: string | null = null;
  if (STARTS_SPEND.has(op.op)) {
    const cost = { worstMicros: prepared.worstMicros, expectedMicros: prepared.expectedMicros };
    const held = await reserveSpend(g.account.userId, cost, { batch: op.op === "batch_create" });
    if (!held.ok) {
      // A concurrency refusal logs a security event once a minute; a spent limit counts as before.
      if (held.refused === "concurrency") noteConcurrencyLimited(g.account, req.headers);
      else if (held.refused !== null && held.refused !== "pending") noteUsageLimited(g.account, req.headers);
      if (held.refused === "site_budget") console.error("the site's first build budget for today is spent");
      return holdRefusedAnswer(held.refused);
    }
    holdId = held.holdId;
  }
  // Until the call says otherwise, its cost is unknown and its hold stays.
  let event: HoldEvent = "unreachable";
  let knownMicros: number | undefined;
  const forwarded = Date.now();
  try {
    const url = upstreamUrl(segments, upstreamSearch(new URL(req.url).searchParams));
    const up = await forwardToAnthropic(req, { url, apiKey, beta: prepared.beta, body: prepared.body, seenThrough: outlivesCaller(op) });
    if (!up.ok) {
      event = up.why;
      return anthropicError(up.why === "timeout" ? "duration" : "upstream");
    }
    const relayed = await relayAnswer(up.res, {
      account: g.account,
      op,
      started,
      requestCount: prepared.requestCount,
      model: prepared.model ?? null,
      worstMicros: prepared.worstMicros,
      upstream: { apiKey, version: req.headers.get("anthropic-version"), beta: prepared.beta },
      holdId,
      cut: up.cut,
    });
    event = relayed.event;
    knownMicros = relayed.knownMicros;
    return relayed.res;
  } finally {
    const outcome = holdOutcome(event);
    if (holdId && outcome === "release") await releaseHold(holdId);
    if (holdId && outcome === "keep") {
      console.error("hold kept to run out", event);
      const call = { model: prepared.model ?? null, worstMicros: prepared.worstMicros, expectedMicros: prepared.expectedMicros, elapsedMs: Date.now() - forwarded, knownMicros };
      const charge = keptCharge(event, call);
      if (charge !== null) await setHoldCharge(holdId, charge);
    }
  }
}
