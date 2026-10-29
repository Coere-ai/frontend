/**
 * Bakes what this film's World answers from Maya's memory, once, through
 * coere-v2's real code in Node: maya-memory.mts writes her world
 * (maya-world.mts: 324 chats, ChatGPT 148, Claude 102, Gemini 74) into a
 * memory file through v2's own write path, a v2.2 memory core
 * (tests/integration/memory-v22/world.ts) imports it as Import memory does,
 * and then the core itself answers:
 *
 *   - memory.contextGraph, the memory search's graph, every live thing
 *     with its dots (import-context/smart/graph.ts);
 *   - memory.contextFind for each word the film types, as she types it;
 *   - memory.status, whose counts the dashboard reads.
 *
 * It also writes, from the same world, the lines and chats behind each
 * memory the strip shows (so "From N chats" counts the chats that taught
 * them), her library's rows and the ChatGPT sidebar's titles.
 *
 * Run with coere-v2's tsx:
 *   COERE_V2=/path/to/coere-v2 $COERE_V2/node_modules/.bin/tsx demos/films/smart-context/bake.mts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mayaMemory } from './maya-memory.mts'

const here = dirname(fileURLToPath(import.meta.url))
const V2 = process.env.COERE_V2
if (!V2) throw new Error('COERE_V2 names the coere-v2 checkout')
const v2 = (p: string) => import(join(V2, p))

const NOW = Date.parse('2026-10-29T15:00:00Z')
const { v22World } = await v2('tests/integration/memory-v22/world.ts')
const { DEFAULT_CONTEXT_OPTIONS } = await v2('packages/memory/src/import-context/types.ts')
const { CATALOG } = await v2('packages/memory/src/taxonomy/catalog.gen.ts')

const maya = await mayaMemory(V2)
const { world } = maya
console.error(`file: ${maya.bytes.length} bytes`)

const w = await v22World({ chats: [], now: NOW, platformName: (p: string) => ({ chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini' })[p] ?? p })
await w.core.start()
const api = (method: string, args?: unknown) => {
  const core = w.core
  for (const part of [core.search, core.runtime, core.v22, core.actions]) if (part && method in part) return part[method](args)
  throw new Error(`no part answers ${method}`)
}
console.error('import', JSON.stringify(await w.core.format.import(new Blob([maya.bytes]))))

// Every thing gets its vector, as the worker's pass does when it opens the file again, so the search's meaning half sees them.
await w.restart()
const left = () =>
  w.memoryDriver.get(
    `SELECT COUNT(*) AS n FROM entity e WHERE e.status = 'active' AND e.kind <> 'self'
       AND NOT EXISTS (SELECT 1 FROM node_vec v WHERE v.owner = 'node' AND v.id = e.id)`,
  )?.n ?? 0
for (let i = 0; i < 300 && left() > 0; i++) await new Promise((r) => setTimeout(r, 200))
console.error(`things without a vector: ${left()}`)

// The ids the file holds for her things, by name and path, read back from the core.
const rows = w.memoryDriver.all(`SELECT e.id, e.name, e.kind, p.id AS parent FROM entity e LEFT JOIN entity p ON p.n = e.parent_n WHERE e.status = 'active'`) as Array<{ id: string; name: string; kind: string; parent: string | null }>
const known = new Set(rows.map((r) => r.id))
for (const [key, id] of Object.entries(maya.ids.things)) if (!known.has(id)) throw new Error(`the import lost ${key}`)

const query = { platform: 'chatgpt', chat: { kind: 'draft', session: 'bake' }, tail: '', keywords: [], options: { ...DEFAULT_CONTEXT_OPTIONS } }
const graph = await api('memory.contextGraph', query)
console.error(`graph: ${graph.nodes.length} nodes, ${graph.nodes.reduce((n: number, x: { memories: number[] }) => n + x.memories.length, 0)} memory dots, more ${graph.more}`)

// What the memory search finds as she types, each step of the word, with nothing skipped: the tab skips what already goes.
const WORDS = ['plan']
const find: Record<string, unknown> = {}
for (const word of WORDS)
  for (let i = 0; i <= word.length; i++) {
    const q = word.slice(0, i)
    if (q in find) continue
    find[q] = await api('memory.contextFind', { ...query, query: q, skip: [] })
  }
console.error('plan finds', JSON.stringify((find.plan as { results: Array<{ id: string }> }).results.map((r) => rows.find((x) => x.id === r.id)?.name)), (find.plan as { lit: string[] }).lit.length, 'lit')

const status = await api('memory.status')
console.error('counts', JSON.stringify(status.counts))

// The strip's memories: each one's path, and for each line the chats that said it, by their library ids.
const sectionName = (key: string) => (CATALOG.sections as Array<{ id: string; name: string }>).find((s) => s.id === key)?.name ?? key
const things = new Map(world.things.map((t) => [t.key, t]))
const pathOf = (key: string): string[] => {
  const t = things.get(key)!
  return t.parent ? [...pathOf(t.parent), t.name] : [sectionName(t.section.slice(4)), ...t.folders, t.name]
}
const chatsOf = (text: string) => world.facts.find((f) => f.text === text)?.chats.map((c) => maya.chatIds[c]!) ?? []
const featured: Record<string, unknown> = {}
for (const key of ['pearx', 'tidepool', 'launch', 'stripe', 'skipdoodle', 'iris']) {
  featured[key] = {
    id: maya.ids.things[key],
    path: pathOf(key),
    lines: world.facts.filter((f) => f.subject === key).map((f) => ({ text: f.text, chats: f.chats.map((c) => maya.chatIds[c]!) })),
  }
}
const about = [...new Set(world.facts.filter((f) => f.core).flatMap((f) => f.chats.map((c) => maya.chatIds[c]!)))]

// Her library: every chat, newest first, and the ChatGPT sidebar's order.
const chats = world.chats.map((c) => ({ id: maya.chatIds[c.key], platform: c.platform, key: c.key, title: c.title, at: c.at, messages: c.says.length }))
const titleOf = new Map(world.chats.map((c) => [c.key, c.title]))
const sidebar = world.sidebar.map((k) => titleOf.get(k)!)

mkdirSync(join(here, 'data'), { recursive: true })
writeFileSync(
  join(here, 'data/maya.json'),
  JSON.stringify({ now: NOW, status, graph, find, featured, about, chatsOf: { prep: chatsOf('My PearX interview answer on traction should lead with the 1,200 weekly users.') }, chats, sidebar }),
)
console.error('wrote data/maya.json')
w.close()
process.exit(0)
