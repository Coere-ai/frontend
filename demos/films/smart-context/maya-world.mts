/**
 * Maya Collins's world, as her memory holds it after a year of chats:
 * 324 chats (ChatGPT 148, Claude 102, Gemini 74) and the memories they
 * taught. It is the same person the films show: the Smart context film's
 * interview, Tidepool and SkipDoodle, and the Cori chat film's CS 162
 * project and the people she writes to.
 *
 * Her memory is filed the way a real library leans (the owner's graph
 * brief, coere-v2 packages/ui/src/gallery/sample-graph.ts): about a dozen
 * sections, each with two to four folders, and each folder a tidy handful
 * of memories. A folder is one place in her memory: a course, a project, a
 * person, or a folder of her own notes (Events, Budget, Emails). Her
 * courses hold their deadlines, grades and notes, not numbered work; her
 * job holds its people and studies. A few small things sit loose on a
 * section, and some of her memories sit on a section itself, as a real
 * memory keeps them.
 *
 * Seeded and deterministic: the same seed gives the same world. The lines
 * the films show are written as the films say them, in the chats the films
 * name, and the chats behind them are fixed, so every "From N chats" the
 * strip shows stays as it was. Nothing here imports coere-v2;
 * maya-memory.mts writes it into a real memory store.
 *
 * Every name is made up.
 */

export type Platform = 'chatgpt' | 'claude' | 'gemini'
export type FactKind = 'attribute' | 'preference' | 'style' | 'goal' | 'task' | 'event' | 'decision' | 'constraint' | 'instruction' | 'note'
export type ThingKind = 'person' | 'organization' | 'group' | 'project' | 'course' | 'task' | 'event' | 'place' | 'product' | 'document' | 'topic' | 'other'
export type Sensitivity = 'health' | 'finance' | 'identity' | 'location' | 'relationships' | 'other'

/** A thing in her world: under a section's folders, or under another thing. */
export interface Thing {
  key: string
  name: string
  kind: ThingKind
  /** The catalog top level, as `sec_<section>`. */
  section: string
  /** Folder names under the section, top first; empty when `parent` is set. */
  folders: string[]
  parent?: string
  importance: number
  aliases?: string[]
}

/** A typed value a fact carries, as the store keeps it. */
export type Value = { type: 'email'; email: string } | { type: 'phone'; phone: string }

/** One memory: one claim about one subject, said in one or more chats. */
export interface Fact {
  key: string
  /** A thing's key, or `self`. */
  subject: string
  /** A thing's key, or `folder:<section>/<Folder>/<Sub>` for a memory about her filed in a folder. */
  under: string
  kind: FactKind
  /** The store's key for the claim, unique per subject. */
  claim: string
  text: string
  importance: number
  /** The chats that said it, first one first. */
  chats: string[]
  due?: string
  sensitivity?: Sensitivity
  value?: Value
  specific?: { type: 'email' | 'phone' | 'date'; text: string }
  /** One of the lines her About me is made from. */
  core?: boolean
}

export interface Chat {
  key: string
  platform: Platform
  title: string
  /** When she started it, ISO. */
  at: string
  /** The facts it taught, in the order she said them. */
  says: string[]
}

export interface World {
  things: Thing[]
  facts: Fact[]
  chats: Chat[]
  /** The ChatGPT chats in her sidebar, newest first, as the film's pages list them. */
  sidebar: string[]
}

/** How many chats each AI holds: the split every film uses. */
export const SPLIT: Record<Platform, number> = { chatgpt: 148, claude: 102, gemini: 74 }
export const TOTAL = SPLIT.chatgpt + SPLIT.claude + SPLIT.gemini

/** mulberry32: a small seeded random source. */
function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** "2026-10-14" from a day of 2026 counted from Jan 1 (0). */
const iso = (dayOfYear: number, year = 2026): string => new Date(Date.UTC(year, 0, 1 + dayOfYear)).toISOString().slice(0, 10)
/** A name inside a sentence or a title: its first word lowered when that word is a plain one ("Lunch with Lena Delacroix", "the clinic wait times study"); a name stays as it is. */
const PROPER = new Set(['Japanese', 'Tuesday', 'Women', 'Bay', 'Portuguese', 'Spring', 'Iris', 'Lena', 'Dana', 'Alex', 'Elena'])
const lower = (s: string): string => {
  const first = s.split(' ')[0]!
  return /^[A-Z][a-z]+$/.test(first) && !PROPER.has(first) ? s[0]!.toLowerCase() + s.slice(1) : s
}
const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40)

type Say = {
  s: string
  text: string
  under?: string
  kind?: FactKind
  imp?: number
  due?: string
  sens?: Sensitivity
  value?: Value
  specific?: Fact['specific']
  core?: boolean
  claim?: string
}

class Builder {
  readonly rand: () => number
  readonly things = new Map<string, Thing>()
  readonly facts = new Map<string, Fact>()
  readonly chats: Chat[] = []
  private n = 0
  constructor(seed: number) {
    this.rand = seeded(seed)
  }
  pick<T>(list: readonly T[]): T {
    return list[Math.floor(this.rand() * list.length)]!
  }
  int(lo: number, hi: number): number {
    return lo + Math.floor(this.rand() * (hi - lo + 1))
  }
  shuffle<T>(list: readonly T[]): T[] {
    const out = [...list]
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.rand() * (i + 1))
      ;[out[i], out[j]] = [out[j]!, out[i]!]
    }
    return out
  }
  thing(key: string, name: string, kind: ThingKind, where: string | { parent: string }, importance = 3, aliases?: string[]): string {
    if (this.things.has(key)) throw new Error(`thing ${key} twice`)
    if (typeof where === 'string') {
      const [section, ...folders] = where.split('/')
      this.things.set(key, { key, name, kind, section: `sec_${section}`, folders, importance, ...(aliases ? { aliases } : {}) })
    } else {
      const up = this.things.get(where.parent)
      if (!up) throw new Error(`no parent ${where.parent} for ${key}`)
      this.things.set(key, { key, name, kind, section: up.section, folders: [], parent: where.parent, importance, ...(aliases ? { aliases } : {}) })
    }
    return key
  }
  /** A chat on a day (or an ISO time), with what it taught. A fact said again in a later chat gains that chat. */
  chat(title: string, when: string, says: Say[], platform?: Platform, key?: string): Chat {
    const at = when.length === 10 ? `${when}T${String(this.int(15, 27) % 24).padStart(2, '0')}:${String(this.int(0, 59)).padStart(2, '0')}:00Z` : when
    const chat: Chat = { key: key ?? `c${String(++this.n).padStart(3, '0')}`, platform: (platform ?? '') as Platform, title, at, says: [] }
    for (const say of says) {
      const id = `${say.s}|${say.text}`
      let fact = this.facts.get(id)
      if (!fact) {
        if (say.s !== 'self' && !this.things.has(say.s)) throw new Error(`no thing ${say.s}`)
        const under = say.under ?? (say.s === 'self' ? 'folder:personal' : say.s)
        fact = {
          key: `f${this.facts.size + 1}`,
          subject: say.s,
          under,
          kind: say.kind ?? (say.due ? 'task' : 'attribute'),
          claim: say.claim ?? slug(say.text),
          text: say.text,
          importance: say.imp ?? 3,
          chats: [],
          ...(say.due ? { due: say.due } : {}),
          ...(say.sens ? { sensitivity: say.sens } : {}),
          ...(say.value ? { value: say.value } : {}),
          ...(say.specific ? { specific: say.specific } : {}),
          ...(say.core ? { core: true } : {}),
        }
        this.facts.set(id, fact)
      }
      if (!fact.chats.includes(chat.key)) fact.chats.push(chat.key)
      chat.says.push(fact.key)
    }
    this.chats.push(chat)
    return chat
  }
}

const say = (s: string, text: string, o: Omit<Say, 's' | 'text'> = {}): Say => ({ s, text, ...o })
/** A memory about her, filed in a folder of a section. */
const mine = (folder: string, text: string, o: Omit<Say, 's' | 'text' | 'under'> = {}): Say => ({ s: 'self', text, under: `folder:${folder}`, ...o })

/** A memory about her, filed on one of her things (a course, a project, a person). */
const on = (thing: string, text: string, o: Omit<Say, 's' | 'text' | 'under'> = {}): Say => ({ s: 'self', text, under: thing, ...o })

/** One line of a chat: a memory's words for the place the chat is about, with its options, or a memory said elsewhere. */
type Line = string | [string, Omit<Say, 's' | 'text' | 'under'>] | Say
/** A chat: its title, its lines, and the day it was had or a span of days to pick from, and its AI when the film names it. */
type Talk = [title: string, lines: Line[], when?: string | [number, number], platform?: Platform]

/**
 * Chats about one place in her memory. `at` is a thing's key (its own
 * memories) or `folder:<section>/<Folder>` (hers, filed there), or
 * `self@<thing>` for hers filed on a thing.
 */
function place(w: Builder, at: string, talks: Talk[], days: [number, number] = [10, 299]): void {
  const lineOf = (l: Line): Say => {
    if (typeof l === 'object' && !Array.isArray(l)) return l
    const [text, o] = typeof l === 'string' ? [l, {}] : l
    if (at.startsWith('folder:')) return mine(at.slice('folder:'.length), text, o)
    if (at.startsWith('self@')) return on(at.slice('self@'.length), text, o)
    return say(at, text, o)
  }
  for (const [title, lines, when, platform] of talks) {
    const span = Array.isArray(when) ? when : days
    const day = typeof when === 'string' ? when : iso(w.int(span[0], span[1]))
    w.chat(title, day, lines.map(lineOf), platform)
  }
}

// ---------------------------------------------------------------- the films' own lines

/**
 * What the Smart context film shows and the Cori chat film asks about,
 * said in the chats the films name. The chats behind the strip's memories
 * are fixed here, with their AIs, so the strip's counts never move: the
 * interview from six chats, Tidepool from nine, the launch talk from two,
 * the Stripe application from three and who she is from fifteen.
 */
