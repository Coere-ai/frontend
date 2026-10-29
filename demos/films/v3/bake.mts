/**
 * Bakes the v3 film's data once, by running coere-v2's real code in Node,
 * as coere-v2's own v3 film ran it in a browser (tools/demo-video/v3.demo.ts):
 *
 *   1. Maya's memory, through the real v2.2 pipeline (the memory core on
 *      wasm SQLite, MiniLM from the extension's files, the stand in Claude
 *      and Jev the film was made with) over her 324 chats: ChatGPT 148,
 *      Claude 102, Gemini 74: her library (maya.mts, mayaSet below) and
 *      the smart context set the film was made with. The build's
 *      events and the overview as it grew are kept with their times, for
 *      onboarding.
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

const { assembleChat } = await v2('tools/gen-corpus/memory/context/plant.ts')
const { Rng } = await v2('tools/gen-corpus/rng.ts')
const { IdMaker } = await v2('tools/gen-corpus/ids.ts')
const { mayaLibrary } = await import('./maya.mts')

/** How many chats Maya has on each AI, as every film on the site says. */
const MAYA_CHATS: Record<string, number> = { chatgpt: 148, claude: 102, gemini: 74 }

type Chat = { platform: string; platformConvId: string; title: string; createdAt?: string; updatedAt?: string; capturedAt: string; messages: Array<{ role: string; text: string; createdAt?: string }> }
type Item = { ref: string }

/**
 * Maya's chats at the scale a person has them: her library (maya.mts),
 * four months of school, work, side projects, friends, money, health and
 * trips, written in the smart context set's shape, and the smart context
 * set the film was made with (PearX, Tidepool, Lena's wedding). Both are
 * one gold set, so the stand in Claude and Jev answer every chat from its
 * truth, as coere-v2's context eval builds Maya. Each AI gets its share of
 * her 324 chats. Seeded: the same day gives the same chats.
 */
function mayaSet(): { set: typeof data.STORY; chats: Chat[] } {
  const story = (data.STORY.conversations as Chat[]).filter((c) => c.platform in MAYA_CHATS)
  const want = Object.fromEntries(Object.entries(MAYA_CHATS).map(([p, n]) => [p, n - story.filter((c) => c.platform === p).length])) as Record<'chatgpt' | 'claude' | 'gemini', number>
  const { chats: planted, facts } = mayaLibrary({ chats: want })
  const rng = Rng.derive(1, 'v3-film-maya')
  const ids = new IdMaker()
  let n = 0
  const next = () => `pm_${String(++n).padStart(4, '0')}`
  const built = planted.map((chat) => assembleChat(chat, { now: NOW, rng, ids, next }) as { conversation: Chat; items: Item[] })
  const mine = built.map((b) => b.conversation)
  console.error(`maya.mts: ${mine.length} chats, ${facts} facts`)
  const set = { ...data.STORY, conversations: [...mine, ...data.STORY.conversations], items: [...built.flatMap((b) => b.items), ...data.STORY.items] }
  return { set, chats: [...mine, ...story] }
}

const shownName = (p: string): string => {
  try {
    return platformById(p).name
  } catch {
    return p
  }
}

