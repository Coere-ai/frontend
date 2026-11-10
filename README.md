<p align="center">
  <img src="src/app/icon.svg" width="72" alt="Coere" />
</p>

<h1 align="center">Coere</h1>

<p align="center">
  coere.ai: the website, the dashboard that frames Coere Connect's own Console, the admin panel, and the accounts and API the extension runs on.
</p>

<p align="center">
  <img alt="License: proprietary" src="https://img.shields.io/badge/license-proprietary-5267f7?style=flat-square" />
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-5267f7?style=flat-square" />
  <img alt="Node 20 or later" src="https://img.shields.io/badge/node-20%2B-5267f7?style=flat-square" />
  <img alt="Database: Supabase" src="https://img.shields.io/badge/database-Supabase-5267f7?style=flat-square" />
</p>

<p align="center">
  Pages: <a href="docs/screenshots/site/README.md">the site</a>, <a href="docs/screenshots/dashboard/README.md">the dashboard</a> and <a href="docs/screenshots/admin/README.md">the admin panel</a>
  <br />
  Contracts: <a href="docs/accounts.md">accounts and the API</a>, <a href="docs/launch.md">the launch</a> and <a href="docs/seo-report.md">search</a>
</p>

## Screenshots

Every picture is the real page, served by `next dev` against a stand in for
Supabase filled with a made up world, and taken by
`scripts/screenshots/run.mjs`. The dashboard pictures are the extension's
own Console, framed by coere.ai. Maya Collins, Fernhill Creative and every
other name and number are made up. Each area has a page with all of its
pictures: [the site](docs/screenshots/site/README.md),
[the dashboard](docs/screenshots/dashboard/README.md) and
[the admin panel](docs/screenshots/admin/README.md).

### The site

<p align="center">
  <img src="docs/screenshots/site/home-hero.webp" width="100%" alt="The home page's first screen: Own your memory, a line on what Coere is, Install Coere, Coere for Teams and Coere for Developers, and the start of the product film" />
  <br />
  <sub>The home page opens on what Coere is, in one line. <a href="docs/screenshots/site/home.webp">The whole page</a>.</sub>
</p>

<table>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/site/home-solves.webp" alt="Every AI starts from zero, with the switch on Without Coere: three drawn chats where context is lost, switching AI to AI, a new chat and one long chat" />
      <br />
      <sub>What Coere solves, on Without Coere: switching AI to AI, a new chat and one long chat.</sub>
    </td>
    <td width="50%">
      <img src="docs/screenshots/site/home-solves-coere.webp" alt="Memory that follows the person, not the app, with the switch on With Coere: the same three chats, each with Coere's line over the box saying what it added" />
      <br />
      <sub>The switch on With Coere: Coere's line adds what each chat needs, as it does in the product.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/site/home-connect.webp" alt="One memory across every AI, with a ChatGPT window beside four features" />
      <br />
      <sub>Each product has its part of the home page, Coere Connect first.</sub>
    </td>
    <td width="50%">
      <img src="docs/screenshots/site/home-compare.webp" alt="A table of Coere Connect against the memory ChatGPT, Claude, Gemini and OpenMemory keep" />
      <br />
      <sub>How Coere compares with the memory each AI keeps.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/site/install.webp" alt="Coming soon on the Chrome Web Store, a countdown and I'm interested" />
      <br />
      <sub>Every Install button leads to the countdown until the extension is in the Chrome Web Store.</sub>
    </td>
    <td width="50%">
      <img src="docs/screenshots/site/sign-in.webp" alt="Sign in to Coere with a username and a password, maya_collins typed, plain on the white page" />
      <br />
      <sub>Sign in with a username and a password. No email is asked for.</sub>
    </td>
  </tr>
</table>

### The dashboard

<p align="center">
  <img src="docs/screenshots/dashboard/memory-graph.webp" width="100%" alt="coere.ai/dashboard framing the Console's Memory page: You in the middle and Maya's sections around her, with Work holding Fernhill Creative and three clients and their projects" />
  <br />
  <sub>coere.ai/dashboard is the extension's own Console, full screen: the same app, in its own style.</sub>
</p>

