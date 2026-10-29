/**
 * Writes levels.json: the loudness of coere-v2's recorded question
 * (tests/fixtures/voice/phrase.wav, the clip its films and e2e suite play
 * through Chromium's fake microphone), in decibels for each 20 ms frame,
 * the frame the microphone's worklet hands on. The demo has no microphone
 * and makes no sound, so its stand in microphone makes frames this loud.
 *
 *   cd <coere-v2> && node_modules/.bin/tsx <this file>
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const V2 = process.cwd()
const { rmsDb } = await import(join(V2, 'apps/extension/src/voice/core/level.ts'))
const wav = readFileSync(join(V2, 'tests/fixtures/voice/phrase.wav'))

/** The data chunk of a 16 bit mono PCM file, as samples from -1 to 1. */
function samplesOf(buf: Buffer): { rate: number; samples: Float32Array } {
  let at = 12
  let rate = 0
  while (at < buf.length) {
    const id = buf.toString('ascii', at, at + 4)
    const size = buf.readUInt32LE(at + 4)
    if (id === 'fmt ') rate = buf.readUInt32LE(at + 12)
    if (id === 'data') {
      const samples = new Float32Array(size / 2)
      for (let i = 0; i < samples.length; i++) samples[i] = buf.readInt16LE(at + 8 + i * 2) / 32768
      return { rate, samples }
    }
    at += 8 + size + (size % 2)
  }
  throw new Error('no data chunk')
}

const { rate, samples } = samplesOf(wav)
const step = Math.round(rate * 0.02)
const db: number[] = []
for (let i = 0; i + step <= samples.length; i += step) db.push(Math.round(rmsDb(samples.subarray(i, i + step)) * 10) / 10)
const out = join(dirname(fileURLToPath(import.meta.url)), 'levels.json')
writeFileSync(out, JSON.stringify({ source: 'tests/fixtures/voice/phrase.wav', frameMs: 20, db }) + '\n')
console.log(`wrote ${db.length} frames to ${out}`)
