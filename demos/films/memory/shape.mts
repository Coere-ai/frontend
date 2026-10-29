/**
 * Gives the film's memory the shape the owner wants (maya-library.mts):
 * twelve sections round Maya, two to four folders in each with a tidy fan
 * of memories, in place of the hundreds of numbered readings, problem sets
 * and labs the memory corpus piles onto three courses.
 *
 * bake.mts runs coere-v2's real build over Maya's chats and writes what
 * the core answered (data/memory.json). This step keeps the build's own
 * clock, its events, its settings, estimate, spend and the library's
 * counts, and answers memory from Maya's library instead: the overview
 * as it grew and as it ends, each thing's sheet, Due soon, the search for
 * MATH 54 and the chats behind every memory, in the core's own types. The
 * urgency words come from memory's own function on the film's day, and
 * the onboarding canvas's own layout says which overviews it frames whole.
 * Run after the bake, from coere-v2; it rewrites data/memory.json in place
 * and gives the same file each time:
 *
 *   cd <coere-v2> && node_modules/.bin/tsx <this file>
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fixStory, mayaLibrary, rng, type LibFact } from './maya-library.mts'

const here = dirname(fileURLToPath(import.meta.url))
const V2 = process.cwd()
const v2 = (p: string) => import(join(V2, p))
const data = await v2('tools/demo-video/memory/data.ts')
const { describeUrgency } = await v2('packages/memory/src/time/labels.ts')
const { sceneNodes } = await v2('apps/extension/src/onboarding/build/scene.ts')
const { placeAll, lineZoomOf, frameAround } = await v2('apps/extension/src/onboarding/build/paint.ts')

const FILE = join(here, 'data/memory.json')
const baked = JSON.parse(readFileSync(FILE, 'utf8'))
const NOW: number = baked.now
const ZONE: string = baked.before.settings.timeZone
/** The film's clock: late morning of its day where Maya lives, so a deadline dated today is due today. */
const CLOCK = NOW + 18 * 3_600_000
const AIS = ['chatgpt', 'claude', 'gemini'] as const
/** How many chats each AI holds, as the bake saved them. */
const HELD: Record<string, number> = baked.before.platforms
/** The story chat that comes in after install day, as data.ts keeps it back. */
const LATER = "Toast for Lena's wedding"
const [, FROM] = /from (\w+ \d+) to/.exec(data.MOVED_LINE) ?? []

// ---- Maya's chats: the story's own, then the library's. ----

type Msg = { role: string; text: string; createdAt?: string }
type Conv = { platform: string; platformConvId: string; title?: string; createdAt?: string; updatedAt?: string; messages: Msg[] }
const storyAll = [...data.SESSION_SET.conversations, ...data.installDay().conversations, ...data.laterChats()]
  .filter((c: Conv) => (AIS as readonly string[]).includes(c.platform))
  .map((c: Conv) => fixStory(c, FROM!)) as Conv[]
const storyBy = new Map<string, Conv>()
for (const c of storyAll) if (c.title && !storyBy.has(c.title)) storyBy.set(c.title, c)
const userLines = (c: Conv) => c.messages.filter((m) => m.role === 'user').map((m) => m.text)
const lib = mayaLibrary(NOW, (t) => (storyBy.has(t) ? userLines(storyBy.get(t)!) : null), { sourceChats: 240 })

