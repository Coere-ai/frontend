import { colorOf, LIGHT_THEME } from '@v2/packages/ui/src/graph2d/theme'
import { sectionHue } from '@v2/apps/extension/src/console/memory/points/look'
import { play } from '../../stage/player'
import { role, text, type Query } from '../../stage/query'
import type { Stage, Tab } from '../../stage/stage'
import type { World } from '../../stage/world'
import baked from './data/memory.json'
import { MemoryWorld } from './world'

/**
 * Coere Memory, ported beat by beat from coere-v2's
 * tools/demo-video/memory.demo.ts (the parts its `memory` director films):
 * onboarding's build step and Build my memory, the graph growing, then the
 * Memory page with All, Memories and Chats, a section up close and a
 * search that lights what it finds. Onboarding and the dashboard are
 * Coere's own pages; their memory is the one coere-v2's build made from
 * Maya's chats (world.ts).
 */

/** `seconds` is each chapter's length in a full run, measured, for the site's play bar. */
const CHAPTERS = [
  { id: 'build', title: 'Build your memory', seconds: 9 },
  { id: 'grow', title: 'The graph grows', seconds: 10 },
  { id: 'memory', title: 'Your memory', seconds: 7 },
  { id: 'layers', title: 'Memories and chats', seconds: 13 },
  { id: 'up-close', title: 'Up close', seconds: 7 },
  { id: 'search', title: 'Search', seconds: 10 },
]

const LIB = '/preview/live/lib/'
let current: MemoryWorld | null = null

function setup(world: World): void {
  current?.stop()
  current = new MemoryWorld(world)
  current.install()
}

/** The layer chips above the graph: All, Memories, Chats. */
const layer = (name: string): Query => text(new RegExp(`^${name}$`), '.cx-mem-seg-item')
const searchBox = role('combobox', 'Search memory and chats')
/** What the graph last said for a screen reader, as the film's check reads it. */
const graphSaid = (doc: Document) => [...doc.querySelectorAll('.cx-mp-hero [aria-live="polite"]')].at(-1)?.textContent ?? ''

async function film(s: Stage): Promise<void> {
  const memory = current!

  // Coere Memory: the build. Extract all ended off camera, and Done leads to the build step, behind the title card.
  await chapter(s, 'build')
  s.say('Coere builds a memory from Maya’s chats, with her own keys.')
  const card = s.card('Coere Memory', 'What your chats taught Coere, as one graph around you.', 2600)
  const onboarding = await s.open('onboarding', `${LIB}onboarding-v2.html`)
  const done = await s.waitFor(onboarding, role('button', 'Done', { exact: true }), 30_000)
  ;(done as HTMLElement).click()
  await s.waitFor(onboarding, role('button', 'Build my memory'))
  await s.waitFor(onboarding, text(/for \d+ chats\./, '.ob-estimate'))
  await card
  await s.film(onboarding)
  s.say('Nothing goes to an AI until she presses Build my memory.')
  await s.glide(onboarding, role('group', 'What should Coere build memory from?'))
  await s.wait(2600)
  await s.click(onboarding, role('button', 'Build my memory'), { after: 200 })
  await s.rest()

  await chapter(s, 'grow')
  s.say('Coere reads her chats and the graph grows, section by section.')
  await s.waitFor(onboarding, '.ob-grow-canvas')
  await s.wait(7000)
  memory.finish()

  // Coere Memory: the Memory page.
  memory.clearBatch()
  const page = await s.open('memory', 'index.html?page=console&tab=memory')
  await s.waitFor(page, searchBox)
  await s.waitFor(page, 'canvas.cx-mp-canvas')
  await settledDrawn(s, page)
  await s.film(page)
  await chapter(s, 'memory')
  s.say('The Memory page draws everything as one graph, with Maya in the middle and a section for each part of her life.')
  await s.wait(3600)
  s.say('Each memory sits beside the chats it came from, the small dots around it.')
  await s.wait(3000)

  await chapter(s, 'layers')
  s.say('All shows both. Memories shows only what Coere learned.')
  await s.click(page, layer('Memories'), { after: 400 })
  await s.rest()
  await s.wait(2600)
  s.say('Chats shows only the chats, each round the thing it taught.')
  await s.click(page, layer('Chats'), { after: 400 })
  await s.rest()
  await s.wait(2600)
  await s.click(page, layer('All'), { after: 400 })
  await s.rest()
  await s.wait(800)

  await chapter(s, 'up-close')
  s.say('A click opens a section, with its folders, memories and chats.')
  await settledDrawn(s, page)
  await s.clickAt(page, sectionSpot(page, 'School'), { after: 0 })
  await until(() => graphSaid(page.doc) === 'Showing School up close.', 'School up close')
  await s.rest()
  await s.wait(3200)
  await s.press(page, 'Escape')
  await s.wait(900)

  await chapter(s, 'search')
  s.say('Search lists the top four matches and lights them on the graph.')
  await s.click(page, searchBox, { after: 150 })
  await s.type(page, 'MATH 54', 80)
  await s.waitFor(page, role('listbox', 'Search results'))
  await s.rest()
  await s.wait(3800)
  await s.press(page, 'Escape')
  await s.wait(600)
  s.say('Every memory keeps the chat and the words it came from.')
  await s.card('Coere Memory', 'Every memory keeps the messages it came from.', 2400)
  // For whoever works on the film: calls the baked memory or the World did not answer.
  if (memory.missed.length) console.log('MISSED', JSON.stringify([...new Set(memory.missed)]))
  if (s.world.unanswered.length) console.log('UNANSWERED', JSON.stringify([...new Set(s.world.unanswered.map((u) => `${u.tab} ${u.type}`))]))
}