<table>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/dashboard/home.webp" alt="The Console's Home: 41 memories from 12 chats, the chats saved last and the AIs she uses" />
      <br />
      <sub>Home: what memory holds and the chats saved last.</sub>
    </td>
    <td width="50%">
      <img src="docs/screenshots/dashboard/library-chat.webp" alt="The Library with a chat open beside the list" />
      <br />
      <sub>The Library, with a chat open.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/dashboard/settings-account.webp" alt="The Account card: connected to coere.ai, the browsers, the backup switches and the memory copy" />
      <br />
      <sub>Settings' Account card, from coere.ai through the device token.</sub>
    </td>
    <td width="50%">
      <img src="docs/screenshots/dashboard/organization-admin.webp" alt="Organization as an admin: Fernhill Creative, the share switch and the shared memory graph" />
      <br />
      <sub>Organization, with the graph the members share.</sub>
    </td>
  </tr>
</table>

### The admin panel

<p align="center">
  <img src="docs/screenshots/admin/statistics.webp" width="100%" alt="Admin statistics: accounts, organizations, AI cost, tokens, memories and storage, tokens saved by day, and the top accounts and organizations" />
  <br />
  <sub>The operator's panel opens on the product's running totals.</sub>
</p>

<table>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/admin/organization-graph.webp" alt="Fernhill Creative in the admin panel, with its shared knowledge graph opened" />
      <br />
      <sub>One organization, with its graph opened by a click that is logged.</sub>
    </td>
    <td width="50%">
      <img src="docs/screenshots/admin/cost.webp" alt="Cost: spend by day, each model's requests, tokens and cost, and the top accounts" />
      <br />
      <sub>Cost by day and by model, and the top accounts with their limits.</sub>
    </td>
  </tr>
</table>

## Commands

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run start     # serve the production build
npm run lint
npm test          # unit tests
npm run db:check  # the migration, against Postgres in WebAssembly
node scripts/screenshots/run.mjs --user owner --password '…'   # every picture above
```

In a worktree whose `node_modules` is a symlink, Turbopack refuses to start;
use `npx next dev --webpack` and `npx next build --webpack`.

`NEXT_PUBLIC_SITE_URL` sets the site's canonical address and defaults to
`https://www.coere.ai`. It should match the host that serves the site.

## Where things live

```
src/app/(site)/       routes: home, products, industries and each industry,
                      resources (the developer docs), the guides, about,
                      install, try-teams, privacy, sign in, sign up, connect,
                      blog, careers, and a 404 inside the site's layout
src/app/dashboard/    the dashboard host: the extension's own Console, framed
src/app/admin/        the admin pages and their server actions
src/app/api/          v1 (the extension's API), admin (the panels' data),
                      site/track (the analytics beacon)
src/site/content/     everything the pages say: products, features, films and
                      their cues, industries and their stories, page copy,
                      code samples, posts, roles, navbar tabs
src/site/content/docs the developer docs as Markdown, one file per page
src/site/blocks/      layouts the pages share: the accordion showcase, feature
                      grid, use case tabs, slanted card, photo hero, code tabs
src/site/nav/         the navbar, its hover menus and the mobile menu
src/site/home/        the home page: one part per product
src/site/products/    one page design per product
src/site/industries/  the industries page and each industry's page
src/site/docs/        the docs layout and the Markdown renderer
src/site/account/     the frame sign in, sign up and connect share
src/site/console-host/
                      the dashboard host's frame and its install note
src/site/memory/      the memory explorer the admin panel shows
src/site/graph/       the memory graph, ported from coere-v2's graph2d
src/site/bridge/      coere.hello, the one message the site sends the extension
src/site/about/, blog/, careers/
                      each page's own sections
src/site/ui/          shared pieces: container, buttons, icons, film frames,
                      slanted tiles, photos saved at several widths
src/admin/            the admin panels; src/stats the analytics panel and charts
src/lib/              the server side: auth, accounts, v1, memory, org, admin,
                      analytics, security, launch, Supabase clients
public/preview/       artwork, industry photos, and the live films
demos/                builds every live film from coere-v2's source
supabase/             the migration, and schema.sql to read it in one place
scripts/db/           npm run db:check
scripts/screenshots/  the screenshot tool and its stand in for Supabase
scripts/agents/       draws Cori's still from coere-v2's art
docs/                 accounts.md (the contract), launch.md, seo-report.md,
                      and the screenshots
```

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

