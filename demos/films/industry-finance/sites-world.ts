import type { World } from "../../stage/world";
import type { Mem } from "./memory";
import { NOTHING, PREP_ANSWER, PREP_CHAT, PREP_CHAT_TEXT } from "./prep";
import { contextFor } from "./views";

/**
 * What the content script asks on the two ChatGPT tabs: in `prep`, Coere's
 * own strip on Daniel's memory (the field's review draft brings his prep
 * chat, About me and the household's rows); in `note`, Coere for Teams'
 * strip, where a draft about one client gets that client's card only.
 */
const wordsOf = (a: { tail?: string; keywords?: string[] }) => `${a.tail ?? ""} ${(a.keywords ?? []).join(" ")}`.toLowerCase();

export function answerSites(world: World, mem: Mem): void {
  world
    .engine("memory.contextFor", (m, tab) => {
      const a = (m.args ?? {}) as { tail?: string; keywords?: string[] };
      if (tab === "note") return contextFor(mem, a.tail ?? "");
      return /\b(lindqvist|elena)\b/.test(wordsOf(a)) && /\breview\b/.test(wordsOf(a)) ? PREP_ANSWER : NOTHING;
    })
    .engine("memory.contextAsk", () => NOTHING)
    .engine("memory.contextDeeper", () => NOTHING)
    .engine("memory.contextMore", () => ({ chats: [], nodes: [] }))
    .engine("memory.contextChat", (m) => ((m.args as { key?: string })?.key === PREP_CHAT.key ? { text: PREP_CHAT_TEXT } : null))
    .engine("memory.contextSent", () => null)
    .engine("memory.skipChats", () => [])
    .engine("capture.tail", () => null)
    // A chat site's scan saves the chats in its sidebar; the library already holds them.
    .engine("upsertConversation", (m) => {
      const conv = ((m.args as { conv?: { platform?: string; platformConvId?: string } })?.conv ?? {}) as { platform?: string; platformConvId?: string };
      return { id: `${conv.platform ?? "chatgpt"}:${conv.platformConvId ?? "new"}`, hash: "0".repeat(16), chunks: 0, bytes: 0, unchanged: true };
    });
}
