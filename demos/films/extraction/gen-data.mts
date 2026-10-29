/**
 * Writes data.json, what this film's sites, library and memory hold.
 *
 * The story is coere-v2's own film data (tools/demo-video/memory/data.ts):
 * the chats on install day, the two that come in later, and the DATA 100
 * lab chat as it stands once Maya comes back to it and moves the lab.
 *
 * A person who has used three AIs for a term has about 324 chats. The
 * rest of her library is Maya's library (../memory/maya-library.mts), the
 * one the Coere Memory film draws too: the chats where she told her AIs
 * about her courses, her job, her side projects, her people, her plans,
 * her health, money and trips, and the chats that taught memory nothing.
 * Memory is filed from all of it the way the owner wants it drawn: twelve
 * sections, two to four folders in each with a tidy fan of memories, and
 * a few loose ones, never hundreds of numbered assignments on one course.
 *
 *   cd <coere-v2> && node_modules/.bin/tsx <this file>
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const V2 = process.cwd()
const data = await import(join(V2, 'tools/demo-video/memory/data.ts'))
const { fixStory, mayaLibrary, rng, MONTHS } = await import(join(here, '../memory/maya-library.mts'))
type LibFact = import('../memory/maya-library.mts').LibFact

/** What Extract all finds on each AI on install day. */
const TARGET = { chatgpt: 148, claude: 102, gemini: 74 } as const
type Platform = keyof typeof TARGET
const PLATFORMS = Object.keys(TARGET) as Platform[]
/** Where Maya lives, for her dates. */
const ZONE = 'America/Los_Angeles'
/** The film's day, as coere-v2's story chats were written for it. */
const NOW = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`)

type Msg = { role: string; text: string; createdAt?: string }
type Conv = { platform: string; platformConvId: string; title?: string; createdAt?: string; updatedAt?: string; capturedAt?: string; messages: Msg[] }
type Slim = { platform: string; id: string; title: string; createdAt: string; updatedAt: string; messages: { role: string; text: string; at: string | null }[] }

/** The date the lab chat first named, and the one Maya moved it to, as her update says them. */
const [, FROM, TO] = /from (\w+ \d+) to (\w+ \d+)/.exec(data.MOVED_LINE) ?? []
if (!FROM || !TO) throw new Error('the moved line names no dates')

/**
 * The replica sites list chats with no update time (demos/tools/sites.mts),
 * so their order is the ids', and Coere checks only the 20 at the top of a
 * list for new messages, as it would the 20 newest. The lab chat, changed
 * today, and the two chats that come in later are the newest, so their ids
 * start with a zero and every other id never does.
 */
const LAB = (data.changedChat() as Conv).platformConvId
const LAB_ID = `0${LAB.slice(1)}`
const laterRaw = (data.laterChats() as Conv[]).map((c) => fixStory(c, FROM))
const LATER = new Set(laterRaw.map((c) => c.title!))
const LATER_IDS = new Map(laterRaw.map((c) => [c.platformConvId, `00${c.platformConvId.slice(2)}`]))
const idOf = (id: string) => (id === LAB ? LAB_ID : (LATER_IDS.get(id) ?? (id.startsWith('0') ? `1${id.slice(1)}` : id)))

const slim = (c: Conv): Slim => ({
  platform: c.platform,
  id: idOf(c.platformConvId),
  title: c.title ?? '',
  createdAt: c.createdAt ?? c.messages[0]?.createdAt ?? c.capturedAt!,
  updatedAt: c.updatedAt ?? c.messages.at(-1)?.createdAt ?? c.capturedAt!,
  messages: c.messages.map((m) => ({ role: m.role, text: m.text, at: m.createdAt ?? null })),
})

// ---- The story's chats, then Maya's library. ----

const story = new Map<string, Conv>()
for (const c of [...data.SESSION_SET.conversations, ...data.installDay().conversations, ...laterRaw] as Conv[])
  if ((PLATFORMS as string[]).includes(c.platform) && c.title && !story.has(c.title)) story.set(c.title, fixStory(c, FROM))
const lib = mayaLibrary(NOW, (t: string) => (story.has(t) ? story.get(t)!.messages.filter((m) => m.role === 'user').map((m) => m.text) : null), { sourceChats: 240 })

const base = lib.story.filter((t: string) => !LATER.has(t)).map((t: string) => slim(story.get(t)!))
const later = laterRaw.map(slim)
const changed = slim(fixStory(data.changedChat() as Conv, FROM))

/** Which AI each of her other chats was on: as many on each as the target asks, spread over the term. */
const r = rng(7)
const idle = lib.idle.slice(0, PLATFORMS.reduce((n, p) => n + TARGET[p], 0) - base.length - lib.chats.length)
const slots = r.shuffle(PLATFORMS.flatMap((p) => Array.from({ length: TARGET[p] - base.filter((c) => c.platform === p).length }, () => p)))
const usedIds = new Set([...base, ...later, changed].map((c) => c.id))
function newId(platform: Platform): string {
  for (;;) {
    const h = Array.from({ length: 32 }, () => '0123456789abcdef'[r.int(0, 15)]).join('')
    const id = platform === 'gemini' ? h.slice(0, 16) : `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
    if (/^[1-9a-f]/.test(id) && !usedIds.has(id)) return usedIds.add(id), id
  }
}
const titles = new Set([...base, ...later].map((c) => c.title))
const byKey = new Map<string, Slim>()
const extra: Slim[] = [...lib.chats, ...idle].map((c, i) => {
  const platform = slots[i]!
  // Her evening in Los Angeles, as a time of day.
  const start = NOW - c.ago * 86_400_000 + c.minute * 60_000 + 7 * 3_600_000
  const messages = c.turns.flatMap((t: { user: string; reply: string }, n: number) => [
    { role: 'user', text: t.user, at: new Date(start + n * 180_000).toISOString() },
    { role: 'assistant', text: t.reply, at: new Date(start + n * 180_000 + 40_000).toISOString() },
  ])
  if (titles.has(c.title)) throw new Error(`two chats are called ${c.title}`)
  titles.add(c.title)
  const slimmed = { platform, id: newId(platform), title: c.title, createdAt: messages[0]!.at, updatedAt: messages.at(-1)!.at, messages }
  byKey.set(c.key, slimmed)
  return slimmed
})
const install = [...base, ...extra].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))

