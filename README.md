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
of them out of the live demos' own pages, `/admin` (and its old address
`/statistics`), `/api/` and the account pages; it says
how to stop model training without leaving AI search. `docs/seo-report.md`
has the research and the remaining manual steps.

The blog and careers pages are hidden from the menus for now. They still
answer at their addresses but are `noindex` and left out of the sitemap.

`/install` and `/try-teams` say Coere Connect and Coere for Teams are coming
soon, with a countdown and an I'm interested button that takes an email.
Every Install and Try it free button leads there until the extension is in
the Chrome Web Store. They are `noindex` and left out of the sitemap too.
The operator sets each countdown in `/admin/launch`. Without Supabase, or
before a moment is saved, both count to `LAUNCH_AT` in
`src/site/content/launch.ts`.

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
src/site/dashboard/, memory/, organization/, settings/
                      the person's dashboard at /dashboard
src/site/graph/       the memory graph, ported from coere-v2's graph2d
src/site/bridge/      messages from dashboard pages to the extension
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

## The admin panel at /admin

A private panel for the operator, backed by Supabase and guarded by its own
`USER` and `PASSWORD`, never by an account. `/statistics` and anything
below it redirect to `/admin`, not permanently. `docs/accounts.md` section 9
lists what each page shows.

| Page | What it is |
| --- | --- |
| `/admin` | Statistics: the product's running totals, by day and in total, and the top accounts and organizations by tokens saved |
| `/admin/analytics` | The site analytics: the Optagon landing page's dashboard, ported whole |
| `/admin/users` | Every account. One opens to its totals, devices and graph, with its plan, its own monthly and lifetime dollar limits, suspend and restore, and revoke every device |
| `/admin/organizations` | Every organization, and the only place one is made. One opens to its members, roles, access, settings, invites and graph, and can be deleted |
| `/admin/interested` | Who is interested: the developer waitlist, Coere Connect and Coere for Teams, each by day with a CSV download, and Export all. `/admin/waitlist` leads here |
| `/admin/launch` | The launch countdowns on `/install` and `/try-teams`: the moment, whether the timer shows, and a live preview |
| `/admin/database` | Each table's estimated rows, size, Row Level Security and policies, and the Storage totals |
| `/admin/security` | The security log over 7, 30 or 90 days, and any table with Row Level Security off |
| `/admin/cost` | AI spend by day, model and account, and Storage's cost at $0.021 per GB month |

The pages are in `src/app/admin`, their client panels in `src/admin` (the
site analytics panel and the charts stay in `src/stats`), and their data in
`src/lib/admin`. Each panel reads one route under `/api/admin/`, and every
change is a server action beside its page. Opening a person's or an
organization's knowledge graph is a click, never automatic, and each one
writes an `admin_viewed_memory` security event.

### Settings

| Variable | What it is |
| --- | --- |
| `SUPABASE_URL` | The project's address, from Supabase's API settings |
| `SUPABASE_SECRET_KEY` | The project's secret key. Server only, never `NEXT_PUBLIC_` |
| `USER` | The username for `/admin` |
| `PASSWORD` | The password for `/admin` |

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
totals, the developer waitlist, who is interested in Coere Connect and Coere
for Teams, the site's settings (the launch countdowns), the private Storage
bucket `memory`, and the functions the server calls. `supabase/schema.sql` holds the same statements,
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
then checks that the second run changed nothing, the sign up trigger, every
server function, the running totals, the per account limits, and the Row
Level Security rules as one person against another. It exits non zero on
any failure. The checks live in `scripts/db`.

### What is recorded

`src/site/tracker/site-tracker.tsx` is mounted by the site layout, so it runs
on every public page and never on `/admin` or the account pages. It
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

- `src/proxy.ts` runs on `/admin/*`, `/api/admin/*` and the account pages
  and nothing else, so public pages stay static. Signed out, `/admin` is the
  sign-in form, anything below it goes to the home page, and every data
  route answers 404. Every page, data route and server action checks the
  session again itself. An account session never opens the panel, and the
  admin cookie is never an account session.
