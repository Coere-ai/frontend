/**
 * Maya Collins's world, as her memory holds it after a year of chats:
 * 324 chats (ChatGPT 148, Claude 102, Gemini 74) and the things and
 * memories they taught, from school, work, Tidepool and her side
 * projects to the people, plans, trips, health, money, home, hobbies and
 * food in her life. It is the same person the films show: the Smart
 * context film's interview, Tidepool and SkipDoodle, and the Cori chat
 * film's CS 162 project and the people she writes to.
 *
 * Seeded and deterministic: the same seed gives the same world. Most of
 * it is made from small pools and templates (her courses' weeks, the
 * people she knows, the companies she applied to), and the lines the
 * films show are written as the films say them. Nothing here imports
 * coere-v2; maya-memory.mts writes it into a real memory store.
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
/** "2026-10-14" from a day of 2026 counted from Jan 1 (0). */
const iso = (dayOfYear: number, year = 2026): string => new Date(Date.UTC(year, 0, 1 + dayOfYear)).toISOString().slice(0, 10)
const doy = (date: string): number => Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${date.slice(0, 4)}-01-01T00:00:00Z`)) / 86_400_000)
/** "Oct 14" for a date. */
const short = (date: string): string => `${MONTHS[Number(date.slice(5, 7)) - 1]} ${Number(date.slice(8, 10))}`
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

// ---------------------------------------------------------------- the films' own lines

/** What the Smart context film shows and the Cori chat film asks about, said in the chats the films name. */
function filmed(w: Builder): void {
  w.thing('tidepool', 'Tidepool', 'project', 'projects/Startups and businesses', 5)
  w.thing('pearx', 'PearX interview', 'event', 'projects/Startups and businesses', 5)
  w.thing('launch', 'Tidepool launch day talk', 'event', 'projects/Startups and businesses', 4)
  w.thing('stripe', 'Stripe application', 'task', 'work/Job applications', 4)
  w.thing('notion', 'Notion PM role', 'task', 'work/Job applications', 3)
  w.thing('skipdoodle', 'SkipDoodle', 'project', 'projects/Software and apps', 4)
  w.thing('sparrowhawk', 'Sparrowhawk', 'project', 'projects/Software and apps', 4)
  w.thing('kitchen', 'Kitchen remodel', 'project', 'projects/Home projects', 3)
  w.thing('kestrel', 'Kestrel Analytics', 'organization', 'work', 5, ['Kestrel'])
  w.thing('iris', 'Iris Sato', 'person', 'people/Coworkers and work contacts', 4)

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
  w.chat('Tidepool one line pitch', '2026-07-02', [tide.what, say('tidepool', 'The one line pitch is online booking for small clinics that still run on the phone.', { imp: 3 })], 'claude')
  w.chat('Cofounder agreement', '2026-03-12', [tide.team, say('iris', 'Iris Sato and I split Tidepool equity evenly.', { imp: 3 })], 'chatgpt')
  w.chat('Pre seed round notes', '2026-06-08', [tide.money, say('tidepool', 'Hearth Ventures led the Tidepool pre seed, with two angels.', { imp: 3 })], 'gemini')
  w.chat('Tidepool metrics for October', '2026-10-03', [tide.users, say('tidepool', 'Tidepool grows about 15 percent a month.', { imp: 4 })], 'chatgpt')

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
  const style = mine('style/Short warm sentences', 'When I write, I use short warm sentences and never use exclamation marks.', { kind: 'style', imp: 5, core: true })
  w.chat('Kestrel first week', '2026-01-12', [job, say('kestrel', 'Kestrel Analytics does research studies for health and city clients.', { imp: 4 })], 'claude')
  w.chat('Rewrite my LinkedIn summary', '2026-02-03', [job, name, style], 'chatgpt')
  w.chat('Cover letter for Stripe', '2026-09-09', [name, job, stripe], 'claude')
  w.chat('Edit this email to Nadia', '2026-05-14', [style, say('kestrel', 'Kestrel Analytics has about forty people in its Oakland office.', { imp: 2 })], 'gemini')
  w.chat('Make this sound like me', '2026-07-21', [style, mine('style/Greetings and sign offs', 'I sign my emails with Thanks, then my first name.', { kind: 'style', imp: 3 })], 'claude')

  // The Cori chat film: the people she writes to, the course's due date and the clinic's form (coere-v2 tools/gen-fake-memory/maya).
  w.thing('sam_lee', 'Sam Lee', 'person', 'people/Classmates and teachers', 3)
  w.thing('priya_raman', 'Priya Raman', 'person', 'people/Classmates and teachers', 3)
  w.thing('jordan', 'Jordan Ellis', 'person', 'people/Service providers', 3)
  w.thing('reyes', 'Daniel Reyes', 'person', 'people/Classmates and teachers', 3, ['Professor Reyes', 'Prof. Reyes'])
  w.thing('alex_kim', 'Alex Kim', 'person', 'people/Friends', 3)
  w.thing('nora', 'Nora Patel', 'person', 'people/Service providers', 3)
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
    mine('personal/Contact details', 'My email is maya.collins@gmail.com.', { claim: 'email', value: { type: 'email', email: 'maya.collins@gmail.com' }, specific: { type: 'email', text: 'maya.collins@gmail.com' } }),
    mine('personal/Contact details', 'My cell is (510) 555-0142.', { claim: 'phone', value: { type: 'phone', phone: '(510) 555-0142' }, specific: { type: 'phone', text: '(510) 555-0142' } }),
    mine('personal', 'My date of birth is 2005-03-14.', { claim: 'birth_date' }),
    mine('personal/Contact details', 'My street address is 2412 Durant Ave, Apt 3, Berkeley, California 94704.', { claim: 'street_address', sens: 'location' }),
  ], 'claude', 'maya-clinic')
}

// ---------------------------------------------------------------- school

interface Course {
  key: string
  code: string
  folder: string
  prof: [key: string, name: string]
  meets: string
  term: 'fall' | 'spring'
  /** What each week's work was on. */
  weeks: string[]
  work: 'Lab' | 'Problem Set' | 'Homework'
  extra?: string[]
}

const FALL: Course[] = [
  {
    key: 'data100', code: 'DATA 100', folder: 'school/Classes and subjects/Data science', prof: ['prof_kim', 'Prof. Kim'], meets: 'Tuesday and Thursday at 11', term: 'fall', work: 'Lab',
    weeks: ['pandas basics', 'data cleaning', 'joins and groupby', 'visualization', 'sampling', 'linear regression', 'feature engineering', 'cross validation', 'logistic regression', 'PCA'],
    extra: ['DATA 100 Project 1 uses the housing data.', 'DATA 100 Project 2 uses the Bay Area transit data.'],
  },
  {
    key: 'math54', code: 'MATH 54', folder: 'school/Classes and subjects/Mathematics', prof: ['prof_hartmann', 'Prof. Hartmann'], meets: 'Monday, Wednesday and Friday at 9', term: 'fall', work: 'Problem Set',
    weeks: ['row reduction', 'matrix algebra', 'determinants', 'vector spaces', 'eigenvalues', 'diagonalization', 'orthogonality', 'least squares', 'first order ODEs'],
  },
  {
    key: 'phys137', code: 'PHYS 137', folder: 'school/Classes and subjects/Physics', prof: ['prof_alvarez', 'Prof. Alvarez'], meets: 'Tuesday and Thursday at 2', term: 'fall', work: 'Problem Set',
    weeks: ['waves', 'interference', 'diffraction', 'the photoelectric effect', 'the Bohr model', 'wave functions', 'the infinite well', 'tunneling'],
  },
  {
    key: 'cs162', code: 'CS 162', folder: 'school/Classes and subjects/Computer science', prof: ['reyes', 'Professor Reyes'], meets: 'Monday and Wednesday at 4', term: 'fall', work: 'Homework',
    weeks: ['processes', 'threads', 'locks', 'semaphores', 'scheduling', 'deadlock', 'virtual memory', 'caching'],
  },
]

const SPRING: Array<{ key: string; code: string; folder: string; grade: string; items: Array<[string, string]> }> = [
  { key: 'cs61b', code: 'CS 61B', folder: 'school/Classes and subjects/Computer science', grade: 'an A minus', items: [['Project 1', 'CS 61B Project 1 was a deque in Java.'], ['Project 2', 'CS 61B Project 2 was Gitlet, a small version control system.'], ['Final', 'The CS 61B final was on May 12.']] },
  { key: 'stat20', code: 'STAT 20', folder: 'school/Classes and subjects/Mathematics', grade: 'an A', items: [['Midterm', 'I got a 91 on the STAT 20 midterm.'], ['Final project', 'My STAT 20 final project looked at BART delays.']] },
  { key: 'econ1', code: 'ECON 1', folder: 'school/Classes and subjects/Economics', grade: 'a B plus', items: [['Problem Set 3', 'ECON 1 Problem Set 3 was on supply shocks.'], ['Final', 'The ECON 1 final was open note.']] },
  { key: 'r1b', code: 'ENGLISH R1B', folder: 'school/Classes and subjects/English and writing', grade: 'an A minus', items: [['Research essay', 'My R1B research essay was on public libraries.'], ['Essay 2', 'R1B Essay 2 was a close reading of a short story.']] },
]

/** The fall's start: week 1's work is due Aug 22. */
const WEEK1 = doy('2026-08-22')
const TODAY = doy('2026-10-29')

function school(w: Builder): void {
  w.thing('prof_kim', 'Prof. Kim', 'person', 'people/Classmates and teachers', 2)
  w.thing('prof_hartmann', 'Prof. Hartmann', 'person', 'people/Classmates and teachers', 2)
  w.thing('prof_alvarez', 'Prof. Alvarez', 'person', 'people/Classmates and teachers', 2)
  w.thing('berkeley', 'UC Berkeley', 'organization', 'school/Schools attended', 4, ['Cal'])
  const rooms = ['Soda 306', 'Evans 10', 'Wheeler 150', 'Dwinelle 155', 'Physics 1']
  const term = say('berkeley', "I'm taking DATA 100, MATH 54, PHYS 137 and CS 162 this term.", { imp: 4 })
  w.chat('Classes this term', '2026-08-25', [term, mine('school/Academic life', 'I am a third year data science major at UC Berkeley.', { imp: 5, core: true })], 'chatgpt')
  w.chat('Fall schedule check', '2026-08-18', [term, mine('school/Academic life', 'I keep Friday afternoons free for Tidepool.', { imp: 3 })])
  w.chat('Data science major requirements', '2026-04-02', [
    mine('school/Academic life', 'I am a third year data science major at UC Berkeley.', { imp: 5, core: true }),
    mine('school/Academic life', 'I still need one domain emphasis course for the data science major.', { imp: 3 }),
  ])
  w.chat('Minor in public health', '2026-04-20', [mine('school/Academic life', 'I am thinking about a public health minor.', { imp: 2 })])
  w.chat('Meeting my advisor', '2026-09-16', [mine('school/Academic life', 'My advisor is Dr. Okonkwo and we meet once a term.', { imp: 2 }), mine('school/Academic life', 'I plan to graduate in May 2028.', { imp: 4 })])

  for (const c of FALL) {
    w.thing(c.key, c.code, 'course', c.folder, 4)
    const facts = [
      say(c.key, `${c.code} meets ${c.meets}.`, { imp: 3 }),
      say(c.prof[0], `${c.prof[1]} teaches ${c.code}.`, { imp: 3 }),
      say(c.key, `${c.code} office hours are on ${w.pick(['Monday', 'Tuesday', 'Wednesday', 'Thursday'])} at ${w.int(1, 5)} in ${w.pick(rooms)}.`, { imp: 2 }),
      say(c.key, `The ${c.code} final is on December ${w.int(14, 18)}.`, { kind: 'event', imp: 4 }),
      say(c.key, `${c.code} grades are ${w.pick(['40 percent', '30 percent', '50 percent'])} homework and the rest exams.`, { imp: 2 }),
    ]
    w.chat(`${c.code} this term`, iso(WEEK1 - w.int(1, 4)), facts.slice(0, 3), c.code === 'MATH 54' ? 'chatgpt' : undefined)
    w.chat(`${c.code} grading`, iso(WEEK1 + w.int(3, 10)), facts.slice(3))
    if (c.code === 'MATH 54') w.chat('MATH 54 this term', '2026-08-27', [say('math54', 'MATH 54 homework is graded on effort.', { imp: 3 })], 'chatgpt')
    if (c.code === 'PHYS 137') w.chat('PHYS 137 lab 1 done', '2026-09-08', [say('phys137', 'PHYS 137 lab 1 is done.', { imp: 2 })], 'chatgpt')
    // Each week's work: done ones with what it was on and how it went, the next ones with a due date.
    let pending: Say[] = []
    let last = ''
    c.weeks.forEach((topic, i) => {
      const n = i + 1
      const due = iso(WEEK1 + 7 * i + (c.key === 'phys137' ? 0 : c.key === 'math54' ? -1 : c.key === 'cs162' ? 1 : 0))
      const name = `${c.work} ${n}`
      const key = `${c.key}_${slug(name)}`
      w.thing(key, name, 'task', { parent: c.key }, doy(due) >= TODAY ? 4 : 2)
      const done = doy(due) < TODAY
      const said: Say[] = [say(key, `${c.code} ${name} is on ${topic}.`, { imp: 2 })]
      if (c.key !== 'cs162' || !done) said.push(say(key, `${c.code} ${name} is due ${short(due)}.`, done ? { imp: 2 } : { imp: 4, due }))
      if (done && w.rand() < 0.5) said.push(say(key, `I got ${w.pick(['full credit', 'a 9 out of 10', 'an 8 out of 10', '18 out of 20'])} on ${c.code} ${name}.`, { imp: 2 }))
      pending.push(...said)
      last = due
      if (pending.length >= 3 || i === c.weeks.length - 1) {
        const verb = w.pick(['help', 'questions', 'check', 'notes', 'hints', 'review'])
        w.chat(`${c.code} ${name.toLowerCase()} ${verb}`, iso(doy(last) - w.int(1, 4)), pending)
        pending = []
      }
    })
    w.thing(`${c.key}_midterm`, 'Midterm', 'event', { parent: c.key }, 3)
    const mid = iso(WEEK1 + 40 + w.int(0, 6))
    w.chat(`Studying for the ${c.code} midterm`, iso(doy(mid) - 3), [say(`${c.key}_midterm`, `The ${c.code} midterm is on ${short(mid)}.`, { imp: 3 })])
    w.chat(`${c.code} midterm results`, iso(doy(mid) + 6), [say(`${c.key}_midterm`, `I got a ${w.int(78, 94)} on the ${c.code} midterm.`, { imp: 3 })])
  }
  // DATA 100's projects, CS 162's three projects and the history reading list.
  w.thing('data100_p1', 'Project 1', 'project', { parent: 'data100' }, 3)
  w.thing('data100_p2', 'Project 2', 'project', { parent: 'data100' }, 4)
  w.chat('DATA 100 project 1 cleaning', '2026-09-18', [say('data100_p1', 'DATA 100 Project 1 uses the housing data.', { imp: 3 }), say('data100_p1', 'I got 47 out of 50 on DATA 100 Project 1.', { imp: 2 })])
  w.chat('DATA 100 project 2 plan', '2026-10-21', [say('data100_p2', 'DATA 100 Project 2 uses the Bay Area transit data.', { imp: 3 }), say('data100_p2', 'DATA 100 Project 2 is due Nov 20.', { imp: 4, due: '2026-11-20' })])
  w.chat('DATA 100 problem set due date', '2026-08-30', [say('data100', 'Problem Set 1 for DATA 100 is due Sep 5.', { imp: 2 })], 'chatgpt')
  w.thing('cs162_p1', 'CS 162 project 1', 'project', { parent: 'cs162' }, 3)
  w.thing('cs162_p2', 'CS 162 project 2', 'project', { parent: 'cs162' }, 3)
  w.thing('cs162_p3', 'CS 162 project 3', 'project', { parent: 'cs162' }, 4)
  w.chat('CS 162 project 1 user programs', '2026-09-14', [say('cs162_p1', 'CS 162 project 1 was user programs in Pintos.', { imp: 2 }), say('cs162_p1', 'Our group got a 92 on CS 162 project 1.', { imp: 2 })])
  w.chat('CS 162 project 2 threads', '2026-10-05', [say('cs162_p2', 'CS 162 project 2 was the thread scheduler.', { imp: 2 }), say('sam_lee', 'Sam Lee pushed the lock fixes for our scheduler.', { imp: 2 })])
  w.chat('CS 162 deadlines', '2026-10-14T18:00:00Z', [
    say('cs162_p3', 'CS 162 project 3 is due November 13.', { kind: 'task', imp: 4, due: '2026-11-13', specific: { type: 'date', text: 'November 13' } }),
    mine('personal', 'I live in Berkeley.', { imp: 4, claim: 'city', core: true }),
  ], 'claude', 'maya-school')
  w.chat('CS 162 project 3 file system', '2026-10-26', [say('cs162_p3', 'CS 162 project 3 is the file system.', { imp: 3 }), say('cs162_p3', 'The CS 162 project 3 design review is on November 3.', { imp: 3 })])
  w.thing('history', 'History reading list', 'topic', 'school/Classes and subjects/History', 2)
  w.chat('History reading list', '2026-09-03', [say('history', 'The history reading list has six books for the term.', { imp: 2 })], 'chatgpt')
  w.chat('Reading list book two', '2026-09-24', [say('history', 'The second book on the history reading list is about the Gold Rush.', { imp: 2 })])
  w.thing('study_group', 'CS 162 study group', 'group', 'school/Studying', 3)
  w.chat('Study group plan', '2026-10-01', [say('study_group', 'The CS 162 study group meets Thursday at 6 in Soda 405.', { imp: 3 }), say('priya_raman', 'Priya Raman runs the CS 162 study group.', { imp: 2 })])
  w.thing('tutoring', 'DATA 8 tutoring', 'task', 'school/Campus life', 3)
  w.chat('Tutoring hours', '2026-09-02', [say('tutoring', 'I tutor DATA 8 students on Monday evenings.', { imp: 3 }), say('tutoring', 'Tutoring pays 22 dollars an hour.', { imp: 2, sens: 'finance' })])

  for (const c of SPRING) {
    w.thing(c.key, c.code, 'course', c.folder, 2)
    w.chat(`${c.code} final grade`, iso(doy('2026-05-20') + w.int(0, 8)), [say(c.key, `I took ${c.code} last spring and got ${c.grade}.`, { imp: 2 })])
    for (const [name, text] of c.items) {
      const key = `${c.key}_${slug(name)}`
      w.thing(key, name, 'task', { parent: c.key }, 2)
      w.chat(`${c.code} ${name.toLowerCase()}`, iso(doy('2026-02-01') + w.int(0, 100)), [say(key, text, { imp: 2 })])
    }
  }
}

// ---------------------------------------------------------------- people

const FRIENDS: Array<[string, string]> = [
  ['lena', 'Lena Delacroix'], ['caleb', 'Caleb Moreau'], ['omar', 'Omar Haddad'], ['silas', 'Silas Haddad'], ['june', 'June Park'], ['marcus', 'Marcus Bell'],
  ['tess', 'Tess Whitaker'], ['ravi', 'Ravi Menon'], ['hana', 'Hana Ito'], ['diego', 'Diego Ruiz'], ['nina', 'Nina Kowalski'], ['ellie', 'Ellie Brandt'],
]
const COWORKERS: Array<[string, string, string]> = [
  ['nadia', 'Nadia Reyes', 'my manager at Kestrel Analytics'], ['priya_okafor', 'Priya Okafor', 'the head of the design team at Kestrel'], ['dana', 'Dana Brooks', 'a research analyst at Kestrel'],
  ['owen', 'Owen Fischer', 'a data engineer at Kestrel'], ['amara', 'Amara Osei', 'a survey lead at Kestrel'], ['ben_k', 'Ben Kaplan', 'the client lead for health studies at Kestrel'],
  ['leah', 'Leah Moran', 'an intern on my team at Kestrel'], ['victor', 'Victor Chen', 'the head of research at Kestrel'],
]
const CLASSMATES: Array<[string, string, string]> = [
  ['zoe', 'Zoe Martin', 'DATA 100'], ['kenji', 'Kenji Watanabe', 'MATH 54'], ['aisha', 'Aisha Rahman', 'PHYS 137'], ['luca', 'Luca Romano', 'DATA 100'], ['grace', 'Grace Liu', 'MATH 54'], ['tom', 'Tom Becker', 'PHYS 137'],
]
const FAMILY: Array<[string, string, string, string]> = [
  ['mom', 'Ellen Collins', 'Parents', 'My mom, Ellen Collins, is a nurse in Sacramento.'],
  ['dad', 'Mark Collins', 'Parents', 'My dad, Mark Collins, teaches high school history.'],
  ['theo', 'Theo Collins', 'Siblings', 'My brother Theo is a high school senior.'],
  ['grandma', 'Rose Collins', 'Grandparents', 'My grandma Rose lives in Fresno.'],
  ['aunt', 'Carol Diaz', 'Extended family', 'My aunt Carol hosts Thanksgiving every year.'],
  ['ben_cousin', 'Ben Diaz', 'Extended family', 'My cousin Ben is studying nursing in San Diego.'],
]
const ORIGINS = ['high school in Sacramento', 'my freshman dorm', 'Tuesday soccer', 'the climbing gym', 'my R1B class', 'Kestrel', 'a hackathon last year']
const CITIES = ['Oakland', 'San Francisco', 'Sacramento', 'Portland', 'Seattle', 'Los Angeles', 'Davis', 'Berkeley']
const INTO = ['pottery', 'trail running', 'jazz records', 'film photography', 'board games', 'baking bread', 'birding', 'rock climbing', 'chess', 'thrifting']
const JOBS = ['Airtable', 'a design studio', 'Kaiser', 'a climate startup', 'the city library', 'Lyft', 'a law firm', 'a coffee roaster']

function people(w: Builder): void {
  const day = () => `${FULL[w.int(0, 11)]} ${w.int(1, 28)}`
  for (const [key, name] of FRIENDS) w.thing(key, name, 'person', 'people/Friends', key === 'lena' ? 4 : 2)
  w.chat('Gift for Lena', '2026-04-06', [say('lena', 'Lena Delacroix is my oldest friend from school.', { imp: 4 }), say('lena', 'Lena loves anything with lemons.', { imp: 2 })], 'gemini')
  w.chat('Omar and Lena', '2026-06-14', [say('omar', 'Omar Haddad is marrying Lena in December.', { imp: 3 }), say('silas', "Silas Haddad is Omar's brother.", { imp: 2 })], 'gemini')
  w.chat('Soccer friends', '2026-03-03', [say('caleb', 'Caleb Moreau plays Tuesday soccer with me.', { imp: 2 })])
  for (const [key, name] of FRIENDS.slice(4)) {
    const first = name.split(' ')[0]!
    const said = [
      say(key, `${name} is my friend from ${w.pick(ORIGINS)}.`, { imp: 3 }),
      say(key, `${first} lives in ${w.pick(CITIES)}.`, { imp: 2 }),
    ]
    if (w.rand() < 0.7) said.push(say(key, `${first}'s birthday is ${day()}.`, { kind: 'event', imp: 3, sens: 'relationships' }))
    if (w.rand() < 0.6) said.push(say(key, `${first} is really into ${w.pick(INTO)}.`, { imp: 2 }))
    w.chat(w.pick([`Birthday idea for ${first}`, `Plans with ${first}`, `Text to ${first}`, `Catching up with ${first}`]), iso(w.int(10, 290)), said.slice(0, 2))
    w.chat(w.pick([`What to get ${first}`, `${first} visit`, `Dinner with ${first}`]), iso(w.int(10, 295)), said.slice(2).length ? said.slice(2) : [said[0]!])
    if (w.rand() < 0.5) w.chat(`${first} just got a new job`, iso(w.int(60, 298)), [say(key, `${first} just started a job at ${w.pick(JOBS)}.`, { imp: 2 })])
  }
  for (const [key, name, role] of COWORKERS) {
    w.thing(key, name, 'person', 'people/Coworkers and work contacts', key === 'nadia' ? 4 : 2)
    const first = name.split(' ')[0]!
    w.chat(w.pick([`Working with ${first}`, `Message for ${first}`, `${first} feedback`]), iso(w.int(12, 298)), [
      say(key, `${name} is ${role}.`, { imp: key === 'nadia' ? 4 : 3 }),
      ...(w.rand() < 0.6 ? [say(key, `${first} ${w.pick(['prefers Slack over email', 'works from the Oakland office on Tuesdays', 'reviews my survey drafts', 'runs the Friday data review', 'is out on leave in December'])}.`, { imp: 2 })] : []),
    ])
  }
  w.chat('Wedding gift for Dana', '2026-10-01', [say('dana', 'Dana Brooks is a coworker getting married in May.', { imp: 3 })])
  w.chat('One on one with Nadia', '2026-09-11', [say('nadia', 'Nadia wants my clinic study draft by the end of November.', { imp: 4, due: '2026-11-30' }), say('nadia', 'Nadia Reyes is my manager at Kestrel Analytics.', { imp: 4 })])
  for (const [key, name, course] of CLASSMATES) {
    w.thing(key, name, 'person', 'people/Classmates and teachers', 2)
    const first = name.split(' ')[0]!
    w.chat(w.pick([`Study session with ${first}`, `${course} with ${first}`, `Splitting the ${course} work`]), iso(WEEK1 + w.int(5, 55)), [
      say(key, `${name} is in my ${course} section.`, { imp: 2 }),
      say(key, `${first} and I study for ${course} on ${w.pick(['Sundays', 'Monday nights', 'Wednesdays', 'Friday mornings'])}.`, { imp: 2 }),
    ])
  }
  for (const [key, name, folder, line] of FAMILY) {
    w.thing(key, name, 'person', `people/Family/${folder}`, key === 'mom' || key === 'theo' ? 4 : 3)
    w.chat(w.pick([`Call with ${name.split(' ')[0]}`, `Note for ${name.split(' ')[0]}`, `Family update`]), iso(w.int(5, 290)), [say(key, line, { imp: 3, sens: 'relationships' })])
  }
  w.chat("Theo's college essays", '2026-10-11', [say('theo', 'Theo is applying to UC Davis and Cal Poly.', { imp: 3 }), say('theo', "Theo's college applications are due November 30.", { imp: 4, due: '2026-11-30' })])
  w.chat("Mom's birthday", '2026-02-10', [say('mom', "My mom's birthday is February 22.", { kind: 'event', imp: 4 }), say('mom', 'My mom likes orchids and mystery novels.', { imp: 2 })])
  w.chat('Thanksgiving at Aunt Carol', '2026-10-20', [say('aunt', 'Thanksgiving is at Aunt Carol in Sacramento again this year.', { kind: 'event', imp: 3 })])
  w.thing('elena', 'Elena Lindqvist', 'person', 'people/Coworkers and work contacts/Mentors', 3)
  w.chat('Mentor questions', '2026-03-22', [say('elena', 'Elena Lindqvist is a mentor from my last job.', { imp: 3 }), say('elena', 'Elena runs product at a health startup in San Francisco.', { imp: 2 })], 'gemini')
  w.chat('Coffee with Elena', '2026-10-23', [say('elena', 'Elena thinks I should lead with Tidepool in interviews.', { imp: 2 })])
  w.thing('jess', 'Jess Moreno', 'person', 'people/Neighbors and community', 3)
  w.thing('gary', 'Gary Novak', 'person', 'people/Service providers', 2)
  w.thing('luis', 'Luis Ortega', 'person', 'people/Service providers', 2)
  w.thing('dr_lin', 'Dr. Lin', 'person', 'people/Service providers', 2)
  w.chat('Roommate chores', '2026-02-18', [say('jess', 'Jess Moreno is my roommate on Durant Ave.', { imp: 3 }), say('jess', 'Jess and I split chores by week.', { imp: 2 })])
  w.chat('Email to the landlord', '2026-01-28', [say('gary', 'Gary Novak is my landlord.', { imp: 2 })])
  w.chat("Mom's kitchen contractor", '2026-05-02', [say('luis', "Luis Ortega is the contractor on my mom's kitchen remodel.", { imp: 2 })])
  w.chat('Dentist reminder', '2026-03-09', [say('dr_lin', 'Dr. Lin is my dentist on Shattuck.', { imp: 2, sens: 'health' })])
  w.chat('Logo feedback for Jordan', '2026-09-26', [say('jordan', 'Jordan Ellis is trying a darker blue for the Tidepool logo.', { imp: 2 })])
  w.chat('Iris and the backend', '2026-05-27', [say('iris', 'Iris Sato is my cofounder at Tidepool and writes the code.', { imp: 4 }), say('iris', 'Iris likes Tesselcrest and plays it every Friday.', { imp: 2 })], 'gemini')
}

