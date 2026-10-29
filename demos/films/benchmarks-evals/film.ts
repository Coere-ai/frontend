import { play } from '../../stage/player'
import { deep, deepAll, role, shown, text, type Query } from '../../stage/query'
import type { Stage, Tab } from '../../stage/stage'
import type { World } from '../../stage/world'
import { setupConsole } from './console-world'
import { LabWorld } from './lab-world'

/**
 * Benchmarks and Evals, ported beat by beat from coere-v2's
 * tools/demo-video/benchmarks-evals.demo.ts: in Settings, Enable Dev Tools
 * adds Benchmarks and Evals to the dashboard's rail; she downloads LoCoMo,
 * reads the estimate, starts a run and watches it build and answer, opens
 * the result, exports it, runs again with the cheaper judge and compares
 * the two; then Evals runs Coere's Extraction checks. The sections are
 * Coere's own (console/lab); the lab's every answer is what coere-v2's lab
 * host gave when bake.mts ran these same steps (lab-world.ts). Where the
 * film cut a long run, the run plays here, a little faster than it ran.
 */

const CHAPTERS = [
  { id: 'devtools', title: 'Dev Tools' },
  { id: 'estimate', title: 'The estimate' },
  { id: 'run', title: 'A run' },
  { id: 'results', title: 'Results' },
  { id: 'export', title: 'Export' },
  { id: 'compare', title: 'Compare' },
  { id: 'evals', title: 'Evals' },
]

const LIB = '/preview/live/lib/'
let lab: LabWorld | null = null

function setup(world: World): void {
  lab?.stop()
  lab = new LabWorld(world)
  lab.install()
  setupConsole(world)
}

/** A section in the dashboard's rail (the tablist named Sections). */
const section = (name: string): Query => role('tab', name, { exact: true, within: '[role="tablist"][aria-label="Sections"]' })

/** One of the lab's cards, by its heading: LoCoMo, Runs, Compare, or a run opened from the list. */
const card =
  (name: string | RegExp): Query =>
  (doc) =>
    deepAll(doc, 'section.cx-lab-card').find((el) => {
      const h = (el.querySelector('h2')?.textContent ?? '').trim()
      return shown(el) && (typeof name === 'string' ? h === name : name.test(h))
    })

/** Something inside a card found first. */
const inCard =
  (outer: Query, inner: (scope: Element) => Element | null | undefined): Query =>
  (doc) => {
    const scope = typeof outer === 'function' ? outer(doc) : deep(doc, outer)
    return scope ? inner(scope) : null
  }

const button = (outer: Query, name: string | RegExp): Query =>
  inCard(outer, (scope) => [...scope.querySelectorAll('button')].find((b) => shown(b) && (typeof name === 'string' ? (b.textContent ?? '').trim() === name : name.test((b.textContent ?? '').trim()))))

/** A field of the run's choices, by its label. */
const field = (outer: Query, label: string): Query =>
  inCard(outer, (scope) => [...scope.querySelectorAll('label.cx-lab-field')].find((l) => l.querySelector('span')?.textContent === label)?.querySelector('select, input'))

const runs = card('Runs')
/** The nth run in the Runs list, newest first. */
const runRow = (n: number): Query => inCard(runs, (scope) => scope.querySelectorAll('li.cx-lab-run')[n])
const inRow = (n: number, name: string): Query =>
  (doc) => {
    const row = (runRow(n) as (d: Document) => Element | null)(doc)
    return row ? [...row.querySelectorAll('button')].find((b) => (b.textContent ?? '').trim() === name) : null
  }
const rowBox = (n: number): Query => (doc) => (runRow(n) as (d: Document) => Element | null)(doc)?.querySelector('[role="checkbox"], input[type="checkbox"]')
const job: Query = '.cx-lab-job'

/** Polls until `test` holds; while the player skips ahead, a job going on ends at once. */
async function until(s: Stage, test: () => boolean, ms = 60_000): Promise<void> {
  const end = Date.now() + ms
  while (!test()) {
    if (s.fast) lab?.finish()
    if (Date.now() > end) throw new Error('benchmarks-evals: timed out')
    await new Promise((r) => setTimeout(r, 50))
  }
}

