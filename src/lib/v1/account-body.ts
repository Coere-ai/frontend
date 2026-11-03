/**
 * The body of `GET /api/v1/account` (docs/accounts.md 8.3), built from the
 * rows the route reads. Pure, so the shape is pinned by a test. Database
 * bigints may arrive as strings; every number goes through `num`.
 */

export interface AccountRows {
  month: string;
  profile: { id: string; email: string | null; username: string | null; created_at: string; memory_sync: boolean; include_sensitive: boolean };
  plan: { id: string; name: string; monthly_limit_micros: number | string; storage_limit_bytes: number | string } | null;
  usage: { requests: number | string; input_tokens: number | string; output_tokens: number | string; cost_micros: number | string } | null;
  memory: { uploaded_at: string; bytes: number | string; digest: string } | null;
  device: { id: string; name: string };
  org: { id: string; name: string; role: string } | null;
  totals: {
    tokens_saved: number | string;
    input_tokens: number | string;
    output_tokens: number | string;
    cost_micros: number | string;
    memories: number | string;
    chats: number | string;
  } | null;
  settingsVersion: number | string | null;
}

const num = (v: number | string | null | undefined): number => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export function accountBody(r: AccountRows) {
  return {
    user: { id: r.profile.id, email: r.profile.email ?? "", username: r.profile.username, createdAt: r.profile.created_at },
    plan: r.plan
      ? {
          id: r.plan.id,
          name: r.plan.name,
          monthlyLimitMicros: num(r.plan.monthly_limit_micros),
          storageLimitBytes: num(r.plan.storage_limit_bytes),
        }
      : null,
    usage: {
      month: r.month,
      costMicros: num(r.usage?.cost_micros),
      requests: num(r.usage?.requests),
      inputTokens: num(r.usage?.input_tokens),
      outputTokens: num(r.usage?.output_tokens),
    },
    memory: {
      sync: r.profile.memory_sync,
      includeSensitive: r.profile.include_sensitive,
      uploadedAt: r.memory?.uploaded_at ?? null,
      bytes: r.memory ? num(r.memory.bytes) : null,
      digest: r.memory?.digest ?? null,
    },
    device: r.device,
    org: r.org,
    totals: {
      tokensSaved: num(r.totals?.tokens_saved),
      tokensUsed: num(r.totals?.input_tokens) + num(r.totals?.output_tokens),
      costMicros: num(r.totals?.cost_micros),
      memories: num(r.totals?.memories),
      chats: num(r.totals?.chats),
    },
    settingsVersion: num(r.settingsVersion),
  };
}

/** The first day of this month in UTC, as the database keys months. */
export function monthKey(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
}