// ---------------------------------------------------------------- work

const STUDIES: Array<[string, string, string, string]> = [
  ['clinic_study', 'Clinic wait times study', 'Harbor Health', 'Median clinic wait times went up 12 minutes since spring.'],
  ['rent_survey', 'Bay Area rent survey', 'the city of Oakland', 'Renters under 30 spend 46 percent of their income on rent.'],
  ['transit', 'Transit ridership dashboard', 'AC Transit', 'Weekend ridership is back to 90 percent of 2019.'],
  ['food_security', 'Student food security study', 'the Berkeley Food Pantry', 'One in three students skipped a meal for money last term.'],
  ['hiring', 'Small business hiring report', 'the Oakland Chamber', 'Half the shops we surveyed want to hire this winter.'],
  ['library', 'Library usage study', 'the Berkeley Public Library', 'Evening visits doubled after the hours changed.'],
]
const COMPANIES: Array<[string, string, string[]]> = [
  ['figma', 'Figma', ['I applied to Figma for the data analyst intern role.', 'Figma said no to my application in October.']],
  ['airbnb', 'Airbnb', ['I applied to Airbnb for the analytics intern role.', 'The Airbnb phone screen was on October 2.']],
  ['duolingo', 'Duolingo', ['I applied to Duolingo for the data science intern role on September 30.']],
  ['databricks', 'Databricks', ['I finished the Databricks online assessment.', 'Databricks wants a take home by November 10.']],
  ['lyft', 'Lyft', ['I applied to Lyft for the data intern role and have not heard back.']],
  ['plaid', 'Plaid', ['Caleb referred me to Plaid for the analytics role.']],
  ['asana', 'Asana', ['I applied to Asana for the product analyst intern role.']],
  ['instacart', 'Instacart', ['I withdrew my Instacart application.']],
]

