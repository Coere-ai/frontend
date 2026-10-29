/**
 * Bakes the forge-dev film's data once, by running coere-v2's real code in
 * Node, as demos/films/v3/bake.mts does:
 *
 *   1. Maya's memory, through the real v2.2 pipeline (the memory core on
 *      wasm SQLite, MiniLM from the extension's files, the stand in Claude
 *      and Jev the films were made with) over the chats the films' sites
 *      held (tools/demo-video/v2/data.ts everything()).
 *   2. The engine worker's real access layer (engine/access/start.ts) on
 *      that memory, paired with a real coere-server on this computer.
 *   3. Add an app on the Apps page: access.tokens.create with what the film
 *      picks in the dialog, and what the Apps section reads before and after.
 *   4. The developer's app, through the real @coere/client (packages/client):
 *      context.forDraft for what its user typed, with the token the dialog
 *      made. Its `block` is what the film's terminal prints.
 *
 * Run with coere-v2's tsx, from the frontend checkout:
 *   COERE_V2=/path/to/coere-v2 $COERE_V2/node_modules/.bin/tsx demos/films/forge-dev/bake.mts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const V2 = process.env.COERE_V2
if (!V2) throw new Error('COERE_V2 names the coere-v2 checkout')
const v2 = (p: string) => import(join(V2, p))

Object.assign(globalThis, { __COERE_VERSION__: 3, __COERE_FAKE_SITES__: true, __COERE_EDITION__: 'consumer' })

const { v22World } = await v2('tests/integration/memory-v22/world.ts')
const { settled } = await v2('tests/integration/memory-v22/built.ts')
const data = await v2('tools/demo-video/v2/data.ts')
const { storyClaude, storyJev } = await v2('tools/demo-video/stage/story-models.ts')
const { realEmbedder } = await v2('evals/context/smart/build.ts')
const { startAccess } = await v2('apps/extension/src/engine/access/start.ts')
const { workerMemory } = await v2('apps/extension/src/engine/access/worker-memory.ts')
const { startLive } = await v2('apps/server/src/security/live.ts')
const { platformById } = await v2('packages/platforms/src/index.ts')
const { Coere } = await v2('packages/client/src/index.ts')

const shownName = (p: string): string => {
  try {
    return platformById(p).name
  } catch {
    return p
  }
}

/** The day the film is set on; Maya's chats were written for it. */
const NOW = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`)
const chats = data.everything().conversations as Array<{ platform: string }>
console.error(`${chats.length} chats`)

// 1. The build.
const w = await v22World({
  chats,
  now: NOW,
  claude: [await storyClaude(data.STORY)],
  jev: [await storyJev(data.STORY)],
  embedder: realEmbedder(),
  platformName: shownName,
})
await w.core.start()
await w.until((s: { held: unknown }) => s.held !== null, 60_000)
const { memoryMethods } = await v2('apps/extension/src/engine/memory/methods.ts')
const { engineMethods } = await v2('apps/extension/src/engine/methods.ts')
const table: Record<string, (a: unknown) => Promise<unknown>> = {
  ...engineMethods(async () => w.engine),
  ...memoryMethods({
    core: async () => w.core,
    capture: { 'capture.tail': async () => ({ count: 0, tail: [] }), 'capture.append': async () => ({ outcome: 'unchanged', count: 0 }) },
    staging: { write: async () => undefined, read: async () => new Uint8Array(), remove: async () => undefined },
  }),
}
const t0 = Date.now()
await table['memory.control']!({ action: 'build', mode: 'direct', from: 'onboarding' })
await settled(w, 900_000)
const builtSeen = () => w.events.some((e: { name?: string }) => e.name === 'memory.built')
for (let i = 0; i < 600 && !builtSeen(); i++) await new Promise((r) => setTimeout(r, 200))
if (!builtSeen()) throw new Error('the build never said memory.built')
await w.until((s: { state: string }) => s.state === 'ready', 120_000)
await new Promise((r) => setTimeout(r, 1500))
console.error(`built in ${Date.now() - t0} ms`)
// What the dashboard asks of the memory beside the Apps section, answered by the worker's own method table.
const api = async (method: string, args?: unknown): Promise<unknown> => {
  const fn = table[method]
  if (fn) return fn(args ?? {})
  for (const part of [w.core.search, w.core.runtime, w.core.v22, w.core.actions]) if (part && method in part) return part[method](args)
  throw new Error(`no part answers ${method}`)
}
const reads = { status: await api('memory.status'), settings: await api('memory.settings'), estimate: await api('memory.buildEstimate', { chats: null }) }

// 2. The worker's access layer, paired with a real coere-server.
const live = await startLive()
const serverUrl = `http://127.0.0.1:${live.port}`
const now = () => Date.now()
const ORIGIN = `chrome-extension://${'fake'.repeat(8)}`
const access = startAccess({
  memory: async () => workerMemory({ driver: w.memoryDriver, store: w.core.store }, now, '3.0.0'),
  run: async (_p: number, fn: () => unknown) => fn(),
  net: { fetch: (url: string, init: RequestInit) => fetch(url, { ...init, headers: { ...(init.headers as Record<string, string>), Origin: ORIGIN } }), now, random: (b: Uint8Array) => void crypto.getRandomValues(b) },
  clock: { now, setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms), clearTimeout: (h: unknown) => clearTimeout(h as never) },
  post: () => undefined,
})
const call = (method: string, args?: unknown): Promise<any> => access.methods[method](args ?? {})
const passes = setInterval(() => {
  for (const e of w.events.splice(0)) if ((e as { name: string }).name === 'memory.changed') access.onMemoryChanged()
}, 100)