`/privacy` is the privacy policy that the Chrome Web Store listing points
to, linked from the footer. Its words are in `src/site/content/privacy.ts`,
each taken from `docs/accounts.md` and the code. When one of those facts
changes, change the policy and its effective date with it.

The blog and careers pages are hidden from the menus for now. They still
answer at their addresses but are `noindex` and left out of the sitemap.

`/install` and `/try-teams` say Coere Connect and Coere for Teams are coming
soon, with a countdown and an I'm interested button that takes an email.
Every Install and Try it free button leads there until the extension is in
the Chrome Web Store. They are `noindex` and left out of the sitemap too.
The operator sets each countdown in `/admin/launch`. Without Supabase, or
before a moment is saved, both count to `LAUNCH_AT` in
`src/site/content/launch.ts`.

## Films

Every film on the site plays live: Coere's real code from the coere-v2
source, driven by a script, never a recording. Each one is
`public/preview/live/<film>/index.html`, built by

```
COERE_V2=/path/to/coere-v2 node demos/build.mjs [film...]
```

`demos/README.md` says how a film is written and played, and what differs
from the extension.

## Photos and docs

Industry photos are from Unsplash, free to use under the Unsplash License,
each saved at 960, 1920 and 3840 wide. The site's own pages are plain and
calm: white, with no artwork, gradient or tint behind a hero, a film or a
form, and no box or circle a part does not need. They load through
`SizedPhoto` instead of the image optimizer, which fetches without the
visitor's pass and would be turned away by the gate.

The developer docs in `src/site/content/docs` were built from the coere-v2
source. Endpoint and schema tables come from `packages/api/openapi.json`, and
every fact keeps a `<!-- src: path:line -->` comment, stripped when the page is
drawn, so it can be checked again when the API changes.

The blog posts and roles are placeholder content for now; each content file
says so at the top. The industry stories illustrate what each product does;
they are not customers.

## Accounts

People make an account at `/sign-up` with a username and a password and
sign in with them at `/sign-in`, through Supabase Auth. coere.ai collects
no email and sends none. `docs/accounts.md` is the contract for all of it;
this section is what the owner sets up by hand.

- The server makes each account with the secret key
  (`auth.admin.createUser`), at a placeholder address,
  `<username>@users.coere.ai`, already confirmed, so Supabase never sends a
  confirmation. The address is never shown; every page shows the username.
  Sign in turns the username back into that address through `profiles`.
- A forgotten password has no reset email. The person writes to the
  contact email, and the operator sets a new one on `/admin/users`.

- Every Supabase call runs on the server. The browser never talks to
  Supabase, so the content security policy keeps `connect-src 'self'`.
- `src/proxy.ts` refreshes the session on the private paths only (`/sign-in`,
  `/sign-up`, `/connect`, `/account` and `/dashboard/*`), and
  gives them the nonce policy and noindex. Public pages stay static, and
  `next.config.ts` gives them `frame-src 'self'; frame-ancestors 'self'`
  so none of them can frame the Console.
- The session cookies are httpOnly and last 400 days. A second cookie,
  `coere_signed_in=1`, is readable by scripts so the navbar can say
  Dashboard instead of Sign in; it grants nothing.
- Sign in and sign up allow 10 tries in 15 minutes per network address and
  per username. A wrong username and a wrong password get the same answer
  after the same wait, so the form never says which usernames exist.
- `/connect` is the page the extension opens to get its device token.
- `/sign-in`, `/sign-up` and `/connect` share one frame,
  `src/site/account/auth-shell.tsx`: the form alone on the white page.

### The dashboard

`/dashboard` is the extension's own Console page, unchanged, in a frame
that fills the window (`docs/accounts.md` section 7). The Console runs as
the extension, so it keeps its style and every feature; nothing of it is
copied here.

