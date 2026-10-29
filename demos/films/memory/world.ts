import { BATCH_KEY, progressKey } from '@v2/apps/extension/src/lib/batch-types'
import { HELLO_KEY } from '@v2/apps/extension/src/console/cori/hello'
import { AIS_KEY } from '@v2/apps/extension/src/lib/chosen-ais'
import { ONBOARDING_KEY, onboardingRecord } from '@v2/apps/extension/src/lib/onboarding'
import { fakeBatch, fakeCounts, fakeEntry } from '@v2/apps/extension/src/lib/testing/batch-fixtures'
import type { World } from '../../stage/world'
import baked from './data/memory.json'

/**
 * The extension's side of the Coere Memory film. Every memory answer is
 * one coere-v2's own memory core gave for Maya's chats (bake.mts runs the
 * real v2.2 build over them with the film's stand in models and writes the
 * answers down): before the build, the build itself with its events and
 * the overview as it grew, and after it the Memory page's reads. The build
 * plays back on the clock when Build my memory is pressed, faster than
 * Node ran it, so the film watches all of it grow in some seconds.
 */

type Answer = { method: string; args?: unknown; answer: unknown }
/** `whole: false` marks an overview onboarding's canvas cannot frame whole (bake.mts). */
type Entry = { t: number; event?: { name: string; [k: string]: unknown }; overview?: unknown; status?: unknown; whole?: false }
type Baked = {
  now: number
  before: { status: unknown; settings: unknown; estimate: { chats: number }; overview: unknown; platforms: Record<string, number> }
  timeline: Entry[]
  answers: Answer[]
  engine: Answer[]
}
const data = baked as unknown as Baked

/** The same key for the same arguments, whatever their order and with absent fields left out. */
function keyOf(method: string, args: unknown): string {
  const norm = (v: unknown): unknown =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, x]) => [k, norm(x)]))
      : v
  return `${method} ${JSON.stringify(norm(args ?? null))}`
}
const table = (list: Answer[]) => new Map(list.map((a) => [keyOf(a.method, a.args), a.answer]))
const AFTER = table(data.answers)
const LIBRARY = table(data.engine)
const after = (method: string, args?: unknown) => AFTER.get(keyOf(method, args))

/**
 * Over Maya's 324 chats the build first sorts them, some seconds before its
 * first overview, then grows memory for half a minute. The replay gives the
 * sorting a moment, then grows the graph so that the biggest one
 * onboarding's canvas frames whole comes some six seconds after Build my
 * memory, near the end of the film's look at it; the build goes on at that
 * pace, and the graph stays as it was framed.
 */
const FIRST = data.timeline.find((e) => e.overview)?.t ?? 0
const WHOLE = data.timeline.findLast((e) => e.overview && e.whole !== false)?.t ?? FIRST
const LAST = data.timeline.findLast((e) => e.overview)?.t ?? WHOLE
const SORT_MS = 1500
const SHOWN_MS = 6200
/** When the canvas frames the whole graph, the build's last steps after it (linking, then built) take this long, so the film cuts away while the graph is still on screen, not on the finish screen starting over. */
const TAIL_MS = 12_000
const replayAt = (t: number) =>
  t < FIRST
    ? (t / Math.max(1, FIRST)) * SORT_MS
    : WHOLE === LAST && t > WHOLE
      ? SHOWN_MS + TAIL_MS + (t - WHOLE)
      : SORT_MS + ((t - FIRST) / Math.max(1, WHOLE - FIRST)) * (SHOWN_MS - SORT_MS)

export const AIS = ['chatgpt', 'claude', 'gemini'] as const

export class MemoryWorld {
  phase: 'before' | 'building' | 'built' = 'before'
  private status: unknown = data.before.status
  private overview: unknown = data.before.overview
  private progress: unknown = null
  private timers: number[] = []
  /** Calls no baked answer covered, for whoever works on the film. */
  readonly missed: string[] = []

  constructor(private readonly world: World) {}

