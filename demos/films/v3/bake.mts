/**
 * Bakes the v3 film's data once, by running coere-v2's real code in Node,
 * as coere-v2's own v3 film ran it in a browser (tools/demo-video/v3.demo.ts):
 *
 *   1. Maya's memory, through the real v2.2 pipeline (the memory core on
 *      wasm SQLite, MiniLM from the extension's files, the stand in Claude
 *      and Jev the film was made with) over the chats the film's sites held
 *      (tools/demo-video/v2/data.ts everything()). The build's events and
 *      the overview as it grew are kept with their times, for onboarding.
 *   2. The engine worker's real access layer (engine/access/start.ts) on
 *      that memory file, paired with a real coere-server on this computer,
 *      as the dashboard's Connect pairs it.
 *   3. The event planner and the Python SDK, run for real through their
 *      own virtual environments against that server: `planner --connect`
 *      (and Allow, through the worker's access.connects.decide), the SDK's
 *      context.py for the draft, and a planner run with Claude's stand in.
 *      What they printed is kept, with the temporary folder named as Maya's.
 *   4. After each step, the answers the dashboard's Apps section reads
 *      (access.status, tokens, the context log, the requests, the inbox),
 *      and the memory reads that turn the context log's ids into words.
 *   5. The strip's answers on ChatGPT for the same draft (memory.contextFor
 *      through the worker's own method table), for the calls in strip.json.
 *
 * Run with coere-v2's tsx, from the frontend checkout:
 *   COERE_V2=/path/to/coere-v2 $COERE_V2/node_modules/.bin/tsx demos/films/v3/bake.mts
 */
import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const V2 = process.env.COERE_V2
if (!V2) throw new Error('COERE_V2 names the coere-v2 checkout')
const v2 = (p: string) => import(join(V2, p))

// The worker's code reads these as the v3 build defines them.
Object.assign(globalThis, { __COERE_VERSION__: 3, __COERE_FAKE_SITES__: true, __COERE_EDITION__: 'consumer' })

const { v22World } = await v2('tests/integration/memory-v22/world.ts')
const { settled } = await v2('tests/integration/memory-v22/built.ts')
const data = await v2('tools/demo-video/v2/data.ts')
const { storyClaude, storyJev } = await v2('tools/demo-video/stage/story-models.ts')
const { realEmbedder } = await v2('evals/context/smart/build.ts')
const { memoryMethods } = await v2('apps/extension/src/engine/memory/methods.ts')
const { engineMethods } = await v2('apps/extension/src/engine/methods.ts')
const { startAccess } = await v2('apps/extension/src/engine/access/start.ts')
const { workerMemory } = await v2('apps/extension/src/engine/access/worker-memory.ts')
const { startLive } = await v2('apps/server/src/security/live.ts')
const { startClaude } = await v2('tools/planner-run/run.ts')
const { FAKE_KEY } = await v2('tests/fake-claude/rules.ts')
const { platformById } = await v2('packages/platforms/src/index.ts')

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
const table: Record<string, (a: unknown) => Promise<unknown>> = {
  ...engineMethods(async () => w.engine),
  ...memoryMethods({
    core: async () => w.core,
    capture: { 'capture.tail': async () => ({ count: 0, tail: [] }), 'capture.append': async () => ({ outcome: 'unchanged', count: 0 }) },
    staging: { write: async () => undefined, read: async () => new Uint8Array(), remove: async () => undefined },
  }),
}
const api = async (method: string, args?: unknown): Promise<unknown> => {
  const fn = table[method]
  if (fn) return fn(args ?? {})
  const core = w.core
  for (const part of [core.search, core.runtime, core.v22, core.actions]) if (part && method in part) return part[method](args)
  throw new Error(`no part answers ${method}`)
}

await w.core.start()
await w.until((s: { held: unknown }) => s.held !== null, 60_000)

const before = {
  status: await api('memory.status'),
  settings: await api('memory.settings'),
  estimate: await api('memory.buildEstimate', { chats: null }),
  overview: await api('memory.overview', {}),
  platforms: Object.fromEntries(['chatgpt', 'claude', 'gemini'].map((p) => [p, chats.filter((c) => c.platform === p).length])),
}

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
  for (const event of w.events.splice(seen)) {
    timeline.push({ t: Date.now() - t0, event })
    if ((event as { name: string }).name === 'memory.changed') void readOverview()
  }
}, 50)
await api('memory.control', { action: 'build', mode: 'direct', from: 'onboarding' })
await settled(w, 900_000)
// The build's end is the `memory.built` event onboarding waits for; the last stage may still be running when the jobs go quiet.
const builtSeen = () => timeline.some((e) => (e.event as { name?: string } | undefined)?.name === 'memory.built')
for (let i = 0; i < 600 && !builtSeen(); i++) await new Promise((r) => setTimeout(r, 200))
await w.until((s: { state: string }) => s.state === 'ready', 120_000)
await new Promise((r) => setTimeout(r, 1500))
if (!builtSeen()) throw new Error('the build never said memory.built')
clearInterval(timer)
for (const event of w.events.splice(seen)) timeline.push({ t: Date.now() - t0, event })
console.error(`built in ${Date.now() - t0} ms, ${timeline.length} timeline entries`)

