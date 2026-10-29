/**
 * Runs the Benchmarks and Evals film's lab once, for real, in Node: the
 * extension's own lab host (apps/extension/src/engine/bench/host.ts) on
 * the fake build's tiny LoCoMo and LongMemEval files (build/bench-fake.ts,
 * served as engine/bench/fake-sources.ts reads them), its benchmark runs
 * building scratch memories with Coere's real build against the fake
 * Claude and Jev in process (packages/memory bench/testing/node-scratch.ts,
 * as the host's own test runs it), and Coere's Extraction eval set in check
 * mode through the same adapters `pnpm evals` and the Evals page run.
 *
 * The film's steps, in its order: Download LoCoMo, the estimate for every
 * choice the page can make, a run of all its questions judged by Sonnet,
 * a second judged by Haiku, then Evals on Extraction. Every lab.state the
 * page would poll while each job ran is written down with its time, and
 * after them each run whole and its exports, so the demo's World answers
 * the dashboard with what the lab answered.
 *
 *   COERE_V2=/path/to/coere-v2 $COERE_V2/node_modules/.bin/tsx demos/films/benchmarks-evals/bake.mts
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const V2 = process.env.COERE_V2
if (!V2) throw new Error('COERE_V2 names the coere-v2 checkout')
const v2 = (p: string) => import(join(V2, p))

const { labHost } = await v2('apps/extension/src/engine/bench/host.ts')
const { fakeSources } = await v2('apps/extension/src/engine/bench/fake-sources.ts')
const { benchFakeFiles } = await v2('apps/extension/build/bench-fake.ts')
const { EXTENSION_VERSION } = await v2('apps/extension/build/version.ts')
const { memoryFiles, fakeFetch, wordsEmbedder } = await v2('packages/memory/src/bench/testing/node-scratch.ts')
const { FAKE_KEY } = await v2('tests/fake-claude/rules.ts')
const { PAGE_SUITES } = await v2('evals/suites/index.ts')
const { runSuites } = await v2('evals/suites/run-suites.ts')

/** The film's day: the lab's clock starts here and runs on with the real one. */
const START = Date.parse('2026-10-29T13:55:00Z')
const t0 = Date.now()
const now = () => START + (Date.now() - t0)

/** A folder in memory, as the lab's OPFS folders are to it. */
function store() {
  const files = new Map<string, Uint8Array>()
  return {
    read: async (p: string) => files.get(p) ?? null,
    write: async (p: string, b: Uint8Array) => void files.set(p, b),
    remove: async (f: string) => {
      for (const k of [...files.keys()]) if (k === f || k.startsWith(`${f}/`)) files.delete(k)
    },
    list: async (f: string) => [...files.keys()].filter((k) => k.startsWith(`${f}/`)).map((k) => k.slice(f.length + 1)),
  }
}

// The fake build serves its tiny files from the extension itself; here from memory, at the same address.
const ORIGIN = 'chrome-extension://coere'
const tiny = new Map<string, string>(benchFakeFiles().map((f: { relativeDest: string; contents: string }) => [`${ORIGIN}/${f.relativeDest}`, f.contents]))
/** A file's bytes a few at a time, as a slow line brings them, so the download's own progress has steps to show. */
function trickle(text: string): ReadableStream<Uint8Array> {
  const bytes = new TextEncoder().encode(text)
  const step = Math.ceil(bytes.length / 8)
  let at = 0
  return new ReadableStream({
    async pull(c) {
      if (at >= bytes.length) return c.close()
      await new Promise((r) => setTimeout(r, 150))
      c.enqueue(bytes.slice(at, (at += step)))
    },
  })
}
const claudeFetch: typeof fetch = await fakeFetch(now)
const fetchAll: typeof fetch = (input, init) => {
  const url = new Request(input, init).url
  const file = tiny.get(url)
  return file !== undefined ? Promise.resolve(new Response(trickle(file), { headers: { 'content-length': String(file.length) } })) : claudeFetch(input, init)
}
const sources = await fakeSources(ORIGIN, fetchAll)

const files = memoryFiles()
const reveal = (value: string) => ({ reveal: () => value, toJSON: () => '[key]' })
const models = { extract: 'claude-sonnet-5-5', consolidate: 'claude-sonnet-5-5', short: 'claude-haiku-5-5' }
const runs = store()