function filmed(w: Builder): void {
  w.thing('tidepool', 'Tidepool', 'project', 'projects', 5)
  w.thing('launch', 'Tidepool launch day talk', 'event', { parent: 'tidepool' }, 4)
  w.thing('skipdoodle', 'SkipDoodle', 'project', 'projects', 4)
  w.thing('sparrowhawk', 'Sparrowhawk', 'project', 'projects', 4)
  w.thing('kitchen', 'Kitchen remodel', 'project', 'projects', 2)
  w.thing('kestrel', 'Kestrel Analytics', 'organization', 'work', 5, ['Kestrel'])
  w.thing('pearx', 'PearX interview', 'event', 'work/Interviews', 5)
  w.thing('stripe', 'Stripe application', 'task', 'work/Job applications', 4)
  w.thing('notion', 'Notion PM role', 'task', 'work/Job applications', 3)
  w.thing('berkeley', 'UC Berkeley', 'organization', 'school', 3, ['Cal'])
  w.thing('cs162', 'CS 162', 'course', 'school', 5)
  w.thing('cs162_p3', 'CS 162 project 3', 'project', { parent: 'cs162' }, 4)
  w.thing('harbor', 'Harbor Clinic', 'organization', 'health', 2)

  const pearx = {
    when: say('pearx', 'The PearX interview is on November 4 at 2 pm over video.', { kind: 'event', imp: 5, due: '2026-11-04' }),
    whyNow: say('pearx', 'I want my PearX interview answer on why now to mention the records move.', { kind: 'goal', imp: 4 }),
    traction: say('pearx', 'My PearX interview answer on traction should lead with the 1,200 weekly users.', { kind: 'goal', imp: 4 }),
    cover: say('pearx', 'They told me the PearX interview will cover traction, the team and why now.', { imp: 4 }),
    round: say('pearx', 'The PearX interview is the partner round with two partners.', { imp: 3 }),
    forTidepool: say('pearx', 'My PearX interview is for Tidepool, my startup.', { imp: 4 }),
  }
  const tide = {
    users: say('tidepool', 'Tidepool has 1,200 weekly users across four clinics.', { imp: 5 }),
    what: say('tidepool', 'Tidepool books patients for small clinics without phone calls.', { imp: 5, core: true }),
    team: say('tidepool', 'The Tidepool team is me and my cofounder Iris Sato, who writes the code.', { imp: 4 }),
    money: say('tidepool', 'Tidepool is in a paid pilot and raised a 150,000 dollar pre seed.', { imp: 4 }),
  }
  w.chat('Tidepool pilot numbers', '2026-08-30', [tide.users, tide.what, tide.team, tide.money], 'gemini')
  w.chat('PearX partner interview', '2026-10-09', [pearx.when, pearx.cover, pearx.round, pearx.forTidepool], 'claude')
  w.chat('PearX interview prep', '2026-10-19T16:20:00Z', [pearx.traction, pearx.whyNow, tide.users], 'chatgpt', 'k-pearx-prep')
  w.chat('Practice questions for PearX', '2026-10-22', [pearx.traction, say('pearx', 'I practice my PearX answers with Iris on Sunday nights.', { imp: 3 })], 'chatgpt')
  w.chat('Why now story', '2026-10-24', [pearx.whyNow, say('pearx', 'The why now story is that clinics moved their records online in the last two years.', { imp: 3 })], 'claude')
  w.chat('PearX application', '2026-09-20', [say('pearx', 'I applied to PearX for the winter batch in September.', { imp: 3 }), pearx.forTidepool], 'gemini')
  w.chat('Following up on PearX interview', '2026-10-26', [pearx.forTidepool], 'gemini')
  w.chat('Tidepool one line pitch', '2026-07-02', [tide.what, say('tidepool', 'The one line pitch is online booking for small clinics that still run on the phone.', { imp: 3 })], 'claude')
  w.chat('Cofounder agreement', '2026-03-12', [tide.team, on('tidepool', 'Iris Sato and I split Tidepool equity evenly.', { imp: 3 })], 'chatgpt')
  w.chat('Notes on Tidepool', '2026-10-11', [tide.team], 'claude')
  w.chat('Pre seed round notes', '2026-06-08', [tide.money, say('tidepool', 'Hearth Ventures led the Tidepool pre seed, with two angels.', { imp: 3 })], 'gemini')
  w.chat('More on Tidepool', '2026-09-14', [tide.money], 'chatgpt')
  w.chat('Tidepool metrics for October', '2026-10-03', [tide.users, say('tidepool', 'Tidepool grows about 15 percent a month.', { imp: 4 })], 'chatgpt')
  w.chat('Investor update October', '2026-10-06', [tide.users, say('tidepool', 'The October investor update leads with the 15 percent growth.', { imp: 3 })], 'claude')

  const launch = [
    say('launch', 'Keep the Tidepool launch day talk under three minutes and end on the ask.', { kind: 'instruction', imp: 4 }),
    say('launch', 'The Tidepool launch day talk is for Tidepool investors on December 2.', { kind: 'event', imp: 4, due: '2026-12-02' }),
  ]
  w.chat('Tidepool launch day talk', '2026-09-29', launch, 'claude')
  w.chat('Launch talk outline', '2026-10-15', [launch[0]!, say('launch', 'The launch talk opens with a clinic front desk story.', { imp: 3 })], 'claude')

  const stripe = say('stripe', 'I applied to Stripe for the data analyst role.', { imp: 4 })
  w.chat('Applying to Stripe', '2026-09-10', [stripe, say('stripe', 'The Stripe role is on the payments analytics team.', { imp: 3 })], 'chatgpt')
  w.chat('Stripe data analyst role', '2026-09-12', [stripe, say('stripe', 'Stripe said I would hear back about the data analyst role in three weeks.', { imp: 2 })], 'claude')
  w.chat('Notion PM role', '2026-10-27', [
    say('notion', 'The Notion PM role closes on November 15.', { imp: 4, due: '2026-11-15' }),
    say('notion', 'Elena Lindqvist offered to refer me for the Notion PM role.', { imp: 3 }),
  ], 'chatgpt')

  const skip = [
    say('skipdoodle', 'SkipDoodle is my weekend project, a drawing game for kids.', { imp: 4, core: true }),
    say('skipdoodle', 'SkipDoodle is built with React Native and Expo, and Supabase stores the drawings.', { imp: 4 }),
  ]
  w.chat('SkipDoodle setup', '2026-08-20', skip, 'chatgpt')
  w.chat('SkipDoodle database choice', '2026-08-24', [skip[1]!, say('skipdoodle', 'SkipDoodle keeps each drawing as a small JSON file of strokes.', { imp: 2 })], 'chatgpt')

  // Who she is, said in the chats over the year: the lines her About me is made from.
  const job = mine('work', 'I work at Kestrel Analytics as a lead research assistant.', { imp: 5, core: true, claim: 'job_title' })
  const name = mine('personal', 'My name is Maya Collins.', { imp: 5, core: true, claim: 'name' })
  const style = mine('style', 'When I write, I use short warm sentences and never use exclamation marks.', { kind: 'style', imp: 5, core: true })
  const major = on('berkeley', 'I am a third year data science major at UC Berkeley.', { imp: 5, core: true })
  const term = say('berkeley', "I'm taking DATA 100, MATH 54, PHYS 137 and CS 162 this term.", { imp: 4 })
  const sparrow = say('sparrowhawk', 'Sparrowhawk is the volunteer app for the East Bay bird rescue.', { imp: 4, core: true })
  w.chat('Kestrel first week', '2026-01-12', [job, say('kestrel', 'Kestrel Analytics does research studies for health and city clients.', { imp: 4 })], 'claude')
  w.chat('Rewrite my LinkedIn summary', '2026-02-03', [job, name, style], 'chatgpt')
  w.chat('Cover letter for Stripe', '2026-09-09', [name, job, stripe], 'claude')
  w.chat('Edit this email to Nadia', '2026-05-14', [style, say('kestrel', 'Kestrel Analytics has about forty people in its Oakland office.', { imp: 2 })], 'gemini')
  w.chat('Make this sound like me', '2026-07-21', [style, mine('style/Emails', 'I sign my emails with Thanks, then my first name.', { kind: 'style', imp: 3 })], 'claude')
  w.chat('Classes this term', '2026-08-25', [term, major], 'chatgpt')
  w.chat('Fall schedule check', '2026-08-18', [term, mine('school', 'I keep Friday afternoons free for Tidepool.', { imp: 3 })], 'gemini')
  w.chat('Data science major requirements', '2026-04-02', [major, mine('school', 'I still need one domain emphasis course for the data science major.', { imp: 3 })], 'gemini')
  w.chat('Working on Tidepool tonight', '2026-09-30', [on('tidepool', 'I spend most evenings on Tidepool.', { imp: 4, core: true })], 'claude')
  w.chat('Working on SkipDoodle', '2026-09-27', [on('skipdoodle', 'I work on SkipDoodle on weekends.', { imp: 3, core: true })], 'gemini')
  w.chat('Sparrowhawk database upgrade', '2026-09-18', [say('sparrowhawk', 'Sparrowhawk runs on Postgres 16 after the upgrade.', { imp: 3 }), sparrow], 'chatgpt')
  w.chat('Back to Sparrowhawk', '2026-10-21', [sparrow], 'claude')

  // The Cori chat film: the people she writes to, the course's due date and the clinic's form (coere-v2 tools/gen-fake-memory/maya).
  w.thing('priya_raman', 'Priya Raman', 'person', 'people', 4)
  w.thing('sam_lee', 'Sam Lee', 'person', 'people', 2)
  w.thing('reyes', 'Daniel Reyes', 'person', 'people', 2, ['Professor Reyes', 'Prof. Reyes'])
  w.thing('jordan', 'Jordan Ellis', 'person', 'people', 2)
  w.thing('alex_kim', 'Alex Kim', 'person', 'people', 2)
  w.thing('nora', 'Nora Patel', 'person', { parent: 'harbor' }, 2)
  const email = (s: string, who: string, address: string) =>
    say(s, `${who}'s email is ${address}.`, { claim: 'email', value: { type: 'email', email: address }, specific: { type: 'email', text: address } })
  w.chat('People I email', '2026-10-12T16:00:00Z', [
    say('sam_lee', 'Sam Lee is my lab partner in CS 162.', { imp: 3 }),
    email('sam_lee', 'Sam Lee', 'sam.lee@northfield.edu'),
    say('priya_raman', 'Priya Raman is in my CS 162 study group.', { imp: 3 }),
    email('priya_raman', 'Priya Raman', 'priya.raman@northfield.edu'),
    say('jordan', 'Jordan Ellis designs the Tidepool logo.', { imp: 3 }),
    email('jordan', 'Jordan Ellis', 'jordan@ellisstudio.co'),
    say('reyes', 'Professor Daniel Reyes teaches CS 162.', { imp: 4 }),
    email('reyes', 'Daniel Reyes', 'dreyes@northfield.edu'),
    say('alex_kim', 'Alex Kim is a friend from home.', { imp: 3 }),
    email('alex_kim', 'Alex Kim', 'alex.kim@gmail.com'),
    say('nora', 'Nora Patel is my nurse at Harbor Clinic.', { imp: 3 }),
    email('nora', 'Nora Patel', 'nora.patel@harborclinic.org'),
  ], 'chatgpt', 'maya-people')
  w.chat('Clinic paperwork', '2026-10-16T18:00:00Z', [
    mine('personal', 'My email is maya.collins@gmail.com.', { claim: 'email', value: { type: 'email', email: 'maya.collins@gmail.com' }, specific: { type: 'email', text: 'maya.collins@gmail.com' } }),
    mine('personal', 'My cell is (510) 555-0142.', { claim: 'phone', value: { type: 'phone', phone: '(510) 555-0142' }, specific: { type: 'phone', text: '(510) 555-0142' } }),
    mine('personal', 'My date of birth is 2005-03-14.', { claim: 'birth_date' }),
    mine('personal', 'My street address is 2412 Durant Ave, Apt 3, Berkeley, California 94704.', { claim: 'street_address', sens: 'location' }),
  ], 'claude', 'maya-clinic')
  w.chat('CS 162 deadlines', '2026-10-14T18:00:00Z', [
    say('cs162_p3', 'CS 162 project 3 is due November 13.', { kind: 'task', imp: 4, due: '2026-11-13', specific: { type: 'date', text: 'November 13' } }),
    mine('personal', 'I live in Berkeley.', { imp: 4, claim: 'city', core: true }),
  ], 'claude', 'maya-school')
}

