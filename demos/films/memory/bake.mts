/**
 * Builds Maya's memory once, through coere-v2's real v2.2 pipeline in Node
 * (tests/integration/memory-v22/world.ts: the real engine library on wasm
 * SQLite, the real memory core, and the same stand in models the Coere
 * Memory film was made with, tools/demo-video/stage/story-models.ts), over
 * the chats the film's sites held on install day
 * (tools/demo-video/memory/data.ts). It writes down what the core answered
 * and announced, so the demo's World gives the dashboard and onboarding the
 * very answers the product computed:
 *
 *   - the build's events and the overview as it grew, with their times;
 *   - after the build, each call in calls.json and its answer.
 *
 * Run with coere-v2's tsx:
 *   COERE_V2=/path/to/coere-v2 $COERE_V2/node_modules/.bin/tsx demos/films/memory/bake.mts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const V2 = process.env.COERE_V2
if (!V2) throw new Error('COERE_V2 names the coere-v2 checkout')
const v2 = (p: string) => import(join(V2, p))

const { v22World } = await v2('tests/integration/memory-v22/world.ts')
const { settled } = await v2('tests/integration/memory-v22/built.ts')
const { installDay, SESSION_SET } = await v2('tools/demo-video/memory/data.ts')
const { storyClaude, storyJev } = await v2('tools/demo-video/stage/story-models.ts')

/** The day the film is set on; its chats were written for it. */
const NOW = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`)
const chats = installDay().conversations
console.error(`${chats.length} chats`)

const w = await v22World({ chats, now: NOW, claude: [await storyClaude(SESSION_SET)], jev: [await storyJev(SESSION_SET)], platformName: (p: string) => ({ chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini' })[p] ?? p })
const api = (method: string, args?: unknown) => {
  const core = w.core
  for (const part of [core.search, core.runtime, core.v22, core.actions]) if (part && method in part) return part[method](args)
  if (method === 'memory.edit') return core.store.edit((args as { op: unknown }).op)
  throw new Error(`no part answers ${method}`)
}

await w.core.start()
await w.until((s: { held: unknown }) => s.held !== null, 60_000)

const before = {
  status: await api('memory.status'),
  settings: await api('memory.settings'),
  estimate: await api('memory.buildEstimate', { chats: null }),
  overview: await api('memory.overview', {}),
  /** Chats saved from each AI by Extract all, for its finished rows. */
  platforms: Object.fromEntries(['chatgpt', 'claude', 'gemini'].map((p) => [p, chats.filter((c: { platform: string }) => c.platform === p).length])),
}

// The build, with every event and the overview each time memory changed.
const t0 = Date.now()
const timeline: Array<{ t: number; event?: unknown; overview?: unknown; status?: unknown }> = []
const seen = w.events.length
let reading = false
let again = false
const readOverview = async (): Promise<void> => {
  if (reading) return void (again = true)
  reading = true
  try {
    timeline.push({ t: Date.now() - t0, overview: await api('memory.overview', {}), status: await api('memory.status') })
  } finally {
    reading = false
    if (again) {
      again = false
      setTimeout(() => void readOverview(), 300)
    }
  }
}
const timer = setInterval(() => {
  const fresh = w.events.splice(seen)
  for (const event of fresh) {
    timeline.push({ t: Date.now() - t0, event })
    if ((event as { name: string }).name === 'memory.changed') void readOverview()
  }
}, 50)
await api('memory.control', { action: 'build', mode: 'direct', from: 'onboarding' })
await settled(w, 900_000)
clearInterval(timer)
for (const event of w.events.splice(seen)) timeline.push({ t: Date.now() - t0, event })
console.error(`built in ${Date.now() - t0} ms, ${timeline.length} timeline entries`)

// After the build: each call the dashboard makes, and its answer.
const calls = JSON.parse(readFileSync(join(here, 'calls.json'), 'utf8')) as Array<{ method: string; args?: unknown; each?: string }>
const answers: Array<{ method: string; args?: unknown; answer: unknown }> = []
const ask = async (method: string, args?: unknown) => {
  try {
    answers.push({ method, args, answer: (await api(method, args)) ?? null })
  } catch (e) {
    console.error(`${method} ${JSON.stringify(args)}: ${String(e)}`)
  }
}
const overview = (await api('memory.overview', {})) as { nodes: Array<{ id: string }> }
for (const c of calls) {
  if (c.each === 'node') for (const n of overview.nodes) await ask(c.method, { ...(c.args as object), id: n.id })
  else await ask(c.method, c.args)
}
// The library, as the engine holds it after Extract all.
const engine: Array<{ method: string; args?: unknown; answer: unknown }> = []
const engineCalls = JSON.parse(readFileSync(join(here, 'engine-calls.json'), 'utf8')) as Array<{ method: string; args?: unknown }>
for (const c of engineCalls) {
  try {
    engine.push({ method: c.method, args: c.args, answer: (await (w.engine as Record<string, (a: unknown) => Promise<unknown>>)[c.method](c.args)) ?? null })
  } catch (e) {
    console.error(`engine ${c.method}: ${String(e)}`)
  }
}

writeFileSync(join(here, 'data/memory.json'), JSON.stringify({ now: NOW, before, timeline, answers, engine }))
console.error('wrote data/memory.json')
w.close()
process.exit(0)