/** Picks an option of a select as a hand does: to it, a press, and the choice. */
async function choose(s: Stage, tab: Tab, q: Query, value: string): Promise<void> {
  await s.click(tab, q, { after: 380 })
  const el = (await s.waitFor(tab, q)) as HTMLSelectElement
  el.value = value
  el.dispatchEvent(new Event('change', { bubbles: true }))
  el.dispatchEvent(new Event('input', { bubbles: true }))
  await s.wait(420)
}

/** Where the page scrolls to put an element at its top, as the film's toTop puts it, without moving it there. */
function topOf(tab: Tab, el: Element, room = 24): number {
  const doc = tab.doc.scrollingElement!
  const was = doc.scrollTop
  el.scrollIntoView({ block: 'start' })
  const to = Math.max(0, doc.scrollTop - room)
  doc.scrollTop = was
  return to
}

/** Scrolls the page with the wheel under the pointer until `el` sits near the top, the way she scrolls to it. */
async function scrollToTop(s: Stage, tab: Tab, q: Query, room = 24): Promise<void> {
  const el = await s.waitFor(tab, q)
  const dy = topOf(tab, el, room) - tab.doc.scrollingElement!.scrollTop
  if (Math.abs(dy) < 4) return
  await s.moveTo({ x: 1240, y: 520 })
  await s.wheel(tab, dy, Math.max(10, Math.min(36, Math.round(Math.abs(dy) / 28))))
  tab.doc.scrollingElement!.scrollTop += topOf(tab, el, room) - tab.doc.scrollingElement!.scrollTop
}

/** Waits until the page stops moving `el` as it draws, as the film's settled() waits for a still page. */
async function settled(el: Element): Promise<void> {
  let last = Number.NaN
  for (let still = 0, i = 0; still < 6 && i < 100; i++) {
    const top = el.getBoundingClientRect().top
    still = top === last ? still + 1 : 0
    last = top
    await new Promise((r) => setTimeout(r, 50))
  }
}

/**
 * A press of the scripted hand gives focus the way a mouse does, with no
 * focus ring: the stage focuses what it presses with `{ preventScroll: true }`
 * (stage/input.ts), which Chrome draws as keyboard focus when no real input
 * came first, so here that one call also says focusVisible: false.
 */
function mouseFocus(tab: Tab): void {
  const proto = (tab.win as unknown as { HTMLElement: typeof HTMLElement }).HTMLElement.prototype
  const focus = proto.focus
  proto.focus = function (this: HTMLElement, o?: FocusOptions & { focusVisible?: boolean }) {
    const pressed = o && o.preventScroll === true && !('focusVisible' in o)
    return focus.call(this, pressed ? { ...o, focusVisible: false } : o)
  }
}

/** Scrolls the Settings page's own box so `el` sits in its middle, as scrollIntoViewIfNeeded does. */
function centerIn(el: Element): void {
  el.scrollIntoView({ block: 'center' })
}