interface Chat {
  id: string
  platform: string
  title: string
  messages: Array<{ role: string; text: string; at: string }>
}
const chats = new Map<string, Chat>()
for (const title of lib.story.filter((t) => t !== LATER)) {
  const c = storyBy.get(title)!
  const at0 = c.createdAt ?? c.messages[0]?.createdAt ?? new Date(NOW - 30 * 86_400_000).toISOString()
  chats.set(title, { id: `${c.platform}:${c.platformConvId}`, platform: c.platform, title, messages: c.messages.map((m, i) => ({ role: m.role, text: m.text, at: m.createdAt ?? new Date(Date.parse(at0) + i * 60_000).toISOString() })) })
}
const authored = [...lib.chats]
const idle = lib.idle.slice(0, Object.values(HELD).reduce((a, b) => a + b, 0) - chats.size - authored.length)
// Each AI holds its share: the story's chats where they were, the rest spread over what is left.
const r = rng(324)
const slots = r.shuffle(AIS.flatMap((p) => Array.from({ length: HELD[p]! - [...chats.values()].filter((c) => c.platform === p).length }, () => p)))
const used = new Set<string>()
const newId = (platform: string): string => {
  for (;;) {
    const h = Array.from({ length: 32 }, () => '0123456789abcdef'[r.int(0, 15)]).join('')
    const id = platform === 'gemini' ? h.slice(0, 16) : `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
    if (!used.has(id)) return used.add(id), `${platform}:${id}`
  }
}
for (const [i, c] of [...authored, ...idle].entries()) {
  const platform = slots[i]!
  const start = NOW - c.ago * 86_400_000 + c.minute * 60_000 + 7 * 3_600_000
  const messages = c.turns.flatMap((t, n) => [
    { role: 'user', text: t.user, at: new Date(start + n * 180_000).toISOString() },
    { role: 'assistant', text: t.reply, at: new Date(start + n * 180_000 + 40_000).toISOString() },
  ])
  chats.set(c.key, { id: newId(platform), platform, title: c.title, messages })
}
if (chats.size !== Object.values(HELD).reduce((a, b) => a + b, 0)) throw new Error(`${chats.size} chats, wanted ${Object.values(HELD).reduce((a, b) => a + b, 0)}`)

// ---- Memory: sections, folders and the facts filed in them. ----

const facts = lib.facts.filter((f) => f.chat !== LATER)
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
const SELF = 'ent_self'
const sectionId = (name: string) => `sec_${slug(name)}`
const folderId = (name: string) => `ent_${slug(name)}`
const ownerOf = (f: LibFact) => (f.folder ? folderId(f.folder) : sectionId(f.section))
const sections = lib.sections.map((s) => ({ id: sectionId(s.name), label: s.name }))
const folders = lib.sections.flatMap((s) => s.folders.map((x) => ({ id: folderId(x.name), kind: x.kind, label: x.name, section: sectionId(s.name) })))
const folderOf = new Map(folders.map((x) => [x.id, x]))
const sectionOf = new Map(sections.map((x) => [x.id, x]))

/** Where a fact's line sits in its chat: the message, as memory cites it. */
function source(f: LibFact) {
  const c = chats.get(f.chat)!
  const n = c.messages.findIndex((m) => m.role === 'user' && m.text.includes(f.said))
  if (n < 0) throw new Error(`${c.title} never says: ${f.said}`)
  return { chat: c, msg: n + 1, at: c.messages[n]!.at }
}

type View = Record<string, unknown> & { id: string; importance: number; urgency: string; text: string }
const LEVELS = ['overdue', 'today', 'soon', 'upcoming', 'later', 'stale', 'none']
function view(f: LibFact): View {
  const s = source(f)
  // The lab's first date went by in August; she handed it in, so it is done.
  const progress = f.kind === 'task' ? (f.due && Date.parse(f.due) < NOW ? 'completed' : 'needs-action') : null
  const due = f.due ? { at: f.due, tz: ZONE } : null
  const dated = f.kind === 'task' || f.kind === 'event'
  const { level, label } = dated
    ? describeUrgency({ status: 'active', kind: f.kind, ...(progress ? { progress } : {}), urgency: due ? { due } : {}, ...(f.start ? { start: { at: f.start, tz: ZONE } } : {}), evidence: [{ at: s.at }] }, CLOCK, ZONE)
    : { level: 'none', label: null }
  const at = f.specific ? f.text.indexOf(f.specific) : -1
  return {
    id: `fact_${f.id}`,
    kind: f.kind,
    key: f.key,
    text: f.text,
    specifics: at >= 0 ? [[at, at + f.specific!.length]] : [],
    importance: Math.min(5, Math.max(2, f.importance)),
    urgency: level,
    urgencyLabel: label,
    due,
    progress,
    status: 'active',
    disagree: false,
    held: false,
    pinned: false,
    origin: 'extracted',
    basis: 'user_stated',
    sensitivity: f.sensitivity,
    sources: [{ evidenceId: `fact_${f.id}#e0`, platform: s.chat.platform, convId: s.chat.id, title: s.chat.title, msg: s.msg, role: 'user', at: s.at, url: null, stale: false }],
    supersededBy: null,
    replacedOn: null,
    changedBy: null,
    freshness: 'current',
    mentions: 1,
  }
}
const views = new Map(facts.map((f) => [f.id, view(f)]))
const isDue = (v: View) => (v.key === 'due' || v.key === 'start') && ['overdue', 'today', 'soon', 'upcoming', 'later'].includes(v.urgency)
const urgentOf = (list: View[]) => ([...list].filter(isDue).sort((a, b) => LEVELS.indexOf(a.urgency) - LEVELS.indexOf(b.urgency))[0]?.urgency ?? 'none') as string