// ---------------------------------------------------------------- school: four courses, and what sits loose

function school(w: Builder): void {
  w.thing('math54', 'MATH 54', 'course', 'school', 4)
  w.thing('phys137', 'PHYS 137', 'course', 'school', 4)
  w.thing('data100', 'DATA 100', 'course', 'school', 4)
  w.thing('history', 'History reading list', 'topic', 'school', 2)

  place(w, 'cs162', [
    ['CS 162 this term', ['CS 162 meets Monday and Wednesday at 4.', 'CS 162 office hours are Tuesday at 3 in Soda 306.'], '2026-08-21'],
    ['CS 162 grading', [['The CS 162 final is on December 15.', { kind: 'event', imp: 4 }], 'CS 162 grades are 40 percent projects and the rest exams.'], '2026-08-26'],
    ['Studying for the CS 162 midterm', [['The CS 162 midterm is on October 7.', { kind: 'event' }]], '2026-10-03'],
    ['CS 162 midterm results', ['I got an 86 on the CS 162 midterm.'], '2026-10-14'],
    ['Study group plan', ['The CS 162 study group meets Thursday at 6 in Soda 405.', say('priya_raman', 'Priya Raman runs the CS 162 study group.', { imp: 3 })], '2026-10-01', 'gemini'],
    ['Pintos deadlock help', [['Deadlock and virtual memory are the hardest CS 162 topics for me.', { imp: 2 }]], [230, 280]],
    ['CS 162 lecture notes', [['Professor Reyes posts CS 162 lecture notes on Sunday nights.', { imp: 2 }], ['CS 162 discussion section is Friday at 10.', { imp: 2 }]], [235, 290]],
  ])
  // Her first two CS 162 projects are done and graded; they sit with the rest of her school year.
  place(w, 'folder:school', [
    ['CS 162 project 1 user programs', [['CS 162 project 1 was user programs in Pintos.', { imp: 2 }], ['Our group got a 92 on CS 162 project 1.', { imp: 2 }]], '2026-09-14'],
    ['CS 162 project 2 threads', [['CS 162 project 2 was the thread scheduler.', { imp: 2 }], say('sam_lee', 'Sam Lee pushed the lock fixes for our scheduler.', { imp: 2 })], '2026-10-05'],
  ])
  place(w, 'cs162_p3', [
    ['CS 162 project 3 file system', ['CS 162 project 3 is the file system.', 'The CS 162 project 3 design review is on November 3.'], '2026-10-26'],
  ])
  place(w, 'math54', [
    ['MATH 54 this term', ['MATH 54 meets Monday, Wednesday and Friday at 9.', 'MATH 54 homework is graded on effort.', say('math54', 'Prof. Hartmann teaches MATH 54.', { imp: 3 })], '2026-08-27', 'chatgpt'],
    ['MATH 54 final date', [['The MATH 54 final is on December 17.', { kind: 'event', imp: 4 }]], [240, 260]],
    ['MATH 54 midterm prep', [['The MATH 54 midterm is on October 9.', { kind: 'event' }], ['MATH 54 office hours are Wednesday at 2 in Evans 10.', { imp: 2 }]], '2026-10-04'],
    ['MATH 54 midterm results', ['I got a 91 on the MATH 54 midterm.'], '2026-10-16'],
    ['Eigenvalues finally clicked', [['Eigenvalues took me the longest in MATH 54.', { imp: 2 }]], [255, 275]],
    ['MATH 54 due dates', [['The next MATH 54 problem set is due November 2.', { imp: 4, due: '2026-11-02' }], ['MATH 54 drops the lowest problem set score.', { imp: 2 }]], '2026-10-27'],
    ['Study session with Kenji', [['Kenji Watanabe and I study for MATH 54 on Sunday nights.', { imp: 2 }]], [240, 290]],
    ['Taking notes for MATH 54', [['I keep my MATH 54 notes in one ruled notebook.', { imp: 2 }]], [236, 260]],
  ])
  place(w, 'phys137', [
    ['PHYS 137 this term', ['PHYS 137 meets Tuesday and Thursday at 2.', 'Prof. Alvarez teaches PHYS 137.'], '2026-08-20'],
    ['PHYS 137 lab 1 done', [['PHYS 137 lab 1 is done.', { imp: 2 }]], '2026-09-08', 'chatgpt'],
    ['PHYS 137 grading', [['The PHYS 137 final is on December 16.', { kind: 'event', imp: 4 }], ['PHYS 137 lab reports are graded out of 20.', { imp: 2 }]], [236, 250]],
    ['PHYS 137 midterm prep', [['The PHYS 137 midterm is on October 13.', { kind: 'event' }]], '2026-10-09'],
    ['PHYS 137 midterm results', ['I got an 84 on the PHYS 137 midterm.'], '2026-10-20'],
    ['Lab partner for PHYS 137', [['Aisha Rahman is my PHYS 137 lab partner.', { imp: 2 }], ['PHYS 137 lab reports are due the Monday after each lab.', { imp: 3 }]], [240, 260]],
    ['Quantum tunneling questions', [['Tunneling is my favorite PHYS 137 topic so far.', { imp: 2 }]], [270, 295]],
  ])
  place(w, 'data100', [
    ['DATA 100 this term', ['DATA 100 meets Tuesday and Thursday at 11.', 'Prof. Kim teaches DATA 100.'], '2026-08-19'],
    ['DATA 100 problem set due date', [['Problem Set 1 for DATA 100 is due Sep 5.', { imp: 2 }]], '2026-08-30', 'chatgpt'],
    ['DATA 100 project 1 cleaning', ['DATA 100 Project 1 uses the housing data.', ['I got 47 out of 50 on DATA 100 Project 1.', { imp: 2 }]], '2026-09-18'],
    ['DATA 100 project 2 plan', ['DATA 100 Project 2 uses the Bay Area transit data.', ['DATA 100 Project 2 is due Nov 20.', { imp: 4, due: '2026-11-20' }]], '2026-10-21'],
    ['DATA 100 final date', [['The DATA 100 final is on December 14.', { kind: 'event', imp: 4 }], ['DATA 100 labs are due Friday at midnight.', { imp: 3 }]], [236, 250]],
    ['DATA 100 with Zoe', [['Zoe Martin and Luca Romano are in my DATA 100 section.', { imp: 2 }]], [240, 280]],
    ['DATA 100 midterm results', ['I got a 93 on the DATA 100 midterm.'], '2026-10-15'],
    ['Cross validation again', [['Cross validation was the part of DATA 100 I had to reread.', { imp: 2 }], ['DATA 100 office hours are Monday at 1 in Wheeler 150.', { imp: 2 }]], [255, 290]],
  ])
  place(w, 'history', [
    ['History reading list', ['The history reading list has six books for the term.'], '2026-09-03', 'chatgpt'],
    ['Reading list book two', ['The second book on the history reading list is about the Gold Rush.'], '2026-09-24'],
  ])
  // What school she did before this term, and her plans for it, sit on the section itself.
  place(w, 'folder:school', [
    ['CS 61B final grade', ['I took CS 61B last spring and got an A minus.', 'CS 61B Project 2 was Gitlet, a small version control system.'], [140, 150]],
    ['STAT 20 final grade', ['I took STAT 20 last spring and got an A.', 'My STAT 20 final project looked at BART delays.'], [140, 150]],
    ['ECON 1 final grade', ['I took ECON 1 last spring and got a B plus.'], [140, 150]],
    ['R1B research essay', ['I took ENGLISH R1B last spring and got an A minus.', 'My R1B research essay was on public libraries.'], [60, 130]],
    ['Minor in public health', [['I am thinking about a public health minor.', { imp: 2 }]], '2026-04-20'],
    ['Meeting my advisor', [['My advisor is Dr. Okonkwo and we meet once a term.', { imp: 2 }], ['I plan to graduate in May 2028.', { imp: 4 }]], '2026-09-16'],
  ])
}

// ---------------------------------------------------------------- work: Kestrel, applications, interviews