async function film(s: Stage): Promise<void> {
  const world = lab!
  world.fast = () => s.fast

  s.chapter('devtools')
  const page = await s.open('dash', `${LIB}console-v2.html?tab=settings`)
  mouseFocus(page)
  const devTools = role('switch', 'Enable Dev Tools')
  await settled(await s.waitFor(page, devTools))
  centerIn(await s.waitFor(page, devTools))
  s.say('Coere can score its own memory, right from the dashboard.')
  await s.card('Benchmarks and Evals', 'Measure Coere’s memory, and check it before each version.', 2600)
  await s.film(page)
  s.say('In Settings, Enable Dev Tools adds Benchmarks and Evals to the dashboard.')
  await s.click(page, devTools, { after: 600 })
  await s.click(page, section('Benchmarks'), { after: 400 })
  const locomo = card('LoCoMo')
  await s.waitFor(page, locomo)
  await s.rest()
  s.say('Runs use a separate scratch memory. Maya’s own chats and memory are never touched.')
  await s.wait(3200)

  s.chapter('estimate')
  s.say('She downloads LoCoMo, a public benchmark of long conversations.')
  await s.click(page, button(locomo, /^Download/), { after: 300 })
  await s.waitFor(page, text(/^Downloaded .*questions\.$/, 'span', { within: locomo }), 60_000)
  await s.wait(500)
  await choose(s, page, field(locomo, 'Questions'), 'all')
  await s.rest()
  s.say('Before anything runs, it says about how much the run will cost.')
  await s.glide(page, inCard(locomo, (c) => c.querySelector('.cx-lab-estimate')))
  await s.wait(3200)

  s.chapter('run')
  s.say('Start builds a memory from the conversations, then answers each question and judges the answers.')
  await s.click(page, button(locomo, 'Start'), { after: 300 })
  // While the player skips ahead the run ends at once, so its progress never shows.
  if (!s.fast) await s.waitFor(page, text(/^Building memory/, '.cx-lab-job-what'), 60_000)
  await s.rest()
  await until(s, () => !s.has(page, job))
  await s.waitFor(page, text(/^Done\./, '.cx-lab-note', { within: runRow(0) }))
  await s.wait(900)

  s.chapter('results')
  s.say('The result scores it the benchmark’s own way, by category, and says what each part cost.')
  await scrollToTop(s, page, runs)
  await s.click(page, inRow(0, 'View'), { after: 300 })
  const view: Query = '.cx-lab-view'
  await s.waitFor(page, text(/^F1$/, '.cx-lab-tile-label', { within: view }))
  await scrollToTop(s, page, card(/^LoCoMo, /))
  await s.rest()
  await s.wait(3600)
  await s.moveTo({ x: 800, y: 500 })
  await s.wheel(page, 360)
  s.say('It also shows how little context Coere sent, against the whole history.')
  await s.wait(3400)
  await s.rest()

  s.chapter('export')
  await scrollToTop(s, page, runs)
  s.say('Export .txt saves the run as a plain report, with every case, its answer and its score.')
  await s.click(page, inRow(0, 'Export .txt'), { after: 400 })
  await s.rest()
  await s.wait(2400)

  // A second run with the cheaper judge, then the two compared.
  s.chapter('compare')
  s.say('A second run uses a cheaper judge. She ticks both runs and presses Compare.')
  // Back to the top, where the run's progress shows above LoCoMo.
  await scrollToTop(s, page, '.cx-lab-about', 200)
  await choose(s, page, field(locomo, 'Judge model'), 'haiku')
  await s.click(page, button(locomo, 'Start'), { after: 300 })
  if (!s.fast) await s.waitFor(page, job)
  await s.rest()
  await until(s, () => !s.has(page, job))
  await s.wait(600)
  await scrollToTop(s, page, runs)
  await s.click(page, rowBox(0), { after: 200 })
  await s.click(page, rowBox(1), { after: 200 })
  await s.click(page, button(runs, 'Compare'), { after: 600 })
  const compare = card('Compare')
  await s.waitFor(page, text('Judged correct', 'th', { within: compare }))
  await scrollToTop(s, page, compare)
  await s.rest()
  s.say('Each score and cost side by side, with the change, ready to export.')
  await s.wait(4000)

  // Evals: Coere's own checks, in check mode.
  s.chapter('evals')
  await s.click(page, section('Evals'), { after: 400 })
  await s.waitFor(page, card('Sets'))
  page.doc.scrollingElement!.scrollTop = 0
  s.say('Evals runs Coere’s own checks, the same cases as the command line. Check mode costs nothing.')
  for (const name of ['Changing chats and structure', 'Memory adding', 'Cori routing and gates']) await s.click(page, role('checkbox', name), { after: 220 })
  await s.rest()
  await s.wait(1800)
  await s.click(page, role('button', 'Run', { exact: true }), { after: 400 })
  if (!s.fast) await s.waitFor(page, job)
  await s.rest()
  await s.wait(2600)
  await until(s, () => !s.has(page, job))
  await s.click(page, inRow(0, 'View'), { after: 300 })
  await s.waitFor(page, '.cx-lab-cases tbody tr', 30_000)
  await scrollToTop(s, page, '.cx-lab-sets')
  await s.rest()
  s.say('Every check held. Each case shows what it expected and what it got.')
  await s.wait(4000)
  s.say('Benchmarks and Evals stay off until Dev Tools is on.')
  await s.card('Benchmarks and Evals', 'In the dashboard, behind Dev Tools.', 2400)
  // Anything the real code asked that this film's World left unanswered, for whoever changes the film.
  if (s.world.unanswered.length) console.warn('Benchmarks and Evals: unanswered', JSON.stringify(s.world.unanswered))
}

play({ title: 'Benchmarks and Evals', chapters: CHAPTERS }, film, setup)
