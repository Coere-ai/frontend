import "server-only";

import { supabase } from "@/lib/supabase";

import { mergeSettings, type SyncedSettings } from "./synced-keys";

/**
 * The synced settings record (docs/accounts.md 8.8), read and written with
 * the secret key for one account. A write merges the change, bumps the
 * version and notes who wrote it. It only lands if the version it read is
 * still the stored one, and tries again otherwise, so two browsers writing
 * at once each keep their keys.
 */

export interface SettingsRecord {
  version: number;
  updatedAt: string | null;
  settings: SyncedSettings;
}

export type SettingsWrite = { ok: true; record: SettingsRecord } | { ok: false; reason: "too_large" | "unavailable" };

interface Row {
  settings: unknown;
  version: number | string;
  updated_at: string;
}

async function readRow(userId: string): Promise<Row | null> {
  const { data, error } = await supabase()
    .from("user_settings")
    .select("settings, version, updated_at")
    .eq("user_id", userId)
    .maybeSingle<Row>();
  if (error) throw new Error(`user_settings read failed: ${error.code}`);
  return data;
}

const toRecord = (r: Row | null): SettingsRecord => ({
  version: Number(r?.version ?? 0),
  updatedAt: r?.updated_at ?? null,
  settings: (mergeSettings(r?.settings ?? {}, {}) ?? {}) as SyncedSettings,
});

export async function readSettings(userId: string): Promise<SettingsRecord> {
  return toRecord(await readRow(userId));
}

export async function writeSettings(userId: string, change: SyncedSettings, by: "site" | "extension"): Promise<SettingsWrite> {
  const db = supabase();
  for (let attempt = 0; attempt < 4; attempt++) {
    const row = await readRow(userId);
    const merged = mergeSettings(row?.settings ?? {}, change);
    if (!merged) return { ok: false, reason: "too_large" };
    const next = { settings: merged, updated_at: new Date().toISOString(), updated_by: by };
    if (!row) {
      const { data, error } = await db
        .from("user_settings")
        .insert({ user_id: userId, version: 1, ...next })
        .select("settings, version, updated_at")
        .maybeSingle<Row>();
      if (!error && data) return { ok: true, record: toRecord(data) };
      if (error?.code !== "23505") return { ok: false, reason: "unavailable" };
      continue;
    }
    const version = Number(row.version);
    const { data, error } = await db
      .from("user_settings")
      .update({ version: version + 1, ...next })
      .eq("user_id", userId)
      .eq("version", version)
      .select("settings, version, updated_at")
      .maybeSingle<Row>();
    if (error) return { ok: false, reason: "unavailable" };
    if (data) return { ok: true, record: toRecord(data) };
  }
  return { ok: false, reason: "unavailable" };
}