function work(w: Builder): void {
  place(w, 'self@kestrel', [
    ['Kestrel team and hours', [['I work at Kestrel Analytics 20 hours a week, Monday to Wednesday.', { imp: 4 }], say('kestrel', 'Kestrel Analytics is in downtown Oakland.', { imp: 3 })], '2026-01-15', 'claude'],
    ['Tools at Kestrel', [say('kestrel', 'Kestrel uses BigQuery, dbt and Tableau.', { imp: 3 })], '2026-02-09'],
    ['Raise at Kestrel', [['I got a raise to 32 dollars an hour at Kestrel in July.', { sens: 'finance' }], ['I was promoted to lead research assistant in July.', { imp: 4 }]], '2026-07-08'],
    ['One on one with Nadia', [['Nadia wants my clinic study draft by the end of November.', { imp: 4, due: '2026-11-30' }], ['Nadia Reyes is my manager at Kestrel Analytics.', { imp: 4 }]], '2026-09-11'],
    ['Who is who at Kestrel', ['Victor Chen is the head of research at Kestrel.', ['Owen Fischer is the data engineer who keeps our BigQuery tables clean.', { imp: 2 }]], [20, 60]],
    ['Working with Dana', [['Dana Brooks is a research analyst at Kestrel.', { imp: 2 }]], [60, 200]],
    ['Message for Leah', [['Leah Moran is an intern on my team at Kestrel.', { imp: 2 }]], [180, 260]],
    ['Survey questions with Amara', [['Amara Osei leads surveys at Kestrel.', { imp: 2 }]], [80, 220]],
    ['Weekly report format', ['Weekly reports at Kestrel are due Friday at noon.', ['Weekly reports have three parts: done, next and blocked.', { imp: 2 }]], '2026-08-12'],
    ['Weekly report draft', [['My last weekly report covered the clinic study draft.', { imp: 2 }]], '2026-10-22'],
    ['Clinic wait times study kickoff', ['The clinic wait times study is for Harbor Health.'], [120, 140]],
    ['Charts for the clinic study', ['Median clinic wait times went up 12 minutes since spring.'], [160, 200]],
    ['Bay Area rent survey kickoff', [['The Bay Area rent survey is for the city of Oakland.', { imp: 2 }]], [40, 70]],
    ['Rent survey findings', [['Renters under 30 spend 46 percent of their income on rent.', { imp: 2 }]], [80, 110]],
    ['Transit ridership dashboard', [['The transit ridership dashboard is for AC Transit.', { imp: 2 }], ['Weekend ridership is back to 90 percent of 2019.', { imp: 2 }]], [100, 180]],
    ['Food security study write up', [['The student food security study is for the Berkeley Food Pantry.', { imp: 2 }], ['One in three students skipped a meal for money last term.', { imp: 2 }]], [150, 240]],
    ['Small business hiring report charts', [['The small business hiring report is for the Oakland Chamber.', { imp: 2 }], ['Half the shops we surveyed want to hire this winter.', { imp: 2 }]], [200, 280]],
    ['Data vendor contract', [['Sabletide is the data vendor Kestrel uses.', { imp: 2 }], ['The Sabletide contract renews in January.', { imp: 2 }]], '2026-04-15'],
    ['Friday data review', [['Owen runs the Friday data review at Kestrel.', { imp: 2 }], ['Kestrel keeps Wednesday afternoons free of meetings.', { imp: 2 }]], [90, 250]],
  ])
  place(w, 'folder:work/Job applications', [
    ['Applying to Figma', ['I applied to Figma for the data analyst intern role.'], [240, 255]],
    ['Figma next steps', ['Figma said no to my application in October.'], [280, 295]],
    ['Duolingo application questions', ['I applied to Duolingo for the data science intern role on September 30.'], '2026-09-29'],
    ['Lyft cover letter', [['I applied to Lyft for the data intern role and have not heard back.', { imp: 2 }]], [245, 270]],
    ['Plaid referral', ['Caleb referred me to Plaid for the analytics role.'], [250, 280]],
    ['Asana application', [['I applied to Asana for the product analyst intern role.', { imp: 2 }]], [250, 285]],
    ['Instacart next steps', [['I withdrew my Instacart application.', { imp: 2 }]], [275, 295]],
    ['Internship timeline', [['I want a data internship for summer 2027.', { kind: 'goal', imp: 4 }], ['I track every application in one spreadsheet.', { imp: 2 }]], '2026-08-31'],
  ])
  place(w, 'folder:work/Interviews', [
    ['Airbnb phone screen', ['The Airbnb phone screen was on October 2.'], '2026-09-28'],
    ['Databricks next steps', [['I finished the Databricks online assessment.', { imp: 2 }], ['Databricks wants a take home by November 10.', { imp: 4, due: '2026-11-10' }]], '2026-10-23'],
    ['Mentor questions', ['Elena Lindqvist is a mentor from my last job.'], '2026-03-22', 'gemini'],
    ['Coffee with Elena', [['Elena thinks I should lead with Tidepool in interviews.', { imp: 3 }]], '2026-10-23'],
  ])
  // Her side job sits on the section.
  place(w, 'folder:work', [
    ['Tutoring hours', ['I tutor DATA 8 students on Monday evenings.', ['Tutoring pays 22 dollars an hour.', { sens: 'finance' }]], '2026-09-02'],
  ])
}

// ---------------------------------------------------------------- projects: Tidepool, SkipDoodle, Sparrowhawk

function projects(w: Builder): void {
  w.thing('busbuddy', 'Bus Buddy', 'project', 'projects', 2)
  place(w, 'tidepool', [
    ['Orrinwood Family Clinic check in', ['Orrinwood Family Clinic was the first Tidepool pilot.'], [120, 200]],
    ['Bayview Pediatrics check in', ['Bayview Pediatrics books about 300 visits a week on Tidepool.'], [200, 280]],
    ['Elm Street Dental check in', [['Elm Street Dental joined the Tidepool pilot in July.', { imp: 2 }]], [190, 220]],
    ['Text reminders for Lakeside', ['Lakeside Physical Therapy wants text reminders from Tidepool.'], [230, 290]],
    ['Tidepool pricing', ['Tidepool charges clinics 199 dollars a month.', ['We want a per seat price for bigger clinics next year.', { imp: 2 }]], [100, 200]],
    ['Tidepool investor updates', ['I send Tidepool investors an update on the first Monday of each month.'], [150, 250]],
    ['Tidepool hiring plan', ['The Tidepool hiring plan is one part time designer in January.', ['Tidepool can afford one hire before the seed round.', { imp: 2 }]], [200, 290]],
    ['Tidepool logo ideas', [['The Tidepool logo is a small wave in teal.', { imp: 2 }], say('jordan', 'Jordan Ellis is trying a darker blue for the Tidepool logo.', { imp: 2 })], '2026-09-26'],
    ['Seed round thinking', ['Tidepool plans to raise a seed round in the spring.', ['The seed round target is 1.5 million dollars.', { imp: 2 }]], [220, 295]],
    ['Tidepool goals', ['Tidepool wants ten clinics by March.', ['Tidepool needs text reminders before the seed round.', { imp: 2 }]], [180, 280]],
    ['Front desk tablets', [['Each pilot clinic got one Tidepool front desk tablet.', { imp: 2 }]], [130, 200]],
    ['Tidepool weekly users', [['Tidepool had 400 weekly users in May and 800 in July.', { imp: 2 }]], [190, 210]],
    ['Iris and the backend', [on('tidepool', 'Iris Sato writes the Tidepool backend in Go.', { imp: 2 })], '2026-05-27', 'gemini'],
  ])
  place(w, 'skipdoodle', [
    ['SkipDoodle undo feature', [['SkipDoodle keeps the drawing state in one hook, so undo stays simple.', { imp: 2 }]], [232, 300]],
    ['Sticker packs for SkipDoodle', [['SkipDoodle has three sticker packs: animals, space and food.', { imp: 2 }], ['Kids unlock a sticker pack after ten drawings.', { imp: 2 }]], [232, 300]],
    ['Color palette for SkipDoodle', [['SkipDoodle uses eight bright colors and a rainbow brush.', { imp: 2 }]], [232, 300], 'claude'],
    ['SkipDoodle offline mode', [['SkipDoodle saves drawings offline and syncs them later.', { imp: 2 }]], [232, 300]],
    ['SkipDoodle App Store listing', ['SkipDoodle is waiting on App Store review.', ['The SkipDoodle listing has six screenshots.', { imp: 2 }]], [270, 300]],
    ['Beta testers for SkipDoodle', ['Twelve families are testing SkipDoodle.'], [250, 290]],
    ['SkipDoodle bug', [['My cousin Ben tests SkipDoodle with his little sister.', { imp: 2 }]], [250, 300], 'claude'],
  ])
  place(w, 'sparrowhawk', [
    ['Sparrowhawk upgrade notes', [['The Sparrowhawk upgrade took one evening.', { imp: 2 }]], [262, 270], 'claude'],
    ['Donations in Sparrowhawk', [['Sparrowhawk takes donations through Stripe.', { imp: 2 }]], [100, 290], 'claude'],
    ['Sparrowhawk volunteer schedule', ['Sparrowhawk has 40 volunteers on the schedule.', ['Volunteers sign up for two hour shifts in Sparrowhawk.', { imp: 2 }]], [100, 290], 'claude'],
    ['Sparrowhawk newsletter', [['The Sparrowhawk newsletter goes out on the 1st of each month.', { imp: 2 }]], [100, 290]],
    ['Shift reminders', [['Sparrowhawk sends a text the night before each shift.', { imp: 2 }]], [200, 295]],
  ])
  place(w, 'kitchen', [
    ["Mom's kitchen remodel", ['The kitchen counters will be white oak.', "The kitchen remodel is at my mom's house in Sacramento."], '2026-04-28', 'gemini'],
    ["Mom's kitchen contractor", [on('kitchen', "Luis Ortega is the contractor on my mom's kitchen remodel.", { imp: 2 })], '2026-05-02', 'gemini'],
  ])
  place(w, 'busbuddy', [
    ['Bus Buddy', [['Bus Buddy was our CalHacks project, an app for late buses.', { imp: 2 }], ['Bus Buddy won the best civic hack prize.', { imp: 2 }]], [30, 120]],
  ])
  place(w, 'folder:projects', [
    ['Personal website', [['My personal website runs on Astro.', { imp: 2 }], ['I want to add the Tidepool case study to my website.', { imp: 2 }]], [60, 290]],
    ['Book club app idea', [['I want to build a tiny app for my book club to vote on books.', { imp: 2 }]], [60, 290]],
  ])
}

// ---------------------------------------------------------------- people: her friends, her family and who she writes to

