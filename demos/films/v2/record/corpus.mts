/**
 * Maya's chats at a person's scale, for the recorder (world.mts): 324 on
 * her three AIs when she runs Extract all (ChatGPT 148, Claude 102, Gemini
 * 74, the split the site's other films use) and three new ones on Claude
 * that save by themselves when she opens it afterwards.
 *
 * Two halves, both in the shape of coere-v2's gold sets, so the stand in
 * models answer from known truth and the real build files each memory
 * where the truth says (tools/demo-video/stage/story-models.ts):
 *
 * - the smart context set the film was made from (PearX, Tidepool, Lena's
 *   wedding; tools/demo-video/v2/data.ts STORY), as it is, but for her
 *   MATH 54 midterm, filed with the class it belongs to, and Lena, filed
 *   with her other friends;
 * - her library (library.mts): the rest of her life, written with
 *   coere-v2's own planting helpers (tools/gen-corpus/memory/context
 *   plant.ts) as a balanced library leans, a dozen sections of two to
 *   four folders each.
 *
 * A few chats about her friend Elena stay in the plain sentences the
 * shipped stand in reads by rule (her email, GitHub and employer), so her
 * sheet fills its identity block as the film was made with.
 *
 * Seeded: every run gives the same chats.
 */
import { join } from 'node:path'
import { LIBRARY, RULE_CHATS, REPLIES, type Shelf, type Said } from './library.mts'

const V2 = process.env.COERE_V2!
const at = (p: string) => import(join(V2, p))
const { assembleChat, plant } = await at('tools/gen-corpus/memory/context/plant.ts')
const { IdMaker } = await at('tools/gen-corpus/ids.ts')
const { Rng } = await at('tools/gen-corpus/rng.ts')

type Msg = { role: string; text: string; createdAt?: string }
export type Conv = { platform: string; platformConvId: string; title: string; createdAt?: string; updatedAt?: string; capturedAt: string; messages: Msg[]; [k: string]: unknown }
type Item = { ref: string; path: string; top: string; topic: string | null; fact: { key: string; subjectKind: string; kind: string; lifetime: string } | null; [k: string]: unknown }
export type Gold = { format: string; seed: number; now: string; zone: string; conversations: Conv[]; items: Item[]; [k: string]: unknown }

/** What Extract all finds on each AI, and how many new chats come in on Claude after it. */
export const SPLIT = { chatgpt: 148, claude: 102, gemini: 74 } as const
const FRESH = 3
const DAY = 86_400_000

const updated = (c: Conv): number => Date.parse(c.updatedAt ?? c.capturedAt)

/**
 * The smart context set with the MATH 54 midterm filed under MATH 54, as
 * a careful model files a class's exam with the class: the build then
 * draws School as her four classes, each with its own memories.
 */
function storyTruth(story: Gold): Gold {
  const items = story.items.map((it) => {
    if (it.topic === 'MATH 54 midterm' && it.fact)
      return { ...it, topic: 'MATH 54', path: 'school.subjects.mathematics', top: 'school', fact: { ...it.fact, subjectKind: 'course', key: `midterm.${it.fact.key}` } }
    // Lena sits with her other friends, straight under People, as the library files them.
    if (it.topic === 'Lena Delacroix') return { ...it, path: 'people' }
    return it
  })
  return { ...story, items }
}

/** One sentence of a shelf as a planted fact. */
function planted(shelf: Shelf, said: Said, n: number) {
  const o = typeof said === 'string' ? { s: said } : said
  return plant({
    sentence: o.s,
    topic: shelf.topic,
    subject: shelf.subject,
    path: o.path ?? shelf.path,
    key: o.key ?? `${shelf.key}.f${n}`,
    kind: o.kind ?? shelf.kind ?? 'note',
    importance: o.imp ?? shelf.imp ?? 4,
    piece: o.piece ?? shelf.piece ?? 'knowledge',
    lifetime: o.life ?? shelf.life ?? 'changeable',
  })
}

const sentence = (said: Said): string => (typeof said === 'string' ? said : said.s)

/** A plain chat the shipped stand in reads by rule, in library format. */
function ruleChat(c: (typeof RULE_CHATS)[number], platform: string, o: { now: number; rng: any; ids: any }): Conv {
  const id = o.ids.conversation(platform, o.rng)
  const start = o.now - c.days * DAY + o.rng.int(9 * 60, 20 * 60) * 60_000
  const messages = c.lines.map((l, i) => ({ role: l[0], text: l[1], createdAt: new Date(start + i * 60_000).toISOString() }))
  return {
    ...{ platform, platformConvId: id, title: c.title },
    ...{ createdAt: messages[0]!.createdAt, updatedAt: messages.at(-1)!.createdAt, archived: false },
    ...{ messages, alternateBranches: 0, hiddenCount: 0, adapter: 'gen-corpus-context@1' },
    capturedAt: new Date(o.now).toISOString(),
  }
}

