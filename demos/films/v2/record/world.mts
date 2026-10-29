/**
 * Coere's engine worker for the v2 film, in Node: the real library and
 * memory core (coere-v2's packages/engine and packages/memory, on the wasm
 * SQLite driver), the worker's own method table (apps/extension/src/engine
 * methods.ts and memory/methods.ts), the stand in Claude and Jev the film
 * was made with (tools/demo-video/stage/story-models.ts), MiniLM from the
 * extension's own files, and a clock on the film's day. Maya's chats are
 * coere-v2's corpora at a person's scale (corpus.mts).
 *
 * The recorder (server.mts) answers the live demo's engine calls from it,
 * and keeps every answer, so the demo plays back what the real code said.
 */
import { join } from 'node:path'

const V2 = process.env.COERE_V2
if (!V2) throw new Error('COERE_V2 names the coere-v2 checkout')
const at = (p: string) => import(join(V2, p))

Object.assign(globalThis, { __COERE_VERSION__: 2, __COERE_FAKE_SITES__: true, __COERE_EDITION__: 'consumer' })

const { createEngine, createSqliteDriver, listHashes } = await at('packages/engine/src/index.ts')
const { createMemory } = await at('packages/memory/src/index.ts')
const { loadScenarios: claudeScenarios } = await at('tests/fake-claude/scenarios/index.ts')
const { FAKE_KEY } = await at('tests/fake-claude/rules.ts')
const { createFakeClaude } = await at('tests/fake-claude/server.ts')
const { loadScenarios: jevScenarios } = await at('tests/fake-jev/scenarios/index.ts')
const { createFakeJev } = await at('tests/fake-jev/server.ts')
const { storyClaude, storyJev } = await at('tools/demo-video/stage/story-models.ts')
const data = await at('tools/demo-video/v2/data.ts')
const { realEmbedder } = await at('evals/context/smart/build.ts')
const { platformById } = await at('packages/platforms/src/index.ts')
const { memoryMethods } = await at('apps/extension/src/engine/memory/methods.ts')
const { engineMethods } = await at('apps/extension/src/engine/methods.ts')
const { JEV_FAKE_KEY } = await at('tests/integration/memory-v22/world.ts')
const { filmChats } = await import('./corpus.mts')

export const DAY = 86_400_000
export type Event = { t: number; event: unknown }

/** The film's day: it all happens today, from the hour Maya installs Coere. */
const TODAY = data.START + 12 * DAY
export const DAYS = { today: TODAY + 17 * 3_600_000 }

/** A clock that runs `speed` times the real pace from wherever it was last put. */
function filmClock() {
  let base = DAYS.today
  let from = Date.now()
  let speed = 30
  const now = () => base + (Date.now() - from) * speed
  return {
    now,
    setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms / speed),
    clearTimeout: (h: unknown) => clearTimeout(h as ReturnType<typeof setTimeout>),
    put(to: number, pace = speed) {
      base = to
      from = Date.now()
      speed = pace
    },
  }
}

const shownName = (p: string): string => {
  try {
    return platformById(p).name
  } catch {
    return p
  }
}

/** One step at a time, like the worker's dispatcher slot. */
function serialRun() {
  let chain: Promise<unknown> = Promise.resolve()
  return <T,>(fn: () => T | Promise<T>): Promise<T> => {
    const next = chain.then(fn)
    chain = next.catch(() => undefined)
    return next as Promise<T>
  }
}

export async function filmWorld() {
  const clock = filmClock()
  const events: Event[] = []
  const t0 = Date.now()
  const post = (event: unknown) => events.push({ t: Date.now() - t0, event })
  const libDriver = await createSqliteDriver({ storage: 'memory' })
  const cores: { onLibraryEvent(e: unknown): void }[] = []
  const engine = createEngine({
    driver: libDriver,
    platformName: shownName,
    onEvent: (e: unknown) => {
      post(e)
      cores.forEach((c) => c.onLibraryEvent(e))
    },
  })
  const library = {
    getConversation: (a: unknown) => engine.getConversation(a),
    listHashes: (page: unknown) => listHashes(libDriver, page),
    search: (a: unknown) => engine.search(a),
    projectIds: async (platform: string) => (await engine.listProjects({ platform })).map((p: { id: string }) => p.id),
  }
  const first = <T extends { name: string }>(base: Map<string, T>, lead: T) => new Map<string, T>([[lead.name, lead], ...base])
  const claude = createFakeClaude({ scenarios: first(await claudeScenarios(), await storyClaude(data.STORY)), now: clock.now })
  const jev = createFakeJev({ scenarios: first(await jevScenarios(), await storyJev(data.STORY)), now: clock.now })
  claude.knobs.scenario = 'story-extract'
  jev.knobs.scenario = 'story'
  const fetchBoth: typeof fetch = (input, init) =>
    new Request(input, init).url.startsWith('https://api.typesafe.ai/') ? jev.fetch(input, init) : claude.fetch(input, init)
  const memoryDriver = await createSqliteDriver({ storage: 'memory' })
  const core = createMemory({
    driver: memoryDriver,
    library,
    key: FAKE_KEY,
    fetch: fetchBoth,
    clock,
    run: serialRun(),
    config: {
      models: { extract: 'claude-sonnet-5-5', consolidate: 'claude-sonnet-5-5', short: 'claude-haiku-5-5' },
      effort: 'medium',
      capUsd: 20,
      askAboveUsd: 2,
      backfill: 'direct',
      build: 'film',
    },
    emit: post,
    app: { app: 'coere', version: '2.0.0' },
    zone: 'America/Los_Angeles',
    platformName: shownName,
    v22: {
      jevKey: JEV_FAKE_KEY,
      embedder: realEmbedder(),
      chats: { sql: libDriver, deleteConversation: (a: unknown) => engine.deleteConversation(a) },
    },
  })
  cores.push(core)
  const table: Record<string, (a: unknown) => Promise<unknown>> = {
    ...engineMethods(async () => engine),
    ...memoryMethods({
      core: async () => core,
      capture: { 'capture.tail': async () => ({ count: 0, tail: [] }), 'capture.append': async () => ({ outcome: 'unchanged', count: 0 }) },
      staging: { write: async () => undefined, read: async () => new Uint8Array(), remove: async () => undefined },
    }),
  }
  await core.start()
  // Maya opens Claude about half a minute of memory's clock after she installs Coere.
  const chats = filmChats(data.STORY.conversations, TODAY, DAYS.today + 30 * 60_000)
  return {
    clock,
    events,
    claude,
    jev,
    core,
    engine,
    memoryDriver,
    t0,
    chats,
    replies: data.REPLIES as readonly string[],
    async call(method: string, args: unknown): Promise<unknown> {
      const fn = table[method]
      if (!fn) throw Object.assign(new Error(`${method} is not a method`), { code: 'unknown_method' })
      return fn(args)
    },
  }
}

export type FilmWorld = Awaited<ReturnType<typeof filmWorld>>