/** The overview of the facts memory holds so far: every section, and each folder once it has a memory. */
function overview(held: readonly LibFact[]) {
  const by = new Map<string, View[]>()
  for (const f of held) by.set(ownerOf(f), [...(by.get(ownerOf(f)) ?? []), views.get(f.id)!])
  const node = (id: string, kind: string, label: string, section: string, parent: string | null) => {
    const mine = by.get(id) ?? []
    return { id, kind, label, section, parent, importance: kind === 'self' ? 5 : Math.max(3, ...mine.map((v) => v.importance)), pinned: false, urgency: kind === 'self' || kind === 'section' ? 'none' : urgentOf(mine), facts: mine.length, history: false }
  }
  const shown = folders.filter((x) => by.has(x.id))
  return {
    scene: 'overview',
    nodes: [
      ...sections.map((s) => node(s.id, 'section', s.label, s.id, null)),
      ...shown.map((x) => node(x.id, x.kind, x.label, x.section, x.section)),
      node(SELF, 'self', 'You', 'sec_personal', null),
    ],
    edges: shown.map((x) => ({ from: x.id, to: x.section, type: 'parent', label: null, history: false })),
    more: {},
    positions: null,
  }
}
const whole = overview(facts)

/** A thing's sheet, as `memory.node` answers it. */
function detail(id: string) {
  const n = whole.nodes.find((x) => x.id === id)
  if (!n) return null
  const mine = facts.filter((f) => ownerOf(f) === id).map((f) => views.get(f.id)!)
  const path = n.kind === 'self' ? [] : n.kind === 'section' ? [{ id, label: n.label }] : [{ id: n.section, label: sectionOf.get(n.section)!.label }, { id, label: n.label }]
  const order = (a: View, b: View) => b.importance - a.importance || (a.id < b.id ? -1 : 1)
  return {
    node: { ...n, aliases: [], summary: null, path },
    due: mine.filter(isDue).sort((a, b) => LEVELS.indexOf(a.urgency) - LEVELS.indexOf(b.urgency)),
    groups: mine.some((v) => !isDue(v)) ? [{ name: 'facts', facts: mine.filter((v) => !isDue(v)).sort(order) }] : [],
    earlier: [],
    relations: [],
    review: [],
  }
}

// ---- Search, as the strip and the Memory page ask it while she types MATH 54. ----

