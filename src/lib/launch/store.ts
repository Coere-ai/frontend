import "server-only";

import { unstable_cache } from "next/cache";

import { supabase, supabaseConfigured } from "@/lib/supabase";
import { LAUNCH_DEFAULT, LAUNCH_PRODUCTS, type LaunchProduct, type LaunchSetting } from "@/site/content/launch";

import { readLaunchSetting } from "./moment";

/**
 * The launch moments in site_settings (docs/accounts.md section 16), read
 * with the secret key. The coming soon pages stay static: the read is
 * cached under LAUNCH_TAG, so a visitor never waits on the database, and
 * the admin save expires the tag and both pages so a change shows at once.
 * The hour is only a floor in case a save's expiry is ever missed.
 */

export const LAUNCH_TAG = "launch";
export const LAUNCH_PATHS = ["/install", "/try-teams"] as const;

export const launchKey = (product: LaunchProduct) => `launch.${product}`;

type Row = { key: string; value: unknown; updated_at: string };

async function readRows(): Promise<Row[]> {
  const { data, error } = await supabase()
    .from("site_settings")
    .select("key, value, updated_at")
    .in("key", LAUNCH_PRODUCTS.map(launchKey));
  // Thrown, so a failed read is never cached: the next visit tries again.
  if (error) throw new Error(`site_settings read: ${error.code ?? "unknown"}`);
  return (data ?? []) as Row[];
}

const readCached = unstable_cache(readRows, ["site-settings-launch"], { tags: [LAUNCH_TAG], revalidate: 3600 });

export type LaunchSettings = Record<LaunchProduct, LaunchSetting>;

function fromRows(rows: Row[]): LaunchSettings {
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  return {
    connect: readLaunchSetting(byKey.get(launchKey("connect")), LAUNCH_DEFAULT),
    teams: readLaunchSetting(byKey.get(launchKey("teams")), LAUNCH_DEFAULT),
  };
}

/** What the pages count to: the saved moments, or LAUNCH_AT without Supabase or a saved row. */
export async function launchSettings(): Promise<LaunchSettings> {
  if (!supabaseConfigured()) return fromRows([]);
  try {
    return fromRows(await readCached());
  } catch (err) {
    console.error("[launch] read failed:", err instanceof Error ? err.message : "unknown");
    return fromRows([]);
  }
}

export type AdminLaunch = Record<LaunchProduct, LaunchSetting & { saved: boolean; updatedAt: string | null }>;

/** For /admin/launch: read fresh, and say which moments are saved and when. */
export async function loadAdminLaunch(): Promise<AdminLaunch> {
  const rows = await readRows();
  const settings = fromRows(rows);
  const none: LaunchSetting = { at: "", show: true };
  const entry = (product: LaunchProduct) => {
    const row = rows.find((r) => r.key === launchKey(product));
    // The fallback comes back as the same object when the row is missing or malformed.
    return { ...settings[product], saved: readLaunchSetting(row?.value, none) !== none, updatedAt: row?.updated_at ?? null };
  };
  return { connect: entry("connect"), teams: entry("teams") };
}

/** Stores one product's moment. The caller has checked it and the admin session. */
export async function saveLaunch(product: LaunchProduct, setting: LaunchSetting): Promise<string> {
  const updatedAt = new Date().toISOString();
  const { error } = await supabase()
    .from("site_settings")
    .upsert({ key: launchKey(product), value: { at: setting.at, show: setting.show }, updated_at: updatedAt }, { onConflict: "key" });
  if (error) throw new Error(`site_settings save: ${error.code ?? "unknown"}`);
  return updatedAt;
}