  install(): void {
    const w = this.world
    // Onboarding was finished and Extract all has saved Maya's chats from her three AIs. Cori said hello on her first visit to the dashboard.
    w.write('local', { [ONBOARDING_KEY]: onboardingRecord(data.now - 3_600_000), [AIS_KEY]: [...AIS], [HELLO_KEY]: { at: data.now - 3_600_000 } })
    const entries = AIS.map((platform, i) => fakeEntry({ platform, tabId: 41 + i, step: 'stopped', stopReason: 'done', pending: null, runId: `run-${platform}-mgq3k2-a1b2c3`, helloAt: 1_100, deliveredAt: 1_100, openedByUs: true }))
    w.write('session', {
      [BATCH_KEY]: fakeBatch({ entries }),
      ...Object.fromEntries(
        AIS.map((platform, i) => {
          const n = data.before.platforms[platform] ?? 0
          return [progressKey(platform), { tabId: 41 + i, at: 2_000, progress: fakeCounts({ platform, runId: `run-${platform}-mgq3k2-a1b2c3`, phase: 'done', foundChats: n, foundProjects: 0, total: n, done: n, indexed: n, etaSec: 0, skipped: 0, bytes: n * 21_000 }) }]
        }),
      ),
    })

    w.engine('memory.status', () => (this.phase === 'built' ? after('memory.status') : this.status))
    w.engine('memory.settings', () => after('memory.settings') ?? data.before.settings)
    w.engine('memory.setSettings', (m) => ({ ...(after('memory.settings') as object), ...(m.args as object) }))
    w.engine('memory.buildEstimate', () =>
      this.phase === 'before' ? data.before.estimate : { ...data.before.estimate, progress: this.phase === 'building' ? this.progress : null },
    )
    // Onboarding keeps the graph it watched grow, framed whole, while the film cuts to the dashboard, which reads the built memory.
    w.engine('memory.overview', (m, tab) => (this.phase === 'built' && tab !== 'onboarding' ? this.answer('memory.overview', m.args) : this.overview))
    w.engine('memory.control', (m) => {
      const action = (m.args as { action?: string } | null)?.action
      if (action === 'build' && this.phase === 'before') this.play()
      return this.status
    })
    for (const method of ['memory.node', 'memory.children', 'memory.dueSoon', 'memory.review', 'memory.learned', 'memory.corePack', 'memory.stats', 'memory.focus', 'memory.quote'])
      w.engine(method, (m) => this.answer(method, m.args))
    w.engine('memory.search', (m) => this.answer('memory.search', m.args) ?? this.noHits(m.args))
    w.engine('memory.savePositions', () => null)
    w.engine('memory.hint', () => null)
    for (const method of ['stats', 'listConversations'])
      w.engine(method, (m) => LIBRARY.get(keyOf(method, m.args)) ?? this.miss(method, m.args, null))
    w.engine('search', (m) => LIBRARY.get(keyOf('search', m.args)) ?? { hits: [], total: 0 })
  }

  private answer(method: string, args: unknown): unknown {
    const hit = AFTER.get(keyOf(method, args))
    return hit === undefined ? this.miss(method, args, null) : hit
  }

  private miss<T>(method: string, args: unknown, fallback: T): T {
    this.missed.push(keyOf(method, args))
    return fallback
  }

  private noHits(args: unknown) {
    const q = (args as { q?: string } | null)?.q ?? ''
    return { stage: q ? 1 : 0, intent: { deadline: false, history: false, people: false, window: null }, open: null, hits: [], library: [], total: 0, capped: false }
  }

  /** Plays the build back: its events go to every page, and each overview becomes the answer when it was read. */
  private play(): void {
    this.phase = 'building'
    for (const entry of data.timeline) {
      const at = replayAt(entry.t)
      this.timers.push(window.setTimeout(() => this.apply(entry), at))
    }
  }

  private apply(entry: Entry): void {
    if (entry.overview && entry.whole !== false) this.overview = entry.overview
    if (entry.status) this.status = entry.status
    if (!entry.event) return
    const { name } = entry.event
    if (name === 'memory.status') this.status = entry.event.status
    if (name === 'memory.build') this.progress = entry.event.progress
    if (name === 'memory.built') this.phase = 'built'
    this.world.tell({ ch: 'coere', type: 'engine.event', event: entry.event })
  }

  /** The build ends at once, as it has by the time she opens the dashboard, so the dashboard opened now reads the built memory. */
  finish(): void {
    for (const t of this.timers) clearTimeout(t)
    this.timers = []
    if (this.phase === 'built') return
    this.phase = 'built'
    this.status = after('memory.status')
  }

  /** Puts the finished Extract all away, as Clear on the dock does, so the dashboard opens without it. */
  clearBatch(): void {
    this.world.remove('session', [BATCH_KEY, ...AIS.map(progressKey)])
  }

  stop(): void {
    for (const t of this.timers) clearTimeout(t)
    this.timers = []
  }
}