type Asked = { method: string; args?: unknown; answer: unknown }
const answers: Asked[] = []
const ask = async (list: Asked[], method: string, args?: unknown): Promise<unknown> => {
  try {
    const answer = (await api(method, args)) ?? null
    list.push({ method, args, answer })
    return answer
  } catch (e) {
    console.error(`${method} ${JSON.stringify(args)}: ${String(e)}`)
    return null
  }
}
const calls = JSON.parse(readFileSync(join(here, 'calls.json'), 'utf8')) as Array<{ method: string; args?: unknown }>
for (const c of calls) await ask(answers, c.method, c.args)

// 5. The strip on ChatGPT, for the calls the tab makes as Maya types the draft.
const strip: Asked[] = []
for (const c of JSON.parse(readFileSync(join(here, 'strip.json'), 'utf8')) as Array<{ method: string; args?: unknown }>) await ask(strip, c.method, c.args)

// 2. The worker's access layer, paired with a real coere-server.
const live = await startLive()
const serverUrl = `http://127.0.0.1:${live.port}`
const now = () => Date.now()
const ORIGIN = `chrome-extension://${'fake'.repeat(8)}`
const access = startAccess({
  memory: async () => workerMemory({ driver: w.memoryDriver, store: w.core.store }, now, '3.0.0'),
  run: async (_p: number, fn: () => unknown) => fn(),
  // Chrome adds the extension's origin to its requests; the server checks it.
  net: { fetch: (url: string, init: RequestInit) => fetch(url, { ...init, headers: { ...(init.headers as Record<string, string>), Origin: ORIGIN } }), now, random: (b: Uint8Array) => void crypto.getRandomValues(b) },
  clock: { now, setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms), clearTimeout: (h: unknown) => clearTimeout(h as never) },
  // The dashboard hears access.status from the film's own steps (world.ts), so the worker's events are not kept.
  post: () => undefined,
})
const call = (method: string, args?: unknown): Promise<any> => access.methods[method](args ?? {})
// Memory changes reach the schedule, as the worker wires memory.changed to it.
const passes = setInterval(() => {
  for (const e of w.events.splice(0)) if ((e as { name: string }).name === 'memory.changed') access.onMemoryChanged()
}, 100)

/** Asks for a pass and waits until one has run and nothing waits to go. */
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

const LOG_LIMIT = 1000
/** What the Apps section reads at one moment of the film. */
async function apps(): Promise<Record<string, unknown>> {
  return {
    status: await call('access.status'),
    tokens: await call('access.tokens.list'),
    log: await call('access.contextLog', { limit: LOG_LIMIT }),
    connects: await call('access.connects.list'),
    requests: await call('access.requests', { limit: 50 }),
  }
}
const phases: Record<string, unknown> = {}
phases.paired = await apps()

// 3. The commands, as Maya runs them in ~/event-planner.
const dir = mkdtempSync(join(tmpdir(), 'coere-planner-'))
const envFile = join(dir, '.env')
writeFileSync(envFile, '')
const HOME = '~/event-planner'
const named = (text: string): string => text.split(`${dir}/`).join(`${HOME}/`).split(dir).join(HOME).trimEnd()
const token = (): string => /^COERE_TOKEN=(.+)$/m.exec(readFileSync(envFile, 'utf8'))?.[1] ?? ''
const PLANNER = join(V2, 'examples/event-planner/.venv/bin/planner')
const PYTHON = join(V2, 'sdk/python/.venv/bin/python')
const CONTEXT = join(V2, 'sdk/python/examples/context.py')

function envWith(extra: Record<string, string>): NodeJS.ProcessEnv {
  const kept = Object.entries(process.env).filter(([k]) => !k.startsWith('ANTHROPIC_') && !k.startsWith('COERE_'))
  // Unbuffered, so the planner's line with the code comes while it waits; and no bytecode written into coere-v2.
  return { ...Object.fromEntries(kept), NODE_NO_WARNINGS: '1', PYTHONUNBUFFERED: '1', PYTHONDONTWRITEBYTECODE: '1', ...extra }
}

function run(cmd: string, args: string[], env: Record<string, string>): Promise<string> {
  return new Promise((done, fail) => {
    const child = spawn(cmd, args, { cwd: dir, env: envWith(env) })
    let out = ''
    let err = ''
    child.stdout.on('data', (b: Buffer) => (out += b.toString()))
    child.stderr.on('data', (b: Buffer) => (err += b.toString()))
    child.on('error', fail)
    child.on('exit', (code) => (code === 0 ? done(named(out)) : fail(new Error(`${cmd} ended with ${code}: ${err.trim().split('\n').at(-1)}`))))
  })
}