- `src/app/dashboard/[[...section]]/page.tsx` is one page for `/dashboard`
  and every address below it, outside the site layout (no navbar or
  footer). It calls `requireUser` and gets the nonce policy and noindex
  from `src/proxy.ts`.
- The server lets the page frame one extension: the `coere_ext` cookie's
  id when `COERE_EXTENSION_IDS` lists it. On `/dashboard` the policy's
  `frame-src` is exactly `chrome-extension://<that id>/`.
- The page asks that id, then each allowed id, with `coere.hello`. When
  the one that answers is the id the policy names, it renders only the
  frame, `console.html?tab=<section>&embed=1`. When another answers, it
  writes that id to `coere_ext` and loads once more. When none answers, it
  says to get Coere (`/install`) or open the page in the Chrome where
  Coere is installed, and links `/account` for a lost browser.
- `/dashboard/usage` opens Statistics, `/dashboard/settings` and
  `/dashboard/account` Settings, `/dashboard/organization` Organization,
  and the last part of any other address is the Console's own section id
  (`src/lib/dashboard/host/console-tab.ts`). An unknown one is a 404.
- The Console's account data (Statistics, the Account card, Organization)
  comes from the API below, called by the extension's background with the
  device token. Pages never call it.
- Organizations are made in the admin panel, never from the dashboard. An
  admin invites coworkers by the username of their Coere account on
  `/account`, and the invite waits in the coworker's Organization
  section.
- `/account` holds what a device token may never do, since a token copied
  out of a browser must not be able to: change the username or password,
  revoke any browser or all of them, turn the memory backup on, invite
  someone or make an admin, and delete the account after a sign in from
  the last ten minutes and the username typed out. It also sets the display name and signs the site
  out. It needs no Coere, so it works from a phone.

### Settings

| Variable | What it is |
| --- | --- |
| `SUPABASE_PUBLISHABLE_KEY` | The project's publishable key, used by the server's session client. Not `NEXT_PUBLIC_`: only the server uses it |
| `COERE_STORE_URL` | Where Add to Chrome on `/install` leads once Coere Connect is out: its Chrome Web Store listing. Unset, a search of the store for Coere |
| `COERE_EXTENSION_IDS` | The extension ids allowed to connect and to be framed at `/dashboard`, comma separated. Unset, any id may connect outside production and none in production |
| `SECURITY_SALT` | A long random string, the key for the address hash in `security_events` |

`SUPABASE_URL` and `SUPABASE_SECRET_KEY` are the same as for the analytics
below.

### In the Supabase dashboard

`docs/launch.md` section 4.4 has the steps. In short:

- **Authentication, Sign In / Providers, Email**: on, since Supabase keeps
  the placeholder email for each account and password sign in runs through
  it. **Confirm email** may be on or off, since the server confirms each
  account when it makes it; on is safer, as an account made straight
  through Supabase around the site then never signs in. **Minimum password
  length** 10.
- **Authentication, Sign In / Providers, Email, Secure password change**:
  off. On, Supabase would email a code before a password change, and
  coere.ai sends no email; `/account` then says to sign in again.
- Every other provider off.
- **Authentication, URL Configuration**: Site URL `https://www.coere.ai`.
  No Redirect URLs are needed.
- **Authentication, Sessions**: leave **Time-box user sessions** and
  **Inactivity timeout** off, so a person stays signed in until they sign
  out.
- **Authentication, Rate Limits**: every sign in reaches Supabase from the
  site's servers, so raise **Rate limit for sign ups and sign ins**. No
  SMTP, sender or email template is needed.

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
| `GET /api/v1/org/page` | The Organization section: the organization, the caller's place, members, totals, open invites for an admin, or the caller's pending invites |
| `POST /api/v1/org/{action}` | `invite`, `revoke-invite`, `accept`, `decline`, `role`, `access`, `remove`, `leave`, `share`, `settings`, by the rules of `docs/accounts.md` 14.1; an invite and making an admin are refused for a device token and done on `/account` |
| `GET /api/v1/devices`, `POST /api/v1/devices/{id}/revoke` | The connected browsers, and signing one out |
| `POST /api/v1/account/memory` | Turns the memory backup and sensitive memories switches off, which removes the stored copy; on is done on `/account` |
| `POST /api/v1/account/delete` | Always refused for a device token; the account is deleted on `/account` after a fresh sign in |

