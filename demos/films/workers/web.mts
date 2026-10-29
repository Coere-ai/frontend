/**
 * Writes the fake web the workers read, from coere-v2's own fake pages
 * (tests/fake-pages/research): the search engine's results for each query
 * the film's two runs make, every page of the biotech company sites, and
 * the Boston directory. Each page gets the film's worker page bundle first
 * in its head (worker-page.ts, the Actions page script), the address it
 * stands for, and a base at that address, so its links read as the site's
 * own. The planted lines of coere-v2's injection tests are left out: this
 * film is not about them, and a preview could show their words.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { BASE, NONE, SITE_PAGES, WHATS, fileFor, searchFile } from './web-path.ts'

const V2 = process.env.COERE_V2!
const OUT = process.env.OUT!
const research = (f: string) => join(V2, 'tests/fake-pages/research', f)
const { COMPANIES, DIRECTORY_HOST } = await import(research('companies.ts'))
const { sitePage } = await import(research('site.ts'))
const { results } = await import(research('engine.ts'))
const { search } = await import(research('search-index.ts'))
const { companyServer } = await import(research('server.ts'))
const { createPagesStore } = await import(join(V2, 'tests/fake-pages/store.ts'))
const { SLICES } = await import(join(V2, 'tests/fake-claude/scenarios/actions-research.ts'))

const esc = (s: string) => JSON.stringify(s).replace(/</g, '\\u003c')

function write(file: string, address: string, body: unknown): void {
  const head = `<head><script>window.__demoAddress=${esc(address)}</script><script src="${BASE}worker-page.js"></script><base href="${address.replace(/"/g, '&quot;')}">`
  const out = join(OUT, file)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, String(body).replace('<head>', head))
}

let pages = 0
// The engine's results for each query a run makes (`${what} ${slice}`, as the fake model plans it), to the third page, the last a worker reads (worker-loop.ts).
for (const what of WHATS) {
  for (const slice of SLICES as string[]) {
    const q = `${what} ${slice}`
    const hits = search(q)
    for (let start = 0; start === 0 || (start < hits.length && start < 30); start += 10) {
      const address = `https://www.google.com/search?q=${encodeURIComponent(q).replace(/%20/g, '+')}${start ? `&start=${start}` : ''}`
      write(searchFile(q, start), address, results(q, hits, start).body)
      pages++
    }
  }
}

// Every company's site, without the planted lines.
for (const [i, c] of (COMPANIES as Array<{ host: string; injection: string | null }>).entries()) {
  for (const page of SITE_PAGES) {
    const address = `https://${c.host}${page === 'home' ? '/' : `/${page}`}`
    write(fileFor(address)!, address, sitePage({ ...c, injection: null }, page, i).body)
    pages++
  }
}

// The Boston directory, a page of links to its members.
const directory = companyServer(createPagesStore(), DIRECTORY_HOST)
for (const page of ['home', 'members']) {
  const address = `https://${DIRECTORY_HOST}${page === 'home' ? '/' : '/members'}`
  write(fileFor(address)!, address, directory.serve('GET', new URL(address), null).body)
  pages++
}

// What a tab shows at an address the fake web does not answer.
mkdirSync(join(OUT, 'web'), { recursive: true })
writeFileSync(join(OUT, NONE), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Not found</title><script src="${BASE}worker-page.js"></script></head><body><h1>Not found</h1></body></html>`)
console.log(`workers: wrote ${pages} pages of the fake web`)
