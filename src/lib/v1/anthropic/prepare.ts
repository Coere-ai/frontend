import { readBody } from "../body";
import type { AnthropicCase } from "./errors";
import { checkBatchBody, checkBeta, checkParams } from "./params";
import type { AnthropicOp } from "./paths";

/**
 * Everything the proxy checks about a request before it is forwarded
 * (docs/accounts.md 8.4): the beta header, the 4 MiB body cap, and each
 * request's params. Answers what to forward or which error to give.
 */

export const BODY_CAP = 4 * 1024 * 1024;

export type Prepared =
  | { ok: true; beta: string | null; body: Uint8Array | null; requestCount: number }
  | { ok: false; error: AnthropicCase; model?: string };

const WITH_PARAMS = new Set(["message", "count_tokens", "batch_create"]);

export async function prepareRequest(req: Request, op: AnthropicOp): Promise<Prepared> {
  const beta = checkBeta(req.headers.get("anthropic-beta"));
  if (beta === false) return { ok: false, error: "beta" };
  if (!WITH_PARAMS.has(op.op)) return { ok: true, beta, body: null, requestCount: 0 };

  const read = await readBody(req, BODY_CAP);
  if (!read.ok) return { ok: false, error: read.reason };
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(read.bytes));
  } catch {
    return { ok: false, error: "bad_request" };
  }
  const check = op.op === "batch_create" ? checkBatchBody(parsed) : checkParams(parsed);
  if (!check.ok) return check.reason === "model" ? { ok: false, error: "model", model: check.model } : { ok: false, error: "bad_request" };
  const requestCount = op.op === "batch_create" ? ((check as { count?: number }).count ?? 0) : 1;
  return { ok: true, beta, body: read.bytes, requestCount };
}
