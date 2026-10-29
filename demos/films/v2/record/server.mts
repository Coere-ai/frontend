/**
 * The v2 film's recorder. It runs Coere's engine worker in Node
 * (world.mts) and answers the live demo's engine calls from it while the
 * demo plays in record mode (`?rec=<this server>`), keeping every answer
 * and every engine event with when it came, part by part of the film. The
 * film then plays back what the real code answered (../engine.ts).
 *
 *   COERE_V2=... node --import ./date-shim.mjs <v2>/node_modules/tsx/dist/cli.mjs server.mts
 *
 * then build the film and play it once in a browser at
 *   /preview/live/v2/index.html?rec=http://127.0.0.1:8790&loop=0
 * The tape is written to ../data/tape.json at each part and at the end;
 * build the film again to play it back.
 *
 * To record only from a later part, prime the world first
 * (`curl 127.0.0.1:8790/prime?until=pearx`, also memory or arrive) and
 * play with `&recFrom=pearx&from=context-as-you-type`: the earlier parts
 * play from the old tape and the new recording replaces the rest of it.
 *
 * The date shim puts the process on the film's day, so Maya's chats
 * (written for "today" by coere-v2's corpus) are the same every run.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DAYS, filmWorld } from './world.mts'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, '../data')
const PORT = Number(process.env.PORT ?? 8790)

const w = await filmWorld()

/** The chats each replica site holds, for sites.mjs: the first day's, then each wave's. */
const site = (c: any) => ({ id: c.platformConvId, title: c.title, at: Date.parse(c.updatedAt ?? c.capturedAt), messages: c.messages.map((m: any) => ({ role: m.role, text: m.text })) })
writeFileSync(
  join(OUT, 'chats.json'),
  JSON.stringify({ dayOne: w.chats.dayOne.map((c) => ({ platform: c.platform, ...site(c) })), one: w.chats.one.map((c) => ({ platform: c.platform, ...site(c) })), two: w.chats.two.map((c) => ({ platform: c.platform, ...site(c) })) }, null, 0),
)

type Call = { t: number; key: string; method: string; ans: string }
type Phase = { name: string; start: number; calls: Call[]; events: { t: number; event: unknown }[] }
const phases: Phase[] = []
const pool = new Map<string, unknown>()
let phase: Phase = { name: 'start', start: Date.now(), calls: [], events: [] }
phases.push(phase)
let seenEvents = 0

/** Arguments as a stable key: object keys sorted. */
export function keyOf(method: string, args: unknown): string {
  const sort = (v: unknown): unknown =>
    Array.isArray(v) ? v.map(sort) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sort((v as Record<string, unknown>)[k])])) : v
  return `${method} ${JSON.stringify(sort(args) ?? null)}`
}

function keep(answer: unknown): string {
  const json = JSON.stringify(answer ?? null)
  const id = createHash('sha1').update(json).digest('hex').slice(0, 12)
  if (!pool.has(id)) pool.set(id, JSON.parse(json))
  return id
}

