/**
 * Writes data.json, what this film's sites, library and memory hold.
 *
 * The story is coere-v2's own film data (tools/demo-video/memory/data.ts):
 * the chats on install day, the two that come in later, the DATA 100 lab
 * chat as it stands once Maya comes back to it, and the memory filed from
 * the memory corpus's planted truth (the facts, the things they are about
 * and the chats they came from).
 *
 * A person who has used three AIs for a term has about 324 chats, so the
 * rest of her library is made the same way, seeded: coere-v2's memory
 * corpus at its medium size (tools/gen-corpus, the same person on the same
 * days) gives the everyday chats, each turn kept with the facts planted in
 * it, renumbered to a term's worth of assignments and reports and grouped
 * into chats as a person has them; and a small set of life chats (health,
 * money, places, home, hobbies) fills the sections that corpus has none
 * of. Memory is filed from all of it, so the graph is as deep as the
 * library is long.
 *
 *   cd <coere-v2> && node_modules/.bin/tsx <this file>
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const V2 = process.cwd()
const data = await import(join(V2, 'tools/demo-video/memory/data.ts'))
const { generateMemoryCorpus } = await import(join(V2, 'tools/gen-corpus/memory/index.ts'))
const { Rng } = await import(join(V2, 'tools/gen-corpus/rng.ts'))
type RngT = InstanceType<typeof Rng>

/** What Extract all finds on each AI on install day. */
const TARGET = { chatgpt: 148, claude: 102, gemini: 74 } as const
type Platform = keyof typeof TARGET
const PLATFORMS = Object.keys(TARGET) as Platform[]

type Msg = { role: string; text: string; createdAt?: string }
type Conv = { platform: string; platformConvId: string; title?: string; createdAt?: string; updatedAt?: string; capturedAt: string; messages: Msg[] }
type Slim = { platform: string; id: string; title: string; createdAt: string; updatedAt: string; messages: { role: string; text: string; at: string | null }[] }

/** The date the lab chat first named, and the one Maya moved it to, as her update says them. */
const [, FROM, TO] = /from (\w+ \d+) to (\w+ \d+)/.exec(data.MOVED_LINE) ?? []
if (!FROM || !TO) throw new Error('the moved line names no dates')

/** The lab chat's first line names the date her update moves it from, so the story holds together. */
const told = (c: Conv): Conv =>
  c.title === data.CHANGING_TITLE ? { ...c, messages: c.messages.map((m, i) => (i === 0 ? { ...m, text: m.text.replace(/due \w+ \d+/, `due ${FROM}`) } : m)) } : c

/**
 * The replica sites list chats with no update time (demos/tools/sites.mts),
 * so their order is the ids', and Coere checks only the 20 at the top of a
 * list for new messages, as it would the 20 newest. The lab chat, changed
 * today, and the two chats that come in later are the newest, so their ids
 * start with a zero and every other id never does.
 */
const LAB = (data.changedChat() as Conv).platformConvId
const LAB_ID = `0${LAB.slice(1)}`
const laterRaw = data.laterChats() as Conv[]
const LATER_IDS = new Map(laterRaw.map((c) => [c.platformConvId, `00${c.platformConvId.slice(2)}`]))
const idOf = (id: string) => (id === LAB ? LAB_ID : (LATER_IDS.get(id) ?? (id.startsWith('0') ? `1${id.slice(1)}` : id)))

const slim = (c: Conv): Slim => ({
  platform: c.platform,
  id: idOf(c.platformConvId),
  title: c.title ?? '',
  createdAt: c.createdAt ?? c.messages[0]?.createdAt ?? c.capturedAt,
  updatedAt: c.updatedAt ?? c.messages.at(-1)?.createdAt ?? c.capturedAt,
  messages: c.messages.map((m) => ({ role: m.role, text: m.text, at: m.createdAt ?? null })),
})

const base = (data.installDay().conversations as Conv[]).map(told).map(slim)
const later = laterRaw.map(slim)
const changed = slim(told(data.changedChat() as Conv))

// ---- The planted truth of the story's corpus. ----