/** The day the film is set on; Maya's chats were written for it. */
const NOW = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`)
const maya = mayaSet()
const chats = maya.chats as Array<{ platform: string }>
console.error(`${chats.length} chats: ${JSON.stringify(Object.fromEntries(['chatgpt', 'claude', 'gemini'].map((p) => [p, chats.filter((c) => c.platform === p).length])))}`)

// 1. The build.
const w = await v22World({
  chats,
  now: NOW,
  claude: [await storyClaude(maya.set)],
  jev: [await storyJev(maya.set)],
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
console.error(`jobs quiet at ${Date.now() - t0} ms`)
for (let i = 0; i < 4500 && !builtSeen(); i++) {
  await new Promise((r) => setTimeout(r, 200))
  if (i % 150 === 149) {
    const progress = [...timeline].reverse().find((e) => (e.event as { name?: string } | undefined)?.name === 'memory.build')
    console.error(`waiting for memory.built at ${Date.now() - t0} ms: ${JSON.stringify((progress?.event as { progress?: unknown } | undefined)?.progress).slice(0, 400)}`)
  }
}
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
/**
 * The format holds at most 64 pieces of evidence on a record (openapi.json
 * EvidenceList), and coere-server refuses a sync line with more. A build of
 * four months of chats gives her busiest things more than that (a course
 * she names in a hundred messages), and v2.2's sync sends them whole, so
 * the pass would be refused at the first one. Sync reads each record with
 * its newest 64, the most the format carries; the memory itself keeps all.
 */
const EVIDENCE_MAX = 64
type Rec = { evidence?: unknown[] }
const capped = <R extends Rec | null>(r: R): R => (r && Array.isArray(r.evidence) && r.evidence.length > EVIDENCE_MAX ? { ...r, evidence: r.evidence.slice(-EVIDENCE_MAX) } : r)
function withEvidenceCap<M extends { store: { records(tx: unknown, t: unknown): Iterable<Rec>; record(tx: unknown, id: string): Rec | null } }>(m: M): M {
  const { store } = m
  return {
    ...m,
    store: {
      ...store,
      *records(tx: unknown, t: unknown) {
        for (const r of store.records(tx, t)) yield capped(r)
      },
      record: (tx: unknown, id: string) => capped(store.record(tx, id)),
    },
  }
}

/** Chrome adds the extension's origin to its requests; the server checks it. */
async function netFetch(url: string, init: RequestInit): Promise<Response> {
  const t = Date.now()
  try {
    const res = await fetch(url, { ...init, headers: { ...(init.headers as Record<string, string>), Origin: ORIGIN } })
    if (process.env.BAKE_NET) console.error(`net ${init.method} ${new URL(url).pathname} ${res.status} ${Date.now() - t} ms ${(init.body as Uint8Array | undefined)?.length ?? 0} bytes`)
    if (process.env.BAKE_NET && res.status >= 400) console.error(await res.clone().text())
    if (process.env.BAKE_NET && res.status >= 400 && init.body) writeFileSync(`${process.env.BAKE_NET}.body`, init.body as Uint8Array)
    return res
  } catch (e) {
    console.error(`net ${init.method} ${new URL(url).pathname} failed after ${Date.now() - t} ms: ${String(e)} ${String((e as { cause?: unknown }).cause ?? '')}`)
    throw e
  }
}
const access = startAccess({
  memory: async () => withEvidenceCap(workerMemory({ driver: w.memoryDriver, store: w.core.store }, now, '3.0.0')),
  run: async (_p: number, fn: () => unknown) => fn(),
  net: { fetch: (url: string, init: RequestInit) => netFetch(url, init), now, random: (b: Uint8Array) => void crypto.getRandomValues(b) },
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

/**
 * The server's address for one planner run, through a pass-through that
 * pins `from` on `/v1/upcoming`. Left out, `from` is the server's now, and
 * the server binds a page's cursor to it (routes/upcoming.ts), so the next
 * page, asked a moment later, is refused as a wrong cursor. Maya's months
 * of deadlines fill more than a page, so the planner's second page would
 * stop it. Each run's listing starts at its first page's now, as the
 * server means it to; nothing else in a request or an answer is changed.
 * With BAKE_NET, every refused request is printed, for whoever works on the bake.
 */
async function pinned(): Promise<{ url: string; close(): void }> {
  const { createServer } = await import('node:http')
  let from: string | null = null
  const proxy = createServer(async (req, res) => {
    const chunks: Buffer[] = []
    for await (const c of req) chunks.push(c as Buffer)
    const body = Buffer.concat(chunks)
    const url = new URL(req.url ?? '/', serverUrl)
    if (url.pathname === '/v1/upcoming' && !url.searchParams.has('from')) url.searchParams.set('from', (from ??= new Date().toISOString()))
    const answer = await fetch(url, { method: req.method, headers: req.headers as Record<string, string>, ...(body.length ? { body } : {}) })
    const bytes = Buffer.from(await answer.arrayBuffer())
    if (process.env.BAKE_NET && answer.status >= 400) console.error(`app ${req.method} ${req.url} ${answer.status} ${bytes.toString().slice(0, 600)}`)
    res.writeHead(answer.status, Object.fromEntries([...answer.headers].filter(([k]) => !['content-encoding', 'content-length', 'transfer-encoding'].includes(k))))
    res.end(bytes)
  })
  await new Promise<void>((r) => proxy.listen(0, '127.0.0.1', r))
  return { url: `http://127.0.0.1:${(proxy.address() as { port: number }).port}`, close: () => proxy.close() }
}