/** Moves new engine events into the phase they came in. */
function takeEvents(): void {
  for (; seenEvents < w.events.length; seenEvents++) {
    const e = w.events[seenEvents]!
    phase.events.push({ t: w.t0 + e.t - phase.start, event: e.event })
  }
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Saves chats as Extract all or a site visit does: a few at a time, one platform after another in turn. */
async function save(chats: any[], gapMs: number): Promise<void> {
  for (const c of chats) {
    await w.call('upsertConversations', { convs: [c] })
    await pause(gapMs)
  }
}

const ACTIONS: Record<string, (o: any) => Promise<void> | void> = {
  extract: (o) => void save(interleave(w.chats.dayOne), o.gap ?? 120),
  waveOne: (o) => void save(w.chats.one, o.gap ?? 400),
  waveTwo: (o) => void save(w.chats.two, o.gap ?? 200),
}

/** Chats in the order Extract all saves them: the three AIs side by side. */
function interleave(chats: any[]): any[] {
  const by = new Map<string, any[]>()
  for (const c of chats) by.set(c.platform, [...(by.get(c.platform) ?? []), c])
  const out: any[] = []
  for (let i = 0; out.length < chats.length; i++) for (const list of by.values()) if (list[i]) out.push(list[i])
  return out
}

function startPhase(o: any): void {
  takeEvents()
  phase = { name: String(o.name), start: Date.now(), calls: [], events: [] }
  phases.push(phase)
  if (o.clock) w.clock.put(DAYS[o.clock as keyof typeof DAYS], o.speed ?? 30)
  if (typeof o.claude === 'number') w.claude.knobs.latencyMs = o.claude
  if (typeof o.jev === 'number') w.jev.knobs.latencyMs = o.jev
  if (o.scenario) w.claude.knobs.scenario = o.scenario
  for (const a of o.actions ?? []) void ACTIONS[a]?.(o)
  console.log('phase', o.name)
}

/** The tape a session began on: a session that records from a later part keeps the earlier parts from it. */
const before = existsSync(join(OUT, 'tape.json')) ? JSON.parse(readFileSync(join(OUT, 'tape.json'), 'utf8')) : { pool: {}, phases: [] }

function save_(): void {
  takeEvents()
  const mine = phases.filter((p) => p.calls.length || p.events.length || p.name !== 'start')
  const first = mine[0]?.name
  const at = before.phases.findIndex((p: { name: string }) => p.name === first)
  const kept = primed && at >= 0 ? before.phases.slice(0, at) : []
  const tape = {
    pool: { ...(kept.length ? before.pool : {}), ...Object.fromEntries(pool) },
    phases: [
      ...kept,
      ...mine.map((p) => {
        const i = phases.indexOf(p)
        return { name: p.name, ms: (phases[i + 1]?.start ?? Date.now()) - p.start, calls: p.calls.map((c) => [c.t, c.key, c.ans]), events: p.events.map((e) => [e.t, e.event]) }
      }),
    ],
  }
  writeFileSync(join(OUT, 'tape.json'), JSON.stringify(tape))
  console.log('saved', pool.size, 'answers', phases.length, 'phases')
}

/**
 * Brings the world to the state a later part of the film starts in, the
 * way the film gets there (Extract all's saves, Build my memory, the two
 * waves of chats on their days), so a session can record from that part.
 */
let primed = false
const STEPS = ['memory', 'arrive', 'pearx']
async function settle(): Promise<void> {
  let quiet = 0
  while (quiet < 3) {
    const s: any = await w.call('memory.status', undefined)
    const ok = s.state === 'ready' && s.held === null && (s.set === null || s.set.state === 'ended') && s.counts.chatsRead > 0
    quiet = ok ? quiet + 1 : 0
    await pause(1000)
  }
}
async function prime(until: string): Promise<void> {
  primed = true
  const upTo = STEPS.indexOf(until)
  await save(interleave(w.chats.dayOne), 0)
  for (let i = 0; i < 100 && !((await w.call('memory.status', undefined)) as any).held; i++) await pause(300)
  await w.call('memory.control', { action: 'build', mode: 'direct', from: 'onboarding' })
  await settle()
  if (upTo >= 1) w.clock.put(DAYS.waveOne)
  if (upTo >= 2) {
    await save(w.chats.one, 0)
    await settle()
    w.clock.put(DAYS.today)
    await save(w.chats.two, 0)
    await settle()
  }
  takeEvents()
  phases.splice(0)
  console.log('primed for', until)
}

const body = (req: import('node:http').IncomingMessage) =>
  new Promise<any>((done) => {
    let s = ''
    req.on('data', (d) => (s += d))
    req.on('end', () => done(s ? JSON.parse(s) : {}))
  })

createServer(async (req, res) => {
  res.setHeader('access-control-allow-origin', '*')
  res.setHeader('access-control-allow-headers', 'content-type')
  if (req.method === 'OPTIONS') return res.end()
  const url = new URL(req.url ?? '/', 'http://x')
  const reply = (v: unknown) => {
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(v ?? null))
  }
  try {
    if (url.pathname === '/call') {
      const { method, args } = await body(req)
      const t = Date.now() - phase.start
      let answer: unknown
      try {
        answer = { ok: true, result: (await w.call(method, args)) ?? null }
      } catch (e: any) {
        answer = { ok: false, error: { code: e?.code ?? 'engine_error', message: String(e?.message ?? e) } }
        console.log('error', method, String(e?.message ?? e).slice(0, 200))
      }
      phase.calls.push({ t, key: keyOf(method, args), method, ans: keep(answer) })
      return reply(answer)
    }
    if (url.pathname === '/phase') {
      startPhase(await body(req))
      save_()
      return reply(null)
    }
    if (url.pathname === '/events') {
      takeEvents()
      const since = Number(url.searchParams.get('since') ?? 0)
      return reply({ next: w.events.length, events: w.events.slice(since).map((e) => e.event) })
    }
    if (url.pathname === '/save') return reply(save_())
    if (url.pathname === '/prime') return reply(await prime(String(url.searchParams.get('until'))))
    if (url.pathname === '/log') {
      console.log('page:', JSON.stringify(await body(req)).slice(0, 2000))
      return reply(null)
    }
    res.statusCode = 404
    res.end()
  } catch (e) {
    console.error(e)
    res.statusCode = 500
    res.end(String(e))
  }
}).listen(PORT, () => console.log(`recorder on http://127.0.0.1:${PORT}`))