type Planted = {
  id: string
  family: string
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
type Truth = { zone: string; facts: Planted[]; changes: { kind: string; older: string; newer: string }[]; tree: { path: string[]; kind: string }[] }
const cacheDir = join(V2, 'tests/.cache/memory-small-e2e')
const day = readdirSync(cacheDir).sort().at(-1)!
const truth = JSON.parse(readFileSync(join(cacheDir, day, 'memory-truth.json'), 'utf8')) as Truth
const NOW = Date.parse(`${day}T00:00:00Z`)

// ---- The rest of the term: the medium memory corpus, the same person, kept turn by turn. ----

const medium = generateMemoryCorpus({ seed: 1, now: NOW, size: 'medium' }) as { conversations: Conv[]; truth: Truth }

/** One turn of a medium chat: what she said, the answer, and the facts planted in it, each with its sentence. */
type Turn = { at: string; messages: Msg[]; facts: { f: Planted; line: number; said: string }[] }

/** Families the story's corpus already holds: who she is, her people, her trip, her side project. */
const STORY = /^(name|home|course|job|job\.org|manager|promotion|allergy|decision|trip|budget|declined|version|switched\..*|selfSite|selfContact\..*|person|personEmail|personWork|personPhone|personGithub|appointment|instruction|likes|dislikes|pastedEmail|injection)$/

/** A term has this many of each, per course: the rest of the corpus's numbering is a stress test. */
const CAPS: Record<string, number> = { Reading: 16, 'Problem Set': 11, Lab: 11, Project: 4, 'Weekly Report': 17 }
/** How many of the invented tools she asks about at work. */
const TOOLS = 26

const turns: Turn[] = []
{
  const byRef = new Map<string, Planted[]>()
  for (const f of medium.truth.facts) byRef.set(f.ref, [...(byRef.get(f.ref) ?? []), f])
  for (const c of medium.conversations) {
    const lib = `${c.platform}:${c.platformConvId}`
    let turn: Turn | null = null
    c.messages.forEach((m, i) => {
      if (m.role === 'user' || !turn) {
        turn = { at: m.createdAt ?? c.capturedAt, messages: [], facts: [] }
        turns.push(turn)
      }
      turn.messages.push(m)
      // The medium corpus numbers its facts as the story's does, so its ids get a letter of their own.
      for (const f of byRef.get(`${lib}#m${i + 1}`) ?? []) turn.facts.push({ f: { ...f, id: `m${f.id}` }, line: turn.messages.length - 1, said: m.text.slice(f.span[0], f.span[1]) })
    })
  }
}

const baseTree = new Set(truth.tree.map((t) => t.path.join('/')))
const baseUsed = new Map<string, Set<number>>()
const ASSIGNMENT = /^(Reading|Problem Set|Lab|Project|Weekly Report) (\d+)$/
for (const t of truth.tree) {
  const m = ASSIGNMENT.exec(t.path.at(-1)!)
  if (m) baseUsed.set(`${t.path[1]}|${m[1]}`, new Set([...(baseUsed.get(`${t.path[1]}|${m[1]}`) ?? []), Number(m[2])]))
}

/** Each assignment of the medium corpus, by course and kind, in the order it first came up, renumbered from the first free number. */
const renumber = new Map<string, number>()
{
  const first = new Map<string, string>()
  for (const t of turns) for (const { f } of t.facts) {
    const m = f.path.length === 3 ? ASSIGNMENT.exec(f.path[2]!) : null
    const key = m && `${f.path[1]}|${m[1]}|${m[2]}`
    if (key && (!first.has(key) || f.at < first.get(key)!)) first.set(key, f.at)
  }
  const groups = new Map<string, string[]>()
  for (const key of [...first.keys()].sort((a, b) => (first.get(a)! < first.get(b)! ? -1 : 1))) {
    const g = key.split('|').slice(0, 2).join('|')
    groups.set(g, [...(groups.get(g) ?? []), key])
  }
  for (const [g, keys] of groups) {
    const used = baseUsed.get(g) ?? new Set()
    let n = 1
    for (const key of keys.slice(0, CAPS[g.split('|')[1]!] ?? 0)) {
      while (used.has(n)) n++
      renumber.set(key, n++)
    }
  }
}

/** The tools she asks about: the first ones the corpus names that the story has not. */
const tools = new Set<string>()
for (const t of [...turns].sort((a, b) => (a.at < b.at ? -1 : 1)))
  for (const { f } of t.facts)
    if (f.path[0] === 'Information' && !baseTree.has(f.path.join('/')) && tools.size < TOOLS) tools.add(f.path[1]!)

const COURSE = /(DATA 100|MATH 54|PHYS 137|Kestrel Analytics)/
/** A line with its assignments renumbered, or null when it names one the term does not keep. `named` collects the ones it names. */
function renamed(text: string, course: string | null, named = new Set<string>()): string | null {
  const within = /\bin (DATA 100|MATH 54|PHYS 137),/.exec(text)?.[1] ?? null
  let lost = false
  const out = text.replace(/\b(Reading|Problem Set|Lab|Project|Weekly Report) (\d+)( for (DATA 100|MATH 54|PHYS 137|Kestrel Analytics))?/g, (all, kind: string, n: string, tail: string | undefined, said: string | undefined) => {
    const c = said ?? within ?? (kind === 'Weekly Report' ? 'Kestrel Analytics' : course)
    const to = c ? renumber.get(`${c}|${kind}|${n}`) : undefined
    if (c) named.add(`${c}|${kind}|${n}`)
    if (to === undefined) {
      lost = true
      return all
    }
    return `${kind} ${to}${tail ?? ''}`
  })
  return lost ? null : out
}

/** The generic answers of the corpus, said a few ways, as different AIs say them. */
const ACKS = new Set(['Noted. Anything else to plan?', 'Got it, noted.', 'Thanks, I will keep that in mind.'])
const SAY_ACK = [
  'Got it. I will keep that in mind.',
  'Noted. Want a reminder plan for the week?',
  'Okay, noted.',
  'Thanks for the update.',
  'Got it. Anything else coming up?',
  'Noted. That is a busy week.',
  'Good to know. I will plan around it.',
  'Okay. I will remember that.',
  'Got it. Want me to block out time for it?',
  'Thanks, noted.',
]

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

/** A turn of a chat to be, with the facts it plants as memory files them. */
type Piece = { at: string; group: string; messages: Msg[]; facts: { f: Planted; line: number; said: string }[]; title?: string }

/** The turns the term keeps, with what they say renumbered; `named` collects every assignment they name. */
function termPieces(named: Set<string>): Piece[] {
const pieces: Piece[] = []
const rngAck = Rng.derive(7, 'extraction-acks')
for (const t of turns) {
  if (!t.facts.length || t.facts.some(({ f }) => STORY.test(f.family) || f.path.length < 2)) continue
  const f0 = t.facts[0]!.f
  if (t.facts.some(({ f }) => baseTree.has(f.path.join('/')) && !['course', 'organization'].includes(medium.truth.tree.find((x) => x.path.join('/') === f.path.join('/'))?.kind ?? ''))) continue
  if (t.facts.some(({ f }) => f.path[0] === 'Information' && !tools.has(f.path[1]!))) continue
  if (t.facts.some(({ f }) => f.path[0] === 'People')) continue
  const course = COURSE.exec(f0.path[1] ?? '')?.[1] ?? null
  const messages: Msg[] = []
  const names = new Set<string>()
  let ok = true
  for (const m of t.messages) {
    const text = renamed(m.text, course, names)
    if (text === null) ok = false
    else messages.push({ ...m, text: m.role === 'assistant' && ACKS.has(text) ? rngAck.pick(SAY_ACK) : text })
  }
  if (!ok) continue
  const facts = t.facts.map(({ f, line, said }) => {
    const path = f.path.map((p, i) => (i === 2 ? (renamed(`${p} for ${f.path[1]}`, course)?.replace(/ for .*$/, '') ?? '') : p))
    return { f: { ...f, path, subject: path.at(-1)! }, line, said: renamed(said, course) ?? '' }
  })
  if (facts.some((x) => !x.said || x.f.path.includes(''))) continue
  for (const n of names) named.add(n)
  // Questions about the tools at work share chats, as a person asks a few at a time.
  const group = facts[0]!.f.path[0] === 'Information' ? 'Information' : facts[0]!.f.path.slice(0, 2).join('/')
  pieces.push({ at: t.at, group, messages, facts })
}
return pieces
}

// Numbered once more over the assignments the kept chats name, so a course's labs run 2, 3, 4 with no gaps.
const kept = new Set<string>()
termPieces(kept)
{
  const order = [...renumber.entries()].filter(([key]) => kept.has(key)).sort((a, b) => a[1] - b[1])
  renumber.clear()
  const next = new Map<string, number>()
  for (const [key] of order) {
    const g = key.split('|').slice(0, 2).join('|')
    let n = next.get(g) ?? 1
    while (baseUsed.get(g)?.has(n)) n++
    renumber.set(key, n)
    next.set(g, n + 1)
  }
}
const pieces = termPieces(new Set())

// ---- Her life outside class and work, which the corpus does not cover: a few dozen chats of her own. ----

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dayOf = (offset: number) => new Date(NOW + offset * 86_400_000)
const say = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
const iso = (d: Date) => d.toISOString().slice(0, 10)

/** One life chat: its title, where its facts are filed, and what each turn says. */
type Life = {
  title: string
  path: string[]
  kinds: string[]
  turns: { ask: string; fact: string; key: string; kind?: string; answer: string; specific?: string; due?: string; start?: string; sensitivity?: string }[]
}

function lifeChats(rng: RngT): Life[] {
  const ahead = (min: number, max: number) => dayOf(rng.int(min, max))
  const dentist = ahead(6, 20)
  const half = ahead(12, 30)
  const tuition = ahead(3, 14)
  const physical = ahead(20, 40)
  const lease = new Date(Date.UTC(dayOf(0).getUTCFullYear() + 1, 7, 14))
  const club = ahead(4, 9)
  return [
    { title: 'Booking a dentist cleaning', path: ['Health', 'Appointments', 'Dentist cleaning'], kinds: ['folder', 'event'], turns: [{ ask: `ok so my dentist cleaning is on ${say(dentist)} at 10am.`, fact: `my dentist cleaning is on ${say(dentist)} at 10am.`, key: 'start', kind: 'event', specific: say(dentist), start: `${iso(dentist)}T10:00`, answer: 'Got it. Bring your insurance card, and skip coffee right before.', sensitivity: 'health' }] },
    { title: 'Annual physical', path: ['Health', 'Appointments', 'Annual physical'], kinds: ['folder', 'event'], turns: [{ ask: `fyi my annual physical at the campus clinic is ${say(physical)} at 2:30pm.`, fact: `my annual physical at the campus clinic is ${say(physical)} at 2:30pm.`, key: 'start', kind: 'event', specific: say(physical), start: `${iso(physical)}T14:30`, answer: 'Noted. Write down any questions for the doctor the night before.', sensitivity: 'health' }] },
    { title: 'Knee physical therapy', path: ['Health', 'Knee'], kinds: ['topic'], turns: [{ ask: 'my left knee has been sore since soccer. physical therapy is Tuesdays at 8am for six weeks.', fact: 'physical therapy for my left knee is Tuesdays at 8am for six weeks.', key: 'schedule', specific: 'Tuesdays at 8am', answer: 'That is a good plan. Ice it after hard runs and keep the exercises daily.', sensitivity: 'health' }, { ask: 'my therapist said no running downhill until it stops hurting.', fact: 'my therapist said no running downhill until my knee stops hurting.', key: 'limit', kind: 'constraint', answer: 'Then flat routes for now. The lake path works well for that.', sensitivity: 'health' }] },
    { title: 'Half marathon training', path: ['Health', 'Running', 'Lakeshore Half Marathon'], kinds: ['folder', 'event'], turns: [{ ask: `i signed up for the Lakeshore Half Marathon on ${say(half)}.`, fact: `i signed up for the Lakeshore Half Marathon on ${say(half)}.`, key: 'start', kind: 'event', specific: say(half), start: `${iso(half)}T08:00`, answer: 'Nice. Here is a taper plan for the last two weeks.' }, { ask: 'my goal is to finish under 2 hours.', fact: 'my goal is to finish the half marathon under 2 hours.', key: 'goal', kind: 'goal', specific: 'under 2 hours', answer: 'That is about 9:09 per mile. Your long runs say you can do it.' }] },
    { title: 'Weekly running plan', path: ['Health', 'Running'], kinds: ['folder'], turns: [{ ask: 'i run Monday, Wednesday and Saturday, with the long run on Saturday.', fact: 'i run Monday, Wednesday and Saturday, with the long run on Saturday.', key: 'schedule', answer: 'Good spacing. Keep Wednesday easy so Saturday feels strong.' }] },
    { title: 'Contact lens order', path: ['Health', 'Eyes'], kinds: ['topic'], turns: [{ ask: 'my contact lens prescription is -2.25 in both eyes.', fact: 'my contact lens prescription is -2.25 in both eyes.', key: 'prescription', specific: '-2.25', answer: 'Saved. Most stores ask for the brand and base curve too.', sensitivity: 'health' }] },
    { title: 'Allergy season', path: ['Health', 'Seasonal allergies'], kinds: ['topic'], turns: [{ ask: 'i take cetirizine every morning in ragweed season.', fact: 'i take cetirizine every morning in ragweed season.', key: 'medication', answer: 'Makes sense. Ragweed here peaks in late August and early September.', sensitivity: 'health' }] },
    { title: 'Getting to sleep earlier', path: ['Health', 'Sleep'], kinds: ['topic'], turns: [{ ask: 'i want to be asleep by 11:30 on weeknights.', fact: 'i want to be asleep by 11:30 on weeknights.', key: 'goal', kind: 'goal', specific: '11:30', answer: 'Try no screens after 11 and the same alarm every day, weekends too.' }] },
    { title: 'Flu shot', path: ['Health', 'Appointments', 'Flu shot'], kinds: ['folder', 'event'], turns: [{ ask: 'i got my flu shot at the campus clinic today.', fact: 'i got my flu shot at the campus clinic.', key: 'status', kind: 'event', answer: 'Good. Your arm may be sore for a day.', sensitivity: 'health' }] },
    { title: 'Yoga on Thursdays', path: ['Health', 'Yoga'], kinds: ['topic'], turns: [{ ask: 'i do yoga at the rec center on Thursdays at 6pm.', fact: 'i do yoga at the rec center on Thursdays at 6pm.', key: 'schedule', specific: 'Thursdays at 6pm', answer: 'A good reset after a long week.' }] },
    { title: 'Rent and utilities', path: ['Money', 'Bills', 'Rent'], kinds: ['folder', 'other'], turns: [{ ask: 'my rent is $1,150 a month, due on the 1st.', fact: 'my rent is $1,150 a month, due on the 1st.', key: 'amount', specific: '$1,150', answer: 'Noted. Want me to fit it into a monthly budget?', sensitivity: 'finance' }, { ask: 'Caleb and i split utilities, about $90 each.', fact: 'Caleb and i split utilities, about $90 each.', key: 'utilities', specific: '$90', answer: 'Then your housing comes to about $1,240 a month.', sensitivity: 'finance' }] },
    { title: 'Phone bill', path: ['Money', 'Bills', 'Phone'], kinds: ['folder', 'other'], turns: [{ ask: 'my phone bill is $35 a month and it autopays on the 12th.', fact: 'my phone bill is $35 a month and it autopays on the 12th.', key: 'amount', specific: '$35', answer: 'Noted. That one is easy to forget, so autopay is good.', sensitivity: 'finance' }] },
    { title: 'Weekly grocery budget', path: ['Money', 'Budget'], kinds: ['topic'], turns: [{ ask: 'my grocery budget is $70 a week.', fact: 'my grocery budget is $70 a week.', key: 'groceries', specific: '$70', answer: 'Here is a week of meals that fits in $70.', sensitivity: 'finance' }, { ask: 'and i try to keep eating out under $120 a month.', fact: 'i try to keep eating out under $120 a month.', key: 'eating_out', specific: '$120', answer: 'That is about two dinners and a few coffees.', sensitivity: 'finance' }] },
    { title: 'Pay at Kestrel', path: ['Money', 'Income', 'Kestrel paycheck'], kinds: ['folder', 'other'], turns: [{ ask: 'Kestrel pays me $24 an hour for about 15 hours a week, paid every other Friday.', fact: 'Kestrel pays me $24 an hour for about 15 hours a week, paid every other Friday.', key: 'rate', specific: '$24 an hour', answer: 'So about $720 every two weeks before taxes.', sensitivity: 'finance' }] },
    { title: 'Scholarship this year', path: ['Money', 'Income', 'Scholarship'], kinds: ['folder', 'other'], turns: [{ ask: "i got the $2,000 Dean's scholarship for this year.", fact: "i got the $2,000 Dean's scholarship for this year.", key: 'amount', specific: '$2,000', answer: 'Congratulations! That covers a good part of the spring.', sensitivity: 'finance' }] },
    { title: 'Tuition payment', path: ['Money', 'Tuition'], kinds: ['task'], turns: [{ ask: `the spring tuition deposit is due ${say(tuition)}.`, fact: `the spring tuition deposit is due ${say(tuition)}.`, key: 'due', kind: 'task', specific: say(tuition), due: iso(tuition), answer: 'Noted. Pay a few days early in case the portal is slow.', sensitivity: 'finance' }] },
    { title: 'Saving for a laptop', path: ['Money', 'Savings', 'Laptop fund'], kinds: ['folder', 'other'], turns: [{ ask: "i'm saving $150 a month for a new laptop.", fact: "i'm saving $150 a month for a new laptop.", key: 'monthly', specific: '$150', answer: 'At that pace you reach $1,200 by the summer.', sensitivity: 'finance' }] },
    { title: 'Emergency fund', path: ['Money', 'Savings', 'Emergency fund'], kinds: ['folder', 'other'], turns: [{ ask: 'i want an emergency fund of $2,500 by the end of the year.', fact: 'i want an emergency fund of $2,500 by the end of the year.', key: 'goal', kind: 'goal', specific: '$2,500', answer: 'Put it in a separate savings account so it stays put.', sensitivity: 'finance' }] },
    { title: 'Credit card autopay', path: ['Money', 'Bills', 'Credit card'], kinds: ['folder', 'other'], turns: [{ ask: 'my credit card autopays in full on the 20th.', fact: 'my credit card autopays in full on the 20th.', key: 'autopay', answer: 'Good habit. No interest that way.', sensitivity: 'finance' }] },
    { title: 'Best place to study', path: ['Places', 'Study spots', 'Memorial Library'], kinds: ['folder', 'place'], turns: [{ ask: 'my favorite study spot is the third floor of Memorial Library.', fact: 'my favorite study spot is the third floor of Memorial Library.', key: 'note', answer: 'Quiet floors are the best for problem sets.' }] },
    { title: 'Studying with Iris', path: ['Places', 'Study spots', 'Brightleaf Cafe'], kinds: ['folder', 'place'], turns: [{ ask: 'i meet Iris at Brightleaf Cafe on State Street to study on Sundays.', fact: 'i meet Iris at Brightleaf Cafe on State Street to study on Sundays.', key: 'note', specific: 'Sundays', answer: 'Nice routine. Want a plan for this Sunday?' }] },
    { title: 'Getting to the office', path: ['Places', 'Kestrel office'], kinds: ['place'], turns: [{ ask: 'the Kestrel office is on East Washington, about 20 minutes by bike.', fact: 'the Kestrel office is on East Washington, about 20 minutes by bike.', key: 'commute', specific: '20 minutes', answer: 'Then leave by 8:35 for a 9 o clock start.', sensitivity: 'location' }] },
    { title: 'Groceries nearby', path: ['Places', 'Food', 'Lakeview Market'], kinds: ['folder', 'place'], turns: [{ ask: 'i do my groceries at Lakeview Market, it is two blocks away.', fact: 'i do my groceries at Lakeview Market, two blocks from home.', key: 'note', answer: 'Handy. Their bulk aisle helps with the budget too.' }] },
    { title: 'Farmers market', path: ['Places', 'Food', 'Farmers market'], kinds: ['folder', 'place'], turns: [{ ask: 'the farmers market on the Square is Saturday mornings and i go after my long run.', fact: 'i go to the farmers market on the Square on Saturday mornings after my long run.', key: 'note', answer: 'Get there before 10 for the good bread.' }] },
    { title: 'Climbing gym', path: ['Places', 'Granite Loft'], kinds: ['place'], turns: [{ ask: 'i boulder at Granite Loft on Monday nights with Caleb.', fact: 'i boulder at Granite Loft on Monday nights with Caleb.', key: 'note', specific: 'Monday nights', answer: 'Fun. Go easy on the knee for now.' }] },
    { title: 'Lease renewal', path: ['Home', 'Lease'], kinds: ['other'], turns: [{ ask: `my lease ends ${say(lease)} and i have to tell them by March 1 if i'm staying.`, fact: `my lease ends ${say(lease)}.`, key: 'ends', specific: say(lease), answer: 'Noted. I will remind you about the March 1 notice.' }] },
    { title: 'Landlord contact', path: ['Home', 'Landlord'], kinds: ['person'], turns: [{ ask: 'my landlord is Greg Ashby and repairs go through the tenant portal.', fact: 'my landlord is Greg Ashby and repairs go through the tenant portal.', key: 'contact', answer: 'Good to know. Photos help repair requests move faster.' }] },
    { title: 'Keeping plants alive', path: ['Home', 'Plants'], kinds: ['topic'], turns: [{ ask: 'i have a pothos and a snake plant. i water them on Sundays.', fact: 'i water my pothos and snake plant on Sundays.', key: 'care', answer: 'The snake plant can go two weeks. The pothos likes it weekly.' }] },
    { title: 'Chores with Caleb', path: ['Home', 'Chores'], kinds: ['topic'], turns: [{ ask: 'Caleb does dishes and i do trash and recycling, it goes out Wednesday night.', fact: 'i take out the trash and recycling on Wednesday nights, and Caleb does dishes.', key: 'split', answer: 'Clear split. Easy to keep.' }] },
    { title: 'Learning guitar', path: ['Hobbies', 'Guitar'], kinds: ['topic'], turns: [{ ask: "i'm learning fingerstyle guitar, 20 minutes a day.", fact: "i'm learning fingerstyle guitar, 20 minutes a day.", key: 'practice', specific: '20 minutes a day', answer: 'Start with Travis picking. Here is a simple pattern.' }] },
    { title: 'Film photography', path: ['Hobbies', 'Film photography'], kinds: ['topic'], turns: [{ ask: "i shoot film on my dad's old camera, mostly Portra 400.", fact: "i shoot film on my dad's old camera, mostly Portra 400.", key: 'note', answer: 'Portra is forgiving. Overexpose a stop in shade.' }] },
    { title: 'Book club picks', path: ['Hobbies', 'Book club'], kinds: ['group'], turns: [{ ask: `my book club meets the first Thursday of every month. next one is ${say(club)}.`, fact: `my book club meets the first Thursday of every month.`, key: 'schedule', answer: 'Want a reading plan so you finish in time?' }] },
    { title: 'A new recipe each week', path: ['Hobbies', 'Cooking'], kinds: ['topic'], turns: [{ ask: "i'm trying one new vegetarian recipe a week.", fact: "i'm trying one new vegetarian recipe a week.", key: 'goal', kind: 'goal', answer: 'Fun. This week try a peanut free pad see ew.' }] },
  ]
}

const rngLife = Rng.derive(7, 'extraction-life')
for (const life of lifeChats(rngLife)) {
  const at0 = NOW - rngLife.int(2, 100) * 86_400_000 + rngLife.int(9 * 60, 21 * 60) * 60_000
  const messages: Msg[] = []
  const facts: Piece['facts'] = []
  life.turns.forEach((t, i) => {
    const at = new Date(at0 + i * 120_000).toISOString()
    messages.push({ role: 'user', text: t.ask, createdAt: at }, { role: 'assistant', text: t.answer, createdAt: new Date(at0 + i * 120_000 + 60_000).toISOString() })
    const said = t.fact
    const f: Planted = {
      id: `life_${life.path.join('_').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${i}`,
      family: 'life',
      path: life.path,
      subject: life.path.at(-1)!,
      key: t.key,
      kind: t.kind ?? 'attribute',
      specifics: t.specific ? [{ type: 'text', text: t.specific }] : [],
      ref: '',
      span: [0, 0],
      role: 'user',
      at,
      basis: 'user_stated',
      importance: [3, t.due || t.start ? 5 : 3],
      sensitivity: t.sensitivity ?? 'none',
      status: 'active',
      ...(t.due ? { due: { at: t.due }, progress: 'needs-action' } : {}),
      ...(t.start ? { start: { at: t.start } } : {}),
      ...(t.key === 'status' ? { progress: 'completed' } : {}),
    }
    facts.push({ f, line: i * 2, said })
  })
  pieces.push({ at: messages[0]!.createdAt!, group: life.path.slice(0, 2).join('/'), messages, facts, title: life.title })
}
const lifeKinds = new Map<string, string>()
for (const life of lifeChats(Rng.derive(7, 'extraction-life'))) life.path.slice(1).forEach((_, i) => lifeKinds.set(life.path.slice(0, i + 2).join('/'), life.kinds[i]!))

// ---- Turns into chats: neighbours on one subject share a chat, until the library has its size. ----

const need = PLATFORMS.reduce((n, p) => n + TARGET[p] - base.filter((c) => c.platform === p).length, 0)
pieces.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
let chats: Piece[][] = pieces.map((p) => [p])
if (chats.length < need) throw new Error(`only ${chats.length} turns for ${need} chats`)
{
  // The closest two chats on one subject join first, up to four turns a chat; life chats stay as they are.
  const last = (c: Piece[]) => Date.parse(c.at(-1)!.messages.at(-1)!.createdAt!)
  while (chats.length > need) {
    let best: [number, number] | null = null
    let gap = Infinity
    const lastOf = new Map<string, number>()
    for (let i = 0; i < chats.length; i++) {
      const c = chats[i]!
      if (c[0]!.title) continue
      const j = lastOf.get(c[0]!.group)
      if (j !== undefined && chats[j]!.length + c.length <= 4) {
        const g = Date.parse(c[0]!.at) - last(chats[j]!)
        if (g < gap) [gap, best] = [g, [j, i]]
      }
      lastOf.set(c[0]!.group, i)
    }
    if (!best) throw new Error('no two chats left to join')
    const [into, from] = best
    chats[into]!.push(...chats[from]!)
    chats = chats.filter((_, k) => k !== from)
  }
}

/** A title as an AI gives one, from what the chat is about. */
const taken = new Set([...base, ...later].map((c) => c.title))
function titleFor(chat: Piece[]): string {
  const named = chat[0]!.title
  const facts = chat.flatMap((p) => p.facts.map((x) => x.f))
  const things = [...new Set(facts.map((f) => f.path.join('/')))]
  const f = facts[0]!
  const [section, second] = f.path
  const short = (s: string) => s.replace(/^(Reading|Problem Set|Lab|Project|Weekly Report)/, (k) => k.toLowerCase())
  const options: string[] = []
  if (named) options.push(named)
  else if (section === 'School') {
    if (things.length === 1) {
      const thing = f.path[2]!
      const keys = new Set(facts.map((x) => x.key))
      if (facts.some((x) => x.family.startsWith('moved'))) options.push(`${second} ${short(thing)} moved`, `New date for ${second} ${short(thing)}`)
      if (keys.has('status') && keys.size === 1) options.push(`Handing in ${second} ${short(thing)}`, `${second} ${short(thing)} done`)
      if (keys.has('grade_weight')) options.push(`How much ${second} ${short(thing)} counts`, `${second} ${short(thing)} grading`)
      options.push(`${second} ${short(thing)}`, `${second} ${short(thing)} due date`, `Planning ${second} ${short(thing)}`)
    } else {
      const week = Math.max(1, Math.ceil((Date.parse(chat[0]!.at) - Date.parse('2026-06-29')) / (7 * 86_400_000)))
      options.push(`${second} week ${week}`, `${second} deadlines, week ${week}`, `${second} this week`, `${second} due dates`, `${second} catch up`, `${second} week ${week} plan`)
    }
  } else if (section === 'Work') {
    const thing = f.path[2]
    if (things.length === 1 && thing) {
      if (facts.some((x) => x.family.startsWith('moved'))) options.push(`${short(thing)} moved`)
      if (facts.every((x) => x.key === 'status')) options.push(`Sending ${short(thing)}`)
      options.push(`Kestrel ${short(thing)}`, `${thing[0]}${short(thing).slice(1)}`)
    } else options.push('Kestrel reports this month', 'Kestrel report deadlines', 'Reports for Nadia')
  } else if (section === 'Information') {
    const keys = new Set(facts.map((x) => x.key))
    const named = [...new Set(facts.map((x) => x.path[1]!))]
    if (named.length === 2) options.push(`${named[0]} and ${named[1]} settings`, `Comparing ${named[0]} and ${named[1]}`)
    if (named.length > 2) options.push(`${named[0]}, ${named[1]} and ${named[2]}`, `Config questions for work`, `Tool settings at Kestrel`, `Defaults for ${named[0]} and others`)
    if (keys.size === 1 && named.length === 1) options.push(`${second} ${{ port: 'default port', log_retention: 'log retention', rate_limit: 'rate limit' }[f.key] ?? 'settings'}`)
    options.push(`${second} config questions`, `Setting up ${second}`, `${second} at Kestrel`, `${second} defaults`)
  } else if (section === 'Plans and deadlines') {
    const [kind, , who] = (second ?? '').split(' ')
    const first = (second ?? '').replace(/^(\w+) with (\w+).*$/, '$1 with $2')
    const lower = `${first[0]!.toLowerCase()}${first.slice(1)}`
    if (facts.some((x) => x.progress === 'cancelled')) options.push(`Cancelling ${lower}`, `Calling off ${kind?.toLowerCase()} with ${who ?? ''}`.trim())
    if (facts.some((x) => x.family.startsWith('mealMoved'))) options.push(`Moving ${lower}`)
    options.push(first, `${first} plans`, `${first} again`)
  } else options.push(second ?? section ?? 'Notes')
  for (const o of options) if (!taken.has(o)) return taken.add(o), o
  for (let n = 2; ; n++) if (!taken.has(`${options[0]} ${n}`)) return taken.add(`${options[0]} ${n}`), `${options[0]} ${n}`
}

/** Which AI each chat was on: as many on each as the target asks, spread over the term. */
const rngPlat = Rng.derive(7, 'extraction-platforms')
const slots = rngPlat.shuffle(PLATFORMS.flatMap((p) => Array.from({ length: TARGET[p] - base.filter((c) => c.platform === p).length }, () => p)))
const rngId = Rng.derive(7, 'extraction-ids')
const usedIds = new Set([...base, ...later, changed].map((c) => c.id))
function newId(platform: Platform): string {
  for (;;) {
    const h = rngId.hex(32)
    const id = platform === 'gemini' ? h.slice(0, 16) : `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
    if (/^[1-9a-f]/.test(id) && !usedIds.has(id)) return usedIds.add(id), id
  }
}

type Source = { f: Planted; chat: string; msg: number; said: string }
const extraSources: Source[] = []
const extra: Slim[] = chats.map((chat, i) => {
  const platform = slots[i]!
  const id = newId(platform)
  const messages: Slim['messages'] = []
  for (const p of chat) {
    for (const x of p.facts) extraSources.push({ f: x.f, chat: `${platform}:${id}`, msg: messages.length + x.line + 1, said: x.said })
    for (const m of p.messages) messages.push({ role: m.role, text: m.text, at: m.createdAt ?? null })
  }
  return { platform, id, title: titleFor(chat), createdAt: messages[0]!.at!, updatedAt: messages.at(-1)!.at!, messages }
})

const install = [...base, ...extra].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))

// ---- Memory: the story's facts, then the term's, filed in one tree. ----

const chatsById = new Map([...install, ...later].map((c) => [`${c.platform}:${c.id}`, c]))
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
    .replace(/\bCaleb and you\b/g, 'You and Caleb')
    .replace(/, keep that in mind for recipes\.?$/, '.')
    .replace(/, so plan around that\.?$/, '.')
  t = t[0]!.toUpperCase() + t.slice(1)
  return /[.!?]$/.test(t) ? t : `${t}.`
}

/** "Aug 18" as a day in the year of `near`. */
function isoDay(text: string, near: string): string {
  const [mon, d] = text.split(' ') as [string, string]
  return `${near.slice(0, 4)}-${String(MONTHS.indexOf(mon) + 1).padStart(2, '0')}-${d.padStart(2, '0')}`
}

const allPlanted = [...truth.facts, ...extraSources.map((s) => s.f)]
const changes = [...truth.changes, ...medium.truth.changes.map((c) => ({ ...c, older: `m${c.older}`, newer: `m${c.newer}` }))]
const replaced = new Map(changes.filter((c) => c.kind === 'superseded').map((c) => [c.older, c]))
const ended = new Set(changes.filter((c) => c.kind !== 'superseded').map((c) => c.older))
const sourceOf = new Map<string, { chat: string; msg: number; said: string }>()
for (const f of truth.facts) {
  const [ref, n] = f.ref.split('#m') as [string, string]
  const [platform, id] = ref.split(':') as [string, string]
  const conv = `${platform}:${idOf(id)}`
  const said = chatsById.get(conv)?.messages[Number(n) - 1]?.text.slice(f.span[0], f.span[1])
  if (said) sourceOf.set(f.id, { chat: conv, msg: Number(n), said })
}
for (const s of extraSources) sourceOf.set(s.f.id, s)

const facts: Fact[] = []
for (const f of allPlanted) {
  const src = sourceOf.get(f.id)
  if (!src) continue
  const chat = chatsById.get(src.chat)!
  let text = memoryText(src.said)
  // Two deadlines said in one line are two memories, each said on its own.
  if (/^multi\./.test(f.family)) text = `${f.subject} for ${f.path[1]} is due ${f.specifics[0]?.text ?? ''}.`.replace(/ \.$/, '.')
  let due = f.due?.at ?? null
  // The lab chat's deadline is the one the film follows: what the chat says first, which her update moves.
  if (f.path.join('/') === 'School/DATA 100/Lab 1' && f.key === 'due') {
    text = `Lab 1 for DATA 100 is due ${FROM}.`
    due = isoDay(FROM, chat.createdAt)
  }
  if (f.path.join('/') === 'School/DATA 100/Lab 1' && f.key === 'status') text = 'Lab 1 for DATA 100 was submitted.'
  const owner = f.path.length === 1 ? sectionId(f.path[0]!) : thingId(f.path)
  const newer = replaced.get(f.id)
  const keep = newer ? sourceOf.has(newer.newer) : true
  const after = newer && allPlanted.find((x) => x.id === newer.newer)
  const sources = [{ chat: src.chat, msg: src.msg, role: f.role, at: chat.messages[src.msg - 1]?.at ?? f.at }]
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
    sources,
  })
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

// The tree: every folder and thing a kept memory is filed under, with its kind.
const kindOf = new Map<string, string>()
for (const t of [...medium.truth.tree, ...truth.tree]) kindOf.set(t.path.join('/'), t.kind)
for (const [path, kind] of lifeKinds) kindOf.set(path, kind)
const paths = new Map<string, string[]>()
for (const f of allPlanted) if (sourceOf.has(f.id)) for (let n = 2; n <= f.path.length; n++) paths.set(f.path.slice(0, n).join('/'), f.path.slice(0, n))
const things = [...paths.values()].map((path) => ({ id: thingId(path), kind: kindOf.get(path.join('/')) ?? (path.length === 3 ? 'task' : 'topic'), label: path.at(-1)!, section: sectionId(path[0]!), parent: path.length > 2 ? thingId(path.slice(0, -1)) : null }))
const sections = [...new Set(allPlanted.filter((f) => sourceOf.has(f.id)).map((f) => f.path[0]!))].map((name) => ({ id: sectionId(name), label: name }))

const memory = { zone: truth.zone, sections, things, facts, moved, lab: lab.id }

const out = { now: Date.now(), changingTitle: data.CHANGING_TITLE, movedLine: data.MOVED_LINE, install, later, changed, memory }
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), 'data.json'), JSON.stringify(out) + '\n')
const by = (list: { platform: string }[]) => Object.entries(list.reduce<Record<string, number>>((n, c) => ((n[c.platform] = (n[c.platform] ?? 0) + 1), n), {}))
console.log('install', install.length, by(install), 'later', later.map((c) => `${c.platform}:${c.title}`), 'changed', changed.title, changed.platform)
console.log('memory', sections.length, 'sections', things.length, 'things', facts.length, 'facts', facts.filter((f) => f.status === 'active').length, 'active')
