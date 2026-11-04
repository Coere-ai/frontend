import "server-only";

import { supabase } from "@/lib/supabase";

import { afterCursor, pageLimit } from "./batch-page";
import { anthropicError } from "./errors";
import { answerHeaders } from "./headers";

/**
 * `GET v1/messages/batches`, answered from the caller's own `ai_batches`
 * rows (docs/accounts.md 8.4) rather than Coere's shared list at Anthropic.
 * The shared list holds every account's batches, so cutting it to the
 * caller's own left pages empty with `has_more` still true: the runtime's
 * search for a lost batch, which pages back until it passes an older batch
 * of its own, walked all of Coere's history and ran into the per minute
 * limit. Here every page is the caller's own, newest first, and each item is
 * Anthropic's current object for that batch, fetched by id.
 */

/** Results and batches are gone at Anthropic after 29 days. */
const KEPT_DAYS = 30;
/** Upstream reads at once, so a page of 100 does not open 100 connections. */
const AT_ONCE = 10;

interface Upstream {
  apiKey: string;
  version: string | null;
  beta: string | null;
}

type Fetched = { ok: true; batch: unknown } | { ok: true; batch: null } | { ok: false };

async function fetchBatch(id: string, u: Upstream): Promise<Fetched> {
  const headers = new Headers({ "x-api-key": u.apiKey, "anthropic-version": u.version ?? "2023-06-01" });
  if (u.beta) headers.set("anthropic-beta", u.beta);
  try {
    const res = await fetch(`https://api.anthropic.com/v1/messages/batches/${encodeURIComponent(id)}`, { headers, cache: "no-store", redirect: "manual" });
    // Deleted or expired at Anthropic: left out of the page.
    if (res.status === 404) {
      await res.body?.cancel().catch(() => {});
      return { ok: true, batch: null };
    }
    if (!res.ok) {
      await res.body?.cancel().catch(() => {});
      return { ok: false };
    }
    return { ok: true, batch: await res.json() };
  } catch {
    return { ok: false };
  }
}

export async function listOwnBatches(userId: string, params: URLSearchParams, u: Upstream): Promise<Response> {
  const limit = pageLimit(params.get("limit"));
  const db = supabase();
  let query = db
    .from("ai_batches")
    .select("id, created_at")
    .eq("user_id", userId)
    .gt("created_at", new Date(Date.now() - KEPT_DAYS * 86_400_000).toISOString())
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  const afterId = params.get("after_id");
  if (afterId) {
    const { data: from, error } = await db.from("ai_batches").select("id, created_at").eq("user_id", userId).eq("id", afterId).maybeSingle();
    if (error) return anthropicError("unavailable");
    if (!from) return anthropicError("bad_request");
    // Strictly older than the cursor row, with the id breaking a tie.
    query = query.or(afterCursor(from as { id: string; created_at: string }));
  }

  const { data: rows, error } = await query;
  if (error) return anthropicError("unavailable");
  const page = (rows ?? []).slice(0, limit) as { id: string }[];

  const fetched: Fetched[] = [];
  for (let i = 0; i < page.length; i += AT_ONCE) {
    fetched.push(...(await Promise.all(page.slice(i, i + AT_ONCE).map((r) => fetchBatch(r.id, u)))));
  }
  if (fetched.some((f) => !f.ok)) return anthropicError("unavailable");

  const body = {
    data: fetched.flatMap((f) => (f.ok && f.batch !== null ? [f.batch] : [])),
    has_more: (rows ?? []).length > limit,
    // The cursors name the page's own rows, an item left out included, so the next page starts after them.
    first_id: page[0]?.id ?? null,
    last_id: page.at(-1)?.id ?? null,
  };
  const headers = answerHeaders(new Headers({ "content-type": "application/json" }));
  return new Response(JSON.stringify(body), { status: 200, headers });
}
