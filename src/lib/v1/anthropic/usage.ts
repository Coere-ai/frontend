import { costMicros, type TokenCounts } from "../prices";

/**
 * Reading `usage` out of Anthropic's answers for metering
 * (docs/accounts.md 8.4): a message's usage block, and a batch's results
 * read line by line as they stream through, so a large results file is
 * never held whole.
 */

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const count = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);

/** The four token counts of a message's `usage`, or null when it has none. */
export function usageOf(message: unknown): TokenCounts | null {
  if (!isRecord(message) || !isRecord(message.usage)) return null;
  const u = message.usage;
  return {
    input: count(u.input_tokens),
    output: count(u.output_tokens),
    cacheWrite: count(u.cache_creation_input_tokens),
    cacheRead: count(u.cache_read_input_tokens),
  };
}

/** One model's run inside a call, with its own token counts. */
export interface Attempt {
  model: string;
  tokens: TokenCounts;
}

/**
 * Every model run a message paid for. With a refusal fallback, the top level
 * `usage` covers only the attempt that wrote the answer, and
 * `usage.iterations` holds each attempt, a declined one included. Each is
 * priced at its own model, the way the extension's counter does it
 * (coere-v2 runtime/budget.ts attemptsOf). An iteration that names no model
 * ran on the one asked for.
 */
export function attemptsOf(message: unknown, requested: string | null): Attempt[] {
  const top = usageOf(message);
  if (!top || !isRecord(message) || !isRecord(message.usage)) return [];
  const served = typeof message.model === "string" ? message.model : null;
  const iterations = message.usage.iterations;
  if (Array.isArray(iterations) && iterations.length > 0) {
    return iterations.filter(isRecord).map((it) => ({
      model: typeof it.model === "string" && it.model ? it.model : (requested ?? served ?? ""),
      tokens: usageOf({ usage: it }) as TokenCounts,
    }));
  }
  return [{ model: served ?? requested ?? "", tokens: top }];
}

/** Adds attempts up by model, for one usage row per model. */
export function byModel(attempts: readonly Attempt[]): Map<string, TokenCounts> {
  const out = new Map<string, TokenCounts>();
  for (const a of attempts) {
    const t = out.get(a.model) ?? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    t.input += a.tokens.input;
    t.output += a.tokens.output;
    t.cacheRead += a.tokens.cacheRead;
    t.cacheWrite += a.tokens.cacheWrite;
    out.set(a.model, t);
  }
  return out;
}

/** One model's share of a batch: summed tokens, the cost priced item by item, and how many items. */
export interface ModelTally {
  tokens: TokenCounts;
  costMicros: number;
  items: number;
}

export interface BatchTally {
  /** Feed the results as they arrive, in any chunking. */
  push(chunk: Uint8Array): void;
  /** The totals by model once the stream ends. */
  end(): Map<string, ModelTally>;
}

/**
 * Tallies a batch's JSONL results. Only succeeded items cost anything; each
 * is priced on its own at batch price (so Haiku's long prompt tier is judged
 * per request), then added to its model's total.
 */
export function createBatchTally(): BatchTally {
  const decoder = new TextDecoder();
  const totals = new Map<string, ModelTally>();
  let rest = "";

  const line = (text: string) => {
    if (!text.trim()) return;
    let item: unknown;
    try {
      item = JSON.parse(text);
    } catch {
      return;
    }
    if (!isRecord(item) || !isRecord(item.result) || item.result.type !== "succeeded") return;
    const message = item.result.message;
    if (!isRecord(message) || typeof message.model !== "string") return;
    const attempts = attemptsOf(message, message.model);
    attempts.forEach(({ model, tokens }, i) => {
      const t = totals.get(model) ?? { tokens: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, costMicros: 0, items: 0 };
      t.tokens.input += tokens.input;
      t.tokens.output += tokens.output;
      t.tokens.cacheRead += tokens.cacheRead;
      t.tokens.cacheWrite += tokens.cacheWrite;
      t.costMicros += costMicros(model, tokens, "batch");
      // The item counts once, under the model that wrote its answer.
      if (i === attempts.length - 1) t.items += 1;
      totals.set(model, t);
    });
  };

  return {
    push(chunk) {
      rest += decoder.decode(chunk, { stream: true });
      let at = rest.indexOf("\n");
      while (at !== -1) {
        line(rest.slice(0, at));
        rest = rest.slice(at + 1);
        at = rest.indexOf("\n");
      }
    },
    end() {
      rest += decoder.decode();
      line(rest);
      rest = "";
      return totals;
    },
  };
}
