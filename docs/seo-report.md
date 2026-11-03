# Coere SEO and GEO report

Branch `worktree-agent-a814e4038c05acdd0`, from `1970fc6`. Work and searches done on **3 November 2026**. Nothing is pushed and `main` is untouched.

The site is coere.ai, served at https://www.coere.ai on Vercel. Coere is a cross-AI, user-owned memory layer. It is pre-launch, and the call to action is "Waitlist Coming Soon". Coere is not Cohere and is not affiliated with it.

## 1. Critical issues found

| # | Issue | Impact | Status |
|---|---|---|---|
| 1 | **coere.ai is not in the index.** In 20+ searches on 3 Nov 2026, including `site:coere.ai`, the site never showed up. "coere ai" and "coere.ai" return only Cohere. "coere memory" is read as *core memory*. | No organic or AI-search visibility yet. | Code is ready. Needs Search Console and Bing submission (§9). |
| 2 | **The home page was 591px wide on a 390px phone.** The "How Coere compares" table's `sr-only` marks are absolutely positioned. Their scroll wrapper was not their containing block, so they escaped it and widened the page, and mobile Chrome zoomed the whole page out. This is live on www.coere.ai today. | Mobile usability and mobile-first indexing. | Fixed (`relative` on the scroller). |
| 3 | **Tabbed content was missing from the initial HTML.** These components drew only the item that was picked: the Coere Connect use cases (4 of 5 missing), the How Coere compares tables (Forge and Solutions missing), the Coere Agents capabilities (8 of 9 descriptions missing) and the "Why people choose" slides. The words were only in the RSC script payload, which crawlers don't treat as page text. | Most product detail was invisible to crawlers that don't run JS, and to most AI bots. | Fixed. Every item is now in the HTML and the others stay hidden until picked. The design is unchanged. |
| 4 | **The 404 page borrowed the home page's title** ("Coere \| The memory layer you own…") and carried both `noindex` and `index, follow`. | Soft-404 risk, and confusing snippets. | Fixed. It now reads "Page not found \| Coere" with `noindex`. |
| 5 | **robots had one `*` group only, and nothing for `/statistics` or `/api/`.** A crawler named in its own group ignores the `*` group. So if anyone added per-bot rules later, those bots would be let into the private routes. | Private-route exposure, now that a parallel agent is adding `/statistics` and `/api`. | Fixed. Every group repeats the private paths. |
| 6 | **Sitemap `lastmod` was `new Date()`**, so every page "changed" on every deploy. | Search engines learn to ignore the dates. | Fixed. Dates now change only when the copy does. |

Other issues, all fixed:

- Docs pages jumped from h1 to h3, and so did /industries.
- Two industry descriptions ran past 170 characters.
- Product titles repeated the brand ("Coere Connect: … | Coere").
- The meta keywords list had 35 terms on every page, which Bing reads as a stuffing signal.
- Hero images used `priority`, which Next 16 deprecates.
- The film player's chapter row grew from 4px to 43px when a film loaded near the screen, a scroll-time layout shift.
- The About page gave no visible not-Cohere note.
- The home h1 and intro never said what Coere is.

Checked and found fine:

- coere.ai sends a 308 to www, with the path kept.
- `/about/` sends a 308 to `/about`.
- http sends a 308 to https.
- Every indexable route is static, so its metadata is in `<head>` for every crawler, including bots that are not on Next's HTML-limited list.
- Canonicals were correct.
- No accidental noindex.
- OG and Twitter cards are on every page.
- The live demo iframes sit in fixed-aspect boxes, so they cause no shift.

## 2. Files changed