- `USER` and `PASSWORD` are compared as SHA-256 digests with
  `timingSafeEqual`. A wrong guess waits 800 ms, and one address gets ten
  tries in fifteen minutes.
- The session is a cookie signed with HMAC-SHA256 under a key made from
  `USER` and `PASSWORD`, so changing the password signs everyone out. It is
  httpOnly, sameSite lax, secure in production, and lasts twelve hours.
- Sign ins, failures and rate limit hits write security events
  (`admin_sign_in`, `admin_sign_in_failed`, `rate_limited`).
- `/admin` and its data routes are `noindex`, and `robots.txt` disallows
  `/admin`, `/statistics` and `/api/`.

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
  `/sign-up`, `/auth/*`, `/connect` and `/dashboard/*`), and gives
  them the nonce policy and noindex. Public pages stay static.
- The session cookies are httpOnly and last 400 days. A second cookie,
  `coere_signed_in=1`, is readable by scripts so the navbar can say
  Dashboard instead of Sign in; it grants nothing.
- Each sign in path allows 10 tries in 15 minutes per network address and
  per email, and a wrong code or password waits before it answers.
- `/connect` is the page the extension opens to get its device token.
- `/sign-in`, `/sign-up` and `/connect` share one frame,
  `src/site/account/auth-shell.tsx`: Coere and Cori on the dune background
  beside the form. Cori is `public/preview/images/agents/cori-general.svg`,
  the happy still that `scripts/agents/build-cori.mts` draws from coere-v2's
  Cori art.

### The dashboard

`/dashboard` is the person's own: Overview, Memory, Chats, Usage,
Organization, Settings and Account (`docs/accounts.md` sections 7 and 14).

- Every page renders per request and calls `requireUser` itself. Reads of
  the person's own rows go through their session, so Row Level Security
  decides what they see. The memory index, the organization's rows and
  every write go through the server with the secret key, after the session
  check, scoped to the person's own id or their own organization.
- The memory graph is the product's flat graph, ported from coere-v2's
  `packages/ui/src/graph2d` into `src/site/graph/`. Change it there first,
  then copy the change here.
- Pages talk to the extension through `src/site/bridge/`: they find it by
  the `coere_ext` cookie, else each id in `COERE_EXTENSION_IDS`, and send
  `coere.hello`, `coere.open`, `coere.backup` and `coere.settings`.
- Organizations are made in the admin panel, never from the dashboard. An
  admin invites coworkers by the email or username of their Coere account,
  and the invite waits on the coworker's Organization page.
- The Chrome Web Store address in `src/site/dashboard/connect-first.tsx` is
  a search until the listing is live; put the listing's address there.

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

- Every route checks the token itself through `device_auth`.
  `src/proxy.ts` does not run on `/api/v1`.
- Answers are `no-store` and `noindex`, with no CORS headers: the extension
  holds the site as a host, and pages never call these routes.
- Requests per minute come from the plan and are counted per device in each
  server instance's memory. The monthly and lifetime limits (the person's
  own when the operator set one, else the plan's) are checked before every
  call that starts new spend. A spent one answers Anthropic's own spend
  limit 400 on the Claude routes and a `usage_limit` 429 elsewhere.
- Refused tokens, rate limits and spent limits write `security_events`
  rows. The token itself is never stored or logged; only its SHA-256 is.

### Settings

| Variable | What it is |
| --- | --- |
| `ANTHROPIC_API_KEY` | Coere's Claude key. Server only, never `NEXT_PUBLIC_`. Unset, the Claude routes answer 503 |
| `JEV_API_KEY` | Coere's Jev key. Server only, and optional: unset, the Jev route answers 403 and the extension classifies with Claude instead |

Any access gate on the deployment (password protection, deployment
protection, a visitor pass) must not cover `/api/v1`. The extension cannot
pass a gate made for people, and every call would fail.