function people(w: Builder): void {
  w.thing('lena', 'Lena Delacroix', 'person', 'people', 4)
  w.thing('caleb', 'Caleb Moreau', 'person', 'people', 3)
  place(w, 'lena', [
    ['Gift for Lena', ['Lena Delacroix is my oldest friend from school.', ['Lena loves anything with lemons.', { imp: 2 }]], '2026-04-06', 'gemini'],
    ['Omar and Lena', ['Omar Haddad is marrying Lena in December.', ["Omar's brother Silas is in Lena's wedding party.", { imp: 2 }]], '2026-06-14', 'gemini'],
    ['Montreal with Lena', [['Lena and I went to Montreal in June.', { imp: 2 }]], [160, 180]],
    ['Catching up with Lena', ['Lena lives in Portland now and works as a pastry chef.', ['Lena and I call every other Sunday.', { imp: 2 }]], [100, 280]],
    ['Lunch with Lena Delacroix', [['Lunch with Lena Delacroix is on Saturday at noon.', { kind: 'event', imp: 2 }]], [285, 298]],
  ])
  place(w, 'caleb', [
    ['Soccer friends', ['Caleb Moreau plays Tuesday soccer with me.'], '2026-03-03'],
    ['Caleb just got a new job', [['Caleb works as an analyst at Plaid.', { imp: 2 }]], [120, 200]],
    ['Running with Caleb', [['Caleb and I run the Bay Trail on Saturday mornings.', { imp: 2 }], ['Caleb is training for the Oakland half marathon too.', { imp: 2 }]], [60, 280]],
    ['Birthday idea for Caleb', [["Caleb's birthday is August 3.", { kind: 'event' }]], [190, 210]],
    ['Text to Caleb', [['Caleb lent me his camping stove for Tahoe.', { imp: 2 }], ['Caleb is from Montreal and speaks French.', { imp: 2 }]], [250, 295]],
  ])
  place(w, 'priya_raman', [
    ['Priya and the design doc', [['Priya and I split the CS 162 project 3 design doc.', { imp: 2 }]], '2026-10-27'],
    ['Studying with Priya', [['Priya is a computer science major from San Jose.', { imp: 2 }], ['Priya likes to study at Doe Library.', { imp: 2 }]], [240, 290]],
    ['Tutoring with Priya', [['Priya tutors DATA 8 with me on Mondays.', { imp: 2 }]], [245, 290]],
    ['Birthday idea for Priya', [["Priya's birthday is January 9.", { kind: 'event', imp: 2 }]], [250, 295]],
  ])
  place(w, 'alex_kim', [
    ['Dinner with Alex Kim', [['Dinner with Alex Kim is on November 14 in the Mission.', { kind: 'event', due: '2026-11-14' }]], '2026-10-28'],
  ])
  place(w, 'folder:people/Family', [
    ['Call with Mom', ['My mom, Ellen Collins, is a nurse in Sacramento.', ['I call my parents on Sunday evenings.', { imp: 2 }]], [10, 120]],
    ['Note for Dad', ['My dad, Mark Collins, teaches high school history.', ['My dad coaches the school debate team this year.', { imp: 2 }]], [30, 200]],
    ["Theo's college essays", ['My brother Theo is a high school senior.', 'Theo is applying to UC Davis and Cal Poly.', ["Theo's college applications are due November 30.", { imp: 4, due: '2026-11-30' }]], '2026-10-11'],
    ["Mom's birthday", [["My mom's birthday is February 22.", { kind: 'event', imp: 4 }], ['My mom likes orchids and mystery novels.', { imp: 2 }]], '2026-02-10'],
    ['Family update', [['My grandma Rose lives in Fresno.', { imp: 2 }], ['My cousin Ben is studying nursing in San Diego.', { imp: 2 }]], [40, 260]],
    ['Thanksgiving at Aunt Carol', [['Thanksgiving is at Aunt Carol in Sacramento again this year.', { kind: 'event' }], ['My aunt Carol hosts Thanksgiving every year.', { imp: 2 }]], '2026-10-20'],
  ])
}

// ---------------------------------------------------------------- plans and deadlines

function plans(w: Builder): void {
  w.thing('lena_wedding', "Lena's wedding", 'event', 'plans/Events', 4)
  place(w, 'lena_wedding', [
    ["Lena's wedding plans", [["Lena's wedding is for Lena Delacroix and Omar Haddad on December 12 in Portland.", { kind: 'event', imp: 4, due: '2026-12-12' }], "I'm a bridesmaid at Lena's wedding."], '2026-07-19', 'gemini'],
    ['Bridesmaid dress', [['The bridesmaid dresses are dusty blue.', { imp: 2 }]], '2026-09-21', 'chatgpt'],
  ])
  const event = (text: string, due: string, o: Omit<Say, 's' | 'text' | 'under'> = {}): Line => [text, { kind: 'event', imp: due ? 3 : 2, ...(due ? { due } : {}), ...o }]
  place(w, 'folder:plans/Events', [
    ['Bank appointment', [event('Bank appointment is on Thursday at 9am.', '2026-11-05')], '2026-10-27', 'claude'],
    ['Dentist cleaning', [event('My dentist cleaning is on November 18 at 10.', '2026-11-18')], [285, 300]],
    ['Planning DMV for Real ID', [event('My DMV appointment for Real ID is December 3 at 1:30.', '2026-12-03')], [280, 300]],
    ['Reminder: eye exam', [event('My eye exam is on January 8.', '2027-01-08')], [280, 300]],
    ['Haircut', [event('My haircut with Mia is November 7 at 11.', '2026-11-07')], [290, 300]],
    ["Iris's birthday dinner", [event("Iris's birthday dinner is November 21 at Comal.", '2026-11-21')], [285, 300]],
    ['Planning friendsgiving', [event('I am hosting Friendsgiving on November 22.', '2026-11-22')], [280, 300]],
    ['Japanese Breakfast concert', [event('The Japanese Breakfast concert is December 5 at the Fox.', '2026-12-05')], [270, 300]],
    ['Women in Data conference', [event('The Women in Data conference is March 10 in San Francisco.', '2027-03-10')], [260, 300]],
    ['Coffee with Elena Lindqvist', [event('Coffee with Elena Lindqvist is on Monday at 10.', '')], [285, 298]],
    ['PearX demo day', [event('PearX demo day is in late January if we get in.', '')], [280, 298]],
    ['A coworker wedding', [event("Dana's wedding is in Austin in May, and I need a gift.", '', { imp: 3 })], '2026-10-01', 'chatgpt'],
  ])
  const due = (text: string, at: string): Line => [text, { kind: 'task', imp: at ? 4 : 3, ...(at ? { due: at } : {}) }]
  place(w, 'folder:plans/Deadlines', [
    ['Deadlines', [due('My lease renewal is due December 1.', '2026-12-01'), due('I need to renew my passport before the Lisbon trip.', '')], [260, 295]],
    ['Taxes done', [due('I filed my taxes on April 10.', '')], '2026-04-11'],
    ['FAFSA reminder', [due('The FAFSA for next year opens October 1.', '')], [250, 270]],
    ['Spring registration', [due('Spring registration opens for me on November 12.', '2026-11-12')], [280, 298]],
    ['To do this week', [due('I need to return the library books by November 9.', '2026-11-09'), due('I need to pick up my bike from the shop.', '')], [290, 300]],
    ['Timesheet reminder', [due('My Kestrel timesheet is due every other Friday.', '')], [30, 200]],
  ])
  const goal = (text: string): Line => [text, { kind: 'goal', imp: 3 }]
  place(w, 'folder:plans/Goals', [
    ['Goals check in', [goal('I want to run a half marathon in April.'), goal('I want to read 24 books this year.')], [10, 60]],
    ['Saving plan', [goal('I want to save 8,000 dollars by June.')], [20, 120]],
    ['Learning Portuguese', [goal('I want to learn basic Portuguese before Lisbon.')], [150, 260]],
    ['Planning ahead', [goal('I want Tidepool in ten clinics before I graduate.'), goal('I want to cook dinner at home five nights a week.')], [200, 290]],
  ])
}

// ---------------------------------------------------------------- the rest of her life: writing, health, money, travel, home