// ---- Memory: Maya's library, filed in its sections and folders. ----

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
const sectionId = (name: string) => `sec_${slug(name)}`
const thingId = (name: string) => `ent_${slug(name)}`
const chatOf = (f: LibFact): Slim => byKey.get(f.chat) ?? [...base, ...later].find((c) => c.title === f.chat)!

/** "Aug 18" as a day in the year of `near`. */
function isoDay(text: string, near: string): string {
  const [mon, d] = text.split(' ') as [string, string]
  return `${near.slice(0, 4)}-${String(MONTHS.indexOf(mon) + 1).padStart(2, '0')}-${d.padStart(2, '0')}`
}

type Fact = {
  id: string
  owner: string
  kind: string
  key: string
  text: string
  specifics: [number, number][]
  importance: number
  status: string
  due: string | null
  start: string | null
  progress: string | null
  history: boolean
  supersededBy: string | null
  replacedOn: string | null
  sensitivity: string | null
  sources: { chat: string; msg: number; role: string; at: string }[]
}
const facts: Fact[] = lib.facts.map((f: LibFact) => {
  const chat = chatOf(f)
  const n = chat.messages.findIndex((m) => m.role === 'user' && m.text.includes(f.said))
  if (n < 0) throw new Error(`${chat.title} never says: ${f.said}`)
  const at = f.specific ? f.text.indexOf(f.specific) : -1
  return {
    id: `fact_${f.id}`,
    owner: f.folder ? thingId(f.folder) : sectionId(f.section),
    kind: f.kind,
    key: f.key,
    text: f.text,
    specifics: at >= 0 ? [[at, at + f.specific!.length] as [number, number]] : [],
    importance: f.importance,
    status: 'active',
    due: f.due,
    start: f.start,
    progress: f.kind === 'task' ? 'needs-action' : null,
    history: false,
    supersededBy: null,
    replacedOn: null,
    sensitivity: f.sensitivity,
    sources: [{ chat: `${chat.platform}:${chat.id}`, msg: n + 1, role: 'user', at: chat.messages[n]!.at ?? chat.createdAt }],
  }
})

/** The lab's deadline, the one the film follows, and her update, the newer one filed where the old one was. */
const lab = facts.find((f) => f.owner === thingId('DATA 100') && f.text === `Lab 1 for DATA 100 is due ${FROM}.`)
if (!lab) throw new Error('memory has no DATA 100 lab deadline')
lab.progress = null
const movedAt = changed.messages.findIndex((m) => m.text === data.MOVED_LINE)
const movedText = `Lab 1 for DATA 100 is due ${TO}.`
const moved: Fact = {
  ...lab,
  id: 'fact_lab_moved',
  text: movedText,
  specifics: [[movedText.indexOf(TO), movedText.indexOf(TO) + TO.length]],
  due: isoDay(TO, lab.due!),
  sources: [{ chat: `${changed.platform}:${changed.id}`, msg: movedAt + 1, role: 'user', at: changed.updatedAt }],
}

const sections = lib.sections.map((s: { name: string }) => ({ id: sectionId(s.name), label: s.name }))
const things = lib.sections.flatMap((s: { name: string; folders: Array<{ name: string; kind: string }> }) => s.folders.map((x) => ({ id: thingId(x.name), kind: x.kind, label: x.name, section: sectionId(s.name), parent: null as string | null })))
const memory = { zone: ZONE, sections, things, facts, moved, lab: lab.id }

const out = { now: Date.now(), changingTitle: data.CHANGING_TITLE, movedLine: data.MOVED_LINE, install, later, changed, memory }
writeFileSync(join(here, 'data.json'), JSON.stringify(out) + '\n')
const by = (list: { platform: string }[]) => Object.entries(list.reduce<Record<string, number>>((n, c) => ((n[c.platform] = (n[c.platform] ?? 0) + 1), n), {}))
const fromChats = new Set(facts.map((f) => f.sources[0]!.chat)).size
console.log('install', install.length, by(install), 'later', later.map((c) => `${c.platform}:${c.title}`), 'changed', changed.title, changed.platform)
console.log('memory', sections.length, 'sections', things.length, 'folders', facts.length, 'facts from', fromChats, 'chats')
for (const s of lib.sections) console.log(' ', s.name, s.folders.map((x: { name: string }) => `${x.name} ${facts.filter((f) => f.owner === thingId(x.name)).length}`).join(', '), '| loose', facts.filter((f) => f.owner === sectionId(s.name)).length)