| Area | Files |
|---|---|
| Crawl and index | `src/app/robots.ts`, `src/app/sitemap.ts`, `next.config.ts` (apex-to-www redirect in code as well as in Vercel), `src/app/(site)/not-found.tsx` |
| Metadata and entity | `src/lib/site.ts` (`description`, `summary`, `notCohere`), `src/lib/seo.ts`, `src/site/content/seo.ts`, `src/app/(site)/industries/[slug]/page.tsx`, `src/site/seo/json-ld.tsx` |
| Initial HTML | `src/site/blocks/use-case-tabs.tsx`, `src/site/home/compare-table.tsx`, `src/site/agents/capabilities.tsx`, `src/site/blocks/slant-card.tsx` |
| Headings, CWV, images | `src/app/(site)/industries/page.tsx`, `src/site/docs/render.ts`, `src/site/docs/docs.css`, `src/site/ui/film-player.tsx`, `src/site/blocks/photo-hero.tsx`, `src/site/blog/featured-post.tsx`, `src/site/blog/post-article.tsx` |
| Copy | `src/site/home/hero.tsx`, `src/site/content/pages/{connect,forge,agents,solutions}.ts`, `src/site/about/team-section.tsx` |
| FAQ | `src/site/blocks/faq.tsx` (new), `src/site/content/faqs.ts` (new), `src/app/(site)/page.tsx` |
| New pages | `src/app/(site)/portable-ai-memory/page.tsx`, `src/app/(site)/chatgpt-to-claude-memory/page.tsx`, `src/app/(site)/ai-agent-memory/page.tsx`, `src/site/content/guides.ts`, `src/site/guides/guide-blocks.tsx` |
| Internal links | `src/site/footer/footer.tsx` (Guides column), `src/site/products/connect-page.tsx`, `src/site/products/forge-page.tsx`, `src/site/content/pages/connect.ts` |
| GEO and docs | `public/llms.txt`, `README.md`, `docs/seo-report.md` |

Commits:

- `c01284c` Technical SEO
- `5daf534` Tabs in the initial HTML
- `3466617` 404
- `14aafbd` Titles and copy
- `d0f8f0b` Home FAQ
- `94eace8` Mobile overflow
- `6546cb8` Guide pages
- `424a22e` llms.txt
- `617767b` README
- the commit that adds this report

## 3. SEO and GEO improvements

### Titles and primary phrases

Each page now leads with a phrase of its own, so no two pages compete for the same search.

| Page | Title | Primary phrase |
|---|---|---|
| `/` | Coere \| Portable AI memory you own, across every AI | Coere (brand), portable AI memory |
| `/products/connect` | Coere Connect: one AI memory for ChatGPT, Claude and Gemini | memory across ChatGPT, Claude and Gemini; AI memory Chrome extension |
| `/products/solutions` | Coere Solutions: shared AI memory for teams and clients | shared AI memory for teams |
| `/products/forge` | Coere Forge: AI memory API, MCP server and SDKs | AI memory API |
| `/products/agents` | Coere Agents: Cori, the AI agent that works from your memory | AI agent with memory |
| `/about` | About Coere: the team building the memory layer you own | Coere team; not Cohere |

### Entity consistency

- `siteConfig.description` holds the one line: "Coere is a portable AI memory layer you own…".
- The home meta, the root metadata, the WebSite data, the home intro and the FAQ all use it.
- `siteConfig.summary` feeds the Organization `description` and the `llms.txt` summary.
- `siteConfig.notCohere` ("Coere is not Cohere and is not affiliated with it. The name comes from the Latin cohaerere, to connect.") appears in three places: the Organization `disambiguatingDescription`, visible text on the About page, and the home FAQ's "Is Coere the same as Cohere?".

### Visible copy

The design is unchanged.

- **Home intro:** "Coere is a portable AI memory layer that you, your team and your app own. Your context follows you across ChatGPT, Claude, Gemini and more…"
- **Product heroes:**
  - Connect names the AIs.
  - Forge's heading is now "The memory API for your apps and agents", and its line is "Build personalized AI experiences with a user-permissioned memory API."
  - Agents opens "Coere Agents is Cori, an AI agent that works from your memory."
  - Solutions says "shared AI memory".

### Structured data

All structured data is parsed in the audit, and all of it is valid.

- **Home:** WebSite and Organization, now with `alternateName`, `disambiguatingDescription`, `knowsAbout` and `sameAs` (LinkedIn and GitHub, both checked live). Plus a FAQPage.
- **Products:** SoftwareApplication, unchanged. No ratings or offers were invented.
- **Guides:** a WebPage tied to the WebSite and the Organization, plus a FAQPage.
- **FAQPage rule:** FAQPage is used only where `FaqSection` shows the same words. Google limits FAQ rich results to authoritative government and health sites, so the gain here is in Bing and AI answers, not a rich result in Google.

### Crawlers