/**
 * The film's chats and the truth the stand in models answer from. `story`
 * is the smart context set (data.STORY), `now` the film's day (the
 * recorder's "today"), and `clock` the instant Maya opens Claude: the new
 * chats end shortly before it.
 */
export function filmLibrary(story: Gold, now: number, clock: number): { set: Gold; extract: Conv[]; fresh: Conv[] } {
  const rng = Rng.derive(7, 'v2-film-library')
  const ids = new IdMaker()
  const storyIds = new Set(story.conversations.map((c) => c.platformConvId))
  let n = 0
  const next = () => `lib_${String(++n).padStart(4, '0')}`

  // Every chat of the library, in table order; each user message holds what one shelf says.
  type Spec = { title: string; days: number | null; fresh: boolean; lines: { role: 'user' | 'assistant'; text: string; plants?: unknown[] }[] }
  const specs: Spec[] = []
  let replyAt = 0
  const reply = () => REPLIES[replyAt++ % REPLIES.length]!
  const counted = new Map<Shelf, number>()
  const say = (shelf: Shelf, said: readonly Said[], ask?: string) => {
    const plants = said.map((s) => {
      const k = (counted.get(shelf) ?? 0) + 1
      counted.set(shelf, k)
      return planted(shelf, s, k)
    })
    const text = [...said.map(sentence), ...(ask ? [ask] : [])].join(' ')
    return { role: 'user' as const, text, plants }
  }
  for (const shelf of LIBRARY)
    for (const chat of shelf.chats) {
      const lines: Spec['lines'] = [say(shelf, chat.say, chat.ask), { role: 'assistant', text: chat.reply ?? reply() }]
      for (const more of chat.more ?? []) lines.push(say(more.shelf, more.say, more.ask), { role: 'assistant', text: more.reply ?? reply() })
      specs.push({ title: chat.title, days: chat.days ?? null, fresh: chat.fresh === true, lines })
    }

  // The AIs: the split less what the smart context set holds, the new chats on Claude.
  const have = { chatgpt: 0, claude: 0, gemini: 0 } as Record<keyof typeof SPLIT, number>
  for (const c of story.conversations) if (c.platform in have) have[c.platform as keyof typeof SPLIT]++
  const need = (p: keyof typeof SPLIT) => SPLIT[p] - have[p]
  const rest = specs.length - specs.filter((s) => s.fresh).length + RULE_CHATS.length
  const wanted = need('chatgpt') + need('claude') + need('gemini')
  if (rest !== wanted || specs.filter((s) => s.fresh).length !== FRESH)
    console.warn(`library: ${rest} chats for Extract all, the split wants ${wanted}; ${specs.filter((s) => s.fresh).length} new ones, the film wants ${FRESH}`)
  const order = Rng.derive(7, 'v2-film-platforms').shuffle(Array.from({ length: rest }, (_, i) => i)) as number[]
  const on = new Array<string>(rest)
  order.forEach((idx, k) => (on[idx] = k < need('chatgpt') ? 'chatgpt' : k < need('chatgpt') + need('claude') ? 'claude' : 'gemini'))

  // Each chat on its day: the table's when it says, else any day of the last four months.
  const conversations: Conv[] = []
  const items: Item[] = []
  const fresh: Conv[] = []
  let k = 0
  for (const s of specs) {
    const platform = s.fresh ? 'claude' : on[k++]!
    const daysAgo = s.days ?? rng.int(3, 120)
    let built: { conversation: Conv; items: Item[] }
    do built = assembleChat({ title: s.title, platform, daysAgo, lines: s.lines }, { now, rng, ids, next })
    while (storyIds.has(built.conversation.platformConvId))
    items.push(...built.items)
    if (s.fresh) fresh.push(built.conversation)
    else conversations.push(built.conversation)
  }
  const rules = RULE_CHATS.map((c) => ruleChat(c, on[k++]!, { now, rng, ids }))

  // The new chats are moved to the film's day, each ending a little before Maya opens Claude.
  const moved = fresh.map((c, i) => {
    const shift = clock - (FRESH - i) * 47 * 60_000 - updated(c)
    const move = (iso?: string) => (iso ? new Date(Date.parse(iso) + shift).toISOString() : iso)
    return { ...c, messages: c.messages.map((m) => ({ ...m, createdAt: move(m.createdAt) })), createdAt: move(c.createdAt), updatedAt: move(c.updatedAt), capturedAt: new Date(now).toISOString() }
  })
  const truth = storyTruth(story)
  const set: Gold = { ...truth, conversations: [...truth.conversations, ...conversations, ...moved], items: [...truth.items, ...items] }
  const extract = [...conversations, ...rules, ...story.conversations.filter((c) => c.platform in SPLIT)].sort((a, b) => updated(a) - updated(b))
  return { set, extract, fresh: moved }
}