function work(w: Builder): void {
  w.thing('weekly', 'Weekly reports', 'topic', { parent: 'kestrel' }, 3)
  w.chat('Kestrel team and hours', '2026-01-15', [
    mine('work', 'I work at Kestrel Analytics 20 hours a week, Monday to Wednesday.', { imp: 4 }),
    say('kestrel', 'Kestrel Analytics is in downtown Oakland.', { imp: 3 }),
  ], 'claude')
  w.chat('Tools at Kestrel', '2026-02-09', [say('kestrel', 'Kestrel uses BigQuery, dbt and Tableau.', { imp: 3 }), mine('work', 'I write most of my Kestrel queries in SQL.', { imp: 2 })])
  w.chat('Raise at Kestrel', '2026-07-08', [mine('work', 'I got a raise to 32 dollars an hour at Kestrel in July.', { imp: 3, sens: 'finance' }), mine('work', 'I was promoted to lead research assistant in July.', { imp: 4 })])
  for (const [key, name, client, finding] of STUDIES) {
    w.thing(key, name, 'project', { parent: 'kestrel' }, key === 'clinic_study' ? 4 : 3)
    const start = w.int(15, 270)
    w.chat(`${name} kickoff`, iso(start), [say(key, `The ${lower(name)} is for ${client}.`, { imp: 3 })])
    w.chat(w.pick([`${name} findings`, `Charts for the ${lower(name)}`, `${name} write up`]), iso(Math.min(start + w.int(10, 40), 300)), [say(key, finding, { imp: 3 })])
    if (w.rand() < 0.6) w.chat(`${name} survey questions`, iso(Math.min(start + w.int(2, 9), 300)), [say(key, `The ${lower(name)} surveyed ${w.int(3, 18) * 100} people.`, { imp: 2 })])
  }
  // Her weekly reports: each its own chat, Friday by Friday.
  const topics = ['response rates', 'the clinic survey launch', 'cleaning the wait times data', 'the rent survey pilot', 'dashboard fixes', 'the transit data refresh', 'survey weighting', 'the food pantry interviews', 'the hiring report draft', 'library foot traffic', 'chart reviews', 'the clinic study draft']
  topics.forEach((topic, i) => {
    const key = `report_${i + 1}`
    w.thing(key, `Weekly Report ${i + 1}`, 'task', { parent: 'weekly' }, i >= topics.length - 2 ? 3 : 2)
    const due = iso(doy('2026-08-14') + 7 * i)
    w.chat(`Weekly report ${i + 1} draft`, iso(doy(due) - 1), [
      say(key, `Weekly report ${i + 1} covered ${topic}.`, { imp: 2 }),
      ...(doy(due) >= TODAY - 1 ? [say(key, `Weekly report ${i + 1} is due ${short(due)} at noon.`, { imp: 3, due })] : []),
    ])
  })
  w.chat('Weekly report format', '2026-08-12', [say('weekly', 'Weekly reports are due Friday at noon.', { imp: 3 }), say('weekly', 'Weekly reports have three parts: done, next and blocked.', { imp: 2 })])
  w.thing('github', 'GitHub handles for the team', 'topic', 'work', 2)
  w.chat('GitHub handles for the team', '2026-10-25', [say('github', "The team's GitHub handles are in the shared doc.", { imp: 2 }), say('github', 'Iris is irissato on GitHub.', { imp: 2 })], 'chatgpt')
  w.thing('sabletide', 'Sabletide', 'organization', { parent: 'kestrel' }, 2)
  w.chat('Data vendor contract', '2026-04-15', [say('sabletide', 'Sabletide is the data vendor Kestrel uses.', { imp: 2 }), say('sabletide', 'The Sabletide contract renews in January.', { imp: 2 })])

  for (const [key, name, lines] of COMPANIES) {
    w.thing(key, `${name} application`, 'task', 'work/Job applications', 3)
    w.chat(w.pick([`Applying to ${name}`, `${name} cover letter`, `${name} application questions`]), iso(w.int(240, 290)), [say(key, lines[0]!, { imp: 3 })])
    if (lines[1]) w.chat(`${name} next steps`, iso(w.int(270, 300)), [say(key, lines[1], { imp: 3, ...(key === 'databricks' ? { due: '2026-11-10' } : {}) })])
  }
  w.thing('resume', 'Resume', 'document', 'work/Job search', 3)
  w.chat('Tighten my resume', '2026-08-28', [say('resume', 'My resume leads with the Kestrel clinic study.', { imp: 3 }), say('resume', 'I keep my resume to one page.', { imp: 2 })])
  w.chat('Resume bullet for Tidepool', '2026-09-05', [say('resume', 'My resume says I grew Tidepool to 1,200 weekly users.', { imp: 2 })])
  w.chat('Internship timeline', '2026-08-31', [mine('work/Job search', 'I want a data internship for summer 2027.', { kind: 'goal', imp: 4 })])
}

