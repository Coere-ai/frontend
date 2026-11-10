# The screenshot tool

Takes every picture under `docs/screenshots`: the public site, the dashboard
and the admin panel, against a stand in for Supabase filled with a made up
world. Nothing it runs is part of the site; the pages are the real ones,
served by `next dev`.

```bash
node scripts/screenshots/run.mjs --user owner --password 'a long password'
```

| Option | What it does |
| --- | --- |
| `--user`, `--password` | The `/admin` sign in for this run. Required; they are handed to the site as `USER` and `PASSWORD` |
| `--coere-v2 <dir>` | The coere-v2 checkout (default `../coere-v2`, or `COERE_V2`) |
| `--only site,admin,dashboard` | Some of the three areas |
| `--port 3210` | The dev server's port |
| `--scale 1` | Pixels per CSS pixel |
| `--out docs/screenshots` | Where the pictures go |

Set `SHOTS_VERBOSE=1` to see the dev server's log, and
`FAKE_SUPABASE_LOG=all` to see every call the site makes to the stand in.

## What it needs

- coere-v2 with its packages installed (`pnpm install`) and the fake v4
  build of the extension:

  ```bash
  cd ../coere-v2 && COERE_VERSION=4 pnpm --filter @coere/extension build:fake
  ```

  It loads from `apps/extension/.output/chrome-mv3-fake-v4`.
- Playwright with Chromium. The tool takes a `playwright` on the module path
  first, else the `@playwright/test` coere-v2 installs.
- `openssl`, for the certificates each run makes.

## How it works

1. **The stand in for Supabase** (`fake-supabase/`). It boots PGlite with
   the stand ins `npm run db:check` uses, runs
   `supabase/migrations/20261103000000_coere.sql`, and answers the REST,
   Auth and Storage routes supabase-js calls. Postgres writes every answer
   with `json_agg`, as PostgREST does, and each request runs as the role its
   key or session gives it, so Row Level Security decides what a signed in
   person reads. It serves https as
   `localhost`, since the extension only uploads to an https address.
2. **The made up world** (`seed/`): Maya Collins, an account director at
   Fernhill Creative, an agency with seven people and one open invite; five
   more organizations; 312 accounts on the three plans; two months of AI use
   by model; devices; a month of the security log; the developer waitlist
   and both interest lists; and a month of site visits, clicks and section
   reads. A seeded random source makes every run the same. Fernhill's
   coworkers' parts of the organization graph sit in Storage, where the
   site's merge reads them.
3. **The site.** `next dev --webpack` with only the settings the pictures
   need, pointed at the stand in.
4. **The dashboard.** Chromium with the fake v4 build, with `www.coere.ai`
   mapped to a local proxy in front of the dev server (`lib/host-proxy.mjs`)
   and every other name going nowhere. Install opens `/connect`; the tool
   signs in as Maya and presses Connect Coere, puts her chats in the Library
   through the extension's engine, chooses her AIs on Home, and imports her
   memory file on the Memory page, as a person imports one. The file is
   written by `maya/memory.mjs` with coere-v2's own memory code, from the
   chats in `maya/chats.mjs`, so every memory points at a chat in her
   Library. Her browser then backs the memory up to the site, and the site's
   own commit merges the organization graph. Each dashboard picture is
   `www.coere.ai/dashboard` framing the extension's Console.
5. **The site and admin pictures**, in a plain Chromium, signed out, then
   signed in to `/admin`.

For the picture of Organization as a member, the tool sets Maya's role to
member in the stand in's database, as an admin's Make member would, and
back to admin after.

Pictures are WebP through `sharp`, which Next installs (PNG when it is
missing), 1440 wide with the whole page when it is long, cut at 16,000
pixels, and a few at 390.

Nothing a run makes is kept: the database is in memory, and the profile,
certificates and memory file are in a temporary folder removed at the end.

## Files

```
run.mjs                 the command: starts everything, takes the pictures, stops everything
fake-supabase/          the stand in: server, REST (rest.mjs, rest-parse.mjs), Auth, Storage
seed/                   the made up world: people, accounts, usage and totals, the org graph, the site
maya/                   Maya's chats and the memory file made from them
lib/                    the dev server, the proxy, certificates, the extension's browser, Maya's setup, the shooter
shots/                  the pictures: site.mjs, dashboard.mjs, admin.mjs
```
