import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/user";
import { plural } from "@/lib/dashboard/format";
import { readMemoryFile } from "@/lib/dashboard/reads";
import { userIndexPath, type MemoryIndex } from "@/lib/memory/index-types";
import { getJson } from "@/lib/memory/storage";
import { toView } from "@/lib/memory/view";
import { supabaseConfigured } from "@/lib/supabase";
import { sessionClient } from "@/lib/supabase/server";
import { ConnectFirst } from "@/site/dashboard/connect-first";
import { PageHeader } from "@/site/dashboard/panel";
import { ChatList } from "@/site/memory/chat-list";

export const metadata: Metadata = { title: "Chats" };

/** The chats the person's memory came from, read from their stored index after the session check. */
export default async function ChatsPage() {
  const user = await requireUser("/dashboard/chats");
  const file = await readMemoryFile(await sessionClient(), user.id);
  const index = file && supabaseConfigured() ? await getJson<MemoryIndex>(userIndexPath(user.id)) : null;
  const view = index && index.v === 1 ? toView(index, { maxFacts: 0, maxChats: 20_000 }) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Chats"
        lede={
          view
            ? `${plural(view.totalChats, "chat")} your memory came from. Only titles are kept here; the chats stay in your browser.`
            : "The chats your memory came from. Only titles are kept here; the chats stay in your browser."
        }
      />
      {view ? <ChatList sources={view.sources} /> : <ConnectFirst title="No chats yet" />}
    </div>
  );
}
