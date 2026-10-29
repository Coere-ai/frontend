/**
 * Writes data.json, what this film's sites, library and memory hold, from
 * coere-v2's own film data (tools/demo-video/memory/data.ts): the chats on
 * install day, the two that come in later, the DATA 100 lab chat as it
 * stands once Maya comes back to it, and her memory, filed from the
 * memory corpus's planted truth (the facts, the things they are about and
 * the chats they came from), which is what the film's build learned.
 *
 *   cd <coere-v2> && node_modules/.bin/tsx <this file>
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const V2 = process.cwd()
const data = await import(join(V2, 'tools/demo-video/memory/data.ts'))

type Msg = { role: string; text: string; createdAt?: string }
type Conv = { platform: string; platformConvId: string; title?: string; createdAt?: string; updatedAt?: string; capturedAt: string; messages: Msg[] }

/** The date the lab chat first named, and the one Maya moved it to, as her update says them. */
const [, FROM, TO] = /from (\w+ \d+) to (\w+ \d+)/.exec(data.MOVED_LINE) ?? []
if (!FROM || !TO) throw new Error('the moved line names no dates')

/** The lab chat's first line names the date her update moves it from, so the story holds together. */
const told = (c: Conv): Conv =>
  c.title === data.CHANGING_TITLE ? { ...c, messages: c.messages.map((m, i) => (i === 0 ? { ...m, text: m.text.replace(/due \w+ \d+/, `due ${FROM}`) } : m)) } : c

/**
 * The lab chat's id, moved to the front of the site's list. The replica
 * sites list chats with no update time (demos/tools/sites.mts), so their
 * order is the ids', and Coere checks only the 20 at the top of a list for
 * new messages, as it would the 20 newest; in a list by date her chat,
 * changed today, is at the top.
 */
const LAB = (data.changedChat() as Conv).platformConvId
const LAB_ID = `0${LAB.slice(1)}`
const idOf = (id: string) => (id === LAB ? LAB_ID : id)

const slim = (c: Conv) => ({
  platform: c.platform,
  id: idOf(c.platformConvId),
  title: c.title ?? '',
  createdAt: c.createdAt ?? c.messages[0]?.createdAt ?? c.capturedAt,
  updatedAt: c.updatedAt ?? c.messages.at(-1)?.createdAt ?? c.capturedAt,
  messages: c.messages.map((m) => ({ role: m.role, text: m.text, at: m.createdAt ?? null })),
})

const install = (data.installDay().conversations as Conv[]).map(told).map(slim)
const later = (data.laterChats() as Conv[]).map(slim)
const changed = slim(told(data.changedChat() as Conv))

// ---- Memory, from the planted truth of the corpus the chats came from. ----

type Planted = {
  id: string
  path: string[]
  subject: string
  key: string
  kind: string
  specifics: { type: string; text: string }[]
  ref: string
  span: [number, number]
  role: string
  at: string
  basis: string
  importance: [number, number]
  sensitivity: string
  status: string
  progress?: string
  due?: { at: string }
  start?: { at: string }
}
const cacheDir = join(V2, 'tests/.cache/memory-small-e2e')
const day = readdirSync(cacheDir).sort().at(-1)!
const truth = JSON.parse(readFileSync(join(cacheDir, day, 'memory-truth.json'), 'utf8')) as {
  facts: Planted[]
  changes: { kind: string; older: string; newer: string }[]
  tree: { path: string[]; kind: string }[]
}

const chats = new Map([...install, ...later].map((c) => [`${c.platform}:${c.id}`, c]))
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
const sectionId = (name: string) => `sec_${slug(name)}`
const thingId = (path: string[]) => `ent_${slug(path.join(' '))}`

