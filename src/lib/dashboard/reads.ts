import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The person's own rows, read through their session so Row Level Security
 * decides what comes back (docs/accounts.md section 7). Every page has
 * already checked the session; these only shape what it reads. A failed
 * read gives the empty value, so a page still renders.
 */

export interface Profile {
  email: string | null;
  username: string | null;
  planId: string;
  memorySync: boolean;
  includeSensitive: boolean;
  createdAt: string | null;
}

export interface Plan {
  id: string;
  name: string;
  monthlyLimitMicros: number;
  storageLimitBytes: number;
}

export interface Device {
  id: string;
  name: string;
  tokenHint: string;
  extensionVersion: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export interface MemoryFile {
  bytes: number;
  memories: number;
  entities: number;
  links: number;
  chats: number;
  sections: number;
  uploadedAt: string;
  includesSensitive: boolean;
}

export interface Month {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  costMicros: number;
}

export interface Totals {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  costMicros: number;
  tokensSaved: number;
  contextImports: number;
  transfers: number;
  extractions: number;
  memories: number;
  chats: number;
}

const n = (v: unknown): number => (typeof v === "number" ? v : Number(v ?? 0)) || 0;

/** The first day of this month in UTC, as the database keys months. */
export const thisMonth = (now = new Date()): string => `${now.toISOString().slice(0, 7)}-01`;

export async function readProfile(db: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data } = await db
    .from("profiles")
    .select("email, username, plan_id, memory_sync, include_sensitive, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    email: data.email,
    username: data.username,
    planId: data.plan_id,
    memorySync: data.memory_sync,
    includeSensitive: data.include_sensitive,
    createdAt: data.created_at,
  };
}

export async function readPlan(db: SupabaseClient, planId: string): Promise<Plan> {
  const { data } = await db.from("plans").select("id, name, monthly_limit_micros, storage_limit_bytes").eq("id", planId).maybeSingle();
  return {
    id: data?.id ?? planId,
    name: data?.name ?? "Free",
    monthlyLimitMicros: n(data?.monthly_limit_micros ?? 5_000_000),
    storageLimitBytes: n(data?.storage_limit_bytes ?? 26_214_400),
  };
}

/** Connected browsers, newest first. The token hash is never asked for; the column grant refuses it anyway. */
export async function readDevices(db: SupabaseClient, userId: string): Promise<Device[]> {
  const { data } = await db
    .from("devices")
    .select("id, name, token_hint, extension_version, created_at, last_used_at, revoked_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    tokenHint: d.token_hint,
    extensionVersion: d.extension_version,
    createdAt: d.created_at,
    lastUsedAt: d.last_used_at,
    revokedAt: d.revoked_at,
  }));
}

export async function readMemoryFile(db: SupabaseClient, userId: string): Promise<MemoryFile | null> {
  const { data } = await db
    .from("memory_files")
    .select("bytes, memories, entities, links, chats, sections, uploaded_at, includes_sensitive")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    bytes: n(data.bytes),
    memories: n(data.memories),
    entities: n(data.entities),
    links: n(data.links),
    chats: n(data.chats),
    sections: n(data.sections),
    uploadedAt: data.uploaded_at,
    includesSensitive: data.includes_sensitive,
  };
}

export async function readMonth(db: SupabaseClient, userId: string, month = thisMonth()): Promise<Month> {
  const { data } = await db.from("usage_monthly").select("requests, input_tokens, output_tokens, cost_micros").eq("user_id", userId).eq("month", month).maybeSingle();
  return { requests: n(data?.requests), inputTokens: n(data?.input_tokens), outputTokens: n(data?.output_tokens), costMicros: n(data?.cost_micros) };
}

export async function readTotals(db: SupabaseClient, userId: string): Promise<Totals> {
  const { data } = await db
    .from("user_totals")
    .select("requests, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_micros, tokens_saved, context_imports, transfers, extractions, memories, chats")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    requests: n(data?.requests),
    inputTokens: n(data?.input_tokens),
    outputTokens: n(data?.output_tokens),
    cacheReadTokens: n(data?.cache_read_tokens),
    cacheWriteTokens: n(data?.cache_write_tokens),
    costMicros: n(data?.cost_micros),
    tokensSaved: n(data?.tokens_saved),
    contextImports: n(data?.context_imports),
    transfers: n(data?.transfers),
    extractions: n(data?.extractions),
    memories: n(data?.memories),
    chats: n(data?.chats),
  };
}
