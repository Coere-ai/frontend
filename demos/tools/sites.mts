/**
 * Writes the replica chat sites as static pages for a live demo. Runs under
 * coere-v2's tsx (demos/build.mjs starts it) and uses coere-v2's own fake
 * site page builder, the one its end to end tests and films load, so the
 * page markup, styles and editor code are the same ones Coere was built
 * against. Only the script addresses change, to where the site serves them.
 *
 * Input, as JSON on stdin: { pages: SitePage[], lib: string }.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

type Message = { role: 'user' | 'assistant'; text: string }
type Chat = { id: string; title: string; messages?: Message[]; createdAt?: string; updatedAt?: string }

/** One page to write: a site, the chats in its sidebar, and the chat it opens on, if any. */
type SitePage = {
  out: string
  platform: 'chatgpt' | 'claude' | 'gemini'
  chats: Chat[]
  open?: string
  options?: Record<string, unknown>
}

const V2 = process.env.COERE_V2
if (!V2) throw new Error('COERE_V2 names the coere-v2 checkout')

const { buildPage } = await import(join(V2, 'tests/fake-sites/pages/build.ts'))
const { DEFAULT_PAGE_OPTIONS } = await import(join(V2, 'tests/fake-sites/page-options.ts'))
const { FAKE_CONVENTIONS, FAKE_STATIC_PREFIX } = await import(join(V2, 'tests/fake-sites/conventions.ts'))

const input = JSON.parse(readFileSync(0, 'utf8')) as { pages: SitePage[]; lib: string }

/** A chat as the page builder reads it from a data server. */
const conversation = (platform: string, chat: Chat) => ({
  platform,
  platformConvId: chat.id,
  title: chat.title,
  archived: false,
  // A chat keeps its own dates, so the site's API lists the newest first, as coere-v2's data server does.
  createdAt: chat.createdAt ?? chat.updatedAt ?? '2026-10-20T10:00:00Z',
  updatedAt: chat.updatedAt ?? chat.createdAt ?? '2026-10-20T10:00:00Z',
  messages: (chat.messages ?? []).map((m) => ({ createdAt: chat.updatedAt ?? '2026-10-20T10:00:00Z', ...m })),
  alternateBranches: 0,
  hiddenCount: 0,
  adapter: 'demo',
  capturedAt: '2026-10-20T10:00:00Z',
})

for (const page of input.pages) {
  const urls = FAKE_CONVENTIONS[page.platform].urls
  const path = page.open ? urls.chatPrefix + encodeURIComponent(page.open) : urls.newChatPath
  const data = {
    platform: page.platform,
    pageOptions: { ...DEFAULT_PAGE_OPTIONS, ...page.options },
    signedOut: false,
    faultSettings: { slowSidebarMs: 0 },
    conversation: (id: string) => {
      const chat = page.chats.find((c) => c.id === id)
      return chat ? conversation(page.platform, chat) : undefined
    },
    sidebarChats: () => page.chats.map((c) => conversation(page.platform, c)),
  }
  const { html } = buildPage(data, path) as { html: string }
  // Every chat in full, for the site's own data API, which the demo serves in the page (stage/tab/site-data.ts).
  const chats = JSON.stringify(page.chats.map((c) => conversation(page.platform, c))).replace(/</g, '\\u003c')
  const out = html.split(FAKE_STATIC_PREFIX).join(input.lib).replace('</body>', `<script type="application/json" id="__demo_chats__">${chats}</script></body>`)
  mkdirSync(dirname(page.out), { recursive: true })
  writeFileSync(page.out, out)
}