function life(w: Builder): void {
  place(w, 'folder:style/Emails', [
    ['Writing preferences', [['I start emails with Hi, never Hey.', { kind: 'style', imp: 2 }], ['I put the ask in the first line of an email.', { kind: 'style', imp: 3 }]], [40, 200]],
    ['Email to my professor', [['With professors I write short, formal emails.', { kind: 'style', imp: 2 }]], [230, 290]],
    ['Email to Nadia', [['With Nadia I am direct and lead with the numbers.', { kind: 'style', imp: 2 }], ['I keep work emails under five sentences.', { kind: 'style', imp: 2 }]], [60, 280]],
    ['Subject lines', [['I write subject lines in plain words, no all caps.', { kind: 'style', imp: 2 }], ['I answer email in two batches, at 10 and at 4.', { kind: 'preference', imp: 2 }]], [90, 260]],
  ])
  place(w, 'folder:style/Cover letters', [
    ['Cover letter template', [['My cover letter template has three short paragraphs.', { imp: 3 }], ['My cover letters open with Tidepool, then Kestrel.', { imp: 2 }]], [220, 250]],
    ['Tighten my resume', [['My resume leads with the Kestrel clinic study.', { imp: 3 }], ['I keep my resume to one page.', { imp: 2 }]], '2026-08-28'],
    ['Resume bullet for Tidepool', [['My resume says I grew Tidepool to 1,200 weekly users.', { imp: 2 }]], '2026-09-05'],
    ['Closing line', [['I end cover letters with one line on why that team.', { kind: 'style', imp: 2 }]], [240, 290]],
  ])

  place(w, 'folder:health/Fitness', [
    ['Running plan', [['I run three times a week, about 15 miles total.', { imp: 3 }], ['My half marathon plan builds to a 10 mile long run.', { imp: 3 }]], [20, 120]],
    ['Training week', [['My long run is on Saturday mornings on the Bay Trail.', { imp: 2 }], ['I stretch for ten minutes after every run.', { imp: 2 }]], [60, 250]],
    ['Climbing for strength', [['I climb twice a week for strength.', { imp: 3 }]], [80, 200]],
    ['Protein question', [['I try to eat 80 grams of protein a day.', { imp: 2 }], ['I log my runs on Strava.', { imp: 2 }]], [90, 280]],
    ['Knee pain', [['My right knee hurts after long runs.', { sens: 'health' }], ['My physical therapist gave me three knee exercises.', { sens: 'health' }]], [120, 260]],
    ['Feeling better', [['Long walks help me when I feel stressed.', { sens: 'health' }]], [100, 290]],
  ])
  place(w, 'folder:health/Sleep', [
    ['Sleep tips', [['I try to be asleep by 11:30 on school nights.', { imp: 3 }], ['I keep my phone out of the bedroom at night.', { imp: 2 }]], [30, 280]],
    ['Bad sleep before deadlines', [['I sleep worse the night before a big deadline.', { imp: 2 }], ['A cool room and white noise help me sleep.', { imp: 2 }]], [100, 290]],
    ['How much sleep I need', [['I aim for seven and a half hours of sleep.', { imp: 2 }], ['No coffee after 2 pm helps me fall asleep.', { imp: 2 }]], [150, 295]],
  ])
  place(w, 'harbor', [
    ['Harbor Clinic visit', [['Harbor Clinic is my clinic for checkups.', { sens: 'health' }], ['Harbor Clinic is on Telegraph Ave near campus.', { imp: 2 }], say('nora', 'Nora Patel works at Harbor Clinic.', { imp: 2 })], '2026-09-19'],
    ['Doctor visit notes', [['My next checkup at Harbor Clinic is in January.', { sens: 'health' }], ['I got my flu shot on October 4.', { sens: 'health' }]], [278, 290]],
  ])
  place(w, 'folder:health', [
    ['Health question', [['I have seasonal allergies and take Zyrtec in spring.', { sens: 'health' }]], [60, 120]],
    ['Dentist reminder', [['Dr. Lin is my dentist on Shattuck.', { sens: 'health' }]], '2026-03-09'],
  ])

  place(w, 'folder:money/Budget', [
    ['Monthly budget', [['My share of the rent is 1,450 dollars a month.', { sens: 'finance' }], ['I budget 400 dollars a month for groceries.', { imp: 3 }]], [5, 60]],
    ['Paying bills', [['I pay for Spotify, iCloud and ChatGPT Plus.', { imp: 2 }], ['I split utilities with Jess on Splitwise.', { imp: 2 }]], [40, 200]],
    ['Budget check', [['I track my spending in a Google Sheet.', { imp: 3 }], ['I review my budget on Sunday nights.', { imp: 2 }]], [60, 280]],
    ['Fun money', [['I keep a 50 dollar a week fun budget.', { imp: 2 }]], [120, 290]],
    ['Saving for Lisbon', [['I am saving for the Lisbon trip in a separate account.', { imp: 3 }], ['Tutoring and Kestrel are my two paychecks.', { sens: 'finance' }]], [200, 280]],
  ])
  place(w, 'folder:money/Investing', [
    ['Roth IRA question', [['I put 100 dollars a month into a Roth IRA.', { imp: 3 }], ['My Roth IRA is in a target date fund.', { imp: 2 }]], [30, 150]],
    ['Index funds', [['I buy index funds and do not pick stocks.', { imp: 2 }], ['I read the Bogleheads guide last summer.', { imp: 2 }]], [150, 280]],
    ['Emergency fund first', [['I keep three months of rent in savings before I invest more.', { imp: 2 }]], [100, 260]],
  ])
  place(w, 'folder:money', [
    ['Money question', [['I have about 9,000 dollars in student loans.', { sens: 'finance' }], ['My credit card is on autopay.', { sens: 'finance' }]], [10, 200]],
    ['Tax forms', [['I need my 1098-T for taxes.', { sens: 'finance' }]], [20, 90]],
  ])

  w.thing('lisbon', 'Lisbon trip', 'event', 'travel', 4)
  w.thing('kyoto', 'Kyoto trip', 'event', 'travel', 3)
  w.thing('portland', 'Portland for the wedding', 'event', 'travel', 2)
  w.thing('tahoe', 'Tahoe ski weekend', 'event', 'travel', 2)
  place(w, 'lisbon', [
    ['Lisbon trip', [['The Lisbon trip is in March for six days.', { kind: 'event', imp: 4 }]], [200, 260], 'chatgpt'],
    ['Lisbon trip planning', [['I am staying in Alfama on the Lisbon trip.', { imp: 2 }], ['The Lisbon trip budget is 2,000 dollars.', { imp: 3 }]], [220, 290]],
    ['Flight times for the trip', [['The flight to Lisbon leaves at 7:40 am.', { imp: 2 }]], '2026-10-06', 'chatgpt'],
    ['Lisbon day trips', [['I want a day trip to Sintra from Lisbon.', { imp: 2 }], ['I booked a fado night for the second evening in Lisbon.', { imp: 2 }]], [230, 295]],
    ['Lisbon food list', [['Pasteis de Belem is first on my Lisbon food list.', { imp: 2 }], ['June Park is coming with me to Lisbon.', { imp: 3 }]], [240, 295]],
  ])
  place(w, 'kyoto', [
    ['Kyoto trip ideas', [['I am planning a Kyoto trip for next summer with Hana.', { imp: 3 }], ['The Kyoto trip would be ten days in July.', { imp: 2 }]], [180, 280]],
    ['Kyoto trip budget', [['The Kyoto trip budget is 3,000 dollars.', { imp: 2 }], ['A JR Pass does not pay off for the Kyoto trip.', { imp: 2 }]], [200, 290]],
    ['Kyoto must sees', [['I want to see Fushimi Inari early in the morning.', { imp: 2 }], ['I want to stay in a ryokan for one night in Kyoto.', { imp: 2 }], ['Hana Ito grew up near Kyoto and will show us around.', { imp: 2 }]], [210, 295]],
  ])
  place(w, 'portland', [
    ['Portland for the wedding planning', [['I fly to Portland on December 11 for the wedding.', { kind: 'event', imp: 3 }], ["I am staying with Lena's family in Portland.", { imp: 2 }]], [250, 295]],
  ])
  place(w, 'tahoe', [
    ['Tahoe ski weekend packing', [['The Tahoe ski weekend is January 16 to 18.', { kind: 'event', imp: 2 }], ['We rented a cabin in Truckee for Tahoe.', { imp: 2 }]], [260, 298]],
  ])
  place(w, 'folder:travel', [
    ['Travel style', [['I travel carry on only.', { kind: 'preference', imp: 2 }], ['I like an aisle seat on long flights.', { kind: 'preference', imp: 2 }]], '2026-03-28'],
    ['Airline miles', [['I collect Alaska miles.', { imp: 2 }]], '2026-06-02'],
    ['Montreal trip budget', [['The Montreal trip budget was $1,400 for 5 nights.', { imp: 2 }]], [120, 150], 'claude'],
    ['Seattle visit', [['I visited June in Seattle in July.', { imp: 2 }]], [180, 220]],
  ])

  w.thing('apartment', 'Durant Ave apartment', 'place', 'personal', 3)
  place(w, 'apartment', [
    ['Apartment stuff', ['I live in a two bedroom apartment on Durant Ave with Jess.', ['The apartment internet is Sonic fiber.', { imp: 2 }]], [10, 120]],
    ['Broken heater', ['The landlord fixes the heater on Wednesday.'], '2026-10-17', 'claude'],
    ['Roommate chores', ['Jess Moreno is my roommate on Durant Ave.', ['Jess and I split chores by week.', { imp: 2 }]], '2026-02-18'],
    ['Email to the landlord', [['Gary Novak is my landlord.', { imp: 2 }]], '2026-01-28'],
    ['Chores and bills', [['Trash goes out on Tuesday night.', { imp: 2 }], ['My renters insurance is with Lemonade.', { imp: 2 }]], [40, 280]],
    ['Balcony garden', [['I built a raised garden bed on the balcony.', { imp: 2 }], ['The raised bed has basil, chard and cherry tomatoes.', { imp: 2 }]], [90, 200]],
    ['Bike tune up', [['My commuter bike is a gray Linus.', { imp: 2 }], ['The bike shop on Telegraph does my tune ups.', { imp: 2 }]], '2026-08-08'],
  ])
  place(w, 'folder:personal/Cooking', [
    ['Pear tart recipe', ['The pear tart for Sunday needs four pears.'], [200, 299], 'gemini'],
    ['Lentil soup recipe', [['My lentil soup uses smoked paprika and lemon.', { imp: 2 }]], [5, 299]],
    ['Shakshuka for four', [['Shakshuka is my go to Sunday breakfast.', { imp: 2 }]], [5, 299]],
    ['Fixing my chickpea curry', [['The chickpea curry freezes well for a week.', { imp: 2 }]], [5, 299]],
    ['Banana bread recipe', [['My banana bread uses brown butter.', { imp: 2 }]], [5, 299]],
    ['Pesto pasta', [['I make pesto with the basil from the balcony.', { imp: 2 }]], [150, 260]],
    ['Dinner ideas', [['I cook vegetarian on weeknights.', { kind: 'preference', imp: 3 }], ['I do not like cilantro.', { kind: 'preference', imp: 2 }]], [5, 299]],
    ['Meal plan for the week', [['I meal prep on Sunday afternoons.', { kind: 'preference', imp: 2 }], ['Overnight oats are my weekday breakfast.', { imp: 2 }]], [5, 299]],
    ['Where to eat', [['Cheese Board Pizza is my favorite place in Berkeley.', { kind: 'preference', imp: 2 }], ['My coffee order is an oat milk cortado.', { kind: 'preference', imp: 2 }]], [5, 299]],
  ])
  place(w, 'folder:personal/Gifts and occasions', [
    ['What to get Lena', [['I want to get Lena a small lemon tree for her new place.', { imp: 2 }]], [200, 280]],
    ['Wedding gift for Dana', [["Dana's wedding gift is a set of linen napkins from her registry.", { imp: 2 }]], '2026-10-01'],
    ['Gift for Theo', [['I want to get Theo a good backpack for college.', { imp: 2 }]], [250, 295]],
    ['Holiday gifts', [['I give friends homemade banana bread at the holidays.', { imp: 2 }], ['I spend about 40 dollars on a birthday gift.', { imp: 3 }]], [250, 298]],
    ['What to get Caleb', [['Caleb wants a new running vest for his birthday.', { imp: 2 }]], [170, 205]],
    ['Friendsgiving plans', [['For Friendsgiving I am bringing the pear tart.', { imp: 2 }]], [285, 298]],
    ["Iris's birthday gift", [["Iris's birthday gift is a Tesselcrest expansion.", { imp: 2 }]], [285, 298]],
    ['Gift list', [['I keep a gift ideas note on my phone.', { imp: 2 }], ['I gave my mom an orchid for her birthday last year.', { imp: 2 }]], [30, 200]],
  ])
}

// ---------------------------------------------------------------- code, preferences and hobbies

