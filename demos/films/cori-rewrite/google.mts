/**
 * Writes fake Gmail's full window compose and fake Docs' cover letter as
 * static pages, from coere-v2's own fake Google servers answering the
 * addresses the film opened. Each page gets the film's tab bundle first in
 * its head (rewrite.ts), which gives it the demo's chrome and Cori.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const V2 = process.env.COERE_V2!
const OUT = process.env.OUT!
const { fakeGoogle } = await import(join(V2, 'tests/fake-google/hosts.ts'))
const { DOC_IDS } = await import(join(V2, 'tests/fake-google/docs/seed.ts'))

const google = fakeGoogle()
const pages: Record<string, string> = {
  'gmail.html': 'https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1',
  'docs.html': `https://docs.google.com/document/d/${DOC_IDS.letter}/edit`,
}
mkdirSync(OUT, { recursive: true })
for (const [file, address] of Object.entries(pages)) {
  const url = new URL(address)
  const page = await google.hosts.get(url.hostname)!.serve('GET', url, null)
  const html = String(page.body).replace('<head>', `<head><script>window.__demoAddress=${JSON.stringify(address)}</script><script src="../rewrite.js"></script>`)
  writeFileSync(join(OUT, file), html)
}
