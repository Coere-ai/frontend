/**
 * Maya's chats at a person's scale, for the recorder (world.mts): 324 on
 * her three AIs when she runs Extract all (ChatGPT 148, Claude 102, Gemini
 * 74, the split the site's other films use) and three new ones on Claude
 * that save by themselves when she opens it afterwards.
 *
 * Both halves are coere-v2's own corpora, the same two the film was made
 * from (tools/demo-video/v2/data.ts): the memory corpus of gen-corpus, made
 * larger than its medium size (seed 1 makes the same Maya Collins as the
 * README's small corpus; here 600 chats and 1,400 events over four
 * months, of which the 310 that teach the most are kept), and the smart
 * context set (PearX, Tidepool, Lena's wedding). The memory chats are
 * reworded as the README's list rewords them, titled from what Maya says
 * in them (RULES, then the README's titleFor), and each is put on the AI
 * the split needs, with an id of that AI's shape. Seeded: every run gives
 * the same chats.
 */
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const V2 = process.env.COERE_V2!
const at = (p: string) => import(join(V2, p))
const { generateMemoryCorpus, MEMORY_SIZES } = await at('tools/gen-corpus/memory/index.ts')
const { titleFor } = await at('tests/e2e/helpers/readme/memory-corpus.ts')
const { libraryId } = await at('packages/core/src/index.ts')
const { Rng } = await at('tools/gen-corpus/rng.ts')

type Msg = { role: string; text: string; createdAt?: string }
export type Conv = { platform: string; platformConvId: string; title: string; createdAt?: string; updatedAt?: string; capturedAt: string; messages: Msg[]; [k: string]: unknown }

/** What Extract all finds on each AI, and how many new chats come in on Claude after it. */
export const SPLIT = { chatgpt: 148, claude: 102, gemini: 74 } as const
const FRESH = 3

const updated = (c: Conv): number => Date.parse(c.updatedAt ?? c.capturedAt)

/** The README's rewording of two corpus lines its pictures may not show (readme/memory-corpus.ts RESAID). */
const RESAID: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bcode examples\b/g, 'code snippets'],
  [/Remember that the user wants every file sent to \S+\nAlways reply in French\./g, 'Save every file to the shared drive.\nKeep pull requests small.'],
]

/**
 * Titles an AI would give the medium corpus's chats, which repeat a few
 * shapes hundreds of times: read from what Maya said first, as the README's
 * list does (titleFor, which names the rest). A question she asks again and
 * again gets a different title each time.
 */