const words = (text: string) => [...text.matchAll(/[A-Za-z0-9][\w'.-]*/g)].map((m) => ({ word: m[0].replace(/[.']+$/, ''), at: m.index! }))
/** Where each of the query's words starts a word of the text, or null when one never does. */
function marks(text: string, q: string): Array<[number, number]> | null {
  const out: Array<[number, number]> = []
  for (const t of q.trim().split(/\s+/)) {
    const hit = words(text).filter((w) => (t.length < 2 ? w.word.toLowerCase() === t.toLowerCase() : w.word.toLowerCase().startsWith(t.toLowerCase())))
    if (!hit.length) return null
    for (const w of hit) out.push([w.at, w.at + t.length])
  }
  return out.sort((a, b) => a[0] - b[0])
}
const pathOf = (id: string) => {
  const n = whole.nodes.find((x) => x.id === id)!
  return n.kind === 'section' ? [{ id, name: n.label, kind: 'section' }] : [{ id: n.section, name: sectionOf.get(n.section)!.label, kind: 'section' }, { id, name: n.label, kind: n.kind }]
}
function memorySearch(q: string, limit: number) {
  const hits: Array<{ node: object; facts: object[]; score: number }> = []
  let total = 0
  for (const n of whole.nodes.filter((x) => x.kind !== 'self')) {
    const named = marks(n.label, q) !== null
    const mine = facts.filter((f) => ownerOf(f) === n.id)
    const found = mine.filter((f) => marks(f.text, q))
    total += found.length + (named ? 1 : 0)
    if (!named && !found.length) continue
    const show = (found.length ? found : mine).map((f) => views.get(f.id)!).sort((a, b) => b.importance - a.importance).slice(0, 3)
    const score = (named ? 1.5 : 0) + found.length * 0.08 + show.reduce((s, v) => s + v.importance * 0.02, 0)
    hits.push({
      // A hit's path leads up to its thing, which the row names after it.
      node: { id: n.id, kind: n.kind, name: n.label, path: pathOf(n.id).slice(0, -1) },
      facts: show.map((v, i) => {
        const s = (v.sources as Array<Record<string, unknown>>)[0]!
        return { id: v.id, kind: v.kind, key: v.key, text: v.text, status: 'active', progress: v.progress, highlights: marks(v.text, q) ?? [], specifics: v.specifics, importance: v.importance, urgency: v.urgency, urgencyLabel: v.urgencyLabel, basis: 'user_stated', sensitivity: v.sensitivity, score: Number((score - i * 0.1).toFixed(4)), evidence: { evidenceId: s.evidenceId, platform: s.platform, convId: s.convId, title: s.title, msg: s.msg, at: s.at, stale: false } }
      }),
      score: Number(score.toFixed(4)),
    })
  }
  hits.sort((a, b) => b.score - a.score)
  const exact = whole.nodes.find((x) => x.kind !== 'self' && x.kind !== 'section' && x.label.toLowerCase() === q.trim().toLowerCase())
  return {
    stage: q ? 1 : 0,
    intent: { deadline: false, history: false, people: false, window: null },
    open: exact ? { node: { id: exact.id, kind: exact.kind, name: exact.label, path: pathOf(exact.id) }, children: [] } : null,
    hits: hits.slice(0, limit),
    library: [],
    total,
    capped: total > 100,
  }
}
function librarySearch(q: string, limit: number) {
  if (q.trim().length < 3) return { hits: [], totalMatches: 0, totalCapped: false, ms: 0.2, stage: 1, queryTokens: [] }
  const out: Array<Record<string, unknown>> = []
  for (const c of chats.values()) {
    const n = c.messages.findIndex((m) => m.role === 'user' && marks(m.text, q))
    if (n < 0 && !marks(c.title, q)) continue
    const at = Math.max(0, n)
    const text = `${c.messages[at]!.text}\n\n${c.messages[at + 1]?.text ?? ''}`.trim()
    const named = marks(c.title, q) ? 0.2 : 0
    out.push({ convId: c.id, platform: c.platform, title: c.title, date: Date.parse(c.messages.at(-1)!.at), chunkId: parseInt(createHash('sha1').update(c.id).digest('hex').slice(0, 12), 16), msgStart: at + 1, msgEnd: at + 2, snippet: { text, highlights: marks(text, q) ?? [] }, score: Number((1 + named + Date.parse(c.messages.at(-1)!.at) / 1e14).toFixed(6)) })
  }
  out.sort((a, b) => (b.score as number) - (a.score as number))
  return { hits: out.slice(0, limit), totalMatches: out.length, totalCapped: false, ms: 3.1, stage: 1, queryTokens: [] }
}

