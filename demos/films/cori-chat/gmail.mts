/**
 * Writes fake Gmail's mailbox for this film from coere-v2's own page
 * builder (tests/fake-google/gmail/page.ts), with Maya's mailbox as its
 * fake server seeds it (tests/fake-google/gmail/mailbox.ts), dated from the
 * hour the demo was built. It is the page the toolbar popup opens over, as
 * the film shows it: under the popup, nothing on it is pressed. Runs under
 * coere-v2's tsx, started by sites.mjs at build time.
 *
 * Input, as JSON on stdin: { out: string }.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const V2 = process.env.COERE_V2
if (!V2) throw new Error('COERE_V2 names the coere-v2 checkout')
const { gmailPage } = await import(join(V2, 'tests/fake-google/gmail/page.ts'))
const { MAYA, seedMailbox } = await import(join(V2, 'tests/fake-google/gmail/mailbox.ts'))

const input = JSON.parse(readFileSync(0, 'utf8')) as { out: string }
mkdirSync(input.out, { recursive: true })

const { mailbox, contacts } = seedMailbox(Date.now())
const account = 0
const boot = {
  account,
  me: MAYA,
  accounts: [MAYA.address, 'mcollins@northfield.edu'],
  threads: mailbox.filter((t: { account: number }) => t.account === account),
  drafts: [],
  sent: [],
  contacts: contacts.filter((c: { accounts: number[] }) => c.accounts.includes(account)).map(({ name, address }: { name: string; address: string }) => ({ name, address })),
  undoSeconds: 5,
  composeOnly: false,
}
writeFileSync(join(input.out, 'gmail.html'), String(gmailPage(boot).body))