// The planner, with Claude's stand in; the first request her memory can plan is the one filmed (v3/planner.ts).
const REQUESTS = ['Plan a dinner with Caleb next Friday', 'Plan a dinner with Iris next Friday', 'Plan a dinner with Elena next Friday']
const claude = await startClaude('planner:happy')
let plan: { request: string; out: string } | null = null
try {
  for (const request of REQUESTS) {
    const coere = await pinned()
    const out = await run(PLANNER, [request, '--out', join(dir, 'plan.ics')], { COERE_URL: coere.url, COERE_TOKEN: token(), ANTHROPIC_API_KEY: FAKE_KEY, ANTHROPIC_BASE_URL: claude.url })
      .catch((e: Error) => {
        console.error(`planner: ${e.message}`)
        return null
      })
      .finally(() => coere.close())
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

/**
 * The build's overviews, as many as onboarding's graph can show growing:
 * one each OVERVIEW_GAP of the build at most, and the last. The events and
 * the counts stay whole, so the page hears the build as it ran.
 */
function thinned(list: typeof timeline): typeof timeline {
  const OVERVIEWS = 48
  const withOverview = list.filter((e) => e.overview)
  const span = (withOverview.at(-1)?.t ?? 0) - (withOverview[0]?.t ?? 0)
  const gap = span / OVERVIEWS
  const last = withOverview.at(-1)
  let kept = -Infinity
  return list.map((e) => {
    if (!e.overview || e === last || e.t - kept >= gap) {
      if (e.overview) kept = e.t
      return e
    }
    return { t: e.t, status: e.status }
  })
}

/**
 * Onboarding's graph (the growing graph and the finish screen) lays out
 * every folder of the overview, and its camera goes no further out than a
 * zoom of 0.05 (build/paint.ts frameAround). Maya's library is spread over
 * many small folders, so the whole of it frames with every line in view;
 * the bake checks that it still does, so a library that grows past the
 * camera fails here and not as a blank corner on the finish screen.
 */
const SCENE = 'apps/extension/src/onboarding/build/'
const { sceneNodes } = await v2(`${SCENE}scene.ts`)
const { placeAll, lineZoomOf, frameAround } = await v2(`${SCENE}paint.ts`)
/** Onboarding's graph card on the film's 1440 by 900 page, less the strip the finish keeps for Cori's feet. */
const CARD = { width: 1170, height: 480 }
function mustFit(o: Overview): void {
  const nodes = sceneNodes(o) as Array<{ id: string }>
  const pos = placeAll(nodes)
  const need = Math.max(0.05, lineZoomOf(nodes, pos)) * 1.1
  // frameAround never goes past 0.05, so a frame asked to go no closer than `need` says whether it reached it.
  const k = frameAround(nodes.map((n) => n.id), pos, CARD, { most: 1.5 }).k
  if (k < need) throw new Error(`onboarding's graph of ${nodes.length} nodes does not fit its card: zoom ${k}, needs ${need}`)
  console.error(`onboarding's graph: ${nodes.length} nodes, zoom ${k.toFixed(3)}`)
}

/**
 * The overviews share most of their nodes and edges, so each is kept once
 * in `pool` and an overview lists them by number (world.ts puts them back).
 */
type Overview = { nodes: unknown[]; edges: unknown[]; [k: string]: unknown }
function packed(b: { timeline: typeof timeline; answers: Asked[]; [k: string]: unknown }) {
  const pool = { nodes: [] as unknown[], edges: [] as unknown[] }
  const index = { nodes: new Map<string, number>(), edges: new Map<string, number>() }
  const ref = (kind: 'nodes' | 'edges', x: unknown): number => {
    const key = JSON.stringify(x)
    let n = index[kind].get(key)
    if (n === undefined) {
      n = pool[kind].push(x) - 1
      index[kind].set(key, n)
    }
    return n
  }
  mustFit(b.answers.find((a) => a.method === 'memory.overview')?.answer as Overview)
  const pack = (o: Overview) => ({ ...o, nodes: o.nodes.map((x) => ref('nodes', x)), edges: o.edges.map((x) => ref('edges', x)) })
  return {
    ...b,
    timeline: b.timeline.map((e) => (e.overview ? { ...e, overview: pack(e.overview as Overview) } : e)),
    answers: b.answers.map((a) => (a.method === 'memory.overview' ? { ...a, answer: pack(a.answer as Overview) } : a)),
    pool,
  }
}

mkdirSync(join(here, 'data'), { recursive: true })
// The replica ChatGPT's sidebar: Maya's ChatGPT chats, newest first, as the site lists them (sites.mjs).
type Conv = { platform: string; platformConvId: string; title: string; createdAt?: string; updatedAt?: string; capturedAt: string; messages: Array<{ role: string; text: string }> }
const site = (chats as unknown as Conv[])
  .filter((c) => c.platform === 'chatgpt')
  .map((c) => ({ id: c.platformConvId, title: c.title, createdAt: c.createdAt ?? c.capturedAt, updatedAt: c.updatedAt ?? c.capturedAt, messages: c.messages.map((m) => ({ role: m.role, text: m.text })) }))
  .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
writeFileSync(join(here, 'data/chats.json'), JSON.stringify({ chatgpt: site }))
if (process.env.BAKE_RAW) writeFileSync(process.env.BAKE_RAW, JSON.stringify({ now: NOW, before, timeline, answers }))
writeFileSync(join(here, 'data/build.json'), JSON.stringify(packed({ now: NOW, before, timeline: thinned(timeline), answers })))
writeFileSync(join(here, 'data/apps.json'), JSON.stringify({ phases, decided, sent, strip, terminal }, null, 1))
console.error('wrote data/build.json and data/apps.json')
await live.stop()
rmSync(dir, { recursive: true, force: true })
w.close()
process.exit(0)
