import type { World } from '../../stage/world'
import baked from './data/lab.json'

/**
 * The lab's side of the film: the engine worker's Benchmarks and Evals
 * methods (apps/extension/src/engine/bench/types.ts, LabApi), answered with
 * what coere-v2's own lab host answered when bake.mts ran the film's steps
 * in Node. Each job plays back as it ran: Download, Start or Run sets the
 * lab going, and every lab.state the page polls while it goes is the state
 * the host gave at that moment of the real job, on the film's clock. Each
 * run opens, compares and exports as the host wrote it.
 */

type State = { job: { kind: string; id: string } | null; runs: Array<{ id: string }>; [k: string]: unknown }
type Snap = { t: number; state: State }
type Job = { answer: unknown; states: Snap[] }
type Baked = {
  initial: State
  download: Job
  estimates: Array<{ args: Record<string, unknown>; answer: unknown }>
  sonnet: Job
  haiku: Job
  evals: Job
  runs: Record<string, unknown>
  exports: Array<{ args: { id: string; format: string }; answer: unknown }>
}
const data = baked as unknown as Baked

/**
 * How the film's clock runs against the bake's: the download at its own
 * speed, the first run a little quicker than Node ran it (the film cut its
 * long run), the second quicker again, and Evals, which Node checks in a
 * blink, held on screen long enough to read its line.
 */
const PACE = { download: 1, sonnet: 0.6, haiku: 0.36, evals: 1 } as const
const AT_LEAST = { download: 0, sonnet: 0, haiku: 0, evals: 2600 } as const

export class LabWorld {
  private state: State = data.initial
  private timers: number[] = []
  private last: State | null = null
  /** Whether the player is skipping ahead, when a job ends at once. */
  fast: () => boolean = () => false

  constructor(private readonly world: World) {}

  install(): void {
    const w = this.world
    w.engine('lab.state', () => this.state)
    w.engine('lab.download', () => this.play('download'))
    w.engine('lab.estimate', (m) => {
      const a = (m.args ?? {}) as Record<string, unknown>
      if (this.state === data.initial) return null
      return data.estimates.find((e) => ['sample', 'answer', 'judge', 'baseline'].every((k) => e.args[k] === (a[k] ?? (k === 'baseline' ? false : undefined))))?.answer ?? null
    })
    w.engine('lab.start', (m) => {
      const judge = (m.args as { judge?: string } | null)?.judge
      const which = judge === 'haiku' ? 'haiku' : 'sonnet'
      this.play(which)
      return data[which].answer
    })
    w.engine('lab.evals', () => {
      this.play('evals')
      return data.evals.answer
    })
    w.engine('lab.stop', () => this.state)
    w.engine('lab.run', (m) => data.runs[(m.args as { id: string }).id] ?? null)
    w.engine('lab.export', (m) => {
      const a = m.args as { id: string; format: string }
      return data.exports.find((e) => e.args.id === a.id && e.args.format === a.format)?.answer ?? null
    })
    w.engine('lab.delete', () => this.state)
    w.engine('lab.resume', () => null)
    w.engine('lab.import', () => this.state)
  }

  /** Plays one job back from its first state to its last, and answers with the first, as the host does. */
  private play(name: keyof typeof PACE): State {
    this.stop()
    const states = data[name].states
    const end = states.at(-1)!.t
    // A job the bake ran in a blink is spread over the time it is held for, its last state kept for the end.
    const scale = end * PACE[name] < AT_LEAST[name] ? AT_LEAST[name] / Math.max(1, end) : PACE[name]
    this.state = states[0]!.state
    this.last = states.at(-1)!.state
    if (this.fast()) {
      this.state = states.at(-1)!.state
      return states[0]!.state
    }
    for (const snap of states.slice(1)) this.timers.push(window.setTimeout(() => (this.state = this.fast() ? states.at(-1)!.state : snap.state), snap.t * scale))
    return this.state
  }

  /** Ends the job going on at once, in its last state, as when the player skips ahead. */
  finish(): void {
    this.stop()
    if (this.last) this.state = this.last
  }

  stop(): void {
    for (const t of this.timers) clearTimeout(t)
    this.timers = []
  }
}