function interests(w: Builder): void {
  w.thing('sql', 'SQL', 'topic', 'tech', 3)
  w.thing('react', 'React', 'topic', 'tech', 3)
  w.thing('git', 'Git', 'topic', 'tech', 3)
  place(w, 'self@sql', [
    ['SQL at Kestrel', [['I write most of my Kestrel queries in SQL.', { imp: 3 }]], '2026-02-10'],
    ['SQL window functions', [['I saved a cheat sheet on SQL window functions.', { imp: 2 }], ['I still look up the difference between RANK and DENSE_RANK.', { imp: 2 }]], [60, 250]],
    ['Cleaner queries', [['I use CTEs instead of nested subqueries.', { kind: 'preference', imp: 2 }], ['I format SQL with one clause per line.', { kind: 'preference', imp: 2 }]], [80, 280]],
    ['BigQuery costs', [['BigQuery charges by bytes scanned, so I select only the columns I need.', { imp: 2 }], ['QUALIFY in BigQuery saves me a subquery.', { imp: 2 }]], [100, 290]],
    ['dbt tests', [['I test dbt models with unique and not null checks.', { imp: 2 }]], [120, 290]],
  ])
  place(w, 'self@react', [
    ['Expo routes', [['I build SkipDoodle screens as Expo routes.', { imp: 2 }], ['I keep React state in one hook per screen.', { kind: 'preference', imp: 2 }]], [232, 299]],
    ['TypeScript setup', [['I write TypeScript with strict mode on.', { kind: 'preference', imp: 3 }], ['I test with Vitest.', { kind: 'preference', imp: 2 }]], [100, 280]],
    ['Styling React Native', [['I style React Native with plain StyleSheet objects.', { imp: 2 }], ['Supabase auth handles SkipDoodle sign in.', { imp: 2 }]], [240, 299]],
    ['Astro islands', [['My personal website uses Astro with a few React islands.', { imp: 2 }]], [60, 290]],
  ])
  place(w, 'self@git', [
    ['GitHub handles for the team', [say('git', "The team's GitHub handles are in the shared doc.", { imp: 2 }), say('git', 'Iris is irissato on GitHub.', { imp: 2 })], '2026-10-25', 'chatgpt'],
    ['Branches for Tidepool', [['Tidepool uses one branch per feature and squash merges.', { imp: 2 }], ['I rebase my branches before opening a pull request.', { imp: 2 }]], [100, 290]],
    ['Commit messages', [['I write commit messages in the present tense.', { kind: 'preference', imp: 2 }], ['I keep a .gitignore template for Python projects.', { imp: 2 }]], [60, 280]],
  ])

  const rule = (text: string, imp = 3): Line => [text, { kind: 'instruction', imp }]
  place(w, 'folder:preferences/How you want answers', [
    ['How I like answers', [rule('Keep answers short unless I ask for detail.', 5), rule('Start with the answer, then explain.', 4)], [20, 120]],
    ['Shorter please', [rule('Keep answers short unless I ask for detail.', 5)], '2026-06-11', 'claude'],
    ['Settings for this chat', [rule('Use a table when you compare options.'), rule('Give code examples in Python unless I say TypeScript.')], [60, 250]],
    ['Please remember', [rule('Write dates like Oct 29, not 10/29.', 2), rule('Use miles for running and Celsius for cooking.', 2)], [80, 280]],
    ['From now on', [rule('Show me the formula before the number.', 2), rule('Ask one question at a time when you need more from me.', 2)], [120, 290]],
  ])
  place(w, 'folder:preferences/Tone of answers', [
    ['One more rule', [rule('Keep a calm, direct tone.', 4), rule('Skip the praise and get to the point.')], [40, 260]],
    ['No emojis', [rule('Do not use emojis in answers.', 2), rule('Tell me when you are not sure.', 3)], [100, 290]],
  ])
  place(w, 'folder:preferences', [
    ['Tools I use', [['I keep my notes in Notion and my tasks in Things.', { kind: 'preference', imp: 2 }]], [30, 200]],
    ['Focus time', [['I do my best focused work before noon.', { kind: 'preference', imp: 3 }]], [30, 250]],
  ])

  // Her hobbies sit loose on their section: a few small things, no folders.
  w.thing('soccer', 'Tuesday soccer', 'group', 'hobbies', 2)
  w.thing('climbing', 'Climbing', 'topic', 'hobbies', 2)
  w.thing('book_club', 'Book club', 'group', 'hobbies', 2)
  w.thing('pottery', 'Pottery class', 'event', 'hobbies', 2)
  place(w, 'soccer', [['Tuesday soccer', [['I play soccer on Tuesdays at 7.', { kind: 'event' }], ['Our rec team is called the Tide Pools.', { imp: 2 }]], '2026-02-24']])
  place(w, 'climbing', [['Climbing goals', [['I climb at Berkeley Ironworks.', { imp: 2 }], ['I am working on V4 boulder problems.', { imp: 2 }]], '2026-05-09']])
  place(w, 'book_club', [['Book club pick', [['My book club meets the last Sunday of the month.', { kind: 'event' }], ["November's book club pick is Pachinko.", { imp: 2 }]], '2026-10-10']])
  place(w, 'pottery', [['Pottery class', [['My pottery class is on Thursday nights.', { kind: 'event', imp: 2 }], ['I made a set of four mugs in pottery.', { imp: 2 }]], '2026-09-10']])
  const books = ['Tomorrow, and Tomorrow, and Tomorrow', 'The Overstory', 'Klara and the Sun', 'Educated', 'Project Hail Mary', 'Pachinko', 'The Remains of the Day', 'Braiding Sweetgrass']
  place(w, 'folder:hobbies', [
    ...books.map((book): Talk => [w.pick([`Thoughts on ${book}`, `${book} discussion`, `What to read after ${book}`]), [[`I ${w.pick(['loved', 'liked', 'finished', 'could not put down'])} ${book}.`, { imp: 2 }]]]),
    ['Severance theories', [['I am rewatching Severance.', { imp: 2 }]]],
    ['The Bear theories', [['The Bear is my favorite show this year.', { imp: 2 }]]],
    ['Music for focus', [['I listen to Japanese Breakfast and Phoebe Bridgers.', { kind: 'preference', imp: 2 }]], '2026-03-17'],
    ['Board game night', [['Wingspan is my favorite board game.', { kind: 'preference', imp: 2 }]], '2026-06-26'],
  ])
}

// ---------------------------------------------------------------- the rest of a year of chats

/** More of what she told her AIs over the year, in the same places: a course's textbook, a project's stack, a friend's dog. */
function more(w: Builder): void {
  const two = (text: string): Line => [text, { imp: 2 }]
  place(w, 'cs162', [
    ['Pintos setup', [two('Pintos needs Linux, so I use the lab machines in Soda.'), two('CS 162 projects go in through Gradescope.')], [232, 260]],
    ['CS 162 final topics', [two('The CS 162 final covers file systems and networking.'), two('I have three CS 162 slip days left.')], [280, 300]],
    ['Late night lab', [two('Sam Lee and I meet late for CS 162 labs, since he is a night owl.')], [240, 290]],
  ])
  place(w, 'math54', [
    ['MATH 54 textbook', [two("MATH 54 uses Lay's Linear Algebra book."), two('I check my MATH 54 answers with Wolfram Alpha.')], [232, 280]],
    ['MATH 54 final rules', [two('The MATH 54 final allows one page of notes.')], [270, 300]],
  ])
  place(w, 'phys137', [
    ['PHYS 137 textbook', [two('PHYS 137 uses the Griffiths quantum book.')], [232, 260]],
    ['PHYS 137 final review', [two('The PHYS 137 final allows a formula sheet.'), two('Prof. Alvarez holds a review session the week before the PHYS 137 final.')], [280, 300]],
  ])
  place(w, 'data100', [
    ['DATA 100 setup', [two('DATA 100 uses pandas and scikit-learn in Jupyter.'), two('DATA 100 lets us drop two labs.')], [232, 260]],
    ['Where I study for DATA 100', [two('I work on DATA 100 labs at Moffitt Library.')], [240, 300]],
  ])
  place(w, 'folder:school', [
    ['Getting to campus', [two('I bike to campus in ten minutes.'), two('My student ID works as an AC Transit pass.')], [10, 290]],
    ['GPA check', [two('My GPA is 3.7.')], [150, 250]],
  ])
  place(w, 'self@kestrel', [
    ['Kestrel perks', [two('Kestrel pays for one conference a year.'), two('Kestrel closes between Christmas and New Year.')], [20, 290]],
    ['Sharing studies with clients', [two('Kestrel shares each study with its client as a Tableau workbook.'), two('I sit with the survey team on Tuesdays.')], [60, 290]],
  ])
  place(w, 'folder:work/Job applications', [
    ['What internships want', [two('Most data internships ask for SQL and Python.'), two('I apply to five roles a week in the fall.')], [240, 290]],
    ['Cover letter reader', [two('Elena reads each cover letter before I send it.')], [245, 295]],
  ])
  place(w, 'folder:work', [
    ['Interview stories', [two('I keep a list of stories for behavioral questions.'), two('I send a thank you note within a day of an interview.')], [250, 295]],
  ])
  place(w, 'tidepool', [
    ['Tidepool stack', [two('Tidepool runs on Next.js and Postgres.')], [100, 290]],
    ['Tidepool waitlist', [two('Tidepool has a waitlist of eleven clinics.'), two('Clinics sign a three month pilot agreement with Tidepool.')], [200, 295]],
    ['Tidepool team call', [two('The Tidepool team call is on Monday mornings.')], [100, 290]],
    ['Logo price', [two('Jordan Ellis charges a flat 600 dollars for the Tidepool logo.')], [240, 280]],
  ])
  place(w, 'skipdoodle', [
    ['SkipDoodle pricing', [two('SkipDoodle is free with one paid sticker pack.'), two('SkipDoodle has no ads and no chat.')], [240, 300]],
    ['Saving SkipDoodle drawings', [two('SkipDoodle can save a drawing to the photo album.')], [240, 300]],
  ])
  place(w, 'sparrowhawk', [
    ['Sparrowhawk stack', [two('Sparrowhawk is built with Django.'), two('I fix Sparrowhawk bugs on the first Sunday of each month.')], [100, 290]],
    ['Bird rescue season', [two('The bird rescue cares for about 200 birds each spring.')], [60, 160]],
  ])
  place(w, 'lena', [['Lena visit', [two("Lena's dog is a corgi named Biscuit."), two('Lena taught me to make croissants.')], [100, 290]]])
  place(w, 'caleb', [['How I met Caleb', [two('Caleb and I met at Tuesday soccer last year.')], [40, 120]]])
  place(w, 'priya_raman', [['Exam prep with Priya', [two('Priya draws great system diagrams.'), two('Priya and I swap notes before CS 162 exams.')], [270, 300]]])
  place(w, 'folder:people/Family', [
    ['Family news', [two('Theo plays trumpet in the school band.'), two('My parents visit Berkeley in early December.')], [200, 298]],
    ['Grandma Rose', [two('My grandma Rose loves crossword puzzles.')], [30, 250]],
  ])
  place(w, 'folder:plans/Events', [
    ['Race day', [['The Oakland half marathon is on March 22.', { kind: 'event', imp: 3, due: '2027-03-22' }]], [250, 298]],
    ['Open studio night', [['Open studio night at my pottery class is December 10.', { kind: 'event', imp: 2, due: '2026-12-10' }]], [280, 298]],
  ])
  place(w, 'folder:plans/Deadlines', [
    ['Quick note', [['Rent is due on the 1st of each month.', { kind: 'task', imp: 3 }], ['My library card expires in January.', { kind: 'task', imp: 2 }]], [30, 280]],
    ['Sabletide renewal', [['I need to send the Sabletide renewal notes by December 15.', { kind: 'task', imp: 3, due: '2026-12-15' }]], [285, 298]],
  ])
  place(w, 'folder:plans/Goals', [
    ['Climbing goal', [['I want to climb a V5 by summer.', { kind: 'goal', imp: 2 }]], [120, 250]],
    ['Bigger goals', [['I want to visit Kyoto before I graduate.', { kind: 'goal', imp: 2 }], ['I want to write one blog post a month.', { kind: 'goal', imp: 2 }]], [30, 290]],
  ])
  place(w, 'folder:style/Emails', [['Email habits', [['I never send an email after 10 pm.', { kind: 'style', imp: 2 }], ['I bold the one date that matters in an email.', { kind: 'style', imp: 2 }]], [100, 290]]])
  place(w, 'folder:style/Cover letters', [['Tailoring a cover letter', [two('I tailor the second paragraph of a cover letter to each company.'), two('I name a product I use in every cover letter.')], [240, 290]]])
  place(w, 'folder:health/Fitness', [
    ['Running shoes', [two('I run in Hoka Clifton shoes.'), two('My best 10k time is 52 minutes.')], [60, 280]],
    ['Sunday yoga', [two('I do a 20 minute yoga video on Sundays.')], [30, 290]],
  ])
  place(w, 'folder:health/Sleep', [['Weekday mornings', [two('I wake up at 7:15 on weekdays.'), two('I take a 20 minute nap on long days.')], [60, 290]]])
  place(w, 'folder:health', [['Winter vitamins', [['I take vitamin D in winter.', { sens: 'health' }]], [10, 60]]])
  place(w, 'folder:money/Budget', [
    ['Cutting costs', [two('Cooking at home keeps my food under budget.'), two('My phone plan is 25 dollars a month with Mint.')], [40, 290]],
    ['Textbooks', [two('I buy textbooks used or rent them.')], [225, 240]],
  ])
  place(w, 'folder:money/Investing', [['Opening a Roth IRA', [two('I opened my Roth IRA at Fidelity.'), two('I never sell investments to pay for trips.')], [20, 120]]])
  place(w, 'folder:money', [['Credit score', [['My credit score is 742.', { sens: 'finance' }]], [60, 250]]])
  place(w, 'lisbon', [['Getting around Lisbon', [two('I want to ride tram 28 in Lisbon.'), two('I am learning to order coffee in Portuguese for Lisbon.')], [240, 298]]])
  place(w, 'kyoto', [['Kyoto gardens', [two('I want to see the moss garden at Saiho ji in Kyoto.')], [220, 298]]])
  place(w, 'folder:travel', [['Booking flights', [two('I book trips on Google Flights with price alerts.'), two('I keep my passport in my desk drawer.')], [30, 290]]])
  place(w, 'apartment', [['Apartment details', [two('The apartment has a small balcony facing west.'), two('Laundry is in the basement and takes quarters.')], [10, 250]]])
  place(w, 'folder:personal/Cooking', [
    ['Winter soup', [two('I make a big pot of soup every Sunday in winter.')], [10, 60]],
    ['Cookbook question', [two('My favorite cookbook is Salt Fat Acid Heat.'), two('I use a cast iron pan for most dinners.')], [40, 290]],
  ])
  place(w, 'folder:personal/Gifts and occasions', [['Wrapping gifts', [two('I wrap gifts in brown paper and twine.'), two('My dad wants a history book about the Gold Rush.')], [250, 298]]])
  place(w, 'self@sql', [['Joins question', [two('I use LEFT JOIN more than any other join.'), two('I keep my saved queries in a GitHub repo.')], [60, 290]]])
  place(w, 'self@react', [['SkipDoodle state', [two('I use Zustand for shared state in SkipDoodle.'), two('I learned React from the official docs tutorial.')], [232, 299]]])
  place(w, 'self@git', [['Big merges', [two('I use GitHub Desktop for big merges.'), two('Tidepool runs its tests on every pull request with GitHub Actions.')], [120, 295]]])
  place(w, 'folder:preferences/How you want answers', [['Formatting answers', [['Do not repeat my question back to me.', { kind: 'instruction', imp: 2 }], ['Use numbered steps for how to answers.', { kind: 'instruction', imp: 3 }]], [60, 290]]])
  place(w, 'folder:preferences/Tone of answers', [['Honest feedback', [['Be honest when my idea has a problem.', { kind: 'instruction', imp: 3 }]], [100, 290]]])
  place(w, 'folder:hobbies', [
    ['Learning ukulele', [two('I want to learn to play the ukulele.')]],
    ['Shows with Jess', [two('I watch Abbott Elementary with Jess.')]],
  ])
}

