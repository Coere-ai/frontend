import { readBody } from "../body";
import type { AnthropicCase } from "./errors";
import { checkBatchBody, checkBeta, checkParams, promptSha } from "./params";
import type { AnthropicOp } from "./paths";
import { PROMPT_CHECK, PROMPT_SHAS } from "./prompt-shas";
import { batchWorstCaseMicros, expectedCaseMicros, worstCaseMicros } from "./worst-case";

/**
 * Everything the proxy checks about a request before it is forwarded
 * (docs/accounts.md 8.4): the beta header, the 4 MiB body cap, each
 * request's params, and that a message, and each entry of a batch, opens
 * with one of Coere's own pinned system prompts (prompt-shas.ts). Answers
 * what to forward, the checked body written out again, or which error to
 * give.
 */

export const BODY_CAP = 4 * 1024 * 1024;

export type Prepared =
  | {
      ok: true;
      beta: string | null;
      body: Uint8Array | null;
      requestCount: number;
      model?: string;
      /** The most the request can cost, for the spend reservation; 0 for a call that starts no spend. */
      worstMicros: number;
      /** What a message will most likely cost, weighed against the limit while it runs; a batch's is its worst case. */
      expectedMicros: number;
    }
  | { ok: false; error: AnthropicCase; model?: string };

const WITH_PARAMS = new Set(["message", "count_tokens", "batch_create"]);

/** The prompt list and the check's mode; the tests give their own. */
export interface PromptRules {
  prompts: Readonly<Record<string, string>>;
  mode: "report" | "enforce";
}

const SITE_RULES: PromptRules = { prompts: PROMPT_SHAS, mode: PROMPT_CHECK };

/** SHAs already logged by this instance, so a loop of one unknown prompt writes one line. */
const reported = new Set<string>();

/**
 * True when every request opens with a listed prompt, or the check only
 * reports. A miss is logged by the prompt's SHA, never its text.
 */
function promptsKnown(requests: Record<string, unknown>[], rules: PromptRules): boolean {
  let known = true;
  for (const params of requests) {
    const sha = promptSha(params);
    if (sha !== null && Object.hasOwn(rules.prompts, sha)) continue;
    known = false;
    const key = sha ?? "none";
    if (!reported.has(key)) {
      if (reported.size > 1000) reported.clear();
      reported.add(key);
      console.error(`system prompt not one of coere's (${rules.mode})`, key);
    }
  }
  return known || rules.mode === "report";
}

export async function prepareRequest(req: Request, op: AnthropicOp, rules: PromptRules = SITE_RULES): Promise<Prepared> {
  const beta = checkBeta(req.headers.get("anthropic-beta"));
  if (beta === false) return { ok: false, error: "beta" };
  if (!WITH_PARAMS.has(op.op)) return { ok: true, beta, body: null, requestCount: 0, worstMicros: 0, expectedMicros: 0 };

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
  // A token count costs nothing, so only what Anthropic bills is held to Coere's own prompts.
  if (op.op !== "count_tokens") {
    const requests =
      op.op === "batch_create"
        ? ((parsed as { requests: Array<{ params: Record<string, unknown> }> }).requests.map((entry) => entry.params))
        : [parsed as Record<string, unknown>];
    if (!promptsKnown(requests, rules)) return { ok: false, error: "bad_request" };
  }
  const requestCount = op.op === "batch_create" ? ((check as { count?: number }).count ?? 0) : 1;
  const model = op.op === "message" ? ((parsed as { model?: string }).model ?? undefined) : undefined;
  const worstMicros =
    op.op === "message" ? worstCaseMicros(parsed as Record<string, unknown>, "direct") : op.op === "batch_create" ? batchWorstCaseMicros(parsed) : 0;
  const expectedMicros = op.op === "message" ? expectedCaseMicros(parsed as Record<string, unknown>, "direct") : worstMicros;
  // What goes on is the parsed body written out again, so Anthropic reads exactly what was checked:
  // in the caller's own bytes a name given twice could read one way here and another way there.
  const body = new TextEncoder().encode(JSON.stringify(parsed));
  return { ok: true, beta, body, requestCount, worstMicros, expectedMicros, ...(model ? { model } : {}) };
}
