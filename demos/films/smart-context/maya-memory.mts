/**
 * Writes Maya's world (maya-world.mts) into a memory file through
 * coere-v2's own write path, as coere-v2's tools/gen-fake-memory/maya
 * does for the Cori chat film's smaller memory: one extraction plan per
 * chat through `StoreApi.applyPlan`, in the order she had them, each with
 * its chat as a source, the things it named first, their catalog folders
 * and sections, and the memories it taught; a memory said again in a later
 * chat gains that chat's evidence, as v2's grow does. Then v2's exporter
 * writes it as `.coere` 2.0, the way Export memory does, for a bake to
 * import as Import memory does. A fixed clock, ids and seed make the same
 * bytes every run.
 *
 * Runs under coere-v2's tsx (its packages resolve from there): `V2` is the
 * checkout.
 */
import { join } from 'node:path'
import { mayaWorld, type Chat, type Fact, type Thing, type World } from './maya-world.mts'

const ZONE = 'America/Los_Angeles'
const AGENT = { app: 'coere-fake-memory', version: '1.0.0' }

type Rec = Record<string, unknown>

export interface MayaMemory {
  /** The `.coere` file's bytes. */
  bytes: Uint8Array
  world: World
  /** Each thing's key to its id in the file, and each fact's. */
  ids: { things: Record<string, string>; facts: Record<string, string>; self: string }
  /** Each chat's key to its library id (`chatgpt:<key>`). */
  chatIds: Record<string, string>
}

