import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/user";
import { ago, bytes, plural } from "@/lib/dashboard/format";
import { readMemoryFile, readProfile } from "@/lib/dashboard/reads";
import { userIndexPath, type MemoryIndex } from "@/lib/memory/index-types";
import { getJson } from "@/lib/memory/storage";
import { toView } from "@/lib/memory/view";
import { supabaseConfigured } from "@/lib/supabase";
import { sessionClient } from "@/lib/supabase/server";
import { allowedIds } from "@/site/bridge/extension-ids";
import { ConnectFirst } from "@/site/dashboard/connect-first";
import { PageHeader } from "@/site/dashboard/panel";
import { MemoryActions } from "@/site/memory/memory-actions";
import { MemoryExplorer } from "@/site/memory/memory-explorer";

export const metadata: Metadata = { title: "Memory" };

/**
 * The person's memory from the stored index (docs/accounts.md 8.7): the
 * graph, the list by section and the download. The index is read with the
 * secret key only after the session is checked, from the signed in
 * person's own folder.
 */
export default async function MemoryPage() {
  const user = await requireUser("/dashboard/memory");
  const db = await sessionClient();
  const [profile, file] = await Promise.all([readProfile(db, user.id), readMemoryFile(db, user.id)]);
  const index = file && supabaseConfigured() ? await getJson<MemoryIndex>(userIndexPath(user.id)) : null;
  const ids = allowedIds(process.env.COERE_EXTENSION_IDS);

  if (!file || !index || index.v !== 1) {
    const off = profile && !profile.memorySync;
    return (
      <div className="space-y-8">
        <PageHeader title="Memory" lede="What Coere has learned from your chats, as a graph and a list." />
        <ConnectFirst title={off ? "The backup is off" : "No memory backed up yet"}>
          {off
            ? "Turn on Back up memory to coere.ai in Settings to see your memory here. Your memory stays in Coere in your browser either way."
            : "Coere backs up your memory here a few minutes after it learns something new. If you have not installed it yet, add Coere to Chrome: it opens coere.ai/connect when it installs, and one press links it to this account."}
        </ConnectFirst>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Memory"
        lede={`${plural(file.memories, "memory", "memories")} from ${plural(file.chats, "chat")}, backed up ${ago(file.uploadedAt)} (${bytes(file.bytes)}).`}
        actions={<MemoryActions allowedIds={ids} />}
      />
      <MemoryExplorer view={toView(index)} center="You" />
    </div>
  );
}