// planner --connect: its first line is the code to match; it waits for Allow.
const connect = await new Promise<{ asked: string; allowed: Promise<string> }>((ready, fail) => {
  const child = spawn(PLANNER, ['--connect', '--env-file', envFile], { cwd: dir, env: envWith({ COERE_URL: serverUrl }) })
  let out = ''
  let err = ''
  let asked = false
  child.stderr.on('data', (b: Buffer) => (err += b.toString()))
  const allowed = new Promise<string>((done, refused) =>
    child.on('exit', (code) => (code === 0 ? done(named(out.split('\n').slice(1).join('\n'))) : refused(new Error(`planner --connect ended with ${code}: ${err}`)))),
  )
  child.stdout.on('data', (b: Buffer) => {
    out += b.toString()
    if (!asked && out.includes('\n')) {
      asked = true
      ready({ asked: named(out.split('\n')[0]!), allowed })
    }
  })
  child.on('error', fail)
})
console.error(`asked: ${connect.asked}`)
await synced()
// The inbox comes with a pass; wait until the request is in it.
for (let i = 0; i < 40 && (await call('access.connects.list')).length === 0; i++) {
  await call('access.syncNow')
  await new Promise((r) => setTimeout(r, 250))
}
phases.asked = await apps()
const ask1 = ((phases.asked as { connects: Array<{ id: string; scopes: string[] }> }).connects)[0]
if (!ask1) throw new Error('the planner asked, but no request reached the inbox')
// Allow with the switches as the card starts them: contact details off (connect.py's note), the rest ticked.
const allowScopes = ask1.scopes.filter((s) => s !== 'memory:identity')
const decided = await call('access.connects.decide', { id: ask1.id, decision: 'allow', scopes: allowScopes })
const allowedOut = await connect.allowed
console.error(`allowed: ${allowedOut}`)
await synced()
phases.allowed = await apps()

const DRAFT = 'Help me prepare for this interview'
const contextOut = await run(PYTHON, [CONTEXT, DRAFT], { COERE_URL: serverUrl, COERE_TOKEN: token() })
console.error(contextOut)

// The planner, with Claude's stand in; the first request her memory can plan is the one filmed (v3/planner.ts).
const REQUESTS = ['Plan a dinner with Caleb next Friday', 'Plan a dinner with Iris next Friday', 'Plan a dinner with Elena next Friday']
const claude = await startClaude('planner:happy')
let plan: { request: string; out: string } | null = null
try {
  for (const request of REQUESTS) {
    const out = await run(PLANNER, [request, '--out', join(dir, 'plan.ics')], { COERE_URL: serverUrl, COERE_TOKEN: token(), ANTHROPIC_API_KEY: FAKE_KEY, ANTHROPIC_BASE_URL: claude.url }).catch((e: Error) => {
      console.error(`planner: ${e.message}`)
      return null
    })
    if (out !== null) {
      plan = { request, out }
      break
    }
  }
} finally {
  await claude.close()
}
if (!plan) throw new Error('the planner could plan none of the requests')
console.error(plan.out)
await synced()
phases.used = await apps()

// 4. The memory reads "What it was sent" makes for the ids the log names.
const sent: Asked[] = []
const ids = new Set<string>()
for (const row of (phases.used as { log: Array<{ items: Array<{ id: string }> }> }).log) for (const item of row.items) ids.add(item.id)
await ask(sent, 'memory.corePack')
for (const id of ids) {
  if (id === 'core') continue
  await ask(sent, 'memory.node', { id })
  await ask(sent, 'memory.documents', { id })
}

// Revoke.
const tokenId = (phases.used as { tokens: Array<{ id: string }> }).tokens[0]?.id
await call('access.tokens.revoke', { id: tokenId })
await synced()
phases.revoked = await apps()

clearInterval(passes)
access.stop()

const terminal = {
  connect: { command: 'uv run planner --connect', asked: connect.asked, allowed: allowedOut },
  context: { command: `uv run context.py "${DRAFT}"`, out: contextOut },
  plan: { command: `uv run planner "${plan.request}"`, out: plan.out },
}
const text = JSON.stringify(terminal)
if (/localhost|127\.0\.0\.1/.test(text)) throw new Error('a command printed the server address')

mkdirSync(join(here, 'data'), { recursive: true })
// The replica ChatGPT's sidebar: Maya's ChatGPT chats, newest first, as the site lists them (sites.mjs).
type Conv = { platform: string; platformConvId: string; title: string; createdAt?: string; updatedAt?: string; capturedAt: string; messages: Array<{ role: string; text: string }> }
const site = (chats as unknown as Conv[])
  .filter((c) => c.platform === 'chatgpt')
  .map((c) => ({ id: c.platformConvId, title: c.title, createdAt: c.createdAt ?? c.capturedAt, updatedAt: c.updatedAt ?? c.capturedAt, messages: c.messages.map((m) => ({ role: m.role, text: m.text })) }))
  .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
writeFileSync(join(here, 'data/chats.json'), JSON.stringify({ chatgpt: site }))
writeFileSync(join(here, 'data/build.json'), JSON.stringify({ now: NOW, before, timeline, answers }))
writeFileSync(join(here, 'data/apps.json'), JSON.stringify({ phases, decided, sent, strip, terminal }, null, 1))
console.error('wrote data/build.json and data/apps.json')
await live.stop()
rmSync(dir, { recursive: true, force: true })
w.close()
process.exit(0)