export async function mayaMemory(V2: string): Promise<MayaMemory> {
  const v2 = (p: string) => import(join(V2, p))
  const { sha256Hex } = await v2('packages/core/src/index.ts')
  const mem = await v2('packages/memory/src/index.ts')
  const { openNodeDriver } = await v2('apps/server/src/db/node-driver.ts')
  const { fakeIdMaker } = await v2('tools/gen-fake-memory/ids.ts')
  const { entity, fact, spec } = await v2('tools/gen-fake-memory/records.ts')
  const { CATALOG } = await v2('packages/memory/src/taxonomy/catalog.gen.ts')
  const { TOP_LEVEL_KEYS } = await v2('packages/memory/src/taxonomy/types.ts')

  const world = mayaWorld()
  const things = new Map(world.things.map((t) => [t.key, t]))
  const catalog = CATALOG.sections as Array<{ id: string; parent: string | null; name: string; about: string; base: boolean }>

  const driver = openNodeDriver({ path: ':memory:' })
  const clock = { now: Date.parse('2026-01-01T15:00:00Z') }
  const ids = fakeIdMaker()
  const store = mem.openMemoryStore({
    ...{ driver, guard: mem.createGuard(), now: () => clock.now, random: mem.seededRandom(0x3a7a) },
    ...{ ids, zone: ZONE, agent: AGENT, memoryId: 'a7a40000000000000000000000000002' },
  })
  const self = store.db.read((tx: { get: (sql: string) => { id: string } | undefined }) => tx.get("SELECT id FROM entity WHERE kind = 'self'"))!.id
  const sectionHeld = (id: string): boolean => Boolean(store.db.read((tx: { get: (sql: string, p: unknown[]) => unknown }) => tx.get('SELECT 1 AS x FROM section WHERE id = ?', [id])))

  const thingId: Record<string, string> = {}
  const factId: Record<string, string> = {}
  const folderId = new Map<string, string>()
  const chatIds: Record<string, string> = {}

  for (const chat of world.chats) {
    const lib = `${chat.platform}:${chat.key}`
    chatIds[chat.key] = lib
    const said = chat.says.map((k) => world.facts.find((f) => f.key === k)!)
    const start = Date.parse(chat.at)
    const at = (i: number) => new Date(start + i * 120_000).toISOString().replace('.000Z', 'Z')
    const hashes: string[] = await Promise.all(said.map((f) => sha256Hex(f.text)))
    const ev = (i: number) => {
      const text = said[i]!.text
      return { src: `${lib}#m${i + 1}`, role: 'user', at: at(i), quote: { exact: text, start: 0, end: text.length }, msgSha256: hashes[i]! }
    }
    const last = at(said.length - 1)
    const act = { t: 'activity', id: ids.next('act'), kind: 'extract', started: last, ended: last, agent: { ...AGENT, model: 'claude-fake-model', prompt: 'extract@1', effort: 'medium' } }
    const sections: Rec[] = []
    const entities: Rec[] = []

    const section = (key: string): string => {
      const id = `sec_${key}`
      if (!sectionHeld(id) && !sections.some((s) => s.id === id)) {
        const line = catalog.find((r) => r.id === key)
        sections.push({ t: 'section', id, key, name: line?.name ?? key, about: line?.about ?? '', base: line?.base ?? false, order: TOP_LEVEL_KEYS.indexOf(key) })
      }
      return id
    }
    /** The folder for a section and names under it, made the first time something is filed there, with its catalog id when the catalog has it. */
    const folder = (sec: string, names: string[]): string => {
      const secId = section(sec)
      let parent: string | null = null
      let cat: string | null = sec
      for (let i = 0; i < names.length; i++) {
        const path = `${sec}/${names.slice(0, i + 1).join('/')}`
        const line = catalog.find((r) => r.parent === cat && r.name === names[i])
        cat = line?.id ?? null
        let id = folderId.get(path)
        if (!id) {
          id = ids.next('ent') as string
          folderId.set(path, id)
          entities.push({
            ...{ t: 'entity', id, kind: 'folder', name: names[i], section: secId },
            ...(parent ? { parent } : {}),
            ...{ importance: 2, status: 'active', origin: 'extracted', recorded: { first: act.started, last: act.started } },
            ...{ evidence: [{ src: act.id, role: 'import', at: act.started }], by: act.id },
            ...(line ? { catalogId: line.id, nameSource: 'code' } : { nameSource: 'user_words' }),
          })
        }
        parent = id
      }
      return parent ?? secId
    }
    /** A thing the chat names, with its parents and folders, the first time any chat names it. */
    const make = (key: string, i: number): string => {
      const held = thingId[key]
      if (held) return held
      const t: Thing = things.get(key)!
      const parent = t.parent ? make(t.parent, i) : t.folders.length ? folder(t.section.slice(4), t.folders) : null
      if (!t.parent) section(t.section.slice(4))
      const id = ids.next('ent') as string
      thingId[key] = id
      const kind = t.kind
      entities.push({
        ...entity(
          { id, kind, name: t.name, section: t.section, importance: t.importance, ...(parent ? { parent } : {}), ...(t.aliases ? { aliases: t.aliases } : {}) },
          [ev(i)],
        ),
        by: act.id,
      })
      return id
    }
    const underOf = (f: Fact, i: number): string => {
      if (!f.under.startsWith('folder:')) return make(f.under, i)
      const [sec, ...names] = f.under.slice('folder:'.length).split('/')
      return names.length ? folder(sec!, names) : section(sec!)
    }

    const facts: Array<{ record: Rec; fp: string | null }> = []
    const grow: Rec[] = []
    for (const [i, f] of said.entries()) {
      const subject = f.subject === 'self' ? self : make(f.subject, i)
      const under = underOf(f, i)
      if (factId[f.key]) {
        grow.push({ id: factId[f.key], evidence: [ev(i)] })
        continue
      }
      const id = ids.next('fact') as string
      factId[f.key] = id
      const specifics = f.specific ? [spec(f.specific.type, f.specific.text, f.value ?? (f.due ? { type: 'when', when: { at: f.due } } : undefined))] : []
      const record = {
        ...fact(
          {
            ...{ id, subject, under, kind: f.kind, key: f.claim, text: f.text, importance: f.importance },
            ...(f.due ? { urgency: { due: { at: f.due } } } : {}),
            ...(f.value ? { value: f.value } : {}),
            ...(f.sensitivity ? { sensitivity: f.sensitivity } : {}),
            ...(specifics.length ? { specifics } : {}),
            ...(f.chats.length > 1 ? { mentions: f.chats.length } : {}),
          },
          [ev(i)],
        ),
        by: act.id,
      }
      const name = f.subject === 'self' ? 'Maya Collins' : things.get(f.subject)!.name
      facts.push({ record, fp: await mem.factFingerprint({ self: f.subject === 'self', name }, specifics) })
    }
    const source = {
      ...{ t: 'source', id: lib, platform: chat.platform, title: chat.title, url: `https://${chat.platform === 'chatgpt' ? 'chatgpt.com' : chat.platform === 'claude' ? 'claude.ai' : 'gemini.google.com'}/c/${chat.key}` },
      ...{ createdAt: at(0), updatedAt: last, capturedAt: last },
      ...{ messages: said.length, convSha256: await sha256Hex(said.map((f) => f.text).join('\n')) },
    }
    clock.now = Date.parse(last)
    const done = store.db.write((tx: unknown) =>
      store.applyPlan(tx, {
        activity: act,
        ...{ sources: [source], sections, entities, facts, relations: [] },
        ...{ aliases: [], grow, changes: [], reviews: [] },
      }),
    )
    if (done.dropped > 0 || done.forgotten > 0) throw new Error(`chat ${chat.key} "${chat.title}" lost records: ${JSON.stringify(done)}`)
  }
  clock.now = Date.parse('2026-10-28T09:00:00Z')
  await store.edit({ kind: 'rename', id: self, name: 'Maya Collins' })

  const out = await mem.exportMemory(
    {
      store,
      library: { getConversation: async () => null },
      now: () => Date.parse('2026-10-28T12:00:00Z'),
      zone: () => ZONE,
      generator: AGENT,
      platformName: (platform: string) => platform,
    },
    { format: 'coere', version: '2.0', quotes: true, sensitive: true, chats: false },
  )
  driver.close()
  return { bytes: out.bytes, world, ids: { things: thingId, facts: factId, self }, chatIds }
}

export type { Chat, Fact, Thing, World }
