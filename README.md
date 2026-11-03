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
of them out of the live demos' own pages, `/statistics`, `/api/` and the
account pages; it says
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

Paste `supabase/migrations/20261103000000_coere.sql` into the Supabase SQL
editor on a blank project and run it. It is the whole database in one file
and safe to run again. Part 1 is the site analytics: three tables
(`site_visits`, `site_events`, `site_section_views`) and three write
functions. Part 2 is the accounts of `docs/accounts.md`: plans, profiles,
devices, usage, the memory copy, synced settings, organizations, the running
totals, the developer waitlist, the private Storage bucket `memory`, and the
functions the server calls. `supabase/schema.sql` holds the same statements,
to read in one place.

The analytics tables have Row Level Security on with no policies and no
grants to `anon` or `authenticated`. The account tables have Row Level
Security on too, with policies that let a signed in person read only their
own rows and their organization's. `anon` gets nothing, and every function
the server calls is revoked from everyone but `service_role`. Only the
server writes, with the secret key, through `src/lib/supabase.ts`, which is
`server-only`.

```bash
npm run db:check
```

proves the migration works without a Supabase project. It boots PGlite
(Postgres in WebAssembly), adds stand ins for what Supabase provides (the
`anon`, `authenticated` and `service_role` roles, `auth.users` with
`auth.uid()`, and Storage's buckets and objects), runs the migration twice,
then checks the sign up trigger, every server function, the running totals,
and the Row Level Security rules as one person against another. It exits
non zero on any failure. The checks live in `scripts/db`.

### What is recorded

`src/site/tracker/site-tracker.tsx` is mounted by the site layout, so it runs
on every public page and never on `/statistics` or the account pages. It
records the view, counts seconds the tab was in focus, notes the deepest scroll, and reports clicks.
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

## Accounts

People sign in at `/sign-in` with a code emailed to them, or with a password,
through Supabase Auth. `docs/accounts.md` is the contract for all of it; this
section is what the owner sets up by hand.

- Every Supabase call runs on the server. The browser never talks to
  Supabase, so the content security policy keeps `connect-src 'self'`.
- `src/proxy.ts` refreshes the session on the private paths only (`/sign-in`,
  `/sign-up`, `/auth/*`, `/connect`, `/dashboard/*`, `/join/*`), and gives
  them the nonce policy and noindex. Public pages stay static.
- The session cookies are httpOnly and last 400 days. A second cookie,
  `coere_signed_in=1`, is readable by scripts so the navbar can say
  Dashboard instead of Sign in; it grants nothing.
- Each sign in path allows 10 tries in 15 minutes per network address and
  per email, and a wrong code or password waits before it answers.
- `/connect` is the page the extension opens to get its device token.

### Settings

| Variable | What it is |
| --- | --- |
| `SUPABASE_PUBLISHABLE_KEY` | The project's publishable key, used by the server's session client. Not `NEXT_PUBLIC_`: only the server uses it |
| `COERE_EXTENSION_IDS` | The extension ids allowed to connect, comma separated. Unset, any id may connect outside production and none in production |
| `SECURITY_SALT` | A long random string, the key for the address hash in `security_events` |

`SUPABASE_URL` and `SUPABASE_SECRET_KEY` are the same as for the analytics
below.

### In the Supabase dashboard

- **Authentication, Sign In / Providers, Email**: on, with **Confirm email**
  on. Set **Email OTP Length** to 6 and **Minimum password length** to 10.
- **Authentication, URL Configuration**: Site URL `https://www.coere.ai`.
  Redirect URLs `https://www.coere.ai/**`, plus `http://localhost:3000/**`
  for development.
- **Authentication, Sessions**: leave **Time-box user sessions** and
  **Inactivity timeout** off, so a person stays signed in until they sign
  out.
- **Authentication, Emails, SMTP Settings**: Supabase's own sender allows
  only a few emails an hour, so set up a real one before launch.

### Email templates

Under **Authentication, Emails, Templates**. A new address that signs in by
code gets **Confirm signup**, a known one gets **Magic Link**, so both hold
the code and the link.

**Magic Link**, subject `Your Coere sign in code`:

```html
<h2>Sign in to Coere</h2>
<p>Your code is <strong>{{ .Token }}</strong>. Type it on the sign in page.</p>
<p>Or open this link in the browser you want to sign in on:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">Sign in to Coere</a></p>
<p>If you did not ask to sign in, you can ignore this email.</p>
```

**Confirm signup**, subject `Confirm your Coere account`:

```html
<h2>Welcome to Coere</h2>
<p>Open this link to confirm your email and sign in:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">Confirm your email</a></p>
<p>Or type this code on the sign in page: <strong>{{ .Token }}</strong></p>
<p>If you did not make a Coere account, you can ignore this email.</p>
```

How the link finds its way back: the server sends `emailRedirectTo` as the
site's origin plus the page to return to (for example
`https://www.coere.ai/connect?ext=…&state=…`). Supabase puts that in
`{{ .RedirectTo }}` when it matches a Redirect URL, and the Site URL
otherwise. It is not encoded, so its own query runs on into the link's;
`/auth/confirm` therefore reads everything after `next=` as the address,
and `next` must stay last in the link. An address on another origin, or the
bare Site URL, goes to `/dashboard`. `{{ .SiteURL }}` is always the live
site, so in development type the code instead of opening the link.

## API for the extension

The extension calls the site under `/api/v1` with `Authorization: Bearer
<device token>`. `docs/accounts.md` section 8 is the contract; the code is in
`src/app/api/v1` and `src/lib/v1`.

| Route | What it does |
| --- | --- |
| `POST /api/v1/auth/token` | Trades a connect code and its PKCE verifier for a device token. No bearer. 20 a minute per address |
| `POST /api/v1/auth/revoke` | Signs the calling browser out |
| `GET /api/v1/account` | The account, plan, this month's usage, memory copy, organization and running totals |
| `/api/v1/anthropic/v1/...` | Claude calls with Coere's key: messages, token counts and batches, metered |
| `POST /api/v1/jev/v1/systemone` | Jev calls with Coere's key, metered |
| `POST /api/v1/memory/upload`, `POST /api/v1/memory/commit` | Push the memory file: a signed upload address, then the commit that builds the index |
| `GET`, `DELETE /api/v1/memory` | A 60 second download link for the stored file, or remove it |
| `GET`, `PUT /api/v1/settings` | The synced settings |
| `POST /api/v1/events` | Feature counts and tokens saved |
| `GET /api/v1/org`, `GET /api/v1/org/index` | The organization and its shared graph, members only |

- Every route checks the token itself through `device_auth`. The proxy does
  not run on `/api/v1`.
- Answers are `no-store` and `noindex`, with no CORS headers: the extension
  holds the site as a host, and pages never call these routes.
- Requests per minute come from the plan and are counted per device in each
  server instance's memory. The monthly limit is checked before every call
  that starts new spend.
- Refused tokens, rate limits and spent months write `security_events`
  rows. The token itself is never stored or logged; only its SHA-256 is.

### Settings

| Variable | What it is |
| --- | --- |
| `ANTHROPIC_API_KEY` | Coere's Claude key. Server only, never `NEXT_PUBLIC_`. Unset, the Claude routes answer 503 |
| `JEV_API_KEY` | Coere's Jev key. Server only, and optional: unset, the Jev route answers 403 and the extension classifies with Claude instead |

Any access gate on the deployment (password protection, deployment
protection, a visitor pass) must not cover `/api/v1`. The extension cannot
pass a gate made for people, and every call would fail.