// ---------------------------------------------------------------- projects

function projects(w: Builder): void {
  const clinics: Array<[string, string, string]> = [
    ['orrinwood', 'Orrinwood Family Clinic', 'Orrinwood Family Clinic was the first Tidepool pilot.'],
    ['bayview', 'Bayview Pediatrics', 'Bayview Pediatrics books about 300 visits a week on Tidepool.'],
    ['elm_dental', 'Elm Street Dental', 'Elm Street Dental joined the Tidepool pilot in July.'],
    ['lakeside', 'Lakeside Physical Therapy', 'Lakeside Physical Therapy wants text reminders from Tidepool.'],
  ]
  w.thing('pilot', 'Pilot clinics', 'topic', { parent: 'tidepool' }, 4)
  for (const [key, name, line] of clinics) {
    w.thing(key, name, 'organization', { parent: 'pilot' }, 3)
    w.chat(`${name} check in`, iso(w.int(120, 295)), [say(key, line, { imp: 3 }), say(key, `${name} pays the pilot price of 199 dollars a month.`, { imp: 2 })])
  }
  w.thing('orrinwood_st', 'Orrinwood', 'place', 'knowledge/Geography and places', 2)
  w.chat('Clinic address', '2026-04-11', [say('orrinwood_st', 'Orrinwood is the street the clinic is on.', { imp: 2 })])
  const parts: Array<[string, string, ThingKind, string[]]> = [
    ['tp_pricing', 'Pricing', 'topic', ['Tidepool charges clinics 199 dollars a month.', 'We want a per seat price for bigger clinics next year.']],
    ['tp_investors', 'Investor updates', 'document', ['I send Tidepool investors an update on the first Monday of each month.', 'The October investor update leads with the 15 percent growth.']],
    ['tp_hiring', 'Hiring plan', 'topic', ['We want to hire a part time designer for Tidepool in January.', 'Tidepool can afford one hire before the seed round.']],
    ['tp_logo', 'Tidepool logo', 'project', ['The Tidepool logo is a small wave in teal.']],
    ['tp_seed', 'Seed round', 'project', ['Tidepool plans to raise a seed round in the spring.', 'The seed round target is 1.5 million dollars.']],
    ['tp_goals', 'Tidepool goals', 'topic', ['Tidepool wants ten clinics by March.', 'Tidepool needs text reminders before the seed round.']],
    ['tp_tablets', 'Front desk tablets', 'product', ['Ferrostone makes the clinic tablets.', 'Each pilot clinic got one Tidepool tablet.']],
    ['tp_growth', 'Weekly users', 'topic', ['Tidepool had 400 weekly users in May.', 'Tidepool reached 800 weekly users in July.']],
  ]
  for (const [key, name, kind, lines] of parts) {
    w.thing(key, name, kind, { parent: 'tidepool' }, 3)
    lines.forEach((line, i) => w.chat(i === 0 ? `Tidepool ${name.toLowerCase().replace(/^tidepool /, '')}` : w.pick([`${name} again`, `Thinking about ${name.toLowerCase()}`, `Tidepool ${name.toLowerCase()} notes`]), iso(w.int(90, 299)), [say(key, line, { imp: 3 })]))
  }
  w.chat('Investor update October', '2026-10-06', [say('tidepool', 'Tidepool has 1,200 weekly users across four clinics.', { imp: 5 }), say('tp_investors', 'The October investor update leads with the 15 percent growth.', { imp: 3 })], 'claude')
  w.chat('Working on Tidepool tonight', '2026-09-30', [mine('projects', 'I spend most evenings on Tidepool.', { imp: 4, core: true })], 'claude')

  const skip: Array<[string, string, string[]]> = [
    ['sd_undo', 'Undo feature', ['SkipDoodle keeps the drawing state in one hook, so undo stays simple.']],
    ['sd_stickers', 'Sticker packs', ['SkipDoodle has three sticker packs: animals, space and food.', 'Kids unlock a sticker pack after ten drawings.']],
    ['sd_colors', 'Color palette', ['SkipDoodle uses eight bright colors and a rainbow brush.']],
    ['sd_offline', 'Offline mode', ['SkipDoodle saves drawings offline and syncs them later.']],
    ['sd_store', 'App Store listing', ['SkipDoodle is waiting on App Store review.', 'The SkipDoodle listing has six screenshots.']],
    ['sd_beta', 'Beta testers', ['Twelve families are testing SkipDoodle.', 'My cousin Ben tests SkipDoodle with his little sister.']],
  ]
  for (const [key, name, lines] of skip) {
    w.thing(key, name, 'task', { parent: 'skipdoodle' }, 2)
    for (const line of lines) w.chat(w.pick([`SkipDoodle ${name.toLowerCase()}`, `${name} for SkipDoodle`, `SkipDoodle bug`]), iso(w.int(232, 300)), [say(key, line, { imp: 2 })])
  }
  w.chat('Working on SkipDoodle', '2026-09-27', [mine('projects', 'I work on SkipDoodle on weekends.', { imp: 3, core: true })])

  const sparrow: Array<[string, string, string[]]> = [
    ['sh_db', 'Database upgrade', ['Sparrowhawk moved to Postgres 16.', 'The Sparrowhawk upgrade took one evening.']],
    ['sh_donations', 'Donations', ['Sparrowhawk takes donations through Stripe.']],
    ['sh_volunteers', 'Volunteer schedule', ['Sparrowhawk has 40 volunteers on the schedule.', 'Volunteers sign up for two hour shifts in Sparrowhawk.']],
    ['sh_news', 'Newsletter', ['The Sparrowhawk newsletter goes out on the 1st of each month.']],
  ]
  w.chat('Sparrowhawk database upgrade', '2026-09-18', [say('sparrowhawk', 'Sparrowhawk runs on Postgres 16 after the upgrade.', { imp: 3 }), say('sparrowhawk', 'Sparrowhawk is the volunteer app for the East Bay bird rescue.', { imp: 4, core: true })], 'chatgpt')
  for (const [key, name, lines] of sparrow) {
    w.thing(key, name, 'task', { parent: 'sparrowhawk' }, 2)
    for (const line of lines) w.chat(w.pick([`Sparrowhawk ${name.toLowerCase()}`, `${name} in Sparrowhawk`]), iso(w.int(100, 295)), [say(key, line, { imp: 2 })], 'claude')
  }

  const kitchen: Array<[string, string, string[]]> = [
    ['k_counters', 'Counters', ['The counters are white oak.']],
    ['k_cabinets', 'Cabinets', ['The kitchen cabinets will be sage green.']],
    ['k_budget', 'Budget', ['The kitchen remodel budget is 18,000 dollars.']],
    ['k_timeline', 'Timeline', ['The kitchen remodel should be done by Thanksgiving.']],
  ]
  w.chat("Mom's kitchen remodel", '2026-04-28', [say('kitchen', 'The kitchen counters will be white oak.', { imp: 3 }), say('kitchen', "The kitchen remodel is at my mom's house in Sacramento.", { imp: 3 })], 'gemini')
  for (const [key, name, lines] of kitchen) {
    w.thing(key, name, 'task', { parent: 'kitchen' }, 2)
    for (const line of lines) w.chat(`Kitchen ${name.toLowerCase()}`, iso(w.int(120, 290)), [say(key, line, { imp: 2 })], 'gemini')
  }
  const more: Array<[string, string, string, string[]]> = [
    ['garden', 'Raised garden bed', 'projects/Home projects', ['I built a raised garden bed on the balcony.', 'The raised bed has basil, chard and cherry tomatoes.']],
    ['site', 'Personal website', 'projects/Software and apps', ['My personal website runs on Astro.', 'I want to add the Tidepool case study to my website.']],
    ['busbuddy', 'Bus Buddy', 'projects/Hackathons', ['Bus Buddy was our CalHacks project, an app for late buses.', 'Bus Buddy won the best civic hack prize.']],
    ['bookclub_app', 'Book club app idea', 'projects/Project ideas', ['I want to build a tiny app for my book club to vote on books.']],
  ]
  for (const [key, name, where, lines] of more) {
    w.thing(key, name, 'project', where, 2)
    lines.forEach((line, i) => w.chat(i ? `${name} update` : name, iso(w.int(30, 298)), [say(key, line, { imp: 2 })]))
  }
}

