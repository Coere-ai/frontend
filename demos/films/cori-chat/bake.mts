/**
 * Bakes what Cori reads from Maya's memory in this film, once, through
 * coere-v2's real code in Node: a v2.2 memory core (tests/integration/
 * memory-v22/world.ts: the real engine library on wasm SQLite and the real
 * memory core) imports her memory file as Import memory does
 * (tests/fixtures/memory/maya-actions.coere, the one the film imported),
 * with her self named, as tools/demo-video/actions/stage.ts importMaya
 * does. Then the service worker's own Cori host asks the film's three
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
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const V2 = process.env.COERE_V2
if (!V2) throw new Error('COERE_V2 names the coere-v2 checkout')
const v2 = (p: string) => import(join(V2, p))

const { v22World } = await v2('tests/integration/memory-v22/world.ts')
const { MAYA_MEMORY_PATH } = await v2('tools/gen-fake-memory/maya/path.ts')
const { PLATFORMS } = await v2('packages/platforms/src/index.ts')
const { createCoriHost, surfaceData } = await v2('apps/extension/src/background/cori/host.ts')
const { engineOverWorker } = await v2('apps/extension/src/background/cori/engine-port.ts')
const { memoryData, memoryOverWorker, v22Data } = await v2('apps/extension/src/background/cori/data-memory.ts')
const { bulkAvailableIn } = await v2('apps/extension/src/lib/bulk-available.ts')
const { LINES, ZONE, NOW } = await import('./lines.ts')

const w = await v22World({ chats: [], now: NOW, platformName: (p: string) => ({ chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini' })[p] ?? p })
await w.core.start()

const core = w.core
const memoryApi = (method: string, args?: unknown) => {
  for (const part of [core.search, core.runtime, core.v22, core.actions]) if (part && method in part) return part[method](args)
  if (method === 'memory.edit') return core.store.edit((args as { op: unknown }).op)
  return undefined
}

// Import memory, as the Memory page's Import sheet does, then her self named.
const report = await core.format.import(new Blob([readFileSync(join(V2, MAYA_MEMORY_PATH))]))
console.error('import', JSON.stringify(report))
const overview = (await memoryApi('memory.overview', {})) as { nodes: Array<{ id: string; kind: string }> }
const self = overview.nodes.find((n) => n.kind === 'self')
if (self) await memoryApi('memory.edit', { op: { kind: 'rename', id: self.id, name: 'Maya Collins' } })

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
  console.error(l.line, JSON.stringify(result.answer.blocks).slice(0, 400))
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
console.error(`wrote data/cori.json: ${calls.length} calls, ${Object.keys(now).length} cards`)
w.close()
process.exit(0)