/** What a planted line says, as memory writes it: about "you", a sentence of its own. */
function memoryText(line: string): string {
  let t = line.replace(/^you can reach me at/i, 'you can be reached at').replace(/^(fyi|ok so|quick note\.?|quick update\.?|big news about my job:)\s+/i, '').trim()
  t = t
    .replace(/\bi'm\b/gi, "you're")
    .replace(/\bi\b/g, 'you')
    .replace(/\bmy\b/gi, 'your')
    .replace(/\bme\b/g, 'you')
    .replace(/, keep that in mind for recipes\.?$/, '.')
    .replace(/, so plan around that\.?$/, '.')
  t = t[0]!.toUpperCase() + t.slice(1)
  return /[.!?]$/.test(t) ? t : `${t}.`
}

const replaced = new Map(truth.changes.filter((c) => c.kind === 'superseded').map((c) => [c.older, c]))
const ended = new Set(truth.changes.filter((c) => c.kind !== 'superseded').map((c) => c.older))
const byId = new Map(truth.facts.map((f) => [f.id, f]))

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

const facts: Fact[] = []
for (const f of truth.facts) {
  const [ref, n] = f.ref.split('#m') as [string, string]
  const conv = ref.replace(LAB, LAB_ID)
  const chat = chats.get(conv)
  if (!chat) continue
  const said = chat.messages[Number(n) - 1]?.text.slice(f.span[0], f.span[1])
  if (!said) continue
  let text = memoryText(said)
  let due = f.due?.at ?? null
  // The lab chat's deadline is the one the film follows: what the chat says first, which her update moves.
  if (f.path.join('/') === 'School/DATA 100/Lab 1' && f.key === 'due') {
    text = `Lab 1 for DATA 100 is due ${FROM}.`
    due = isoDay(FROM, chat.createdAt)
  }
  if (f.path.join('/') === 'School/DATA 100/Lab 1' && f.key === 'status') text = 'Lab 1 for DATA 100 was submitted.'
  const owner = f.path.length === 1 ? sectionId(f.path[0]!) : thingId(f.path)
  const newer = replaced.get(f.id)
  const after = newer && byId.get(newer.newer)
  const keep = newer ? chats.has(byId.get(newer.newer)!.ref.split('#m')[0]!.replace(LAB, LAB_ID)) : true
  facts.push({
    id: `fact_${f.id}`,
    owner,
    kind: f.kind,
    key: f.key,
    text,
    specifics: (text.includes(FROM) && f.key === 'due' && owner.endsWith('data_100_lab_1') ? [{ type: 'date', text: FROM }] : f.specifics).flatMap((s) => {
      const at = text.indexOf(s.text)
      return at < 0 ? [] : [[at, at + s.text.length] as [number, number]]
    }),
    importance: Math.round((f.importance[0] + f.importance[1]) / 2),
    status: newer && keep ? 'superseded' : 'active',
    due,
    start: f.start?.at ?? null,
    progress: f.progress ?? null,
    history: f.key === 'status' || ended.has(f.id),
    supersededBy: newer && keep ? `fact_${newer.newer}` : null,
    replacedOn: newer && keep && after ? after.at.slice(0, 10) : null,
    sensitivity: f.sensitivity === 'none' ? null : f.sensitivity,
    sources: [{ chat: conv, msg: Number(n), role: f.role, at: f.at }],
  })
}

/** "Aug 18" as a day in the year of `near`. */
function isoDay(text: string, near: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const [mon, d] = text.split(' ') as [string, string]
  return `${near.slice(0, 4)}-${String(months.indexOf(mon) + 1).padStart(2, '0')}-${d.padStart(2, '0')}`
}

/** Her update, the newer deadline, filed where the old one was. */
const lab = facts.find((f) => f.owner === thingId(['School', 'DATA 100', 'Lab 1']) && f.key === 'due')!
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

const used = new Set(facts.map((f) => f.owner))
const things = truth.tree
  .filter((t) => t.path.length > 1)
  .map((t) => ({ id: thingId(t.path), kind: t.kind, label: t.path.at(-1)!, section: sectionId(t.path[0]!), parent: t.path.length > 2 ? thingId(t.path.slice(0, -1)) : null }))
// A thing is kept when a fact of its own, or of something under it, is.
const keep = new Set<string>()
for (const t of things) if (used.has(t.id)) for (let at: string | null = t.id; at; at = things.find((x) => x.id === at)?.parent ?? null) keep.add(at)
const sections = [...new Set(truth.facts.map((f) => f.path[0]!))].map((name) => ({ id: sectionId(name), label: name }))

const memory = {
  zone: 'America/Los_Angeles',
  sections,
  things: things.filter((t) => keep.has(t.id)),
  facts,
  moved,
  lab: lab.id,
}

const out = { now: Date.now(), changingTitle: data.CHANGING_TITLE, movedLine: data.MOVED_LINE, install, later, changed, memory }
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), 'data.json'), JSON.stringify(out, null, 1) + '\n')
const by = (list: { platform: string }[]) => Object.entries(list.reduce<Record<string, number>>((n, c) => ((n[c.platform] = (n[c.platform] ?? 0) + 1), n), {}))
console.log('install', install.length, by(install), 'later', later.map((c) => `${c.platform}:${c.title}`), 'changed', changed.title, changed.platform)
console.log('memory', sections.length, 'sections', memory.things.length, 'things', facts.length, 'facts')