// ---------------------------------------------------------------- plans, travel, health, money, home

function life(w: Builder): void {
  // Plans and deadlines.
  w.thing('weddings', 'Weddings', 'topic', 'plans/Events', 3)
  w.thing('lena_wedding', "Lena's wedding", 'event', { parent: 'weddings' }, 4)
  w.thing('dana_wedding', "Dana's wedding", 'event', { parent: 'weddings' }, 3)
  w.chat("Lena's wedding plans", '2026-07-19', [
    say('lena_wedding', "Lena's wedding is for Lena Delacroix and Omar Haddad on December 12 in Portland.", { kind: 'event', imp: 4, due: '2026-12-12' }),
    say('lena_wedding', "I'm a bridesmaid at Lena's wedding.", { imp: 3 }),
  ], 'gemini')
  w.chat('Bridesmaid dress', '2026-09-21', [say('lena_wedding', 'The bridesmaid dresses are dusty blue.', { imp: 2 })], 'chatgpt')
  w.chat('A coworker wedding', '2026-10-01', [say('dana_wedding', "Dana's wedding is in Austin in May, and I need a gift.", { kind: 'event', imp: 3 })], 'chatgpt')
  const events: Array<[string, string, string, string, string]> = [
    ['bank', 'Bank appointment', 'plans/Events/Appointments', 'Bank appointment is on Thursday at 9am.', '2026-11-05'],
    ['dentist', 'Dentist cleaning', 'plans/Events/Appointments', 'My dentist cleaning is on November 18 at 10.', '2026-11-18'],
    ['dmv', 'DMV for Real ID', 'plans/Events/Appointments', 'My DMV appointment for Real ID is December 3 at 1:30.', '2026-12-03'],
    ['eye', 'Eye exam', 'plans/Events/Appointments', 'My eye exam is on January 8.', '2027-01-08'],
    ['haircut', 'Haircut', 'plans/Events/Appointments', 'My haircut with Mia is November 7 at 11.', '2026-11-07'],
    ['iris_bday', "Iris's birthday dinner", 'plans/Events/Parties and celebrations', "Iris's birthday dinner is November 21 at Comal.", '2026-11-21'],
    ['friendsgiving', 'Friendsgiving', 'plans/Events/Parties and celebrations', 'I am hosting Friendsgiving on November 22.', '2026-11-22'],
    ['concert', 'Japanese Breakfast concert', 'plans/Events/Concerts and shows', 'The Japanese Breakfast concert is December 5 at the Fox.', '2026-12-05'],
    ['wid', 'Women in Data conference', 'plans/Events/Conferences and meetups', 'The Women in Data conference is March 10 in San Francisco.', '2027-03-10'],
    ['coffee_elena', 'Coffee with Elena Lindqvist', 'plans', 'Coffee with Elena Lindqvist is on Monday at 10.', ''],
    ['lunch_lena', 'Lunch with Lena Delacroix', 'plans', 'Lunch with Lena Delacroix is on Saturday at noon.', ''],
    ['dinner_alex', 'Dinner with Alex Kim', 'plans', 'Dinner with Alex Kim is on November 14 in the Mission.', '2026-11-14'],
    ['demo_day', 'PearX demo day', 'plans/Events', 'PearX demo day is in late January if we get in.', ''],
  ]
  for (const [key, name, where, line, due] of events) {
    w.thing(key, name, 'event', where, due ? 3 : 2)
    w.chat(w.pick([name, `Reminder: ${lower(name)}`, `Planning ${lower(name)}`]), iso(Math.min(doy(due || '2026-10-20') - w.int(5, 20), 300)), [say(key, line, { kind: 'event', imp: due ? 3 : 2, ...(due ? { due } : {}) })], key === 'bank' ? 'claude' : undefined)
  }
  const deadlines: Array<[string, string, string]> = [
    ['plans/Deadlines/Renewals and expirations', 'My lease renewal is due December 1.', '2026-12-01'],
    ['plans/Deadlines/Renewals and expirations', 'I need to renew my passport before the Lisbon trip.', ''],
    ['plans/Deadlines/Tax deadlines', 'I filed my taxes on April 10.', ''],
    ['plans/Deadlines/School deadlines', 'The FAFSA for next year opens October 1.', ''],
    ['plans/Deadlines/School deadlines', 'Spring registration opens for me on November 12.', '2026-11-12'],
    ['plans/Goals', 'I want to run a half marathon in April.', ''],
    ['plans/Goals', 'I want to read 24 books this year.', ''],
    ['plans/Goals', 'I want to save 8,000 dollars by June.', ''],
    ['plans/Goals', 'I want to learn basic Portuguese before Lisbon.', ''],
    ['plans/To do lists/Errands', 'I need to return the library books by November 9.', '2026-11-09'],
    ['plans/To do lists/Errands', 'I need to pick up my bike from the shop.', ''],
  ]
  for (const [where, line, due] of deadlines)
    w.chat(w.pick(['Reminders', 'To do this week', 'Deadlines', 'Quick note', 'Planning ahead', 'Goals check in']), iso(Math.min(doy(due || '2026-09-30') - w.int(3, 40), 300)), [mine(where, line, { kind: /want/.test(line) ? 'goal' : 'task', imp: due ? 4 : 3, ...(due ? { due } : {}) })])

  // Travel.
  const trips: Array<[string, string, number, string[]]> = [
    ['lisbon', 'Lisbon trip', 4, ['The Lisbon trip is in March for six days.', 'I am staying in Alfama on the Lisbon trip.', 'The Lisbon trip budget is 2,000 dollars.']],
    ['montreal', 'Montreal trip', 3, ['The Montreal trip budget is $1,400 for 5 nights.', 'I went to Montreal with Lena in June.']],
    ['portland', 'Portland for the wedding', 3, ['I fly to Portland on December 11 for the wedding.', 'I am staying with Lena\'s family in Portland.']],
    ['tahoe', 'Tahoe ski weekend', 2, ['The Tahoe ski weekend is January 16 to 18.', 'We rented a cabin in Truckee for Tahoe.']],
    ['austin', 'Austin in May', 2, ['I am going to Austin in May for Dana\'s wedding.']],
    ['seattle', 'Seattle visit', 2, ['I visited June in Seattle in July.']],
    ['la', 'Spring break in LA', 2, ['I spent spring break in Los Angeles with Hana.']],
  ]
  for (const [key, name, imp, lines] of trips) {
    w.thing(key, name, 'event', 'travel/Trips', imp)
    lines.forEach((line, i) => w.chat(i === 0 && key === 'lisbon' ? 'Lisbon trip' : w.pick([`${name} planning`, `${name} ideas`, `${name} budget`, `${name} packing`]), iso(w.int(20, 295)), [say(key, line, { kind: 'event', imp: i ? 2 : imp })], key === 'lisbon' && i === 0 ? 'chatgpt' : key === 'montreal' && i === 0 ? 'claude' : undefined))
  }
  w.thing('lisbon_flight', 'Flight times for the trip', 'event', { parent: 'lisbon' }, 2)
  w.chat('Flight times for the trip', '2026-10-06', [say('lisbon_flight', 'The flight to Lisbon leaves at 7:40 am.', { imp: 2 })], 'chatgpt')
  w.chat('Travel style', '2026-03-28', [mine('travel/Travel preferences', 'I travel carry on only.', { kind: 'preference', imp: 2 }), mine('travel/Travel preferences', 'I like an aisle seat on long flights.', { kind: 'preference', imp: 2 })])
  w.chat('Airline miles', '2026-06-02', [mine('travel/Points and loyalty', 'I collect Alaska miles.', { imp: 2 })])

  // Health.
  w.thing('harbor', 'Harbor Clinic', 'organization', 'health/Care team', 3)
  const health: Array<[string, string, Sensitivity | undefined]> = [
    ['health/Checkups and screenings', 'Next checkup is in January.', 'health'],
    ['health/Checkups and screenings', 'I got my flu shot on October 4.', 'health'],
    ['health/Allergies', 'I have seasonal allergies and take Zyrtec in spring.', 'health'],
    ['health/Conditions/Bones, joints and muscles', 'My right knee hurts after long runs.', 'health'],
    ['health/Conditions/Bones, joints and muscles', 'My physical therapist gave me three knee exercises.', 'health'],
    ['health/Sleep', 'I try to be asleep by 11:30 on school nights.', undefined],
    ['health/Fitness/Cardio and running', 'I run three times a week, about 15 miles total.', undefined],
    ['health/Fitness/Cardio and running', 'My half marathon plan builds to a 10 mile long run.', undefined],
    ['health/Fitness/Strength training', 'I climb twice a week for strength.', undefined],
    ['health/Nutrition', 'I try to eat 80 grams of protein a day.', undefined],
    ['health/Mental health', 'Long walks help me when I feel stressed.', 'health'],
  ]
  for (const [where, line, sens] of health) w.chat(w.pick(['Health question', 'Running plan', 'Doctor visit notes', 'Feeling better', 'Training week', 'Sleep tips']), iso(w.int(10, 299)), [mine(where, line, { imp: 3, ...(sens ? { sens } : {}) })])
  w.chat('Harbor Clinic visit', '2026-09-19', [say('harbor', 'Harbor Clinic is my clinic for checkups.', { imp: 3, sens: 'health' }), say('nora', 'Nora Patel works at Harbor Clinic.', { imp: 2 })])

  // Money.
  const money: Array<[string, string, string]> = [
    ['money/Budget/Housing costs', 'My share of the rent is 1,450 dollars a month.', 'finance'],
    ['money/Budget/Food costs', 'I budget 400 dollars a month for groceries.', 'finance'],
    ['money/Budget/Subscriptions', 'I pay for Spotify, iCloud and ChatGPT Plus.', 'finance'],
    ['money/Saving/Savings goals', 'I am saving for the Lisbon trip in a separate account.', 'finance'],
    ['money/Investing/Retirement accounts', 'I put 100 dollars a month into a Roth IRA.', 'finance'],
    ['money/Debt/Student loans', 'I have about 9,000 dollars in student loans.', 'finance'],
    ['money/Debt/Credit cards', 'My credit card is on autopay.', 'finance'],
    ['money/Taxes/Tax forms', 'I need my 1098-T for taxes.', 'finance'],
    ['money/Income/Side income', 'Tutoring and Kestrel are my two paychecks.', 'finance'],
  ]
  for (const [where, line, sens] of money) w.chat(w.pick(['Budget check', 'Money question', 'Monthly budget', 'Saving plan', 'Paying bills']), iso(w.int(5, 299)), [mine(where, line, { imp: 3, sens: sens as Sensitivity })])

  // Home.
  w.thing('apartment', 'Durant Ave apartment', 'place', 'home/Your homes', 3)
  w.thing('heater', 'Broken heater', 'topic', { parent: 'apartment' }, 2)
  w.chat('Broken heater', '2026-10-17', [say('heater', 'The landlord fixes the heater on Wednesday.', { imp: 3 })], 'claude')
  const home: Array<[string, string]> = [
    ['apartment', 'I live in a two bedroom apartment on Durant Ave with Jess.'],
    ['apartment', 'The apartment internet is Sonic fiber.'],
    ['apartment', 'Trash goes out on Tuesday night.'],
    ['apartment', 'My renters insurance is with Lemonade.'],
    ['apartment', 'The pothos and the basil live by the kitchen window.'],
  ]
  for (const [key, line] of home) w.chat(w.pick(['Apartment stuff', 'Home question', 'Chores and bills', 'Moving things around']), iso(w.int(10, 299)), [say(key, line, { imp: 2 })])
  w.thing('bike', 'Commuter bike', 'product', 'home/Vehicles', 2)
  w.chat('Bike tune up', '2026-08-08', [say('bike', 'My commuter bike is a gray Linus.', { imp: 2 }), say('bike', 'The bike shop on Telegraph does my tune ups.', { imp: 2 })])
}

