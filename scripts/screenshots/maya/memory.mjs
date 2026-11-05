// Writes Maya's memory file (.coere 2.0) with the extension's own code from
// a coere-v2 checkout: each chat in chats.mjs is one extraction plan
// applied through the memory store's write path, then exported the way
// Export memory writes a file. The dashboard imports it the way a person
// imports one, so the Memory page draws a memory the real code made.
// Runs under tsx, since it loads coere-v2's TypeScript source:
//
//   npx tsx scripts/screenshots/maya/memory.mjs <coere-v2 dir> <out file> [now ms]

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { allChats, MEMORY_CHATS } from "./chats.mjs";
import { ENTITIES, FACTS, RELATIONS } from "./memory-records.mjs";

const ZONE = "America/Los_Angeles";
const AGENT = { app: "coere", version: "4.0.0" };
const URLS = { chatgpt: "https://chatgpt.com/c/", claude: "https://claude.ai/chat/", gemini: "https://gemini.google.com/app/" };

/** The next date on or after `now` with this month and day, as YYYY-MM-DD. */
function nextDate(monthDay, now) {
  const year = new Date(now).getUTCFullYear();
  for (const y of [year, year + 1]) {
    const iso = `${y}-${monthDay}`;
    if (Date.parse(`${iso}T23:59:59Z`) >= now) return iso;
  }
  return `${year + 1}-${monthDay}`;
}

export async function mayaMemoryBytes(coereV2, now) {
  const src = (p) => import(join(coereV2, p));
  const { sha256Hex } = await src("packages/core/src/index.ts");
  const mem = await src("packages/memory/src/index.ts");
  const { openNodeDriver } = await src("apps/server/src/db/node-driver.ts");
  const { fakeId, fakeIdMaker } = await src("tools/gen-fake-memory/ids.ts");
  const { entity, fact, relation, spec } = await src("tools/gen-fake-memory/records.ts");

  const chats = new Map();
  const listed = allChats(now);
  MEMORY_CHATS.forEach((c, i) => chats.set(c.key, { ...c, ...listed[i] }));

  // Each chat's source record and a way to quote one of Maya's lines from it.
  const corpus = new Map();
  for (const [key, c] of chats) {
    const hashes = await Promise.all(c.messages.map((m) => sha256Hex(m.text)));
    const convId = `${c.platform}:${c.id}`;
    const last = c.messages[c.messages.length - 1].at;
    corpus.set(key, {
      at: c.messages[0].at,
      source: {
        ...{ t: "source", id: convId, platform: c.platform, title: c.title, url: `${URLS[c.platform]}${c.id}` },
        ...{ createdAt: c.start, updatedAt: last, capturedAt: last, messages: c.messages.length },
        convSha256: await sha256Hex(c.messages.map((m) => m.text).join("\n")),
      },
      ev(line, exact) {
        const n = 2 * line - 1;
        const text = c.messages[n - 1].text;
        const start = text.indexOf(exact);
        if (start < 0) throw new Error(`no quote "${exact}" in ${key} line ${line}`);
        return { src: `${convId}#m${n}`, role: "user", at: c.messages[n - 1].at, quote: { exact, start, end: start + exact.length }, msgSha256: hashes[n - 1] };
      },
    });
  }

  const SELF = fakeId("ent", 0x01);
  const ids = new Map(ENTITIES.map(([key], i) => [key, fakeId("ent", 0x20 + i)]));
  const idOf = (key) => (key === "self" ? SELF : ids.get(key));
  const underOf = (key) => ids.get(key) ?? `sec_${key}`;
  const names = new Map(ENTITIES.map(([key, , name]) => [ids.get(key), name]));

  // One part per chat, in the order the chats happened.
  const parts = new Map([...chats.keys()].map((k) => [k, { sources: [corpus.get(k).source], entities: [], facts: [], relations: [] }]));
  ENTITIES.forEach(([key, kind, name, section, parent, importance, chat, line, quote]) => {
    parts.get(chat).entities.push(entity({ id: ids.get(key), kind, name, section: `sec_${section}`, importance, ...(parent ? { parent: ids.get(parent) } : {}) }, [corpus.get(chat).ev(line, quote)]));
  });
  FACTS.forEach(([subject, under, kind, key, text, chat, line, quote, due], i) => {
    const when = due ? nextDate(due, now) : null;
    parts.get(chat).facts.push(
      fact(
        {
          ...{ id: fakeId("fact", 0x100 + i), subject: idOf(subject), under: underOf(under), kind, key, text },
          ...(when ? { urgency: { due: { at: when } }, importance: 4, specifics: [spec("date", quote, { type: "when", when: { at: when } })] } : {}),
        },
        [corpus.get(chat).ev(line, quote)],
      ),
    );
  });
  RELATIONS.forEach(([from, type, to, chat, line, quote], i) => {
    parts.get(chat).relations.push(relation({ id: fakeId("rel", 0x100 + i), from: idOf(from), type, to: idOf(to) }, [corpus.get(chat).ev(line, quote)]));
  });

  const driver = openNodeDriver({ path: ":memory:" });
  try {
    const order = [...chats.keys()].sort((a, b) => corpus.get(a).at.localeCompare(corpus.get(b).at));
    const clock = { now: Date.parse(corpus.get(order[0]).at) - 86_400_000 };
    const maker = fakeIdMaker();
    const store = mem.openMemoryStore({
      ...{ driver, guard: mem.createGuard(), now: () => clock.now, random: mem.seededRandom(0x3a7a) },
      ...{ ids: maker, zone: ZONE, agent: AGENT, memoryId: "c0e4a7a4000000000000000000000001" },
    });
    for (const key of order) {
      const part = parts.get(key);
      const at = new Date(Date.parse(part.sources[0].updatedAt) + 60_000).toISOString().replace(/\.\d+Z$/, "Z");
      clock.now = Date.parse(at);
      const act = { t: "activity", id: maker.next("act"), kind: "extract", started: at, ended: at, agent: { ...AGENT, model: "claude-sonnet-4-5", prompt: "extract@1", effort: "medium" } };
      const facts = [];
      for (const f of part.facts) facts.push({ record: { ...f, by: act.id }, fp: await mem.factFingerprint({ self: f.subject === SELF, name: names.get(f.subject) ?? "Maya Collins" }, f.specifics ?? []) });
      const done = store.db.write((tx) =>
        store.applyPlan(tx, {
          activity: act,
          ...{ sources: part.sources, sections: [] },
          entities: part.entities.map((e) => ({ ...e, by: act.id })),
          facts,
          relations: part.relations.map((r) => ({ ...r, by: act.id })),
          ...{ aliases: [], grow: [], changes: [], reviews: [] },
        }),
      );
      if (done.dropped > 0 || done.forgotten > 0) throw new Error(`Maya's ${key} plan lost records`);
    }
    await store.edit({ kind: "rename", id: SELF, name: "Maya Collins" });
    const out = await mem.exportMemory(
      { store, library: { getConversation: async () => null }, now: () => now, zone: () => ZONE, generator: AGENT, platformName: (p) => p },
      { format: "coere", version: "2.0", quotes: true, sensitive: true, chats: false },
    );
    return out.bytes;
  } finally {
    driver.close();
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  const [coereV2, outFile, nowArg] = process.argv.slice(2);
  const bytes = await mayaMemoryBytes(coereV2, nowArg ? Number(nowArg) : Date.now());
  await writeFile(outFile, bytes);
  console.log(`wrote ${bytes.byteLength} bytes to ${outFile}`);
}