// ---------------------------------------------------------------- putting it together

/**
 * The memories whose chats the strip counts: the films' own lines, said
 * before anything else is made, which include the lines her About me is
 * made from. Nothing below adds a chat to them.
 */
const KEPT = new Set<string>()
const kept = (f: Fact): boolean => KEPT.has(f.key) || Boolean(f.core)

/** Chats about things she already told an AI, made until her chats come to TOTAL: she comes back to a topic. */
function revisits(w: Builder): void {
  const titles = ['More on', 'Back to', 'Quick question about', 'Notes on', 'Following up on', 'Help with']
  const facts = [...w.facts.values()].filter((f) => !kept(f) && f.importance >= 3 && !f.value && !f.sensitivity && !f.under.startsWith('folder:') && w.things.get(f.under)!.kind !== 'person')
  /** What a memory is filed on, as a chat's title names it. */
  const placeOf = (f: Fact): string => {
    const thing = w.things.get(f.under)!
    const up = thing.parent ? w.things.get(thing.parent)! : null
    // A part of something reads with what it is part of: "Notes on Tidepool launch day talk".
    return up && thing.kind !== 'person' && !thing.name.includes(up.name) ? `${up.name} ${lower(thing.name)}` : thing.name
  }
  while (w.chats.length < TOTAL) {
    const f = w.pick(facts)
    const at = placeOf(f)
    w.chat(`${w.pick(titles)} ${at}`, iso(w.int(5, 300)), [{ s: f.subject, text: f.text }])
  }
}

/**
 * Folds chats into one another until there are `target`: a later chat on
 * the same thing becomes part of the earlier one, as one chat often covers
 * a few weeks of the same work. The films' own chats stay as they are.
 */
function fold(w: Builder, target: number): void {
  const fixed = (c: Chat) => Boolean(c.platform) || !/^c\d{3}$/.test(c.key)
  const places = (c: Chat) => new Set(c.says.map((k) => [...w.facts.values()].find((f) => f.key === k)!.under))
  while (w.chats.length > target) {
    const open = w.chats.filter((c) => !fixed(c))
    const a = w.pick(open)
    const mine = places(a)
    const same = open.filter((b) => b !== a && [...places(b)].some((s) => mine.has(s)))
    const b = same.length ? w.pick(same) : null
    if (!b) continue
    const [first, later] = a.at <= b.at ? [a, b] : [b, a]
    for (const k of later.says) {
      const f = [...w.facts.values()].find((x) => x.key === k)!
      f.chats = [...new Set(f.chats.map((c) => (c === later.key ? first.key : c)))]
      if (!first.says.includes(k)) first.says.push(k)
    }
    w.chats.splice(w.chats.indexOf(later), 1)
  }
}

/** Each chat's AI: the films' own as they are, the rest dealt so the split comes to SPLIT. */
function platforms(w: Builder): void {
  const left = { ...SPLIT }
  for (const c of w.chats) if (c.platform) left[c.platform]--
  if (Object.values(left).some((n) => n < 0)) throw new Error('more fixed chats than the split allows')
  const deck = w.shuffle([...Array(left.chatgpt).fill('chatgpt'), ...Array(left.claude).fill('claude'), ...Array(left.gemini).fill('gemini')] as Platform[])
  for (const c of w.chats) if (!c.platform) c.platform = deck.pop()!
}

/** The sidebar's first chats, in the order the film's pages show them. */
const PINNED = [
  'Notion PM role', 'PearX interview prep', 'GitHub handles for the team', 'Applying to Stripe', 'History reading list', 'PHYS 137 lab 1 done', 'A coworker wedding',
  'Sparrowhawk database upgrade', 'SkipDoodle setup', 'Lisbon trip', 'Flight times for the trip', 'DATA 100 problem set due date', 'MATH 54 this term', 'Classes this term',
]

export function mayaWorld(seed = 0x3a7a2026): World {
  const w = new Builder(seed)
  filmed(w)
  KEPT.clear()
  for (const f of w.facts.values()) KEPT.add(f.key)
  school(w)
  work(w)
  projects(w)
  people(w)
  plans(w)
  life(w)
  interests(w)
  more(w)
  // The strip's memories are said only in chats the film names, with their AIs.
  for (const f of w.facts.values()) if (kept(f)) for (const c of f.chats) if (!w.chats.find((x) => x.key === c)!.platform) throw new Error(`"${f.text}" is said in a chat with no AI`)
  fold(w, TOTAL - 20)
  revisits(w)
  platforms(w)
  // A chat's day stays in her year, before the film's day.
  for (const c of w.chats) if (c.at > '2026-10-28T23:59:59Z') c.at = `2026-10-28${c.at.slice(10)}`
  const chats = [...w.chats].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
  const byTitle = new Map(chats.filter((c) => c.platform === 'chatgpt').map((c) => [c.title, c.key]))
  for (const t of PINNED) if (!byTitle.has(t)) throw new Error(`no ChatGPT chat "${t}"`)
  const pinned = PINNED.map((t) => byTitle.get(t)!)
  const rest = chats.filter((c) => c.platform === 'chatgpt' && !pinned.includes(c.key)).reverse().map((c) => c.key)
  const facts = [...w.facts.values()]
  // Each claim is unique for its subject, as the store keys it.
  const seen = new Set<string>()
  for (const f of facts) {
    let claim = f.claim
    for (let i = 2; seen.has(`${f.subject}|${claim}`); i++) claim = `${f.claim}_${i}`
    f.claim = claim
    seen.add(`${f.subject}|${claim}`)
  }
  return { things: [...w.things.values()], facts, chats, sidebar: [...pinned, ...rest] }
}

/** For a quick look: node maya-world.mts prints the counts. */
if (import.meta.url === `file://${process.argv[1]}`) {
  const m = mayaWorld()
  const by = (p: Platform) => m.chats.filter((c) => c.platform === p).length
  console.log(`${m.chats.length} chats (chatgpt ${by('chatgpt')}, claude ${by('claude')}, gemini ${by('gemini')}), ${m.things.length} things, ${m.facts.length} facts`)
  const taught = new Set(m.facts.flatMap((f) => f.chats))
  console.log(`chats that taught something: ${taught.size}`)
}