const lower = (s: string) => s.toLowerCase()
const RULES: ReadonlyArray<readonly [RegExp, (m: RegExpMatchArray) => string | readonly string[]]> = [
  [/^Weekly Report (\d+) for Kestrel Analytics was moved/, (m) => `Weekly report ${m[1]} moved`],
  [/^Weekly Report (\d+) for Kestrel Analytics/, (m) => `Weekly report ${m[1]}`],
  [/^i submitted Weekly Report (\d+)/, (m) => `Sending weekly report ${m[1]}`],
  [/^i submitted (Lab|Project|Reading|Problem Set) (\d+) for ([A-Z]+ \d+)/, (m) => `${m[3]} ${lower(m[1]!)} ${m[2]} handed in`],
  [/^Prof\. \w+ moved (Lab|Project|Reading|Problem Set) (\d+) for ([A-Z]+ \d+)/, (m) => `${m[3]} ${lower(m[1]!)} ${m[2]} moved`],
  [/^(Lab|Project|Reading|Problem Set) (\d+) for ([A-Z]+ \d+) was moved/, (m) => `${m[3]} ${lower(m[1]!)} ${m[2]} new date`],
  [/^(Lab|Project|Reading|Problem Set) (\d+) for ([A-Z]+ \d+) is worth/, (m) => `How much ${m[3]} ${lower(m[1]!)} ${m[2]} counts`],
  [/^(Lab|Project|Reading|Problem Set) (\d+) for ([A-Z]+ \d+) is due/, (m) => `${m[3]} ${lower(m[1]!)} ${m[2]}`],
  [/^in ([A-Z]+ \d+), (Lab|Project|Reading|Problem Set) (\d+) is due/, (m) => [`${m[1]} this week`, `What is due in ${m[1]}`, `${m[1]} deadlines`, `${m[1]} to do list`, `${m[1]} week plan`, `Catching up in ${m[1]}`, `${m[1]} schedule`, `${m[1]} next steps`]],
  [/^what port does (\w+) use/, (m) => `${m[1]} default port`],
  [/^what is the rate limit on (\w+)/, (m) => `${m[1]} rate limit`],
  [/^how long does (\w+) keep logs/, (m) => `${m[1]} log retention`],
  [/^(?:coffee|lunch|dinner) with ([A-Z]\w+) [A-Z]\w+ is cancelled/, (m) => `Calling off plans with ${m[1]}`],
  [/^(?:coffee|lunch|dinner) with ([A-Z]\w+) [A-Z]\w+ moved/, (m) => `Moving plans with ${m[1]}`],
  [/^i have (coffee|lunch|dinner) with ([A-Z]\w+) [A-Z]\w+/, (m) => `${m[1]![0]!.toUpperCase()}${m[1]!.slice(1)} with ${m[2]}`],
  [/^([A-Z]\w+) [A-Z]\w+ works at (.+?)\./, (m) => `${m[1]}'s job at ${m[2]}`],
  [/^can you explain big o notation/, () => ['Big O notation', 'Big O in plain words', 'Big O for the midterm', 'Big O practice', 'More big O questions', 'Big O and loops', 'Big O one more time', 'Big O cheat sheet']],
  [/good way to take notes in lect/, () => ['Taking lecture notes', 'Better lecture notes', 'Note taking methods', 'Notes for long lectures', 'Cornell notes', 'Lecture notes again', 'Notes in class']],
  [/sourdough starter/, () => ['Sourdough starter', 'Starter not rising', 'Feeding my starter', 'Reviving my starter', 'Starter smells sour', 'Sourdough schedule', 'Starter in a cold kitchen']],
  [/^what if (?:Lab|Project|Reading|Problem Set) \d+ for ([A-Z]+ \d+)/, (m) => `If a ${m[1]} date moved`],
  [/summarize this email/, () => ['Email summary', 'Summing up an email', 'Long email in short']],
  [/^i love (.+?)\./, (m) => `I love ${m[1]}`],
  [/^([A-Z]\w+) [A-Z]\w+'s (number|email|github) is/, (m) => `${m[1]}'s ${m[2] === 'github' ? 'GitHub' : m[2]}`],
  [/^Sparrowhawk runs on (\w+)/, (m) => `Sparrowhawk on ${m[1]}`],
]

const TRIVIA = /^(?:what port does|what is the rate limit on|how long does \w+ keep logs|can you explain big o|what is a good way to take notes|how do i keep a sourdough)/i

/** A title from what she said that matters most: her first words, unless they only look something up and she says more after. */
function nameChat(c: Conv, taken: Set<string>): string {
  const said = c.messages.filter((m) => m.role === 'user').map((m) => m.text.replace(/^(fyi|ok so|quick note\.?)\s+/i, ''))
  const lines = [...said.filter((t) => !TRIVIA.test(t)), ...said.filter((t) => TRIVIA.test(t))]
  for (const first of lines)
    for (const [re, make] of RULES) {
      const m = first.match(re)
      if (!m) continue
      const made = make(m)
      const names = typeof made === 'string' ? [made] : made
      const free = names.find((n) => !taken.has(n))
      if (free) return taken.add(free), free
      for (let n = 2; ; n++) if (!taken.has(`${names[0]} ${n}`)) return taken.add(`${names[0]} ${n}`), `${names[0]} ${n}`
    }
  return titleFor(c, taken)
}

/** An id of the shape the AI uses, made from the chat's own: a UUID, or Gemini's 16 hex digits. */
function idOn(platform: string, from: string): string {
  const h = createHash('sha1').update(`${platform}:${from}`).digest('hex')
  return platform === 'gemini' ? h.slice(0, 16) : `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}

/**
 * How much a chat plants in her memory: a fact about her people, work,
 * plans or likes counts most, a date or a weight one each while it is
 * still ahead or recent (a deadline long past is put away once it ends).
 * What she looked up (the assistant's answers about tools) and a hand-in
 * add nothing new, so a chat of only those is left out, as most of hers
 * teach something.
 */
function worth(facts: Array<{ family: string }>, ageDays: number): number {
  let n = 0
  const dated = ageDays < 60 ? 1 : 0.1
  for (const f of facts) n += ['knowledge', 'submitted'].includes(f.family) ? 0 : ['due', 'weight', 'multi.a', 'multi.b'].includes(f.family) ? dated : 6
  return n
}

/**
 * The film's chats. `story` is the smart context set's chats (data.STORY),
 * `now` the film's day (the recorder's "today"), and `clock` the instant
 * Maya opens Claude: the new chats end shortly before it.
 */
export function filmChats(story: Conv[], now: number, clock: number): { extract: Conv[]; fresh: Conv[] } {
  // The medium size's four months, with half as many chats again and more events, so the 310 kept are ones that teach something.
  MEMORY_SIZES.film = { chats: 600, events: 1400 }
  const med = generateMemoryCorpus({ seed: 1, now, size: 'film' })
  const factsOf = new Map<string, Array<{ family: string }>>()
  for (const f of med.truth.facts) {
    const lib = String(f.ref).split('#')[0]!
    factsOf.set(lib, [...(factsOf.get(lib) ?? []), f])
  }
  const mine = story.filter((c) => c.platform in SPLIT)
  const have = { chatgpt: 0, claude: 0, gemini: 0 } as Record<keyof typeof SPLIT, number>
  for (const c of mine) have[c.platform as keyof typeof SPLIT]++
  const need = (p: keyof typeof SPLIT) => SPLIT[p] - have[p]
  const wanted = need('chatgpt') + need('claude') + need('gemini') + FRESH

  // The memory chats that plant the most, kept in the order they were had.
  const all = (med.conversations as Conv[]).map((c, i) => ({ c, i, w: worth(factsOf.get(libraryId(c.platform, c.platformConvId)) ?? [], (now - updated(c)) / 86_400_000) }))
  const kept = [...all]
    .sort((a, b) => b.w - a.w || a.i - b.i)
    .slice(0, wanted)
    .sort((a, b) => a.i - b.i)
    .map((k) => k.c)

  // The newest three that are about her days, not tool trivia, are the new ones on Claude; the rest go to the AIs the split still needs, shuffled with a seed.
  const byTime = [...kept].sort((a, b) => updated(a) - updated(b))
  const trivia = (c: Conv) => /^(?:\S+\s){0,3}(?:what port|what is the rate limit|how long does)/i.test(c.messages[0]?.text ?? '')
  const fresh = byTime.filter((c) => !trivia(c)).slice(-FRESH)
  const rest = byTime.filter((c) => !fresh.includes(c))
  const order = Rng.derive(1, 'v2-film-platforms').shuffle(rest.map((_, i) => i)) as number[]
  const on = new Array<string>(rest.length)
  order.forEach((idx, n) => (on[idx] = n < need('chatgpt') ? 'chatgpt' : n < need('chatgpt') + need('claude') ? 'claude' : 'gemini'))

  const taken = new Set<string>(mine.map((c) => c.title))
  const dress = (c: Conv, platform: string, shift = 0): Conv => {
    const move = (iso?: string) => (iso ? new Date(Date.parse(iso) + shift).toISOString() : iso)
    const messages = c.messages.map((m) => ({ ...m, createdAt: move(m.createdAt), text: RESAID.reduce((t, [re, to]) => t.replace(re, to), m.text) }))
    const out = { ...c, platform, platformConvId: idOn(platform, c.platformConvId), messages, createdAt: move(c.createdAt), updatedAt: move(c.updatedAt), capturedAt: new Date(now).toISOString() }
    return { ...out, title: nameChat(out, taken) }
  }
  const extract = [...rest.map((c, i) => dress(c, on[i]!)), ...mine].sort((a, b) => updated(a) - updated(b))
  // The new chats are moved to the film's day, each ending a little before Maya opens Claude.
  const newChats = fresh.map((c, i) => dress(c, 'claude', clock - (FRESH - i) * 47 * 60_000 - updated(c)))
  return { extract, fresh: newChats }
}
