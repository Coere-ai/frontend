/**
 * Writes fake Calendar's page for this film from coere-v2's own page
 * builder (tests/fake-google/calendar/page.ts): the header, the side panel
 * with Create and the script that draws the week or the event editor. Runs
 * under coere-v2's tsx, started by sites.mjs at build time. The page's
 * boot block is left out: the tab's own script (calendar-tab.ts) sits in
 * its place and writes it from the film's store as the page loads, as
 * fake Calendar's server writes it for the address the tab is on.
 *
 * Input, as JSON on stdin: { out: string, script: string }.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const V2 = process.env.COERE_V2
if (!V2) throw new Error('COERE_V2 names the coere-v2 checkout')
const { calendarPage } = await import(join(V2, 'tests/fake-google/calendar/page.ts'))

const input = JSON.parse(readFileSync(0, 'utf8')) as { out: string; script: string }
mkdirSync(input.out, { recursive: true })

const me = { name: 'Maya Collins', address: 'maya.collins@gmail.com' }
const boot = { account: 0, me, accounts: [me.address], zone: 'America/Los_Angeles', contacts: [], events: [], weekly: [], day: '2026-11-19', editor: null, missing: false }
const html = String(calendarPage(boot).body)
const at = html.indexOf('<script type="application/json" id="boot">')
const end = html.indexOf('</script>', at) + '</script>'.length
if (at < 0) throw new Error('no boot block in the Calendar page')
writeFileSync(join(input.out, 'calendar.html'), html.slice(0, at) + `<script src="${input.script}"></script>` + html.slice(end))
