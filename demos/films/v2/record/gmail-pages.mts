/**
 * Copied from the actions-gmail film (demos/films/actions-gmail/gmail-pages.mts).
 *
 * Writes fake Gmail's two pages for this film from coere-v2's own page
 * builder (tests/fake-google/gmail/page.ts): the mailbox at /mail/u/0/ and
 * the full window compose at ?view=cm. Runs under coere-v2's tsx, started
 * by sites.mjs at build time. The page's boot block is left out: the tab's
 * own script (gmail-tab.ts) sits in its place and writes it from the
 * film's store as the page loads, so the mail is dated from the day the
 * demo plays and drafts and sends carry over between loads.
 *
 * Input, as JSON on stdin: { out: string, script: string }.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const V2 = process.env.COERE_V2
if (!V2) throw new Error('COERE_V2 names the coere-v2 checkout')
const { gmailPage } = await import(join(V2, 'tests/fake-google/gmail/page.ts'))

const input = JSON.parse(readFileSync(0, 'utf8')) as { out: string; script: string }
mkdirSync(input.out, { recursive: true })

const me = { name: 'Maya Collins', address: 'maya.collins@gmail.com' }
for (const [file, composeOnly] of [['gmail.html', false], ['gmail-cm.html', true]] as const) {
  const boot = { account: 0, me, accounts: [me.address], threads: [], drafts: [], sent: [], contacts: [], undoSeconds: 5, composeOnly }
  const html = String(gmailPage(boot).body)
  const at = html.indexOf('<script type="application/json" id="boot">')
  const end = html.indexOf('</script>', at) + '</script>'.length
  if (at < 0) throw new Error('no boot block in the Gmail page')
  writeFileSync(join(input.out, file), html.slice(0, at) + `<script src="${input.script}"></script>` + html.slice(end))
}
