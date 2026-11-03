import "server-only";

import { supabase } from "@/lib/supabase";

import { num } from "./totals";

/**
 * admin_storage_usage() read once: the rows with no folder are each bucket's
 * total, the rest are the first folders in the memory bucket (a user id, or
 * "org" for every organization's graphs together).
 */

export interface StorageRow {
  bucket: string;
  folder: string | null;
  objects: number;
  bytes: number;
}

export async function readStorageUsage(): Promise<StorageRow[]> {
  const { data, error } = await supabase().rpc("admin_storage_usage");
  if (error) throw new Error(`admin_storage_usage failed: ${error.code}`);
  return ((data ?? []) as Array<{ bucket_id: string; folder: string | null; objects: unknown; bytes: unknown }>).map((r) => ({
    bucket: r.bucket_id,
    folder: r.folder,
    objects: num(r.objects),
    bytes: num(r.bytes),
  }));
}

/** The memory bucket's total bytes. */
export const memoryBytes = (rows: readonly StorageRow[]): number =>
  rows.find((r) => r.bucket === "memory" && r.folder === null)?.bytes ?? 0;