async function synced(ms = 120_000): Promise<void> {
  const end = Date.now() + ms
  await call('access.syncNow')
  for (;;) {
    const s = await call('access.status')
    if (s.state === 'ok' && s.pending === 0) return
    if (Date.now() > end) throw new Error(`never synced: ${JSON.stringify(s)}`)
    await new Promise((r) => setTimeout(r, 250))
  }
}

const paired = await call('access.pair', { url: serverUrl, code: live.server.pairingCode ?? '', deviceName: 'Chrome on this computer' })
console.error(`paired: ${paired.state}`)
await synced()

async function apps(): Promise<Record<string, unknown>> {
  return {
    status: await call('access.status'),
    tokens: await call('access.tokens.list'),
    log: await call('access.contextLog', { limit: 1000 }),
    connects: await call('access.connects.list'),
    requests: await call('access.requests', { limit: 50 }),
  }
}
const phases: Record<string, unknown> = {}
phases.paired = await apps()

// 3. Add an app, as the film fills the dialog in (film.ts ADD).
const ADD = JSON.parse(process.env.FORGE_ADD ?? 'null') ?? {
  name: 'prep-coach',
  scopes: ['memory:read', 'memory:evidence'],
  sections: ['work', 'projects', 'plans'],
  expiresInDays: null,
}
const made = await call('access.tokens.create', ADD)
console.error(`made: ${made.token.slice(0, 14)}...`)
await synced()
phases.made = await apps()

// 4. The developer's app: what its user typed, and the context Coere adds in front of it.
const DRAFT = 'Help me prepare for this interview'
const coere = new Coere({ baseUrl: serverUrl, token: made.token })
const ctx = await coere.context.forDraft(DRAFT, { chat: crypto.randomUUID() })
console.error(ctx.block)
console.error(JSON.stringify(ctx.items.map((i: { path: string[]; why: string }) => [i.path.join(' / '), i.why])))
await synced()
phases.used = await apps()

clearInterval(passes)
access.stop()

const out = { add: ADD, made, phases, draft: DRAFT, context: ctx, reads }
const text = JSON.stringify({ block: ctx.block, made: made.token })
if (/localhost|127\.0\.0\.1/.test(text)) throw new Error('the context names the server address')
mkdirSync(join(here, 'data'), { recursive: true })
writeFileSync(join(here, 'data/forge.json'), JSON.stringify(out, null, 1))
console.error('wrote data/forge.json')
await live.stop()
w.close()
process.exit(0)
