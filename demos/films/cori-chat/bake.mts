/**
 * Bakes what Cori reads from Maya's memory in this film, once, through
 * coere-v2's real code in Node: a v2.2 memory core (tests/integration/
 * memory-v22/world.ts: the real engine library on wasm SQLite and the real
 * memory core) imports her memory file as Import memory does. The file is
 * her whole memory, 532 memories from 324 chats (ChatGPT 148, Claude 102,
 * Gemini 74), written through v2's own write path by the Smart context
 * film's generator (../smart-context/maya-world.mts, maya-memory.mts),
 * which holds everything the film's own memory file held
 * (tests/fixtures/memory/maya-actions.coere: the people she writes to, the
 * CS 162 due date, her clinic form) and the rest of her year. Then the
 * service worker's own Cori host asks the film's three
 * lines from the surface each was asked on, and every engine call the host
 * makes is written down with the core's answer. The demo runs the same
 * host in the page and gives it these answers, so Cori answers there with
 * his own code over the memory the product holds.
 *
 * It also writes memory's status after the import, which the toolbar
 * popup's Home counts its memories from, and how each memory card Cori showed reads when a stored
 * chat is opened again (the history's withMemoryNow), for the Cori page.
 *
 * Run with coere-v2's tsx:
 *   COERE_V2=/path/to/coere-v2 $COERE_V2/node_modules/.bin/tsx demos/films/cori-chat/bake.mts
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const V2 = process.env.COERE_V2
if (!V2) throw new Error('COERE_V2 names the coere-v2 checkout')
const v2 = (p: string) => import(join(V2, p))

const { v22World } = await v2('tests/integration/memory-v22/world.ts')
const { PLATFORMS } = await v2('packages/platforms/src/index.ts')
const { createCoriHost, surfaceData } = await v2('apps/extension/src/background/cori/host.ts')
const { engineOverWorker } = await v2('apps/extension/src/background/cori/engine-port.ts')
const { memoryData, memoryOverWorker, v22Data } = await v2('apps/extension/src/background/cori/data-memory.ts')
const { bulkAvailableIn } = await v2('apps/extension/src/lib/bulk-available.ts')
const { LINES, ZONE, NOW } = await import('./lines.ts')
const { mayaMemory } = await import('../smart-context/maya-memory.mts')

const w = await v22World({ chats: [], now: NOW, platformName: (p: string) => ({ chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini' })[p] ?? p })
await w.core.start()

const memoryApi = (method: string, args?: unknown) => {
  const core = w.core
  for (const part of [core.search, core.runtime, core.v22, core.actions]) if (part && method in part) return part[method](args)
  if (method === 'memory.edit') return core.store.edit((args as { op: unknown }).op)
  return undefined
}

// Import memory, as the Memory page's Import sheet does, then her self named.
const maya = await mayaMemory(V2)
const report = await w.core.format.import(new Blob([maya.bytes]))
console.error('import', JSON.stringify(report))
const overview = (await memoryApi('memory.overview', {})) as { nodes: Array<{ id: string; kind: string }> }
const self = overview.nodes.find((n) => n.kind === 'self')
if (self) await memoryApi('memory.edit', { op: { kind: 'rename', id: self.id, name: 'Maya Collins' } })
// Her things get their vectors when the worker opens the file again, as after an import in the extension.
await w.restart()
const unembedded = () =>
  w.memoryDriver.get(`SELECT COUNT(*) AS n FROM entity e WHERE e.status = 'active' AND e.kind <> 'self' AND NOT EXISTS (SELECT 1 FROM node_vec v WHERE v.owner = 'node' AND v.id = e.id)`)?.n ?? 0
for (let i = 0; i < 300 && unembedded() > 0; i++) await new Promise((r) => setTimeout(r, 200))

// Every call Cori's host makes, with the core's answer.
const calls: Array<{ method: string; args: unknown; answer: unknown }> = []
const forward = async (msg: { id: string; method: string; args: unknown }) => {
  try {
    let answer = method(msg.method) ? await memoryApi(msg.method, msg.args) : undefined
    if (answer === undefined && !msg.method.startsWith('memory.') && !msg.method.startsWith('recall.'))
      answer = await (w.engine as Record<string, (a: unknown) => Promise<unknown>>)[msg.method]?.(msg.args)
    calls.push({ method: msg.method, args: msg.args, answer: answer ?? null })
    return { id: msg.id, ok: true, result: answer ?? null }
  } catch (e) {
    console.error(`${msg.method}: ${String(e)}`)
    return { id: msg.id, ok: false, error: { code: 'internal', message: String(e) } }
  }
}
const method = (m: string) => m.startsWith('memory.') || m.startsWith('recall.')

const calls$ = memoryOverWorker(forward)
const batches = { read: async () => null, progress: async () => new Map() }
const host = createCoriHost({
  version: 2,
  bulk: PLATFORMS.map((p: { id: string }) => p.id).filter(bulkAvailableIn(true)),
  clock: Date.now,
  zone: () => ZONE,
  dataFor: async (asker: unknown) =>
    surfaceData(asker, {
      engine: engineOverWorker(forward),
      batches,
      memory: { ...memoryData(calls$, ZONE), v22: { site: v22Data(calls$, null, true), own: v22Data(calls$, null, false) } },
      clock: Date.now,
    }),
})

const answers: unknown[] = []
for (const l of LINES) {
  const result = await host.ask(l.asker, { input: { line: l.line }, state: null, conv: 'cori_bake00000001' })
  answers.push({ line: l.line, result })
  console.error(l.line, JSON.stringify(result.answer.blocks).slice(0, 6000))
}

// How each memory card reads when its chat is opened again: the history's own read.
const ids = new Set<string>()
JSON.stringify(answers, (k, v) => {
  if (v && typeof v === 'object' && Array.isArray(v.rows)) for (const r of v.rows) if (typeof r?.id === 'string') ids.add(r.id)
  if (v && typeof v === 'object' && Array.isArray(v.facts)) for (const r of v.facts) if (typeof r?.id === 'string') ids.add(r.id)
  return v
})
const facts = [...ids].map((id) => ({ id, path: [] as string[] }))
const done = await memoryApi('memory.chat.append', { convId: null, startedOn: 'dashboard', fresh: true, turn: { role: 'cori', at: NOW, text: 'x', blocks: [{ type: 'memory', facts, more: 0, folder: null }], runId: null } })
const read = (await memoryApi('memory.chat.get', { id: done.conv.id })) as { turns: Array<{ blocks: Array<{ facts?: Array<{ id: string; now: unknown }> }> }> }
const now = Object.fromEntries((read.turns[0]?.blocks[0]?.facts ?? []).map((f) => [f.id, f.now]))

// The calls each line made; a call asked the same way twice keeps one answer.
// Memory's status after the import, which the popup's Home counts from.
const status = await memoryApi('memory.status')
writeFileSync(join(here, 'data/cori.json'), JSON.stringify({ calls, now, status }, null, 1))
// Her Claude chats, newest first, for Claude's sidebar on the page Right Option opens on (sites.mjs).
const claude = maya.world.chats.filter((c) => c.platform === 'claude').reverse().map((c) => c.title)
writeFileSync(join(here, 'data/claude-chats.json'), JSON.stringify(claude, null, 1))
console.error(`wrote data/cori.json: ${calls.length} calls, ${Object.keys(now).length} cards`)
w.close()
process.exit(0)