/**
 * Starts a chapter. A chapter played alone (`from`) is revealed a frame
 * after it starts, and until then the stage is still skipping, when a wait
 * passes in one frame: the chapter's first beat would be lost (the grow
 * chapter's whole build). Two frames let the reveal land first; a chapter
 * the run is skipping past loses only those.
 */
async function chapter(s: Stage, id: string): Promise<void> {
  s.chapter(id)
  for (let i = 0; i < 2 && s.fast; i++) await new Promise((r) => requestAnimationFrame(r))
}

/** Waits until `done` holds, as the film's expect does. */
async function until(done: () => boolean, what: string, timeout = 20_000): Promise<void> {
  const end = Date.now() + timeout
  while (!done()) {
    if (Date.now() > end) throw new Error(`never: ${what}`)
    await new Promise((r) => setTimeout(r, 50))
  }
}

const canvasOf = (tab: Tab) => tab.doc.querySelector<HTMLCanvasElement>('canvas.cx-mp-canvas')

/** What share of the graph's canvas shows something over the card (tests/e2e/helpers/console/memory-graph.ts). */
function drawnShare(tab: Tab): number {
  const c = canvasOf(tab)
  const ctx = c?.getContext('2d')
  if (!c || !ctx || c.width === 0) return 0
  const { data } = ctx.getImageData(0, 0, c.width, c.height)
  const [r0, g0, b0] = [data[0]!, data[1]!, data[2]!]
  let n = 0
  for (let i = 0; i < data.length; i += 4) if (Math.abs(data[i]! - r0) + Math.abs(data[i + 1]! - g0) + Math.abs(data[i + 2]! - b0) > 60) n++
  return n / (data.length / 4)
}

/** Waits until the graph stops changing, as the film's settledDrawn does. */
async function settledDrawn(s: Stage, tab: Tab): Promise<void> {
  let last = drawnShare(tab)
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, s.fast ? 250 : 400))
    const now = drawnShare(tab)
    if (last > 0 && Math.abs(now - last) / last < 0.03) return
    last = now
  }
}

/**
 * Where a section sits on the graph (tools/demo-video/stage/graph.ts): the
 * graph is a canvas, and a section is the biggest patch of its colour,
 * the colour the page gives the section's place in the overview.
 */
