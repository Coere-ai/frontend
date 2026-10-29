import { libraryId, type Conversation, type Message } from "@coere/core";
import { IdMaker } from "@v2/tools/gen-corpus/ids";
import { Rng } from "@v2/tools/gen-corpus/rng";
import { isoUtc } from "@v2/tools/gen-corpus/time";
import { makeCtx, PLATFORMS, REPLIES } from "@v2/tools/gen-corpus/solution/agency";
import { clientChats, type Client, type Contact } from "@v2/tools/gen-corpus/solution/clients";
import { anchorOf, DEFAULT_SEED, generateSolutionCorpus, type PlantedItem, type SolutionCorpus } from "@v2/tools/gen-corpus/solution/index";

/**
 * Fernhill Creative's chats at full size: coere-v2's agency corpus
 * (tools/gen-corpus/solution) with every family it plants, and the
 * agency's smaller clients, whose chats coere-v2's own client family
 * writes (clients.ts clientChats) from the same seeded streams. A small
 * client has fewer chats than a big one, so each takes the first of its
 * chats in their seeded order. Seeded and deterministic, as the corpus is.
 */

const contact = (key: string, name: string, role: string): Contact => ({ key, name, first: name.split(" ")[0] ?? name, role });

/** The agency's other clients, with how many of their chats Maya had. Made up names. */
export const MORE_CLIENTS: ReadonlyArray<Client & { chats: number }> = [
  { key: "sallowmere", name: "Sallowmere Physio", aliases: ["Sallowmere"], domain: "sallowmerephysio.com", status: "active", what: "run four physiotherapy clinics", city: "Madison", contacts: [contact("hannah", "Hannah Cole", "clinic director"), contact("victor", "Victor Osei", "practice manager")], work: "clinic booking app", chats: 14 },
  { key: "hollis", name: "Hollis Bay Ferries", aliases: ["Hollis Bay"], domain: "hollisbayferries.com", status: "active", what: "run passenger ferries across the sound", city: "Bellingham", contacts: [contact("june", "June Takahashi", "communications manager"), contact("carl", "Carl Brennan", "operations director")], work: "summer timetable campaign", chats: 12 },
  { key: "brightmoor", name: "Brightmoor Inns", aliases: ["Brightmoor"], domain: "brightmoorinns.com", status: "active", what: "run small hotels in old mill towns", city: "Asheville", contacts: [contact("celia", "Celia Okoye", "guest experience lead"), contact("frank", "Frank Delgado", "director of sales")], work: "booking site redesign", chats: 12 },
  { key: "fenwick", name: "Fenwick Cider Works", aliases: ["Fenwick Cider", "Fenwick"], domain: "fenwickcider.com", status: "active", what: "press and can craft cider", city: "Hood River", contacts: [contact("mae", "Mae Sullivan", "founder"), contact("diego", "Diego Ramos", "sales lead")], work: "can label series", chats: 10 },
  { key: "cobalt", name: "Cobalt Ridge Climbing", aliases: ["Cobalt Ridge"], domain: "cobaltridgeclimbing.com", status: "active", what: "run three indoor climbing gyms", city: "Salt Lake City", contacts: [contact("jules", "Jules Martin", "marketing lead"), contact("pete", "Pete Lowry", "general manager")], work: "membership drive", chats: 10 },
  { key: "meadowlark", name: "Meadowlark Learning Trust", aliases: ["Meadowlark"], domain: "meadowlarktrust.org", status: "active", what: "run five charter schools", city: "Omaha", contacts: [contact("gloria", "Gloria Pratt", "head of admissions"), contact("ian", "Ian Kerr", "trust director")], work: "enrollment campaign", chats: 11 },
  { key: "thistle", name: "Thistle Row Bakery", aliases: ["Thistle Row"], domain: "thistlerowbakery.com", status: "active", what: "bake bread for cafes across the city", city: "Minneapolis", contacts: [contact("nell", "Nell Avery", "owner"), contact("omar", "Omar Haddad", "wholesale manager")], work: "wholesale catalog", chats: 8 },
  { key: "lantern", name: "Lantern Hill Theatre", aliases: ["Lantern Hill"], domain: "lanternhilltheatre.org", status: "active", what: "stage plays in a converted church", city: "Providence", contacts: [contact("ada", "Ada Whitford", "artistic director"), contact("neil", "Neil Corcoran", "box office manager")], work: "season brochure", chats: 2 },
];

export function teamCorpus(now: number, seed = DEFAULT_SEED): SolutionCorpus {
  const base = generateSolutionCorpus({ seed, now });
  const rng = Rng.derive(seed, "teams-film", "chats");
  const ids = new IdMaker();
  const conversations: Conversation[] = [...base.conversations];
  const items: PlantedItem[] = [...base.items];
  for (const c of MORE_CLIENTS) {
    const specs = clientChats(c, makeCtx(Rng.derive(seed, "teams-film", `client-${c.key}`), now)).slice(0, c.chats);
    for (const chat of specs) {
      // Placed as generateSolutionCorpus places a chat: an AI, the day's working hours, a reply after each line.
      const platform = rng.pick(PLATFORMS);
      const conv = ids.conversation(platform, rng);
      const convId = libraryId(platform, conv);
      let at = now - chat.daysAgo * 86_400_000 + rng.int(9 * 60, 17 * 60) * 60_000;
      const messages: Message[] = [];
      for (const spec of chat.items) {
        at += rng.int(1, 3) * 60_000;
        items.push({ ...spec, id: `it_${String(items.length + 1).padStart(4, "0")}`, convId, msgIndex: messages.length, anchor: anchorOf(spec.text) });
        messages.push({ role: "user", text: spec.text, createdAt: isoUtc(at) });
        at += rng.int(1, 2) * 60_000;
        messages.push({ role: "assistant", text: rng.pick(REPLIES), createdAt: isoUtc(at) });
      }
      conversations.push({
        platform,
        platformConvId: conv,
        title: chat.title,
        createdAt: messages[0]?.createdAt,
        updatedAt: messages.at(-1)?.createdAt,
        archived: false,
        messages,
        alternateBranches: 0,
        hiddenCount: 0,
        adapter: "gen-corpus-solution@1",
        capturedAt: isoUtc(now),
      });
    }
  }
  conversations.sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
  const record = {
    ...base.record,
    clients: [...base.record.clients, ...MORE_CLIENTS.map((c) => ({ key: c.key, name: c.name, aliases: [...c.aliases], domains: [c.domain], status: c.status }))],
  };
  return {
    ...base,
    record,
    conversations,
    items,
    sameClient: [...base.sameClient, ...MORE_CLIENTS.map((c) => ({ key: c.key, forms: [c.name, ...c.aliases, c.domain] }))],
  };
}
