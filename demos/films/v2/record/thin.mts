/**
 * Keeps the tape small. While memory builds, onboarding asks for the whole
 * graph again at each step, and the recorder keeps every answer: sixty
 * graphs of several hundred memories each. The film plays that build in a
 * few seconds, so a graph every few steps is all it can show; the rest go.
 * The first and the last answer of each part are always kept, so the
 * graph starts and ends where the real build did.
 *
 *   node <v2>/node_modules/tsx/dist/cli.mjs thin.mts   rewrites ../data/tape.json
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

type Tape = { pool: Record<string, unknown>; phases: { name: string; ms: number; calls: [number, string, string][]; events: unknown[] }[] }

/** How many answers of each heavy method a part keeps. */
const KEEP: Record<string, number> = { 'memory.overview': 14 }

export function thin(tape: Tape): Tape {
  const phases = tape.phases.map((p) => {
    const drop = new Set<number>()
    for (const [method, keep] of Object.entries(KEEP)) {
      const at = p.calls.flatMap((c, i) => (c[1].startsWith(`${method} `) ? [i] : []))
      if (at.length <= keep) continue
      const kept = new Set(Array.from({ length: keep }, (_, n) => at[Math.round((n * (at.length - 1)) / (keep - 1))]!))
      for (const i of at) if (!kept.has(i)) drop.add(i)
    }
    return { ...p, calls: p.calls.filter((_, i) => !drop.has(i)) }
  })
  const used = new Set(phases.flatMap((p) => p.calls.map((c) => c[2])))
  return { pool: Object.fromEntries(Object.entries(tape.pool).filter(([id]) => used.has(id))), phases }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = join(dirname(fileURLToPath(import.meta.url)), '../data/tape.json')
  const before = readFileSync(file, 'utf8')
  const out = JSON.stringify(thin(JSON.parse(before)))
  writeFileSync(file, out)
  console.log(`tape: ${before.length} to ${out.length} bytes`)
}
