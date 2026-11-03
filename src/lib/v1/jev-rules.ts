import { isRecord } from "./body";

/**
 * The checks and usage reading of the Jev proxy (docs/accounts.md 8.5).
 * Jev bills input tokens only, so that is all the meter reads.
 */

export const JEV_URL = "https://api.typesafe.ai/v1/systemone";
export const JEV_BODY_CAP = 256 * 1024;
export const JEV_MODELS: ReadonlySet<string> = new Set(["jev-1.14.0", "jev-1.13.0"]);

/** The request's model when it is one Coere pays for, else null. */
export function jevModel(body: unknown): string | null {
  if (!isRecord(body) || typeof body.model !== "string") return null;
  return JEV_MODELS.has(body.model) ? body.model : null;
}

/** The answer's model (falling back to the asked one) and its input tokens. */
export function jevUsage(answer: unknown, asked: string): { model: string; input: number } {
  const model = isRecord(answer) && typeof answer.model === "string" ? answer.model : asked;
  const usage = isRecord(answer) && isRecord(answer.usage) ? answer.usage : null;
  const n = usage && typeof usage.input_tokens === "number" ? usage.input_tokens : 0;
  return { model, input: Number.isFinite(n) && n > 0 ? Math.floor(n) : 0 };
}

/** The answer headers Jev's client reads. */
export function jevAnswerHeaders(upstream: Headers): Headers {
  const out = new Headers({ "cache-control": "no-store", "x-robots-tag": "noindex" });
  for (const name of ["content-type", "retry-after", "retry-after-ms"]) {
    const v = upstream.get(name);
    if (v !== null) out.set(name, v);
  }
  return out;
}
