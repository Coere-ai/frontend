import "server-only";

import { supabase } from "@/lib/supabase";

import { isUuid } from "./http";
import { personName } from "./memory-view";
import { readStorageUsage } from "./storage-usage";
import { num } from "./totals";
import type { DatabasePayload, TableStat } from "./types";

/**
 * /admin/database: every table's estimated rows, size, Row Level Security
 * and policy count from admin_table_stats(), and the Storage totals from
 * admin_storage_usage(). Rows are Postgres's own estimate, so the page
 * says so.
 */

export async function readTableStats(): Promise<TableStat[]> {
  const { data, error } = await supabase().rpc("admin_table_stats");
  if (error) throw new Error(`admin_table_stats failed: ${error.code}`);
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    schema: String(r.schema_name),
    name: String(r.table_name),
    rows: num(r.row_estimate),
    bytes: num(r.total_bytes),
    rls: r.rls_enabled === true,
    policies: num(r.policy_count),
  }));
}

/** The largest folders the page lists. */
const TOP_FOLDERS = 20;

export async function loadDatabase(): Promise<DatabasePayload> {
  const [tables, storage] = await Promise.all([readTableStats(), readStorageUsage()]);
  const folders = storage
    .filter((r) => r.folder !== null)
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, TOP_FOLDERS);
  const ids = folders.map((f) => f.folder!).filter(isUuid);
  const { data: people } = ids.length ? await supabase().from("profiles").select("id, display_name, username, email").in("id", ids) : { data: [] };
  const name = new Map((people ?? []).map((p) => [p.id as string, p.email ?? personName(p)]));
  return {
    tables: [...tables].sort((a, b) => b.bytes - a.bytes),
    buckets: storage.filter((r) => r.folder === null).map((r) => ({ bucket: r.bucket, objects: r.objects, bytes: r.bytes })),
    folders: folders.map((f) => ({
      folder: f.folder!,
      label: f.folder === "org" ? "Every organization's graphs" : (name.get(f.folder!) ?? "A deleted account"),
      objects: f.objects,
      bytes: f.bytes,
    })),
  };
}
