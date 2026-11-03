# Coere

The Coere website, built with Next.js, TypeScript, Tailwind CSS and Motion.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint
```

`NEXT_PUBLIC_SITE_URL` sets the site's canonical address and defaults to
`https://www.coere.ai`. It should match the host that serves the site.

## Search and sharing

Every page is public and indexed. `src/lib/seo.ts` holds the shared keywords
and `pageMetadata`, which gives a page its title, description, keywords,
canonical link and share card in one call; the words for each page are in
`src/site/content/seo.ts`. What Coere is, in one line, lives in
`siteConfig.description` (with a longer `summary` and the `notCohere` line);
keep the meta, structured data, `public/llms.txt` and page copy in step with
it. The home page carries the WebSite and Organization structured data, each
product page a SoftwareApplication, and every page with a visible FAQ
(`FaqSection`) the same words as FAQPage (`src/site/seo/json-ld.tsx`).

The guide pages (`/portable-ai-memory`, `/chatgpt-to-claude-memory`,
`/ai-agent-memory`) are listed in `src/site/content/guides.ts`, which the
sitemap and footer read. `src/app/sitemap.ts` lists every page the menus and
footer link to, with dates that change only when the words do.
`src/app/robots.ts` names the search and AI crawlers one by one and keeps all
of them out of the live demos' own pages, `/statistics` and `/api/`; it says
how to stop model training without leaving AI search. `docs/seo-report.md`
has the research and the remaining manual steps.

The blog and careers pages are hidden from the menus for now. They still
answer at their addresses but are `noindex` and left out of the sitemap.

## Where things live

```
src/app/(site)/       routes: home, products, industries and each industry,
                      resources (the developer docs), blog, about, careers,
                      and a 404 inside the site's layout
src/site/content/     everything the pages say: products, features, films and
                      their cues, industries and their stories, page copy,
                      code samples, backgrounds, posts, roles, navbar tabs
src/site/content/docs the developer docs as Markdown, one file per page
src/site/blocks/      layouts the pages share: the accordion showcase, feature
                      grid, use case tabs, slanted card, photo hero, code tabs
src/site/nav/         the navbar, its hover menus and the mobile menu
src/site/home/        the home page: one part per product
src/site/products/    one page design per product
src/site/industries/  the industries page and each industry's page
src/site/docs/        the docs layout and the Markdown renderer
src/site/about/, blog/, careers/
                      each page's own sections
src/site/ui/          shared pieces: container, buttons, icons, film frames,
                      slanted tiles, photos saved at several widths
public/preview/       artwork, backgrounds, industry photos, and the films
scripts/films/        builds each film's HTML page from coere-v2
```

## Films

Every film plays in its own HTML page under `public/preview/films`, made
from the coere-v2 demo pages by

```
node scripts/films/build-pages.mjs ../coere-v2/docs/demo
```

So a film looks exactly as it does on those pages: the browser's player at the
film's full 1440 by 900. `<slug>.html?preview&start=3` is the silent loop the
site uses beside features.

## Photos and docs

Industry photos and backgrounds are from Unsplash, free to use under the
Unsplash License, each saved at 960, 1920 and 3840 wide. They load through
`SizedPhoto` instead of the image optimizer, which fetches without the
visitor's pass and would be turned away by the gate.

The developer docs in `src/site/content/docs` were built from the coere-v2
source. Endpoint and schema tables come from `packages/api/openapi.json`, and
every fact keeps a `<!-- src: path:line -->` comment, stripped when the page is
drawn, so it can be checked again when the API changes.

The blog posts and roles are placeholder content for now; each content file
says so at the top. The industry stories illustrate what each product does;
they are not customers.

## Analytics and /statistics

A private dashboard at `/statistics`, backed by Supabase. It is the Optagon
landing page's analytics, ported whole: the same numbers, charts, world map,
page picker, section cards and click tracking. Bars, lines, meters and map
shading are Coere's brand blue; text and controls stay ink on white.

### Settings

| Variable | What it is |
| --- | --- |
| `SUPABASE_URL` | The project's address, from Supabase's API settings |
| `SUPABASE_SECRET_KEY` | The project's secret key. Server only, never `NEXT_PUBLIC_` |
| `USER` | The username for `/statistics` |
| `PASSWORD` | The password for `/statistics` |

With either Supabase value missing, the beacon still answers and stores
nothing, and the dashboard says storage is not configured. With `USER` or
`PASSWORD` missing, nobody can sign in.

Your shell already sets `USER` to your login name, and Next never overrides a
variable the shell has set, so a `USER` in `.env.local` is ignored. Locally,
start the server with both on the command line:

```bash
USER=owner PASSWORD='a long password' npm run dev
```

### The database

Paste `supabase/migrations/20261103000000_coere_site_analytics.sql` into the
Supabase SQL editor and run it. It creates three tables (`site_visits`,
`site_events`, `site_section_views`) and three write functions, and it is
safe to run again. `supabase/schema.sql` holds the same statements, to read
in one place.

The browser never talks to Supabase. Every table has Row Level Security on
with no policies and no grants to `anon` or `authenticated`, and the
functions are revoked from them too. Only the server connects, with the
secret key, through `src/lib/supabase.ts`, which is `server-only`.

### What is recorded

`src/site/tracker/site-tracker.tsx` is mounted by the site layout, so it runs
on every public page and never on `/statistics`. It records the view, counts
seconds the tab was in focus, notes the deepest scroll, and reports clicks.
`data-cta` on a link marks it as a conversion and `data-track` marks anything
else worth counting; links off the site are counted on their own. It skips
pages shown inside a frame, and crawlers are labelled by their user agent and
shown apart from people.

Nothing identifies a person. The visitor id is a random string in
`localStorage`, no cookie is set, the referrer is cut to its host, and the
place comes from the edge's own headers.

`POST /api/site/track` is public. It checks the origin, caps the body at 8 KB,
validates every field, allows 120 requests a minute per address, and always
answers 204.

### Sections

`src/lib/analytics/sections/discover.ts` splits each page into its outermost
`<section>` blocks. A block's id is its DOM id; the block holding the page's
h1 is `hero`; any other is a slug of its heading, its `aria-label` or a short
first line. `src/lib/sections.ts` names the home page's sections by product
and gives each a line for its card. A page can also tag elements with
`data-section` and `data-section-label`.

### Sign-in and the guard

- `src/proxy.ts` runs on `/statistics` and `/api/statistics/*` and nothing
  else, so public pages stay static. Signed out, `/statistics` is the sign-in
  form, anything below it goes to the home page, and the data route answers
  404. The page and the data route check the session again themselves.
- `USER` and `PASSWORD` are compared as SHA-256 digests with
  `timingSafeEqual`. A wrong guess waits 800 ms, and one address gets ten
  tries in fifteen minutes.
- The session is a cookie signed with HMAC-SHA256 under a key made from
  `USER` and `PASSWORD`, so changing the password signs everyone out. It is
  httpOnly, sameSite lax, secure in production, and lasts twelve hours.
- `/statistics` and the data route are `noindex`, and `robots.txt` disallows
  `/statistics` and `/api/`.

### Tests

```bash
npm test
```

runs the unit tests (`src/**/*.test.ts`) with Node's test runner through
`tsx`.