const lab = labHost({
  data: store(),
  runs,
  scratch: { openFile: files.openFile, removeRun: files.removeRun, sweep: async () => 0 },
  // The fake build's sealed settings: the fake Claude's key, and Jev's.
  claude: { key: reveal(FAKE_KEY), jevKey: reveal('ts-fake-coere-0000'), models, effort: 'medium', capUsd: 20, askAboveUsd: 2, backfill: 'direct' },
  fetch: fetchAll,
  now,
  embedder: () => wordsEmbedder(),
  version: `${EXTENSION_VERSION} Coere v2`,
  build: async () => 'fake-v2',
  app: { app: 'coere', version: EXTENSION_VERSION },
  // The fake build runs its scratch clock faster against the fake Claude (engine/bench/start.ts).
  speed: 30,
  sources,
  // Coere's own sets as `pnpm evals` runs them in Node: the set files from disk, the scenarios from their folders.
  evals: async () => async (r: { id: string; sets: string[]; live: boolean; capUsd: number; stamp: unknown; signal: AbortSignal; save(run: unknown): Promise<void>; progress(done: number, total: number, phase: string): void }) =>
    runSuites({
      id: r.id,
      stamp: r.stamp,
      suites: PAGE_SUITES.filter((s: { id: string }) => r.sets.length === 0 || r.sets.includes(s.id)),
      env: { read: (path: string) => readFile(join(V2, 'evals', path), 'utf8'), live: null, capUsd: r.capUsd, world: { embedder: wordsEmbedder() }, signal: r.signal },
      save: r.save,
      now,
      progress: (p: { index: number; suites: number; suite: string }) => r.progress(p.index, p.suites, p.suite),
    }),
})
await lab.start()

const call = (method: string, args?: unknown) => lab.methods[method](args)

type Snap = { t: number; state: unknown }
/** Starts a job and writes down every state the page would read, until the job is over. */
async function record(name: string, begin: () => Promise<unknown>): Promise<{ answer: unknown; states: Snap[] }> {
  const from = Date.now()
  const answer = await begin()
  const states: Snap[] = [{ t: 0, state: await call('lab.state') }]
  let last = JSON.stringify(states[0]!.state)
  for (;;) {
    await new Promise((r) => setTimeout(r, 40))
    const s = (await call('lab.state')) as { job: unknown }
    const json = JSON.stringify(s)
    if (json !== last) states.push({ t: Date.now() - from, state: s })
    last = json
    if (s.job === null) break
  }
  console.error(`${name}: ${Date.now() - from} ms, ${states.length} states`)
  return { answer, states }
}

const initial = await call('lab.state')
const download = await record('download', () => call('lab.download', { bench: 'locomo' }))

// The estimate for every choice the page offers, as RunSetup asks it on each change.
const estimates: Array<{ args: unknown; answer: unknown }> = []
for (const sample of [10, 50, 'all'])
  for (const answer of ['haiku', 'sonnet'])
    for (const judge of ['sonnet', 'haiku'])
      for (const baseline of [false, true]) {
        const args = { bench: 'locomo', sample, seed: 1, answer, judge, baseline }
        estimates.push({ args, answer: await call('lab.estimate', args) })
      }

const capOf = (o: Record<string, unknown>) => {
  const hit = estimates.find((e) => Object.entries(o).every(([k, v]) => (e.args as Record<string, unknown>)[k] === v))
  return (hit!.answer as { capMicros: number }).capMicros / 1e6
}
const first = { sample: 'all', answer: 'haiku', judge: 'sonnet', baseline: false }
const sonnet = await record('run, judged by Sonnet', () => call('lab.start', { bench: 'locomo', ...first, seed: 1, capUsd: capOf(first), keep: false }))
const second = { ...first, judge: 'haiku' }
const haiku = await record('run, judged by Haiku', () => call('lab.start', { bench: 'locomo', ...second, seed: 1, capUsd: capOf(second), keep: false }))
const evals = await record('evals', () => call('lab.evals', { sets: ['extraction'], live: false, capUsd: 5 }))

const ids = ((await call('lab.state')) as { runs: Array<{ id: string; kind: string }> }).runs
const whole: Record<string, unknown> = {}
const exports: Array<{ args: unknown; answer: unknown }> = []
for (const r of ids) {
  whole[r.id] = await call('lab.run', { id: r.id })
  for (const format of r.kind === 'benchmark' ? ['txt', 'json', 'official'] : ['txt', 'json']) {
    const args = { id: r.id, format }
    exports.push({ args, answer: await call('lab.export', args) })
  }
}
for (const r of ids) console.error(`${r.id}: ${JSON.stringify((await call('lab.state') as { runs: Array<{ id: string }> }).runs.find((x) => x.id === r.id))}`)

await mkdir(join(here, 'data'), { recursive: true })
await writeFile(join(here, 'data/lab.json'), JSON.stringify({ initial, download, estimates, sonnet, haiku, evals, runs: whole, exports }))
console.error('wrote data/lab.json')
process.exit(0)