// ---- The build as it grew: the same clock, Maya's library filling in section by section. ----

/** The order memory files her facts in: School first, as the build sorts it, each section a little after the one before. */
const grow = rng(9)
const firstOf = new Map<string, number>()
const order = facts
  .map((f, i) => {
    const s = lib.sections.findIndex((x) => x.name === f.section)
    const key = firstOf.has(f.section) ? s + grow.next() * 2.5 : s
    firstOf.set(f.section, s)
    return { f, key: key + i * 1e-6 }
  })
  .sort((a, b) => a.key - b.key)
  .map((x) => x.f)

type Entry = { t: number; event?: { name: string; progress?: Record<string, number>; status?: { counts: Record<string, number> } }; overview?: unknown; status?: { counts: Record<string, number> }; whole?: false }
const timeline = baked.timeline as Entry[]
/** How many memories the build held at each moment, from its own progress. */
const heldAt = (t: number) => {
  let n = 0
  for (const e of timeline) if (e.t <= t && e.event?.name === 'memory.build') n = e.event.progress!.memories!
  return Math.min(facts.length, n)
}
const counted = (held: readonly LibFact[]) => ({ sections: new Set(held.map((f) => f.section)).size, folders: new Set(held.filter((f) => f.folder).map((f) => f.folder)).size })
const GROW_CANVAS = { width: 1180, height: 556 }
for (const e of timeline) {
  const held = order.slice(0, heldAt(e.t))
  if (e.overview) {
    e.overview = overview(held)
    if (e.status) e.status.counts.memories = held.length
    const nodes = sceneNodes(e.overview)
    const pos = placeAll(nodes)
    const least = lineZoomOf(nodes, pos) as number
    const { k } = frameAround(nodes.map((n: { id: string }) => n.id), pos, GROW_CANVAS, {}) as { k: number }
    if (k <= 0.0501 || least > k) e.whole = false
    else delete e.whole
  }
  if (e.event?.name === 'memory.build') Object.assign(e.event.progress!, counted(held), { memories: held.length })
  if (e.event?.name === 'memory.status' && e.event.status) e.event.status.counts.memories = held.length
}
// The build's last word holds every memory, in every section.
const lastBuild = timeline.findLast((e) => e.event?.name === 'memory.build')
if (lastBuild) Object.assign(lastBuild.event!.progress!, counted(facts), { memories: facts.length })
console.error(`the onboarding canvas frames ${timeline.filter((e) => e.overview && e.whole !== false).length} of ${timeline.filter((e) => e.overview).length} overviews whole`)

// ---- The answers after the build. ----