// ---------------------------------------------------------------- hobbies, food, preferences, information

function interests(w: Builder): void {
  w.thing('soccer', 'Tuesday soccer', 'group', 'hobbies/Sports/Your teams', 3)
  w.chat('Tuesday soccer', '2026-02-24', [say('soccer', 'I play soccer on Tuesdays at 7.', { kind: 'event', imp: 3 }), say('soccer', 'Our rec team is called the Tide Pools.', { imp: 2 })])
  w.thing('climbing', 'Climbing', 'topic', 'hobbies/Sports/Outdoor and mountain sports', 3)
  w.chat('Climbing goals', '2026-05-09', [say('climbing', 'I climb at Berkeley Ironworks.', { imp: 2 }), say('climbing', 'I am working on V4 boulder problems.', { imp: 2 })])
  const books = ['Tomorrow, and Tomorrow, and Tomorrow', 'The Overstory', 'Klara and the Sun', 'Educated', 'Project Hail Mary', 'Pachinko', 'The Remains of the Day', 'Braiding Sweetgrass']
  for (const book of books) {
    const key = `book_${slug(book)}`
    w.thing(key, book, 'product', 'hobbies/Reading/Books read', 2)
    w.chat(w.pick([`Thoughts on ${book}`, `${book} discussion`, `What to read after ${book}`]), iso(w.int(5, 299)), [say(key, `I ${w.pick(['loved', 'liked', 'finished', 'could not put down'])} ${book}.`, { imp: 2 })])
  }
  w.thing('book_club', 'Book club', 'group', 'hobbies/Reading', 3)
  w.chat('Book club pick', '2026-10-10', [say('book_club', 'My book club meets the last Sunday of the month.', { kind: 'event', imp: 3 }), say('book_club', 'November\'s book club pick is Pachinko.', { imp: 2 })])
  const shows: Array<[string, string]> = [['Severance', 'I am rewatching Severance.'], ['The Bear', 'The Bear is my favorite show this year.'], ['Abbott Elementary', 'I watch Abbott Elementary with Jess.']]
  for (const [show, line] of shows) {
    const key = `show_${slug(show)}`
    w.thing(key, show, 'product', 'hobbies/Movies and TV/TV shows', 2)
    w.chat(`${show} theories`, iso(w.int(5, 299)), [say(key, line, { imp: 2 })])
  }
  w.chat('Music for focus', '2026-03-17', [mine('hobbies/Music/Music taste', 'I listen to Japanese Breakfast and Phoebe Bridgers.', { kind: 'preference', imp: 2 })])
  w.thing('tesselcrest', 'Tesselcrest', 'product', 'hobbies/Games/Board games', 2)
  w.chat('Board game night', '2026-06-26', [say('tesselcrest', 'Tesselcrest is a board game Iris likes.', { imp: 2 }), mine('hobbies/Games/Board games', 'Wingspan is my favorite board game.', { kind: 'preference', imp: 2 })])
  w.thing('pottery', 'Pottery class', 'event', 'hobbies/Crafts/Pottery and ceramics', 2)
  w.chat('Pottery class', '2026-09-10', [say('pottery', 'My pottery class is on Thursday nights.', { kind: 'event', imp: 2 }), say('pottery', 'I made a set of four mugs in pottery.', { imp: 2 })])

  const recipes: Array<[string, string]> = [
    ['Pear tart', 'The pear tart for Sunday needs four pears.'],
    ['Lentil soup', 'My lentil soup uses smoked paprika and lemon.'],
    ['Shakshuka', 'Shakshuka is my go to Sunday breakfast.'],
    ['Chickpea curry', 'The chickpea curry freezes well for a week.'],
    ['Banana bread', 'My banana bread uses brown butter.'],
    ['Pesto pasta', 'I make pesto with the basil from the balcony.'],
    ['Overnight oats', 'Overnight oats are my weekday breakfast.'],
  ]
  for (const [name, line] of recipes) {
    const key = `recipe_${slug(name)}`
    w.thing(key, name, 'document', 'food/Recipes', 2)
    w.chat(w.pick([`${name} recipe`, `Fixing my ${lower(name)}`, `${name} for four`]), iso(w.int(5, 299)), [say(key, line, { imp: 2 })], name === 'Pear tart' ? 'gemini' : undefined)
  }
  const food: Array<[string, string]> = [
    ['food', 'I cook vegetarian on weeknights.'],
    ['food/Cooking/Meal prep', 'I meal prep on Sunday afternoons.'],
    ['food', 'My coffee order is an oat milk cortado.'],
    ['food', 'I do not like cilantro.'],
    ['food', 'Cheese Board Pizza is my favorite place in Berkeley.'],
  ]
  for (const [where, line] of food) w.chat(w.pick(['Dinner ideas', 'Food question', 'Grocery list', 'Where to eat', 'Meal plan for the week']), iso(w.int(5, 299)), [mine(where, line, { kind: 'preference', imp: 2 })])

  const prefs: Array<[string, string, FactKind, number]> = [
    ['preferences/How you want answers', 'Keep answers short unless I ask for detail.', 'instruction', 5],
    ['preferences/How you want answers', 'Start with the answer, then explain.', 'instruction', 4],
    ['preferences/How you want answers', 'Use a table when you compare options.', 'instruction', 3],
    ['preferences/How you want answers', 'Give code examples in Python unless I say TypeScript.', 'instruction', 3],
    ['preferences/Tone of answers', 'Keep a calm, direct tone.', 'instruction', 4],
    ['preferences/Tone of answers', 'Skip the praise and get to the point.', 'instruction', 3],
    ['preferences/Coding instructions', 'I write TypeScript with strict mode on.', 'preference', 3],
    ['preferences/Coding instructions', 'I test with Vitest.', 'preference', 2],
    ['preferences/Units and formats', 'Write dates like Oct 29, not 10/29.', 'instruction', 2],
    ['preferences/Units and formats', 'Use miles for running and Celsius for cooking.', 'preference', 2],
    ['preferences/Tools and apps you prefer', 'I keep my notes in Notion and my tasks in Things.', 'preference', 2],
    ['preferences/How you like to work', 'I do my best focused work before noon.', 'preference', 3],
    ['tone/With teachers and professors', 'With professors I write short, formal emails.', 'style', 2],
    ['tone/With your manager', 'With Nadia I am direct and lead with the numbers.', 'style', 2],
    ['style/Greetings and sign offs', 'I start emails with Hi, never Hey.', 'style', 2],
  ]
  for (const [where, line, kind, imp] of prefs) w.chat(w.pick(['How I like answers', 'Settings for this chat', 'From now on', 'One more rule', 'Writing preferences', 'Please remember']), iso(w.int(5, 299)), [mine(where, line, { kind, imp })])
  w.chat('Shorter please', '2026-06-11', [mine('preferences/How you want answers', 'Keep answers short unless I ask for detail.', { kind: 'instruction', imp: 5 })], 'claude')

  const info: Array<[string, string, ThingKind, string]> = [
    ['knowledge/Topics you follow', 'Health tech', 'topic', 'I follow health tech news for Tidepool.'],
    ['knowledge/Topics you follow', 'Urban transit', 'topic', 'I follow BART and AC Transit budget news.'],
    ['knowledge/Topics you follow', "Women's soccer", 'topic', 'I follow Bay FC.'],
    ['knowledge/Saved answers', 'SQL window functions', 'document', 'I saved a cheat sheet on SQL window functions.'],
    ['knowledge/Saved answers', 'Pandas groupby notes', 'document', 'I saved notes on pandas groupby and agg.'],
    ['knowledge/Saved answers', 'Cover letter template', 'document', 'My cover letter template has three short paragraphs.'],
    ['knowledge/How to guides', 'Changing a bike tube', 'document', 'I saved the steps for changing a bike tube.'],
    ['knowledge/How to guides', 'Filing a 1098-T', 'document', 'The 1098-T goes in the education credits part of my taxes.'],
    ['knowledge/Reading notes', 'Notes on The Mom Test', 'document', 'The Mom Test says to ask about past behavior, not opinions.'],
    ['knowledge/Language learning', 'Portuguese', 'topic', 'I practice Portuguese on Duolingo for ten minutes a day.'],
  ]
  for (const [where, name, kind, line] of info) {
    const key = `info_${slug(name)}`
    w.thing(key, name, kind, where, 2)
    w.chat(w.pick([name, `Quick question on ${lower(name)}`, `${name} notes`]), iso(w.int(5, 299)), [say(key, line, { imp: 2 })])
  }
}

