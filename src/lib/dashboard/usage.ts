/**
 * The person's usage rows added up for the Usage page: cost and tokens per
 * day (every day of the range, so a quiet day shows as empty and not as a
 * gap), per model and per kind of call. Pure, so the sums are tested.
 */

export interface UsageRow {
  created_at: string;
  model: string | null;
  kind: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  cost_micros: number;
}

export interface UsageSum {
  key: string;
  costMicros: number;
  tokens: number;
  requests: number;
}

export interface UsageSummary {
  days: UsageSum[];
  models: UsageSum[];
  kinds: UsageSum[];
  total: UsageSum;
}

/** The words for each kind of call, as the page shows them. */
export const KIND_NAMES: Record<string, string> = {
  message: "Memory work",
  batch_result: "Memory work at half price",
  count_tokens: "Token counts",
  jev: "Classifier",
};

/** The words for each model. */
export const MODEL_NAMES: Record<string, string> = {
  "claude-opus-5-5": "Claude Opus 5.5",
  "claude-sonnet-5-5": "Claude Sonnet 5.5",
  "claude-haiku-5-5": "Claude Haiku 5.5",
  "jev-1.14.0": "Jev 1.14",
  "jev-1.13.0": "Jev 1.13",
};

const num = (v: unknown): number => (typeof v === "number" ? v : Number(v ?? 0)) || 0;

/** Input and output, with cache reads and writes counted as tokens too. */
const tokensOf = (r: UsageRow) => num(r.input_tokens) + num(r.output_tokens) + num(r.cache_read_tokens) + num(r.cache_write_tokens);

/** The UTC days from `from` to `to`, both included, as YYYY-MM-DD. */
export function daysBetween(from: Date, to: Date): string[] {
  const out: string[] = [];
  const at = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  for (let i = 0; at <= to && i < 400; i++) {
    out.push(at.toISOString().slice(0, 10));
    at.setUTCDate(at.getUTCDate() + 1);
  }
  return out;
}

function add(map: Map<string, UsageSum>, key: string, r: UsageRow) {
  const sum = map.get(key) ?? { key, costMicros: 0, tokens: 0, requests: 0 };
  sum.costMicros += num(r.cost_micros);
  sum.tokens += tokensOf(r);
  sum.requests += 1;
  map.set(key, sum);
}

const biggest = (a: UsageSum, b: UsageSum) => b.costMicros - a.costMicros || b.tokens - a.tokens || a.key.localeCompare(b.key);

export function summarize(rows: readonly UsageRow[], from: Date, to: Date): UsageSummary {
  const days = new Map(daysBetween(from, to).map((d) => [d, { key: d, costMicros: 0, tokens: 0, requests: 0 }]));
  const models = new Map<string, UsageSum>();
  const kinds = new Map<string, UsageSum>();
  const total: UsageSum = { key: "total", costMicros: 0, tokens: 0, requests: 0 };
  for (const r of rows) {
    const d = r.created_at.slice(0, 10);
    if (days.has(d)) add(days, d, r);
    add(models, r.model || "other", r);
    add(kinds, r.kind, r);
    total.costMicros += num(r.cost_micros);
    total.tokens += tokensOf(r);
    total.requests += 1;
  }
  return { days: [...days.values()], models: [...models.values()].sort(biggest), kinds: [...kinds.values()].sort(biggest), total };
}
