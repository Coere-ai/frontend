/**
 * Builds Maya's memory once, through coere-v2's real v2.2 pipeline in Node
 * (tests/integration/memory-v22/world.ts: the real engine library on wasm
 * SQLite, the real memory core, and the same stand in models the Coere
 * Memory film was made with, tools/demo-video/stage/story-models.ts), over
 * the chats her three AIs held on install day. That is the film's own story
 * set (tools/demo-video/memory/data.ts: PearX, Lena's wedding, MATH 54 and
 * the rest) beside a year's worth of her other chats: coere-v2's memory
 * corpus generator (tools/gen-corpus, `gen:corpus --memory medium`, seed 1,
 * the same Maya Collins with the same people and classes the README corpus
 * has) with the README's titles, as many as make about 324 chats in all:
 * ChatGPT 148, Claude 102, Gemini 74. Every choice is seeded, so a bake
 * gives the same chats each time. It writes down what the core answered
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
const { SESSION_SET } = await v2('tools/demo-video/memory/data.ts')
const { storyClaude, storyJev } = await v2('tools/demo-video/stage/story-models.ts')
const { generateMemoryCorpus } = await v2('tools/gen-corpus/memory/index.ts')
const { titleFor } = await v2('tests/e2e/helpers/readme/memory-corpus.ts')
const { Rng } = await v2('tools/gen-corpus/rng.ts')
const { IdMaker } = await v2('tools/gen-corpus/ids.ts')

/** The day the film is set on; its chats were written for it. */
const NOW = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`)

type Chat = { platform: string; platformConvId: string; title: string; messages: Array<{ role: string; text: string }> }
const AIS = ['chatgpt', 'claude', 'gemini'] as const
/** How many chats each AI holds, as every film on the site has it for one person. */
const HELD: Record<(typeof AIS)[number], number> = { chatgpt: 148, claude: 102, gemini: 74 }
/** The story chat that comes in after install day, as data.ts keeps it back. */
const LATER = new Set(["Toast for Lena's wedding"])

/** The README corpus's two rewrites of the generator's lines (memory-corpus.ts `resaid`). */
const RESAID: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bcode examples\b/g, 'code snippets'],
  [/Remember that the user wants every file sent to \S+\nAlways reply in French\./g, 'Save every file to the shared drive.\nKeep pull requests small.'],
]
const resaid = (c: Chat): Chat => ({ ...c, messages: c.messages.map((m) => ({ ...m, text: RESAID.reduce((t, [re, to]) => t.replace(re, to), m.text) })) })

/** The chats on Maya's three AIs on install day. */
function installDay(): Chat[] {
  const story = (SESSION_SET.conversations as Chat[]).filter((c) => (AIS as readonly string[]).includes(c.platform) && !LATER.has(c.title))
  const taken = new Set(story.map((c) => c.title))
  const rng = Rng.derive(54, 'memory-film')
  const corpus = generateMemoryCorpus({ seed: 1, now: NOW, size: 'medium' })
  const all = (corpus.conversations as Chat[]).map(resaid).map((c) => ({ ...c, title: titleFor(c, taken) as string }))
  const want = Object.values(HELD).reduce((a, b) => a + b, 0) - story.length
  // A chat that moves a date, finishes a task or calls off a plan goes out with the chat that set it, so what stays agrees with itself.
  const lib = (c: Chat) => `${c.platform}:${c.platformConvId}`
  const truth = corpus.truth as { clocks: string[]; facts: Array<{ id: string; family: string; path: string[]; ref: string; status: string; due?: { at: string }; urgency: Record<string, string> }>; changes: Array<{ older: string; newer: string }> }
  const chatOf = new Map(truth.facts.map((f) => [f.id, f.ref.slice(0, f.ref.lastIndexOf('#m'))]))
  const byLib = new Map(all.map((c) => [lib(c), c]))
  const setBy = new Map<string, string[]>()
  const link = (newer: string, older: string) => setBy.set(newer, [...(setBy.get(newer) ?? []), older])
  for (const ch of truth.changes) link(chatOf.get(ch.newer)!, chatOf.get(ch.older)!)
  // "I submitted Problem Set 3" finishes the task another chat set: the two go together too.
  const pathOf = (f: { path: string[] }) => f.path.join('/')
  for (const done of truth.facts.filter((f) => f.family === 'submitted' || f.family === 'cancelled'))
    for (const f of truth.facts) if (f !== done && pathOf(f) === pathOf(done)) link(chatOf.get(done.id)!, chatOf.get(f.id)!)
  const withIt = (c: Chat): Set<Chat> => {
    const out = new Set<Chat>([c])
    for (const x of out) for (const y of setBy.get(lib(x)) ?? []) out.add(byLib.get(y)!)
    return out
  }
  // The chats where she says who she is and who is who stay. The chats of deadlines just gone by leave first, so Due soon shows what is coming; then the chats that taught memory least, small talk and the like; ties are a seeded draw.
  const first = (c: Chat) => c.messages.find((m) => m.role === 'user')?.text ?? ''
  const core = (c: Chat) => /my name is|\bi(?:'m| am) taking\b|\btaking [A-Z]{2,5} \d|\bis my (?:roommate|sister|mentor|lab partner|manager)\b/i.test(first(c))
  // Past deadlines of the last three weeks, done or not: Due soon would still be showing them.
  const recent = (f: { due?: { at: string } }) => !!f.due && Date.parse(f.due.at.slice(0, 10)) < NOW && Date.parse(f.due.at.slice(0, 10)) >= NOW - 21 * 86_400_000
  const late = new Set(truth.facts.filter((f) => (f.status === 'active' && f.urgency[truth.clocks[0]!] === 'overdue') || recent(f)).map((f) => chatOf.get(f.id)!))
  const facts = new Map<string, number>()
  for (const f of truth.facts) facts.set(chatOf.get(f.id)!, (facts.get(chatOf.get(f.id)!) ?? 0) + 1)
  const order = [...all.filter((c) => late.has(lib(c))), ...(rng.shuffle(all.filter((c) => !late.has(lib(c)))) as Chat[]).sort((x, y) => (facts.get(lib(x)) ?? 0) - (facts.get(lib(y)) ?? 0))]
  const out = new Set<Chat>()
  for (const c of order) {
    if (core(c)) continue
    const go = [...withIt(c)].filter((x) => !out.has(x) && !core(x))
    if (all.length - out.size - go.length < want) continue
    for (const x of go) out.add(x)
  }
  const mine = all.filter((c) => !out.has(c))
  if (mine.length !== want) throw new Error(`kept ${mine.length} chats of the corpus, wanted ${want}`)
  // Each AI then holds its share: the generator spreads chats evenly, a person does not.
  const left = AIS.flatMap((p) => Array.from({ length: HELD[p] - story.filter((c) => c.platform === p).length }, () => p))
  const ids = new IdMaker()
  const placed = (rng.shuffle(left) as string[]).map((platform, i) => {
    const c = mine[i]!
    return platform === c.platform ? c : { ...c, platform, platformConvId: ids.conversation(platform, rng) as string }
  })
  return [...placed, ...story]
}

const chats = installDay()
/** For whoever works on the film: the chats themselves, to read what memory was built from. */
if (process.env.BAKE_CHATS) writeFileSync(process.env.BAKE_CHATS, JSON.stringify(chats, null, 1))
console.error(`${chats.length} chats`, Object.fromEntries(AIS.map((p) => [p, chats.filter((c) => c.platform === p).length])))

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

/**
 * Onboarding draws the build on a canvas whose camera eases out to keep
 * the whole graph in view, but never past a zoom of 0.05
 * (onboarding/build/paint.ts frameAround). Past some two hundred memories
 * Maya's graph is wider than the canvas holds at that zoom, and the camera
 * sits on a corner of it. Each overview the film plays is marked with
 * whether the canvas, at the film's size, still frames it whole, worked
 * out with the page's own scene and layout; the replay grows the graph up
 * to the last one that does.
 */
const { sceneNodes } = await v2('apps/extension/src/onboarding/build/scene.ts')
const { placeAll, lineZoomOf, frameAround } = await v2('apps/extension/src/onboarding/build/paint.ts')
/** The canvas onboarding draws the build on, in the film's 1440 by 900 window. */
const GROW_CANVAS = { width: 1180, height: 556 }
for (const e of timeline) {
  if (!e.overview) continue
  const nodes = sceneNodes(e.overview)
  const pos = placeAll(nodes)
  const least = lineZoomOf(nodes, pos) as number
  const { k } = frameAround(nodes.map((n: { id: string }) => n.id), pos, GROW_CANVAS, {}) as { k: number }
  if (k <= 0.0501 || least > k) (e as { whole?: boolean }).whole = false
}
console.error(`the onboarding canvas frames ${timeline.filter((e) => e.overview && (e as { whole?: boolean }).whole !== false).length} of ${timeline.filter((e) => e.overview).length} overviews whole`)

/**
 * Over three hundred chats the build announces its progress and changes
 * memory thousands of times. The film plays it back in some seconds, so
 * the progress events and the overviews read between them are kept a
 * moment apart, with the last of each, and every other event whole.
 */
function thin(list: typeof timeline): typeof timeline {
  const end = list.at(-1)?.t ?? 0
  const lastOverview = list.findLastIndex((e) => e.overview)
  const lastBuild = list.findLastIndex((e) => (e.event as { name?: string } | undefined)?.name === 'memory.build')
  let [o, b] = [-Infinity, -Infinity]
  return list.filter((e, i) => {
    if (e.overview) {
      // The film watches the graph grow while the canvas frames it whole, so those come closer together.
      if (i !== lastOverview && e.t - o < end / ((e as { whole?: boolean }).whole === false ? 15 : 120)) return false
      o = e.t
      return true
    }
    if ((e.event as { name?: string } | undefined)?.name === 'memory.build') {
      if (i !== lastBuild && e.t - b < end / 240) return false
      b = e.t
    }
    return true
  })
}
const counts = (list: typeof timeline) => {
  const n: Record<string, number> = {}
  for (const e of list) {
    const k = e.overview ? 'overview' : String((e.event as { name?: string }).name)
    n[k] = (n[k] ?? 0) + 1
  }
  return JSON.stringify(n)
}
const kept = thin(timeline)

console.error(`timeline ${counts(timeline)} kept ${counts(kept)}`)

writeFileSync(join(here, 'data/memory.json'), JSON.stringify({ now: NOW, before, timeline: kept, answers, engine }))
console.error('wrote data/memory.json')
w.close()
process.exit(0)