// ---------------------------------------------------------------- putting it together

/** Chats about things she already told an AI, made until her chats come to TOTAL: she comes back to a topic. */
function revisits(w: Builder): void {
  const titles = ['More on', 'Back to', 'Quick question about', 'Notes on', 'Following up on', 'Help with']
  const facts = [...w.facts.values()].filter((f) => f.subject !== 'self' && f.importance >= 3)
  while (w.chats.length < TOTAL) {
    const f = w.pick(facts)
    const thing = w.things.get(f.subject)!
    const up = thing.parent ? w.things.get(thing.parent)! : null
    // A part of something reads with what it is part of: "Notes on Tidepool pricing", "Help with DATA 100 lab 3".
    const name = up && thing.kind !== 'person' && !thing.name.includes(up.name) ? `${up.name} ${lower(thing.name)}` : thing.name
    w.chat(`${w.pick(titles)} ${name}`, iso(w.int(5, 300)), [say(f.subject, f.text)])
  }
}

/**
 * Folds chats into one another until there are `target`: a later chat on
 * the same thing becomes part of the earlier one, as one chat often covers
 * a few weeks of the same work. The films' own chats stay as they are.
 */
function fold(w: Builder, target: number): void {
  const fixed = (c: Chat) => Boolean(c.platform) || !/^c\d{3}$/.test(c.key)
  const subjects = (c: Chat) => new Set(c.says.map((k) => [...w.facts.values()].find((f) => f.key === k)!.subject))
  const sectionOf = (key: string) => (key === 'self' ? 'self' : w.things.get(key)!.section)
  while (w.chats.length > target) {
    const open = w.chats.filter((c) => !fixed(c))
    const a = w.pick(open)
    const mine = subjects(a)
    const same = open.filter((b) => b !== a && [...subjects(b)].some((s) => mine.has(s)))
    const near = same.length ? same : open.filter((b) => b !== a && [...subjects(b)].some((s) => [...mine].some((m) => sectionOf(m) === sectionOf(s))))
    const b = near.length ? w.pick(near) : null
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
  school(w)
  people(w)
  work(w)
  projects(w)
  life(w)
  interests(w)
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
