import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/user";
import { readProfile } from "@/lib/dashboard/reads";
import { readEntry, SETTING_GROUPS, type SettingValue } from "@/lib/settings/catalog";
import { mergeSettings, type SyncedSettings } from "@/lib/settings/synced-keys";
import { sessionClient } from "@/lib/supabase/server";
import { allowedIds } from "@/site/bridge/extension-ids";
import { PageHeader } from "@/site/dashboard/panel";
import { SettingsForm } from "@/site/settings/settings-form";

export const metadata: Metadata = { title: "Settings" };

/**
 * The synced settings (docs/accounts.md 6.6) and the backup switches. The
 * stored record is read through the person's own session; each change is
 * saved by a server action that checks the session again.
 */
export default async function SettingsPage() {
  const user = await requireUser("/dashboard/settings");
  const db = await sessionClient();
  const [profile, stored] = await Promise.all([readProfile(db, user.id), db.from("user_settings").select("settings").eq("user_id", user.id).maybeSingle()]);
  const settings = (mergeSettings(stored.data?.settings ?? {}, {}) ?? {}) as SyncedSettings;
  const initial: Record<string, SettingValue> = {};
  for (const g of SETTING_GROUPS) for (const e of g.entries) initial[e.id] = readEntry(settings, e);

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" lede="These follow you to every browser where Coere is connected to this account." />
      <SettingsForm
        initial={initial}
        backup={{ on: profile?.memorySync ?? true, includeSensitive: profile?.includeSensitive ?? false }}
        allowedIds={allowedIds(process.env.COERE_EXTENSION_IDS)}
      />
    </div>
  );
}