- Every route checks the token itself through `device_auth`.
  `src/proxy.ts` does not run on `/api/v1`.
- Answers are `no-store` and `noindex`, with no CORS headers: the extension
  holds the site as a host, and pages never call these routes.
- Requests per minute come from the plan and are counted per device in each
  server instance's memory. The spend limits (the person's own when the
  operator set one, else the plan's) are checked before every call that
  starts new spend: a $10 first build allowance until the account's first
  memory build has finished, then the monthly limit ($5 on Free), counting
  only spend after that build. There is no daily limit unless the operator
  sets one, and the lifetime limit applies always (`docs/accounts.md` 8.10).
  A spent one answers Anthropic's own spend limit 400 on the Claude routes
  and a `usage_limit` 429 elsewhere. The person never sees a limit.
- A rule's no (the last admin, a typed email that does not match) answers
  `409 refused` with `reason` and `detail`, the line the Console shows.
  The device and account deletion routes work for a suspended account too.
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

## The admin panel at /admin

A private panel for the operator, backed by Supabase and guarded by its own
`USER` and `PASSWORD`, never by an account. `/statistics` and anything
below it redirect to `/admin`, not permanently. `docs/accounts.md` section 9
lists what each page shows.

| Page | What it is |
| --- | --- |
| `/admin` | Statistics: the product's running totals, by day and in total, and the top accounts and organizations by tokens saved |
| `/admin/analytics` | The site analytics: the Optagon landing page's dashboard, ported whole |
| `/admin/users` | Every account, and whether its free first build is used. One opens to its totals, devices and graph, with its plan, its own daily, first build, monthly and lifetime dollar limits, each limit in force with its spend, a reset of the free first build, suspend and restore, and revoke every device |
| `/admin/organizations` | Every organization, and the only place one is made. One opens to its members, roles, access, settings, invites and graph, and can be deleted |
| `/admin/interested` | Who is interested: the developer waitlist, Coere Connect and Coere for Teams, each by day with a CSV download, and Export all. `/admin/waitlist` leads here |
| `/admin/launch` | The launch countdowns on `/install` and `/try-teams`: the moment, whether the timer shows, and the countdown line the page shows |
| `/admin/database` | Each table's estimated rows, size, Row Level Security and policies, and the Storage totals |
| `/admin/security` | The security log over 7, 30 or 90 days, and any table with Row Level Security off |
| `/admin/cost` | AI spend by day, and for today, this month, the last 30 days or all time each model's requests, tokens and cost with a total, and the top accounts by cost, tokens or requests. Storage's cost at $0.021 per GB month |
| `/admin/limits` | Each plan's daily (off by default), first build, monthly and lifetime limits, one daily limit for every plan at once (blank for off), and how many accounts override each, with Clear all |

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
nothing, and the panel says storage is not configured. With `USER` or
`PASSWORD` missing, nobody can sign in.

Your shell already sets `USER` to your login name, and Next never overrides a
variable the shell has set, so a `USER` in `.env.local` is ignored. Locally,
start the server with both on the command line:

```bash
USER=owner PASSWORD='a long password' npm run dev
```

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

## The database

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

## Site analytics

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

## Screenshot tool

`scripts/screenshots/run.mjs` takes every picture in `docs/screenshots`. It
starts a stand in for Supabase (the real migration in PGlite behind the REST,
Auth and Storage routes supabase-js calls), fills it with a made up world,
runs the site on `next dev --webpack` against it, and photographs the site,
the admin panel (signed in with the `--user` and `--password` it is given)
and the dashboard, with coere-v2's fake v4 build of the extension loaded and
the site served as `www.coere.ai`. `scripts/screenshots/README.md` has what
it needs and how each part works.

## Tests

```bash
npm test
```

runs the unit tests (`src/**/*.test.ts`) with Node's test runner through
`tsx`. `npm run db:check` checks the migration (see The database), and
`npx next typegen && npx tsc --noEmit` checks the types, route props
included.