function sectionSpot(tab: Tab, name: string): { x: number; y: number } {
  const overview = (baked as unknown as { answers: Array<{ method: string; answer: { nodes: Array<{ kind: string; label: string }> } }> }).answers.find((a) => a.method === 'memory.overview')!.answer
  const index = overview.nodes.filter((n) => n.kind === 'section').findIndex((n) => n.label === name)
  const hex = colorOf(LIGHT_THEME, sectionHue(index))
  const c = canvasOf(tab)!
  const box = c.getBoundingClientRect()
  // Past the ninth section the colours come round again, so two hubs can share School's: the one with its folders and memories round it is School's.
  const patches = patchesOf(c, hex, 30)
  const big = patches.filter((p) => p.area >= (patches[0]?.area ?? 0) * 0.6)
  const patch = big.length > 1 ? big.map((p) => ({ p, near: patches.filter((q) => Math.hypot(q.x - p.x, q.y - p.y) < 160).reduce((n, q) => n + q.area, 0) + nearby(c, hex, p, 160) })).sort((a, b) => b.near - a.near)[0]!.p : big[0]
  if (!patch) throw new Error(`no section on the graph is called ${name}`)
  return { x: box.left + patch.x, y: box.top + patch.y }
}

/** How many pixels of one colour lie within `radius` of a point on the canvas: a section's own fan is drawn in its colour. */
function nearby(canvas: HTMLCanvasElement, hex: string, at: { x: number; y: number }, radius: number): number {
  const ctx = canvas.getContext('2d')!
  const ratio = canvas.width / canvas.clientWidth
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  const [cx, cy, rr] = [at.x * ratio, at.y * ratio, radius * ratio]
  const x0 = Math.max(0, Math.floor(cx - rr))
  const y0 = Math.max(0, Math.floor(cy - rr))
  const w = Math.min(canvas.width, Math.ceil(cx + rr)) - x0
  const h = Math.min(canvas.height, Math.ceil(cy + rr)) - y0
  if (w <= 0 || h <= 0) return 0
  const { data } = ctx.getImageData(x0, y0, w, h)
  let n = 0
  for (let i = 0; i < w * h; i++) {
    const [x, y] = [x0 + (i % w), y0 + Math.floor(i / w)]
    if (Math.hypot(x - cx, y - cy) > rr) continue
    if (Math.abs(data[i * 4]! - r!) + Math.abs(data[i * 4 + 1]! - g!) + Math.abs(data[i * 4 + 2]! - b!) <= 60) n++
  }
  return n / (ratio * ratio)
}

/** Every flat patch of one colour on the canvas, biggest first (tests/e2e/helpers/console/graph-points.ts). */
function patchesOf(canvas: HTMLCanvasElement, hex: string, least: number): Array<{ x: number; y: number; area: number }> {
  const ctx = canvas.getContext('2d')!
  const { width: w, height: h } = canvas
  const ratio = w / canvas.clientWidth
  const { data } = ctx.getImageData(0, 0, w, h)
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  const hit = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) if (Math.abs(data[i * 4]! - r!) + Math.abs(data[i * 4 + 1]! - g!) + Math.abs(data[i * 4 + 2]! - b!) <= 6) hit[i] = 1
  const out: Array<{ x: number; y: number; area: number }> = []
  const stack: number[] = []
  for (let start = 0; start < w * h; start++) {
    if (hit[start] !== 1) continue
    hit[start] = 2
    stack.push(start)
    let [n, sx, sy] = [0, 0, 0]
    while (stack.length > 0) {
      const i = stack.pop()!
      const [x, y] = [i % w, Math.floor(i / w)]
      n++
      sx += x
      sy += y
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1])
        if (j >= 0 && hit[j] === 1) {
          hit[j] = 2
          stack.push(j)
        }
    }
    const area = n / (ratio * ratio)
    if (area >= least) out.push({ x: sx / n / ratio, y: sy / n / ratio, area })
  }
  return out.sort((a, b) => b.area - a.area)
}

// The same page is the film's dashboard tab: Coere's dashboard with the Memory page's sheets in place (console.ts).
if (new URLSearchParams(location.search).get('page') === 'console') {
  document.title = 'Coere dashboard'
  const app = document.createElement('div')
  app.id = 'app'
  const script = document.createElement('script')
  script.src = 'console.js'
  document.body.append(app, script)
} else play({ title: 'Coere Memory', chapters: CHAPTERS }, film, setup)