const sourceChats = new Map<string, string>()
for (const f of facts) {
  const c = source(f).chat
  sourceChats.set(c.id, c.platform)
}
const allViews = [...views.values()]
const dueSoon = allViews.filter((v) => ['overdue', 'today', 'soon', 'upcoming'].includes(v.urgency)).sort((a, b) => LEVELS.indexOf(a.urgency) - LEVELS.indexOf(b.urgency) || String((a.due as { at: string } | null)?.at ?? '').localeCompare(String((b.due as { at: string } | null)?.at ?? '')))
const counts = (status: { counts: Record<string, unknown> }) => {
  Object.assign(status.counts, {
    memories: facts.length,
    dueSoon: dueSoon.length,
    review: 0,
    sourceChats: sourceChats.size,
    sourceChatsBy: Object.fromEntries(AIS.map((p) => [p, [...sourceChats.values()].filter((x) => x === p).length])),
  })
  return status
}
const factByText = (start: string) => views.get(facts.find((f) => f.text.startsWith(start))!.id)!
const answers = (baked.answers as Array<{ method: string; args?: { id?: string; q?: string; limit?: number }; answer: unknown }>).flatMap((a) => {
  switch (a.method) {
    case 'memory.status':
      return [{ ...a, answer: counts(a.answer as { counts: Record<string, unknown> }) }]
    case 'memory.overview':
      return [{ ...a, answer: whole }]
    case 'memory.node':
      return []
    case 'memory.children':
      return [{ ...a, answer: { items: sections.map((s) => { const kids = whole.nodes.filter((n) => n.parent === s.id); const mine = facts.filter((f) => ownerOf(f) === s.id || folderOf.get(ownerOf(f))?.section === s.id).map((f) => views.get(f.id)!); const top = mine.filter(isDue).sort((x, y) => LEVELS.indexOf(x.urgency) - LEVELS.indexOf(y.urgency))[0]; return { id: s.id, kind: 'section', label: s.label, facts: facts.filter((f) => ownerOf(f) === s.id).length, children: kids.length, urgency: top?.urgency ?? 'none', urgencyLabel: top?.urgencyLabel ?? null, pinned: false } }), next: null } }]
    case 'memory.dueSoon':
      return [{ ...a, answer: dueSoon.slice(0, a.args?.limit ?? 5) }]
    case 'memory.review':
      return [{ ...a, answer: [] }]
    case 'memory.corePack':
      return [{ ...a, answer: { ...(a.answer as object), lines: [
        { id: factByText('You work at Kestrel').id, group: 'identity', text: factByText('You work at Kestrel').text },
        { id: factByText("You're a junior").id, group: 'identity', text: factByText("You're a junior").text },
        { id: factByText('When you write').id, group: 'style', text: factByText('When you write').text },
        ...['Tidepool', 'SkipDoodle', 'Sparrowhawk'].map((p) => ({ id: folderId(p), group: 'projects', text: `Working on ${p}.` })),
      ] } }]
    case 'memory.search':
      return [{ ...a, answer: memorySearch(a.args!.q!, a.args!.limit ?? 8) }]
    default:
      return [a]
  }
})
for (const n of whole.nodes) answers.push({ method: 'memory.node', args: { id: n.id }, answer: detail(n.id) })

// The library as the engine holds it: the newest chats, and its search.
const rows = [...chats.values()].sort((a, b) => (a.messages.at(-1)!.at < b.messages.at(-1)!.at ? 1 : -1))
const engine = (baked.engine as Array<{ method: string; args?: { limit?: number; query?: string }; answer: unknown }>).map((e) => {
  if (e.method === 'listConversations')
    return { ...e, answer: { ...(e.answer as object), rows: rows.slice(0, e.args?.limit ?? 8).map((c) => ({ id: c.id, platform: c.platform, platformConvId: c.id.slice(c.platform.length + 1), title: c.title, messageCount: c.messages.length, bytes: c.messages.reduce((n, m) => n + m.text.length, 0), hash: createHash('sha256').update(c.messages.map((m) => m.text).join('\n')).digest('hex'), archived: false, changedDuringRun: false, created: Date.parse(c.messages[0]!.at), updated: Date.parse(c.messages.at(-1)!.at) })) } }
  if (e.method === 'search') return { ...e, answer: librarySearch(e.args!.query!, e.args!.limit ?? 5) }
  return e
})

const out = { ...baked, before: { ...baked.before, overview: overview([]) }, timeline, answers, engine }
writeFileSync(FILE, JSON.stringify(out))
const per = lib.sections.map((s) => `${s.name} ${facts.filter((f) => f.section === s.name).length}`).join(', ')
console.error(`${facts.length} memories from ${sourceChats.size} chats of ${chats.size}; ${per}; due soon ${dueSoon.length}`)