`src/app/robots.ts` documents this choice. Every group repeats `Disallow: /preview/live/`, `/statistics` and `/api/`.

**Search and answer crawlers: allowed.** These put Coere in results and citations.
- Googlebot
- Bingbot (Bing also answers in Copilot)
- OAI-SearchBot (ChatGPT Search)
- PerplexityBot
- Claude-SearchBot
- The user-triggered fetchers ChatGPT-User, Perplexity-User and Claude-User

**Training crawlers: allowed.** These decide what future models know about a new name that models now confuse with Cohere.
- GPTBot
- ClaudeBot
- Google-Extended (it does not affect Google Search)
- Applebot-Extended
- CCBot

To stop model training without leaving AI search, set the training group to `disallow: "/"`.

### FAQs

A visible FAQ with matching FAQPage data is on the home page and on each guide page. Every answer is something the site or `src/site/content/docs` already says.

### llms.txt

`llms.txt` was rewritten as an optional experiment, not a ranking factor. It has:
- the same entity line
- a pre-launch note
- each product, described from the site
- Forge's self-hosted status, word for word from the docs
- the guide pages
- the main docs pages

### No hidden text

No hidden AI-targeted text was added. Text that sits hidden in tabs is real UI content that appears on click.

## 4. New pages

| Page | Target keywords | Intent | What it holds |
|---|---|---|---|
| `/portable-ai-memory` | portable AI memory, cross-AI memory, universal / persistent AI memory, AI memory across apps, AI memory that follows you, user-owned AI memory | Informational to commercial | A direct answer ("What is portable AI memory?"), the 9 supported AIs, a 4-step workflow over the live v2 film, How Coere compares, what works today, a 6-question FAQ, and Read next |
| `/chatgpt-to-claude-memory` | transfer ChatGPT memory to Claude, ChatGPT to Claude memory, import ChatGPT conversations, move AI conversations between platforms, share memory between ChatGPT and Gemini | How-to, transactional | The 3 ways (Claude's import, Gemini's import, Coere) with links to Anthropic's and Google's own pages, a table of what moves with each way, a 4-step workflow over the live Extraction film, Without vs with Coere (240 against 10.4k tokens, from the site's own demo), and a 7-question FAQ |
| `/ai-agent-memory` | AI agent memory, memory layer for AI agents, long-term memory for AI agents, shared memory MCP server, persistent memory for LLMs, user context API | Developer, commercial investigation | A direct answer, what an agent can read, 4 steps (token, scopes, MCP or API, suggest-only) over the live Forge film, the `context.forDraft` code, an honest "supports today" (`coere-server` is self-hosted, the hosted API is planned, the SDKs are not on npm or PyPI, there are no webhooks), and a 7-question FAQ including "How is Coere different from mem0, Zep or Letta?" |

Every guide page has:
- an H1
- "Waitlist Coming Soon" as its main CTA
- a canonical link
- its own title and description
- an entry in the sitemap at priority 0.8

They are linked from:
- the new footer "Guides" column, on every page
- the home FAQ
- the Coere Connect Import chats tab and its "Put your memory to work" section (Connect)
- "Everything in Coere Forge" (Forge)
- each other's Read next cards

I chose `/chatgpt-to-claude-memory` over `/import-chatgpt-conversations` because "move/transfer ChatGPT memory to Claude" is clearly the dominant phrasing in the results. The page also covers the Gemini and "import conversations" long tails. I chose `/ai-agent-memory` over `/ai-memory-api` because the Forge page already targets "AI memory API", and an `/ai-memory-api` page would compete with it.

## 5. Research summary

Sources: WebSearch and WebFetch on 3 Nov 2026. **No search volumes are claimed.** Every difficulty rating below is a qualitative estimate from who ranks today.

### Cluster A: portable AI memory

- **Long tails seen in results:**
  - portable AI memory across ChatGPT Claude Gemini
  - can you take your AI memory with you
  - sync memory across ChatGPT and Claude
  - AI memory portability problem
  - who owns your AI memory
  - universal AI memory extension
- **Intent:** mostly informational and problem-aware (lock-in, starting over). The rest is commercial: people comparing tools.
- **Difficulty (qualitative):** medium. Results are fragmented and no one dominates.
- **Who ranks now:**
  - research and standards pages: MacPaw's Portable Memory proposal, the Stanford Digital Economy Lab, the PAM standard site
  - vendor blogs: mem0, MemoryPlugin, memx.app, MemoryLake, Backboard, Memvid, evermind
  - dev.to posts
  - Product Hunt launches: Memory Forge, Memory Sync
  - extensions: OpenMemory (mem0), Supermemory, MemSync, Open Brain
- **Best page:** `/portable-ai-memory`, with `/products/connect` for the product intent.
- **What competitors explain better:**
  - mem0's OpenMemory post has a per-site support list, a plain capture-then-inject explanation and an example of what is saved. We matched those with the AI list and the 4 steps.
  - Its gaps are where data is stored and what leaves the browser. Coere's pages now state both, from the site.

### Cluster B: cross-platform personalization and switching

- **Long tails seen in results:**
  - move ChatGPT memory to Claude in 60 seconds
  - how to switch from ChatGPT to Claude export and import memory
  - Gemini import chat history from ChatGPT
  - transfer chats to Gemini what actually moves
  - import ChatGPT history to Grok
  - share context between ChatGPT and Claude
- **Intent:** how-to and transactional, with high urgency. These are people switching assistants.
- **Difficulty (qualitative):** high for the head terms. Tom's Guide, TechCabal, PCWorld, MakeTechEasier, 9to5Google and Bluehost rank, as do the official pages: claude.com/import-memory and Google's help article support.google.com/gemini/answer/16868299. The long tail is medium.
- **What the official imports do, verified:**
  - **Claude:** a 2-step paste. You run Claude's prompt in the other AI and paste the answer into Claude's memory settings. It moves preferences and context, not chats.
  - **Gemini:** two paths. A memory import by prompt, and chat import from an export .zip (up to 5 GB, 5 files a day, text only). It is not available in the EEA, Switzerland or the UK.
  - Both launched in March 2026.
- **Best page:** `/chatgpt-to-claude-memory`.
- **Competitor note:** the guides explain the official import steps well, with screenshots. Their weak point is that each import is one-way and one-off. The page states that difference fairly and links to the official pages instead of copying their steps.

### Cluster C: developers

- **Long tails seen in results:**
  - mem0 vs zep vs letta
  - best AI agent memory frameworks 2026
  - memory layer for AI agents API
  - MCP memory server for Claude, ChatGPT and Cursor
  - user-scoped memory for LLM apps
  - user-governed context layer (Stanford workshop paper)
- **Intent:** commercial investigation and implementation.
- **Difficulty (qualitative):** high. mem0, Zep, Letta, Cognee and Supermemory own the comparison results, and listicles (Atlan, dev.to, vectorize.io) fill the rest. MCP-specific and user-permission-specific queries are medium.
- **Who ranks now:** mem0 (guides and docs), Zep (getzep.com, blog.getzep.com), Letta, MemMachine, MemoryLayer.ai, Supermemory docs, Fast.io, Cortex docs, and the PyPI pages of small SDKs.
- **Best pages:** `/ai-agent-memory` for agent memory and the MCP server, and `/products/forge` for "AI memory API" and the SDKs.
- **Competitor note:**
  - Zep's homepage is very clear on the ingest, build and retrieve pipeline, on provenance, on access and retention controls, and on deployment options. The new page covers provenance (sources), scopes and revoke, and deployment (self-hosted today).
  - mem0's guides lead with "three lines of code". The new page shows the `forDraft` snippet.
  - Coere's honest differentiator is that the agent reads memory the person already built across their AIs, with their permission. The comparison table already marks mem0 and Zep for this. No benchmark numbers are claimed.

### Adjacent topics

- AI memory portability
- personal AI context
- AI profile portability
- portable AI

These are covered by `/portable-ai-memory`. The results are dominated by research proposals and opinion pieces, which leaves room for a clear explainer.

### Coere vs Cohere (brand)

Searched on 3 Nov 2026:

| Query | Result |
|---|---|
| `coere` | A UAB research center (COERE), dictionary pages and "Coeur". No Coere. |
| `coere ai` | Every result is Cohere. The engine assumes a typo. |
| `coere.ai` | Every result is Cohere. "You probably meant cohere.ai." |
| `coere memory` | Read as core memory (magnetic-core RAM). |
| `coere AI memory layer` | Read as Cohere. mem0 and Cognee guides rank. |
| `Coere Connect Chrome extension memory` | Read as Cohere. A third-party Cohere extension and OpenMemory rank. |
| `site:coere.ai` | No pages from coere.ai. |

**Conclusion:** Cohere dominates and autocorrect interferes on every brand query. The fixes are the entity signals above plus external profiles (§9). Keep the name always as "Coere" or "Coere AI". Never write "Coere.ai" in prose without "Coere AI" nearby.

## 6. Search baseline (3 November 2026)

WebSearch is US-only. Each row records whether coere.ai appeared at all.

| Query | coere.ai present | Position |
|---|---|---|
| coere | No | n/a |
| coere ai | No | n/a |
| coere.ai | No | n/a |
| coere memory | No | n/a |
| coere AI memory layer | No | n/a |
| site:coere.ai | No | n/a |
| Coere Connect Chrome extension memory | No | n/a |
| portable AI memory | No | n/a |
| portable AI memory across ChatGPT Claude Gemini | No | n/a |
| AI memory layer you own across every AI | No | n/a |
| cross-AI memory layer browser extension | No | n/a |
| user-owned AI memory | No | n/a |
| "AI memory portability" | No | n/a |
| same memory across AI assistants | No | n/a |
| transfer ChatGPT memory to Claude | No | n/a |
| import ChatGPT conversations into another AI reddit | No | n/a |
| AI memory API | No | n/a |
| memory layer for AI agents API | No | n/a |
| shared memory MCP server across Claude ChatGPT Cursor | No | n/a |
| AI agent memory MCP server user permission | No | n/a |

**Indexing has not been verified, and none is claimed.** To reproduce the baseline, run the same queries (and the Bing and Google `site:` queries) after the sitemap is submitted. Compare positions at 2, 4 and 8 weeks, and use Search Console's Performance report as the source of truth.

## 7. Tests run

All of these ran against a production build (`npx next build` and `next start -p 3001`).

| Test | Result |
|---|---|
| `npx eslint` | Pass, no output |
| `npx tsc --noEmit` | Pass |
| `npx next build` | Pass. 52 static pages. Every indexable route is static (○ or ●). |
| Crawl of the initial HTML from the sitemap and every internal link | 28 sitemap URLs, 28 pages crawled, **0 broken links, 0 problems**. Per page it checked: title and length, description and length, canonical equal to `https://www.coere.ai` + path, exactly one h1, no heading skips, JSON-LD parses, OG image and Twitter card present, no img without alt, indexable pages in the sitemap, noindex pages out of it, and no duplicate titles or descriptions. Only sitemap pages were reachable by link, so there are no indexable orphans. |
| robots.txt output | 3 groups (`*`, search, training). Each one has `Allow: /` and disallows `/preview/live/`, `/statistics` and `/api/`. Sitemap and Host are present. |
| sitemap.xml | 28 canonical www URLs with stable `lastmod` dates. Blog and careers are left out (noindex). |
| 404s (`/nope`, `/products/nope`, `/resources/nope`, `/industries/nope`) | HTTP 404, "Page not found \| Coere", noindex |
| Redirects | `/about/` gives a 308 to `/about`. Host `coere.ai` gives a 308 to `https://www.coere.ai/about` (the config rule). The live site already does both through Vercel. |
| Visible-text check (scripts stripped) | Every use case, all 3 compare tables, all 9 capabilities and all slides are present. Before the fix, each was missing. |
| Layout shift and LCP (puppeteer, Chromium) | CLS 0 on `/` at 1440 and on `/portable-ai-memory` at 390. LCP is the hero or poster image, about 160 to 210 ms locally. The film chapter row is reserved at 43px. |
| Mobile screenshots at 390px and desktop at 1440px of all 3 guides, home, Connect, Agents and About | No horizontal overflow (scrollWidth equals 390). The home page went from 591 to 390. The guide pages use the site's own type, spacing, buttons, lists and cards. |

Screenshots are in the session scratchpad (`shots/`, `clips/`). They are not committed.

## 8. What was not changed, on purpose

- **The home h1 "Own your Memory"** stays, because it is the brand line. The keyword went into the intro sentence under it.
- **The h1 fades in after hydration** (a motion `initial` of opacity 0). LCP measures on the demo poster, but the h1 is invisible without JS until it animates. Starting it visible is a design call for the owner.
- **The compare table's prices** ("Free", "Usage based", "Per seat") and its marks for other products are existing content. They were left as they are and not repeated elsewhere.
- **No BreadcrumbList data was added.** The site shows no visible breadcrumbs.
- **No `offers` or ratings on SoftwareApplication.** Coere is pre-launch, and ratings would be invented.
- **`/statistics` and `/api` routes and `src/app/layout.tsx` are untouched,** apart from the shared robots disallows. Whoever merges the other agent's robots change should keep the per-bot groups: every group must list `/statistics` and `/api/`.

## 9. Remaining manual actions

1. **Google Search Console:**
   - Add the domain property `coere.ai` with DNS verification, or set `GOOGLE_SITE_VERIFICATION` in Vercel; the layout already reads it.
   - Submit `https://www.coere.ai/sitemap.xml`.
   - Request indexing for `/`, the 4 product pages and the 3 guides.
2. **Bing Webmaster Tools:**
   - Import the property from Search Console, or set `BING_SITE_VERIFICATION`.
   - Submit the sitemap.
   - Turn on IndexNow if offered. Bing feeds Copilot and DuckDuckGo.
3. **External profiles,** for the entity and to tell Coere apart from Cohere:
   - LinkedIn (`/company/coere`): it says "Revolutionizing AI Infrastructure" and "backend infrastructure for applications and artificial intelligence". Change both to the `siteConfig.description` line, and link `https://www.coere.ai`, not the apex.
   - GitHub (`Coere-ai`): it has no website link. Add `https://www.coere.ai` and the same one-line description. Note: the public `frontend` repository is this site's source.
   - Create and add to `siteConfig.profiles` when they exist: an X/Twitter account, a Crunchbase entry, a Product Hunt page at launch, and a Chrome Web Store listing when Connect ships. The listing is the strongest signal for "AI memory Chrome extension".
   - Wikidata only once there is independent coverage.
4. **Vercel:**
   - Keep `coere.ai` as a redirect to `www`.
   - Check that preview deployments keep Vercel's default `X-Robots-Tag: noindex`.
   - Make sure `NEXT_PUBLIC_SITE_URL` is unset or equal to `https://www.coere.ai` in production.
5. **Before launch:**
   - Replace the mailto CTA with a real waitlist page or form, so "Waitlist Coming Soon" can rank and convert.
   - Update `/ai-agent-memory`'s "supports today" when the hosted API or the npm and PyPI packages ship.
6. **Monitor:**
   - Re-run the §6 baseline.
   - In Search Console, watch Coverage for "Discovered, not indexed".
   - Check whether ChatGPT and Perplexity describe Coere correctly. Ask them "What is Coere AI?".

## 10. Next steps, by impact and effort

| Priority | Step | Impact | Effort |
|---|---|---|---|
| 1 | Search Console and Bing verification, plus the sitemap (§9.1–2) | Very high: nothing ranks until it is indexed | 30 min |
| 2 | Fix the LinkedIn and GitHub descriptions and link www (§9.3) | High for brand queries and Cohere confusion | 15 min |
| 3 | Merge this branch, then deploy. The mobile overflow fix is live-impacting. | High | Low |
| 4 | Chrome Web Store listing at launch, linked both ways | High for Cluster A and B commercial queries | Medium |
| 5 | Earn mentions: launch posts (Product Hunt, Hacker News "Show HN"), and get listed in "best AI memory tools 2026" roundups (MemoryPlugin, memx, aimagicx, sourceforge) and the comparison pages that rank | High: the site has no backlinks today | Medium to high |
| 6 | Unhide and publish the blog with 2–3 useful posts, each linking to a guide: "What moves when you switch from ChatGPT to Claude" and "Why each AI's memory starts from zero" | Medium | Medium |
| 7 | A short developer quickstart page or video once there is a hosted API, and an `/ai-memory-api` comparison then | Medium for Cluster C | Medium |
| 8 | Render the home h1 visible before hydration | Low to medium for LCP on slow phones | Low (design call) |
| 9 | Sitemap `lastmod` per page, from git, if pages start changing on their own schedules | Low | Low |
