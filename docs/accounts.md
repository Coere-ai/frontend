# Coere v4: accounts at coere.ai

Status: **the contract for the first build.** The coere-v2 repository holds
the extension side. The coere.ai website (the `frontend` repository) holds the
site side. Both repositories keep a copy of this file: here as
`docs/design/v4-account.md`, and in the frontend repository as
`docs/accounts.md`. When one copy changes, change the other one too.

This replaces the parts of coere-v2's `docs/design/hosted-service.md` that it
names. An account is a username and a password, through Supabase Auth, and
coere.ai sends no email. It is not Google through Auth.js. The site is the separate Next.js repository, not an `apps/web`
workspace in coere-v2. The extension gets its token from a coere.ai tab,
not from `chrome.identity`.

The writing rules of CONTRIBUTING.md apply to every line here.

## 1. What v4 is

v4 is v2 with no API key in the build. Every model request goes to
coere.ai, which checks the person's token, adds Coere's own key, forwards
the request and counts the usage. The person's account lives on coere.ai.
The dashboard moves there too.

| | v2 and v3 | v4 |
|---|---|---|
| Build switch | `COERE_VERSION=2` or `3` | `COERE_VERSION=4` |
| Who pays for Claude | The person, with the key in `.env` | Coere, under the person's account |
| Where the key lives | The engine worker's bundle | Only on the coere.ai servers |
| Who the person is | Nobody | A coere.ai account (email) |
| Claude requests go to | `https://api.anthropic.com` | `https://www.coere.ai/api/v1/anthropic` |
| Jev requests go to | `https://api.typesafe.ai` | `https://www.coere.ai/api/v1/jev` |
| Dashboard | `console.html` in the extension | `https://www.coere.ai/dashboard`, with the local pages it cannot hold |
| Memory copy | None (v2), the person's own server (v3) | A `.coere` file in the person's folder of a Supabase Storage bucket |
| v3 access layer and Apps | v3 only | Not in v4 |

v1, v2 and v3 do not change. A v1 build stays byte identical. v4 has no
Teams edition yet.

The site always uses `https://www.coere.ai`. The apex `coere.ai` answers
with a 308 to www, and a browser drops the `Authorization` header when a
redirect crosses origins, so the extension must never call the apex.

## 2. Names and formats

| Thing | Format |
|---|---|
| Site origin | `https://www.coere.ai`. A build may name another with `COERE_SITE_URL` (for `next dev`, `http://localhost:3000`). |
| API base | `<site>/api/v1` |
| Device token | `coere_dev_` followed by 43 base64url characters (32 random bytes). The counted logger already refuses the prefix. |
| Connect code | `coere_code_` followed by 43 base64url characters (32 random bytes). Lives 5 minutes, works once. |
| Stored token or code | The lowercase hex SHA-256 of the whole string. The plain value is never stored on the server. |
| Token hint | The last 4 characters of the token, shown in the device list. |
| PKCE | `verifier` is 43 base64url characters (32 random bytes). `challenge` is base64url(SHA-256(verifier)) with no padding. |
| `state` | 22 base64url characters (16 random bytes). |
| Extension id | `chrome.runtime.id`, 32 letters a to p. |
| Money | Integer micro dollars (`*_micros`), 1 USD = 1,000,000. |
| Months | The first day of the month in UTC, as a `date`. |

## 3. Sign in on the site

All of it runs on the server. The browser never talks to Supabase, so the
site's rule that only the server connects still holds, and the content
security policy keeps `connect-src 'self'`.

### 3.1 Ways in

An account is a username and a password. coere.ai collects no email and
sends none: Supabase's own sender reaches only the project team's
addresses, a few an hour, so nothing a person does may wait on an email.

1. **Create an account.** `/sign-up` asks for a username and a password
   typed twice (at least 10 characters). The server checks the username is
   free with the secret key, then makes the user with the secret key:
   `auth.admin.createUser({ email: '<username>@users.coere.ai', password,
   email_confirm: true, user_metadata: { username } })`. `email_confirm`
   marks the placeholder address confirmed at once, so Supabase sends no
   confirmation whatever its Confirm email setting, and the signup trigger
   sets the profile's username and counts the sign up. The server then signs
   the person in with `auth.signInWithPassword` through their own session
   client and goes on to `next` or `/dashboard`.
2. **Sign in.** `/sign-in` asks for the username and the password. The
   server turns the username into the account's email by reading
   `profiles` with the secret key, then calls `auth.signInWithPassword`. A
   username nobody has and a wrong password get the same answer after the
   same wait, so the form never says which usernames exist. `next` must be
   a path on this site: it is parsed the way a browser reads it and only a
   same origin path is kept.
3. **The placeholder email.** Supabase Auth needs an email for every
   account, so each one has `<username>@users.coere.ai`, a domain that
   receives no mail. It is never shown: the site, the admin panel and the
   extension show the username. An account that changes its username keeps
   its first placeholder; when a new person then picks the old name, their
   placeholder gets a short random suffix. If two people take one free name
   at the same moment, the trigger gives it to the first, and the second
   user, left without one, is deleted again and told the name is taken.
4. **On `/account`.** The person changes their username (checked unique on
   the server with the secret key; it writes `username_set`, and the
   placeholder email stays as it was) and their password (through their
   own session with `auth.updateUser`; it writes `password_set`). Each
   asks for the current password first: a session lives 400 days and
   there is no email to win an account back with, so a browser left signed
   in must not be enough to lock the owner out. The server checks it with
   `auth.signInWithPassword` on a throwaway client that keeps its session
   in memory and signs it out again, so the browser's own session is not
   touched, and the check counts against the sign in limits below.
   Supabase's Secure password change must be off, since it would email a
   code. Should Supabase still ask for a recent sign in, the page says to
   sign in again.
5. **A forgotten password or username.** There is no reset email.
   `/sign-in` says "Forgot your password? Contact us." with the site's
   contact email. The operator sets a new password on `/admin/users`
   (**Set a new password**, `auth.admin.updateUserById` behind the admin
   guard, which writes `admin_set_password` naming the account, so the log
   tells it from the person's own `password_set`) and tells the person,
   who then changes it on `/account`. Supabase signs the account's web
   sessions out; its Coere browsers stay connected, so after a takeover the
   operator also uses **Revoke every device**. **Set the username** works
   the same way and writes `admin_set_username`; it also gives a username
   to an account that has none, which cannot sign in until it has one.

Usernames are 3 to 24 characters of `a-z`, `0-9` and `_`, stored lowercase,
unique.

Every sign in, sign up and current password check counts against the
network address and the username: 10 tries in 15 minutes for each
address, and 50 for each username. A try from an address past its own 10
is refused there and does not count against the username, so one machine
cannot lock anyone out; many machines aimed at one account get 50 guesses
in 15 minutes. The trade-off: usernames are public to an organization's
members, so someone with five or more addresses can still keep one
username locked while they keep trying. A wrong username or password waits
at least 800 ms and about 1.5 seconds in all, like the admin guard.
These limits are held per server instance. Sign up also counts in the
database (`hit_sign_up_limit`, a `sign_up_attempts` row per address hash):
10 accounts an hour from one address, across every instance, since each
new account gets a first build on Coere's key. When the database cannot
answer, sign up goes on under the instance limits alone. The site wide
first build budget (section 8.10) bounds what many addresses can spend.
Supabase's own refusals (its shared sign in limit, an outage) read the same
to the person, so the form never says which usernames exist, and the
server logs their code. Each outcome writes a `security_events` row
(section 8.9).

### 3.2 The session

`@supabase/ssr` keeps the Supabase session in cookies. The cookies are
httpOnly, `sameSite=lax`, secure in production, and live 400 days, which is
Chrome's ceiling. Supabase refresh tokens do not expire on their own, so a
person stays signed in until they sign out or the session is revoked.
`src/proxy.ts` refreshes the session on the private paths only, so public
pages stay static.

A second cookie, `coere_signed_in=1`, is readable by scripts and holds
nothing else. The navbar reads it on the client to show "Dashboard" instead
of "Sign in". It is set on sign in and cleared on sign out. It grants
nothing.

### 3.3 Pages

| Path | What it is |
|---|---|
| `/sign-in` | A username and a password. A signed in person goes to `next` or `/dashboard`. |
| `/sign-up` | Create an account with a username and a password. |
| `/sign-out` | Where the Console in its own tab goes after Sign out (section 6.9). It signs this browser's session out as it loads when `Sec-Fetch-Site` is `none` or `same-origin`, and waits for its Sign out button on a visit from another site. A signed out visitor goes to `/sign-in`. |
| `/connect` | Hands a connect code to the extension (section 4). |
| `/account` | The steps a device token may not take, signed in on the site (section 7): the display name, username and password, Sign out, the browsers with Revoke, the backup switches, an admin's invites, deleting the account. |
| `/dashboard/...` | The person's dashboard (section 7). |
| `/admin/...` | The operator's panel (section 9). It keeps its own USER and PASSWORD guard, separate from accounts. |

No page handles an emailed link: there is none.

Every private path is `noindex`, left out of the sitemap and disallowed in
`robots.txt`. The site tracker does not run on them.

## 4. Connecting the extension

The extension holds no Supabase session and never sees a password. It gets
a device token through a coere.ai tab.

1. **The extension starts.** On install, on a toolbar click while signed
   out, or on "Sign in" anywhere in the extension, the background makes
   `state`, `verifier` and `challenge`, keeps `{state, verifier, at}` under
   `coere.connect.pending` in `chrome.storage.session`, and opens
   `<site>/connect?ext=<chrome.runtime.id>&state=<state>&challenge=<challenge>&v=<extension version>`.
   A pending record younger than 30 minutes is reused.
2. **The site checks the address.** `/connect` refuses an `ext` that is not
   in `COERE_EXTENSION_IDS` (comma separated, set on the server). With the
   list unset, any id passes outside production and none passes in
   production. A malformed `state` or `challenge` is refused too. A
   refusal writes `connect_refused`.
3. **Sign in if needed.** Signed out, `/connect` redirects to
   `/sign-in?next=<the whole /connect address>`.
4. **The person confirms.** The page shows the account's username and a
   **Connect Coere** button. Nothing happens without the press. This stops a
   link made by someone else from connecting their extension to this
   account.
5. **The site makes a code.** A server action checks the session again,
   stores `device_codes(code_hash, user_id, challenge, extension_id,
   device_name, expires_at = now + 5 min)` and returns the code to the page.
6. **The page hands it over.** The page calls
   `chrome.runtime.sendMessage(ext, { type: 'coere.connect', code, state })`.
   With no `chrome.runtime` (another browser, or Coere not installed) the
   page says to open it in Chrome with Coere installed.
7. **The extension trades it.** The background checks that the sender's
   origin is the site and its path is `/connect`, and that `state` matches
   the pending record. It then calls `POST /api/v1/auth/token` with
   `{ code, verifier, extensionId, extensionVersion, name }` and gets
   `{ token, device, user }`.
8. **The extension keeps it.** It writes `coere.account` (section 6.2),
   clears the pending record, answers the page `{ ok: true }`, and pushes
   the token to the engine worker. If onboarding is not done it turns the
   connect tab into `onboarding.html` with `chrome.tabs.update`.
9. **The site exchange** finds the code by hash, checks it is unused, not
   expired, that `extensionId` matches, and that base64url(SHA-256(verifier))
   equals the stored challenge. It marks the code used, makes a `devices`
   row, writes `device_connected`, and answers. Any failure answers the same
   `400 invalid_grant`.

The site remembers the extension id in a `coere_ext` cookie (readable by
scripts, 400 days) so the dashboard can talk to the extension later.

## 5. The bridge between the site and the extension

The v4 manifest has `externally_connectable.matches` set to the site's
origins, so pages there can send one off messages with
`chrome.runtime.sendMessage(extensionId, message)`. The background handles
them in `chrome.runtime.onMessageExternal`. It accepts a message only when
`sender.origin` is one of the site origins. It answers with a small object
and never with chat text, memory text or the token.

| Message | Allowed from | Answer | What it does |
|---|---|---|---|
| `{type:'coere.hello'}` | any site page | `{ok:true, version, build:4, signedIn, userId}` | Lets the site know Coere is installed and which account it uses. |
| `{type:'coere.connect', code, state}` | `/connect` | `{ok:true}` or `{ok:false, reason:'state'\|'exchange'}` | Section 4. |
| `{type:'coere.open', target}` | `/dashboard` and below | `{ok:true}` | Opens a local page. `target` is one of `library`, `memory`, `home`, `cori`, `settings-folder`, `settings-import`, `settings-logs`, `settings-transfer`. |
| `{type:'coere.backup'}` | `/dashboard` and below | `{ok:true}` | Pushes the memory file now (section 6.5). |
| `{type:'coere.settings'}` | `/dashboard` and below | `{ok:true}` | Pulls the synced settings now (section 6.6). |
| `{type:'coere.sign_out'}` | any site page | `{ok:true}` | Disconnects Coere in this browser, as Settings' Disconnect does (the token revoked, the record cleared). The navbar's and `/account`'s Sign out send it, to the id in the `coere_ext` cookie, and wait at most 3 s before signing the site out (section 6.9). |

Anything else answers `{ok:false, reason:'unknown'}`, and a page off the
site gets no answer at all.

The bridge never runs the Console's own requests. The dashboard on
coere.ai is the extension's own `console.html` in a frame (section 6.8),
which talks to the service worker as any extension page does, so the site
needs no way in. An earlier build had one (`coere.rpc` and a
`coere.console` port), and it let any script on coere.ai read and delete
the local library and start Browser Use; it is gone.

## 6. The extension side

### 6.1 Build

- `COERE_VERSION=4`, `pnpm build:v4`, folder `chrome-mv3-v4`, fake build
  `chrome-mv3-fake-v4`, `version_name` "1.1.3 Coere v4".
- The build reads no `ANTHROPIC_API_KEY` and no `TYPESAFE_API_KEY`.
  `virtual:coere-claude` carries the model settings with the key fields set
  to the placeholder `coere-account`, so the memory runtime builds its
  clients as it does in v2.
- `host_permissions` gets the site origins (`https://www.coere.ai/*` and
  `https://coere.ai/*`, or the `COERE_SITE_URL` origin) and neither
  `api.anthropic.com` nor `api.typesafe.ai`. Holding the site as a host lets
  the worker call it without a CORS preflight, so the site sends no CORS
  headers.
- `externally_connectable.matches` lists the same site origins and nothing
  else.
- Every v3 gate (`>= 3`) becomes `=== 3`, so v4 has no access layer, no Apps
  and no loopback host. Gates on `>= 2` stay, so v4 keeps memory, Actions,
  voice and Cori.
- The memory runtime's batch size cap is 4 MiB in v4 (24 MiB in v2 and v3),
  because the site's host refuses a request body over 4.5 MB.
- v4 sends no new batch: every memory job is a direct call, whatever a
  click or Settings names, and Settings has no Large reads choice. A
  batch's reservation holds its whole worst case until it is read, which
  refuses every other call meanwhile, and a first build must land chat by
  chat (2026-11-11). Every call to Claude starts through one budget
  (`runtime/ai-budget.ts`, the speed overhaul of 2026-11-24): at most 100
  in flight, a start rate of 6 a second with a burst of 16, and a class
  each for Sonnet (32 in flight at first, up to 100) and Haiku (32, up to
  64), so a Haiku limit never holds Sonnet back. Haiku sorts 32 chats at
  once, since the site has no Jev key. The extension waits 330 s for a
  call, the route's 300 s and 30 s for the proxy.
- `tools/lint-manifest` and the build scans learn the v4 rules: no model
  host, no key, no fake key, no v3 marker, `externally_connectable` only in
  v4 and only with the site origins, and the one web accessible entry that
  lets the site frame `console.html` (section 6.8) only in v4.

### 6.2 The account record

`chrome.storage.local` key `coere.account`:

```ts
{ v: 1, token: string, deviceId: string, userId: string,
  email: string, username: string | null, at: number }
```

`email` is the account's placeholder address (section 3.1) and is never
shown; pages show `username`. A rename on coere.ai reaches the record the
next time the background reads `GET /api/v1/account` for the Account card:
when `user.username` differs, it writes the new one back.

Only the background writes it. "Disconnect" in Settings calls
`POST /api/v1/auth/revoke` and then removes it. `restartOnboarding` leaves
it alone.

### 6.3 The account fetch

`apps/extension/src/engine/account/fetch.ts` wraps the worker's fetch at the
two places it is handed to the memory core and the lab. It changes nothing
else, so no request builder changes.

- `https://api.anthropic.com/<rest>` becomes `<site>/api/v1/anthropic/<rest>`,
  query kept. That includes a batch's absolute `results_url`.
- `https://api.typesafe.ai/<rest>` becomes `<site>/api/v1/jev/<rest>`.
- It deletes `x-api-key` and `anthropic-dangerous-direct-browser-access`,
  and sets `Authorization: Bearer <device token>`, replacing Jev's own.
- With no token it answers a local
  `401 {type:'error', error:{type:'authentication_error', message:'signed_out'}}`
  and sends nothing.
- On a 401 from the site it tells the background, which removes
  `coere.account`.
- Every other address passes through untouched.

The background pushes the token to the worker with an `account.token`
engine call on startup, on install and whenever `coere.account` changes.
The worker also asks for it when it starts, since the worker restarts on
its own. Jev's key function returns the device id, so a new sign in lifts
Jev's refusal.

Cori's route waits longer in v4, since each call goes through the site:
Jev 4 s and Haiku 20 s in `memory.route`, and 35 s for `cori.ask`, with the
thinking beat shown and a "Still working on it." line after 8 s. With no
gates (the site has no Jev key, or Jev failed or was refused), act@1 is
asked beside route@2 and code picks one (`cori-route/no-gates.ts`): a
command that changes something wins, a plan of a kind Coere has wins over
no command, an answer in words (unless the line asks how or what) or a
read tool on a line not about the chats, and an `other` plan answers when
route@2 settled nothing, so Cori says what it cannot do yet rather than
"I don't write". A Jev call that fails or runs out of time rests five
minutes for Cori (`jev-cool.ts`). A Haiku 429 whose retry-after fits is
tried once more, and a refusal for the spend limit makes Cori say so
(`site-haiku.ts`). The route's abort cancels the request.

A mail line the notes would answer, such as "gmail please", goes to the
route first, and a line that only asks for an email gets the Gmail draft
offer when the route planned none (`cori/engine/route/mail.ts`). When an
email plan cannot start (Browser Use off, no leave for Gmail, a refusal),
the service worker writes it anyway with `memory.act.context` and
`memory.act.write` on the person's thinking model, on the message
`actions.draft`, and the chat shows it as a card to edit and copy
(`DraftBlock` in `AllowBlock.tsx`, `DraftCard` in `AllowCard.tsx`). The
card lives at the end of files every Actions build already holds, with
their imports, so v2 and v3 keep their bytes. Nothing is typed on a page
and nothing is sent. A plan that names nobody and nothing asks for that
instead.

### 6.4 Signed out

The memory status gains a `signed_out` state, checked before `no_key`. Its
copy says Coere is not connected to coere.ai, and its action is **Sign in**,
which starts section 4. A new token clears a stored `key_refused` or
`forbidden` stop and restarts the queue.

Until the first connect, the toolbar click opens the connect page the way a
missing onboarding record opens onboarding, and onboarding does not start
the first build.

### 6.5 Memory push

`apps/extension/src/engine/cloud/memory-push.ts`, wired beside the v3
access hook at `memory.changed`.

- It exports with `{format:'coere', version:'2.0', quotes:true,
  sensitive:<includeSensitive from the account>, chats:false,
  documents:true, forgetKeys:false}`. Chat text and forget keys never leave
  the browser.
- It runs 5 minutes after the last `memory.changed` (at most 30 minutes
  after the first), 10 seconds after `memory.built`, an import, a forget or
  a chat deletion, at browser start when the last push is over 24 hours
  old, and on the bridge's `coere.backup` and after a backup switch the
  Console set. It also runs 10 seconds after the account read every 30
  minutes finds a switch changed, or the stored copy gone while the backup
  is on.
- It skips when the manifest's `digest` equals the one the site holds
  (from `GET /api/v1/account`, kept up to date by its own commit and skip
  answers), when the person turned the backup off, or when the file is over
  50 MiB (the site's cap, section 8.10).
- Steps: `POST /api/v1/memory/upload`, then a `PUT` of the zip to the
  signed URL it returns, then `POST /api/v1/memory/commit`.
- How it reads a refusal at any step: `401` signs out; `409` turns its copy
  of the backup switch off and waits; `412 sensitive_off` means its copy of
  the account is older than the site's, so it reads `GET /api/v1/account`
  again and exports once more with the current `includeSensitive` (a
  second `412` in the same push backs off); `413`, from the site or from
  Storage's `PUT`, waits for a smaller file; `400` and `403` wait for the
  next change. A `404` at the commit, a `429`, a `503`, any other Storage
  refusal or no answer at all back off.
- Failures back off from 1 minute, doubling to 30 minutes.

### 6.6 Settings sync

`apps/extension/src/background/account/settings-sync.ts`.

- **Synced keys.** `coere.prefs`, `coere.run.settings`, `coere.ais`,
  `coere.memory.prefs`, `coere.memory.capture`, `coere.memory.corepack`,
  `coere.memory.recall`, `coere.memorylinks`, `coere.stripdisplay`,
  `coere.fileupload`, `coere.devtools`, `coere.voice`, and
  `coere.browser_use` with only `level`, `model` and `blocked`. The
  `on` and `grantedAt` fields never sync: turning Browser Use on stays
  something the person does in this browser.
- **Pull.** On startup, every 30 minutes, after a connect and on the
  bridge's `coere.settings`, it calls `GET /api/v1/settings` and writes each
  key whose value differs. A write it made itself is not pushed back.
- **Push.** A change to a synced key in `chrome.storage.local` is pushed
  with `PUT /api/v1/settings` after 3 seconds. The newest write of a key
  wins. A changed key's name (never its value) waits under
  `coere.account.settingsPending` in `chrome.storage.local` until the site
  has it, so a change made while coere.ai cannot be reached outlives the
  service worker. Each pull pushes what waits first, so it never writes
  the site's older value over it.
- **First connect.** If the server has no settings, it pushes every synced
  key once.

### 6.7 Usage events

The background counts feature use and sends the counts every 10 minutes
with `POST /api/v1/events`. It sends counts and token numbers only, never
text. The kinds: `extract_chat`, `extract_all`, `transfer`,
`context_import`, `memory_search`, `cori_chat`, `action_run`, `rewrite`,
`voice`, `file_upload`, `memory_built`, `onboarding_done`.

A `context_import` or a `transfer` also carries `tokensSaved`: the tokens
the person would have pasted by hand (the raw chats, as the local
Statistics counts them) minus the tokens Coere sent. The site adds it to
the person's running total (section 15).

### 6.8 The dashboard

coere.ai's `/dashboard` frames the extension's own `console.html`
(section 7). The Console runs there as the extension itself, with every
feature it has in its own tab. Nothing of it is copied, forked or
restyled.

**Who may frame it.** The v4 manifest adds one `web_accessible_resources`
entry once the build is done: `console.html` and exactly the files it
loads (its chunks and fonts, read from the built folder by
`build/console-resources.ts`), with `matches` the site origins of
`host_permissions` and `use_dynamic_url: false`. `tools/lint-manifest`
allows that entry in v4 alone, with no wildcard, no other page and no
`extension_ids`, and refuses a site origin in any other version. When the
page is framed (`window.top !== window`), it renders only if every entry
of `location.ancestorOrigins` is a site origin. Otherwise it shows one
line, "Open Coere from its own button in the Chrome toolbar.", and loads
nothing else (`console/embed/guard.ts`). The check runs before anything
else the page loads, the Allow page and the section sheets included, and
the Allow page never renders framed at all: framed, it shows the same
line. An extension cannot send a
`frame-ancestors` header for its own pages and a meta tag cannot carry
one, so this check of every ancestor is the refusal; the site's own policy
keeps other sites from framing `/dashboard`. Every other page on coere.ai
answers `frame-src 'self'; frame-ancestors 'self'` and
`X-Frame-Options: SAMEORIGIN` (`next.config.ts`), so a script slipped into
a public page cannot frame the Console either.

**Framed by the site.** Links and `console.open` that open other
extension pages use their usual routes, a new tab. Four things need the
extension's own page, since Chrome refuses them in a frame on another
site, and open it in a tab: the folder picker (`console.open` for
`folder` with `local: true`), the microphone for voice (`settings` with
`local: true`), and Browser Use's Allow, from the Settings switch (the
Allow page `console.html#allow-browser-use`) or from a Cori chat (the
worker's Allow page for the run, as an AI site's corner chat does).
**Manage on coere.ai** opens `<site>/account`, in the frame too.

**From the site.** The Console reaches coere.ai's account data through
the background, which holds the device token: an `account.site` message
names one call (`lib/account-calls.ts`), and the background makes it and
answers `{ok:true, status, body}` or `{ok:false, status, reason, detail}`,
where `reason` and `detail` come from a `409 refused` (section 8). A page
never names a path of its own. Deleting the account, or revoking this
browser, then removes `coere.account`.

- **Statistics**, the original section, shows in v4's rail without the
  Dev Tools switch. Benchmarks and Evals stay out.
- **The Account card** in Settings: the username, **Manage on coere.ai** and
  **Disconnect**, then the connected browsers with **Revoke**
  (`GET /devices`, `POST /devices/{id}/revoke`), the switches **Back up
  memory to coere.ai** and **Include sensitive memories** (read from
  `GET /account`, set with `POST /account/memory`; turning one on shows
  the site's refusal line, since only `/account` turns them on),
  **Download memory file** and **Delete memory copy** (`GET` and
  `DELETE /memory`), and **Delete account**, a line and **Delete on
  coere.ai**, which opens `<site>/account`, all built from the Settings
  panel's own rows, buttons and dialog. Revoke, turning the backup off and
  Delete memory copy each ask first in that dialog.
- **Organization**, a v4 section after Library, made only of the
  Console's own cards, rows and buttons and the Memory page's graph, with
  no sheet of its own: the organization's totals, the shared graph from
  `GET /org/index`, the members, and for admins invites, roles, access and
  the organization's settings (`GET /org/page`, `POST /org/{action}`). A
  role change and **Remove** ask first. An invite and making an admin
  show the site's refusal line, since only `/account` does those. With
  no organization, the person's pending invites with **Accept** and
  **Decline**.

**`console.open`** stays the one way in. In v4:

| Asked for | Opens |
|---|---|
| `home` or no section | `<site>/dashboard` |
| `memory` | `<site>/dashboard/memory` |
| `statistics` | `<site>/dashboard/usage` |
| `settings` with no part | `<site>/dashboard/settings` |
| `organization` | `<site>/dashboard/organization` |
| `library`, `cori`, Settings parts `folder`, `import`, `logs`, `transfer`, `ais` | the local `console.html` as today |
| any section with `local: true`, sent by voice and by the framed Console for what needs the extension's own page | the local `console.html` |
| anything while `navigator.onLine` is false | the local `console.html`, so the dashboard still opens offline |

Signed out, any of the site ones opens the connect page instead. The
toolbar popup's dashboard button goes through `console.open`, so it lands
on the site. In v4 the memory settings drop the monthly spend cap, since
the plan on coere.ai sets the limit. The Logs page's Memory table shows
this month's spend with no limit beside it, since the person never sees a
limit (section 8.10).

### 6.9 Onboarding on coere.ai, the live build and Sign out

The owner's report of 2026-11-11 asked for three things: the onboarding
and its memory build on coere.ai with every detail, a build that can be
watched, stopped and continued, and an easy Sign out.

**Onboarding at `/welcome`.** The same `web_accessible_resources` entry
holds `onboarding.html` beside `console.html`, with every file either page
loads (`framedResources` in `build/console-resources.ts`);
`tools/lint-manifest` allows those two pages and no other. The onboarding
page runs the Console's frame check (`console/embed/guard.ts`) before it
mounts. While the browser is online, a v4 build never opens the local
onboarding page: install, the toolbar click, the tab after Connect Coere
and any reopening of an unfinished onboarding open
`https://www.coere.ai/welcome` (`lib/welcome.ts`), and an open welcome tab
counts as the onboarding tab. Offline, the local page opens as before.
v1 to v3 and v5 local keep their local page. The tab after Connect Coere
is worked out when Connect ends, so a worker that started offline still
opens `/welcome` once the browser is online. The finish screen's Open the
dashboard and the tour go to `https://www.coere.ai/dashboard` (with
`?tour=1` for the tour), framed or not, while online. When a build
onboarding started ends with its page closed, the finish screen opens at
`https://www.coere.ai/dashboard/memory?finish=1` while online; the host
page passes `finish=1` to the framed Console and drops it from its own
address. Offline it opens the local Console as before.

**One choice, then a background build.** The owner's ask of 2026-11-23
streamlined it: v4's onboarding asks only which AIs, with every
recommended setting on and a line that they can be changed later in the
dashboard. The form has no switch or other choice beyond the nine AI
cards, Choose all, Clear and Start. Start writes the choices with Cori on
and Always show Cori off, also over an Always show Cori the person turned
on in Settings, and runs Extract all as Save did, then makes the build
step's calls in its order (the stored checklist, Automatically save new
chats on and Add my context to chats in Auto mode, written over any stored
choice with the other context switches kept, the finish owed,
`memory.control` build from onboarding), so memory reads each chat as it
is saved. Auto adds memories, and saved chat excerpts until memory exists,
on the person's own Enter. Tests pin these defaults
(`onboarding/stream/start-build.test.ts`, `stream-onboarding.test.tsx`).
The page goes straight to "Coere is saving your chats and
building your memory." with "You can close this tab or keep browsing.
We'll let you know when it's ready.", Open the dashboard, and a small live
card of the chats saved and memory's step that counts from the first
second. It plays the finish screen if it is still open when the build
ends. While the finish screen is owed the worker gives chats memory holds
for a click the same build call, and the finish tab waits for Extract all
to end, since memory can finish one round before the last chats land
(`background/account/onboarding-build.ts`). Until it ends, Recall's search
as you type runs whatever its switch says (`recall/while-building.ts`), so
typing brings up saved chats before there is a memory to add.

**Saved chats until memory exists** (the owner's ask, 2026-11-24). While
the memory holds fewer than 50 memories and the selection adds nothing,
`memory.contextFor` answers excerpts of the saved chats nearest the draft:
at most 3 chats of 2 pieces each, each with its title, its AI and its date,
redacted as Prepare redacts a request. In Auto they go in front of the
draft inside the person's own Enter, as memories do; in Suggest they only
show. A temporary chat, the chat in the tab, a chat already sent to it, an
AI or chat left out of memory, a sensitive section without Include
sensitive memories, a forgotten quote, a blocked topic and an excluded
message never go. Once the memory holds 50 memories it answers from memory
alone, whether the build came from onboarding or the dashboard. Recall's
suggestions stay the fallback while the embedder loads. The excerpts go to
the AI site with the person's message; nothing of them goes to coere.ai.

Every page that shows a build says Preparing with "n of N chats ready"
while memory plans the chats it was handed (the `memory.planning` event,
counts only), filling the first 5% of the bar, or "Sorting your chats, 0
of N chats" before the first progress (`console/memory/live/build-line.ts`).
The activity log names each chat as Extract all saves it (Saving, then
Saved), from the run's own `currentTitle`, which goes from the tab to the
extension's pages only.

**The live build.** In v4 the Memory page (a card at its top, the one
place to watch a build) and the processing popup draw one live view
(`console/memory/live`) from the same status and progress: the steps with
one count, one bar and one time left, each chat as a dot the moment a job
takes it, lit while it is read and flying into the section whose memories
grew, Cori teleporting there with his hammer at most about once a second,
the chat in work by title and AI, each AI's rows, the memories each AI
added, the chats that could not be read, the activity log, and Pause,
Resume, Stop and Continue. The runtime's `memory.work` event carries each job's
start and end with the chat's id, title and AI, and at the end the ids of
the entities and folders its memories landed in; it goes to the extension's
own pages only and is never logged, stored or sent to coere.ai. The
activity log (the owner's ask of 2026-11-23) names each chat by its title
as it is saved, sorted, read, linked and connected, newest on top, at most
50 lines with a small accent mark for each kind, and says the step that
runs when nothing new came for a few seconds. Its titles come from
`memory.work` and, for Saved, from `library.changed` with the library's
own title rows; they live in the page alone.
`memory.control` takes `stop` (a pause kept as Stopped, every job left in
the memory file) and `continue` (lifts it, tests a site stop at once,
releases jobs waiting out a retry and drops the pacer's own wait), so a
build that broke carries on from the job it was at. A stopped build's line
under the bar says Stopped, as its controls do.

Each chat's dot keeps the place on the ring it got when it first showed,
and is gone once it has flown in, so a new chat never moves the others. A
read chat's dot flies into the first drawn place its own memories landed
in, or that place's nearest drawn parent, rather than to where Cori stands.

The time left and the bar come from one model
(`pipeline/build-time.ts`). In v4 a stage is measured at its latest job
end, not at the moment of reading, and the time left counts down from that
end by at most one job's seconds, so a set of calls waiting on its answers
never makes the time climb. The dashboard's steps card, like the
onboarding's live card, never draws its bar below what it drew before. The
corner pill of the processing popup takes its percent, and its Linking,
from the build's own progress, and a set with no chats of its own is never
read as linking.

While calls are still in flight the status reads `running`, never
`waiting`, so the page offers Continue only for a wait it can shorten.
The extension reacts to each 429 by its `x-coere-limit` marker (section
8.4), never by its retry-after alone: `spend-pending` waits the 10 s and
keeps 85% of the calls in flight, once a window
(`runtime/held-spend.ts`); `per-minute`, `concurrency`, `upstream` or no
marker keeps 60% and waits the retry-after, cut at 60 s; Anthropic's ramp
limit also empties the start burst and sets no ceiling, since the start
rate answers it. After any other limit the cap climbs back no higher than
one under the level that met the limit, until a minute passes with no 429.

**The waiting copy.** While it waits, the v4 status names whose limit
holds the build (`waitReason`), and the Memory card, titled "Memory is
waiting", says so: "Waiting on coere.ai's limit for your plan." for the
site's three markers, "Anthropic is busy right now." for `upstream`, a ramp
limit or a 529, "coere.ai is busy right now." for the site's 503, and
"coere.ai asked Coere to slow down." for a 429 with no marker, each with
"Continuing in" and the time. On the saving side v4 names Claude's site
Claude.ai, so a limit from claude.ai is not read as Anthropic's limit on
memory.

**Sign out.** The v4 Console's rail has Sign out at its foot, always in
view. It asks once ("Sign out of coere.ai on this browser?"), then
disconnects (the background's `POST /api/v1/auth/revoke` and the account
record cleared). Framed by coere.ai, it posts `{type: "coere.sign_out"}` to
the parent at its exact site origin, nothing else in the message; the host
page takes it only from its own frame's window at that extension's origin
with that one type and no other field, signs the site session out and goes
to `/sign-in`. In its own tab it opens `/sign-out` after disconnecting,
which signs the site session out and goes to `/sign-in` (section 3.3);
`/sign-in` alone sends a signed in visitor straight on. The site's navbar
shows Sign out beside Dashboard while signed in, and `/account` has Sign
out at its top. Either Sign out first sends the bridge's `coere.sign_out`
(section 5) to the extension in the `coere_ext` cookie, so Coere in this
browser disconnects too, and the next person to sign in there never sees
the last person's Coere.

**Build memory prompt.** While saved chats wait for a build, v4's Home
leads with a Build memory card (the count, the time it takes, Build memory
and Not now), the toolbar popup shows the same card, and Cori offers it
once beside his seat ("I can build your memory from 70 chats. Start?").
Not now keeps the waiting count and its time in `coere.memory.prompt`
(`{v: 1, chats, at}`), and Cori's offer keeps the same in
`coere.memory.offer`. The offer comes back only after 10 more chats wait,
or a day later with at least one more, so capture saving one chat does not
bring it back. Build memory opens the Memory page's live view.

## 7. The person's dashboard on coere.ai

`coere.ai/dashboard` is the extension's own Console page, unchanged, in a
frame that fills the window. The Console runs as the extension itself, so
it keeps its own style and every feature it has in its own tab. Nothing of
it is copied into the site. Its account data (Statistics, the Settings
Account card, Organization) comes from the site through the background
with the device token, by the routes of section 8.

**The host page.** `/welcome` frames `onboarding.html?embed=1` the same way
(section 6.9), passing on only the onboarding's own query words.
`/dashboard` and every address below it are one page,
`src/app/dashboard/[[...section]]/page.tsx`, outside the site's layout, so
no navbar or footer shows. It renders per request, calls `requireUser`,
and carries the nonce policy and noindex like the other account pages.

1. The server picks the one extension it lets the page frame: the
   `coere_ext` cookie's id when `COERE_EXTENSION_IDS` lists it (or, outside
   production while the list is unset, any well formed id, as `/connect`
   allows). On `/dashboard` alone the policy's `frame-src` is exactly
   `chrome-extension://<that id>/`; every other directive stays as it is.
2. The page asks that id, then each id of `COERE_EXTENSION_IDS`, with
   `coere.hello`, and takes the first that answers.
3. When that is the id the policy names, it renders only
   `<iframe src="chrome-extension://<id>/console.html?tab=<section>&embed=1" allow="clipboard-write">`.
   Voice records in the offscreen document and asks for the microphone on
   the extension's own page, and nothing reads the clipboard, so the frame
   is granted only writing to it.
   When another id answered, it writes that id to `coere_ext` and loads the
   page once more, so the policy names it. It never reloads twice for the
   same id.
4. With no Coere answering, or in a browser with no `chrome.runtime`, a
   plain page in the site's style says the dashboard runs inside Coere
   Connect, links **Get Coere for Chrome**, with the Chrome mark, to
   `/install`, says to open the page in the Chrome where Coere is
   installed, and links `/account` for a person who lost the browser
   Coere was in.

| Address | Console section |
|---|---|
| `/dashboard` | `home` |
| `/dashboard/memory` | `memory` |
| `/dashboard/usage`, `/dashboard/statistics` | `statistics` |
| `/dashboard/settings`, `/dashboard/account` | `settings`, whose Account card is first |
| `/dashboard/organization` | `organization` |
| `/dashboard/library`, `/dashboard/chats` | `library` |
| `/dashboard/search`, `/import`, `/logs`, `/transfer`, `/platforms`, `/folder` | the same id, which the Console places itself (section 6.8) |

Any other address below `/dashboard` is a 404. The mapping is
`src/lib/dashboard/host/console-tab.ts`; the id rules are `frame-id.ts`
and `find-extension.ts` beside it.

**What the Console shows from the site.** Statistics, in v4's rail
without the Dev Tools switch. The Settings Account card: the username,
connected browsers with **Revoke** (`/devices`), the memory backup and
sensitive memories switches (`/account/memory`, off only), download the
memory file and delete the memory copy (`GET` and `DELETE /memory`), and
Delete account, which opens `/account`. The Organization
section: the shared graph from `/org/index`, drawn by the Memory page's
own graph, the members, and for admins invites, roles, access and the
organization's settings (`/org/page`, `/org/{action}`); with no
organization, the person's pending invites with **Accept** and
**Decline**.

**No limit shows.** Nothing shows a spend limit, a plan limit, a meter of
spend against a limit or an amount left (section 8.10). The person sees
only their own use.

**`/account`, signed in on the site.** A device token never expires and
lives in a browser, so a copy of one taken from that browser must not be
able to delete the account, start sending memory to coere.ai, or let a new
person into the organization. Those steps live on `/account`
(`src/app/(site)/account`), a plain page in the site's quiet style that
calls `requireUser` and needs no Coere, so it works from a phone when a
laptop is lost:

- **Profile**: the display name the organization sees (at most 80
  characters; an empty box clears it), and the username, set or changed
  by the rules of 3.1, after the current password. Each saves on its own.
- **Password**: change it after the current one, by 3.1.
- **Sign out**: signs coere.ai out in this browser and clears the
  `coere_signed_in` hint, after asking Coere in this browser to disconnect
  with `coere.sign_out` (section 5).
- **Browsers**: every connected browser with **Revoke**, and **Sign out
  every browser**, which revokes them all at once (`revoked_reason =
  'user'`, one `device_revoked` event). Each asks first.
- **Memory backup**: both switches, on and off. Turning one on writes
  `memory_backup_on`; turning the backup off writes `memory_deleted`.
- **Organization**, for an admin: invite a coworker by username
  with a role, and **Make admin** for each member, by the same rules as
  `POST /org/{action}`.
- **Delete account**, below.

**Deleting the account** happens on `/account` only. It needs a sign in
from the last ten minutes: the newest `amr` timestamp of the session's
verified access token (`getClaims`, `src/lib/auth/recent-sign-in.ts`).
Older than that, the page offers **Sign in again**, which signs this
browser out and comes back to `/account`. Then the person types their
username. The server
then removes every object under their Storage folder, revokes their
devices, and calls `auth.admin.deleteUser`, which removes their rows
through the foreign keys. Usage rows keep their numbers with the person
cut off (`user_id` set to null), so the cost history stays whole and names
nobody. It writes `account_deleted` with no user id and signs the browser
out. Coere's next request then answers `signed_out`, and the extension
removes its `coere.account`.

**The backup switches.** The site's old Settings page held the memory
backup switch (`profiles.memory_sync`) and the sensitive memories switch
(`include_sensitive`). The Console's Account card turns them off through
`POST /api/v1/account/memory` (8.12); only `/account` turns them on.
Turning the backup off removes the stored file and its index, and the
extension stops pushing.

**Not in the Console.** The username and the password are set on
`/account` only, and no route sets them for a device token: a token taken
from a browser must never be able to change how the account signs in.

## 8. The API

All routes are Next.js route handlers with `runtime = "nodejs"` and
`dynamic = "force-dynamic"`. Every answer carries `cache-control: no-store`
and `x-robots-tag: noindex`. There are no CORS headers: the extension holds
the site as a host, and pages never call these routes.

Auth is `Authorization: Bearer <device token>` except on `/auth/token`. One
database call, `device_auth(token_hash)` (section 10), checks the token and
returns the account, its plan, and every spend limit with the spend it is
checked against (`spend_state()`), so the gate needs no second call.

Errors outside the Anthropic routes are problem details
(`application/problem+json`):

```json
{ "type": "https://www.coere.ai/docs/errors#usage_limit", "title": "Monthly limit reached",
  "status": 429, "code": "usage_limit" }
```

| code | status | When |
|---|---|---|
| `signed_out` | 401 | No token, an unknown token, or a revoked one |
| `suspended` | 403 | The account is suspended |
| `invalid_grant` | 400 | A connect code that does not work, for any reason |
| `bad_request` | 400 | A body that does not match |
| `not_found` | 404 | Nothing there |
| `memory_sync_off` | 409 | A memory upload while the backup is off |
| `refused` | 409 | The request was understood and a rule said no (8.11, 8.12). The body adds `reason`, which names the rule, and `detail`, the line the Console shows as it is. `reason: 'web_session'` marks a step a device token may never take, whose line sends the person to `/account` |
| `sensitive_off` | 412 | A memory commit whose file holds sensitive memories while the person has them turned off; the extension refreshes its account and exports again |
| `too_large` | 413 | A body or file over its limit |
| `rate_limited` | 429 | Too many requests this minute, with `Retry-After` |
| `usage_limit` | 429 | The monthly, the lifetime or the daily limit (or the first build allowance) is spent. A spent day answers `Retry-After` until the next UTC midnight and the title "Daily limit reached"; a spent first build allowance is titled as the monthly limit |
| `unavailable` | 503 | The server is missing a setting it needs |

### 8.1 `POST /api/v1/auth/token`

No bearer. Body `{ code, verifier, extensionId, extensionVersion, name }`.
Answer `200 { token, device: { id, name }, user: { id, email, username } }`.
20 tries a minute per address.

### 8.2 `POST /api/v1/auth/revoke`

Revokes the calling token (`revoked_reason = 'signed_out'`). `204`.

### 8.3 `GET /api/v1/account`

```json
{ "user": { "id": "…", "email": "…", "username": null, "createdAt": "…" },
  "plan": { "id": "free", "name": "Free", "monthlyLimitMicros": 5000000, "lifetimeLimitMicros": null, "storageLimitBytes": 26214400 },
  "usage": { "month": "2026-11-01", "costMicros": 0, "requests": 0, "inputTokens": 0, "outputTokens": 0 },
  "memory": { "sync": true, "includeSensitive": false, "uploadedAt": null, "bytes": null, "digest": null },
  "device": { "id": "…", "name": "Chrome on macOS" },
  "org": { "id": "…", "name": "…", "role": "member" },
  "totals": { "tokensSaved": 0, "tokensUsed": 0, "costMicros": 0, "memories": 0, "chats": 0 },
  "settingsVersion": 0 }
```

A suspended account gets this answer too, since the Console's backup
switches read it and turning the backup off stays in reach (8.12).

### 8.4 Anthropic: `/api/v1/anthropic/v1/...`

The paths the extension uses, and nothing else:

| Method | Path | Note |
|---|---|---|
| POST | `v1/messages` | metered |
| POST | `v1/messages/count_tokens` | counted, cost 0 |
| POST | `v1/messages/batches` | the batch id is stored as the caller's, also when the caller goes away before the answer |
| GET | `v1/messages/batches` | answered from the caller's own `ai_batches` rows of the last 30 days, newest first, each item fetched from Anthropic by id (one gone there is left out); `limit` at most 100, `after_id` pages on, and `first_id`, `last_id` and `has_more` describe the caller's own rows only |
| GET | `v1/messages/batches/{id}` | own batches only |
| POST | `v1/messages/batches/{id}/cancel` | own batches only |
| DELETE | `v1/messages/batches/{id}` | own batches only; a batch deleted before its results were metered is charged its reservation, then its row goes, also when Anthropic answers 404 because an earlier delete got through |
| GET | `v1/messages/batches/{id}/results` | own batches only, streamed, metered once at batch price |

Another path answers 404. Before forwarding:

- **Body.** At most 4 MiB.
- **Each request's params** (one for a message, each entry for a batch):
  `model` is one of `claude-opus-5-5`, `claude-sonnet-5-5`,
  `claude-haiku-5-5`; `max_tokens` is from 1 to 64,000; `stream` is
  missing or false; every tool is a client tool (no `type`, or `custom`),
  since a server tool's per use fee is not in `usage`; no `cache_control`,
  on a block or at the top of the request, asks for a `ttl` other than
  `5m`, since the price table has only the 5 minute cache write;
  `fallbacks` is missing or `default`, since a list can name another
  model; and `speed` is missing or `standard` and `inference_geo` missing
  or `global`, since fast mode and a named region are billed above the
  table.
- **Pictures and documents** are in the request itself: a picture as
  base64, a document as text or as blocks. One given by address or by
  stored file, and a PDF, are refused, since the spend reservation counts
  the request's bytes and these cost far more than their bytes say
  (section 8.10).
- **Coere's own prompts.** A message, and each entry of a batch, opens with
  one of the extension's pinned system prompts: the SHA-256 of its first
  system block (the whole `system` when it is a string) is one of those
  listed in `src/lib/v1/anthropic/prompt-shas.ts`, each the SHA coere-v2
  pins for that prompt. What changes per call goes in the messages, so the
  first block is always a whole pinned prompt. A token count is not held to
  it, since it costs nothing. From 2026-11-25 the check reports only: a
  miss is logged by its SHA and a 12 character hash of the account's id,
  never the prompt's text or the id, at most once per SHA and five SHAs an
  account an hour on each server instance, and the call goes on. Once the
  logs show every v2 to v4 prompt, `PROMPT_CHECK` turns to `enforce` and a
  miss is a `400 bad_request`. A package that adds a prompt version adds
  its SHA to the list first, and the site deploys before the extension.
- **The body forwarded** is the parsed body written out again, so Anthropic
  reads exactly what was checked. Its bytes are read under the cap while
  the device check runs, once the `authorization` header has a token's
  shape (`readRequest` in `anthropic/prepare.ts`). The parse, these checks
  and the prompt log wait until the gate has passed the device
  (`checkRequest`), so a caller with a made up token costs no parse and
  writes no line.
- **A batch** has at most 500 entries, and each names `max_tokens` of at
  most 16,000: the extension's own ceilings, which bound how far one batch's
  worst case can reach past a limit (section 8.10).
- **Headers forwarded:** `anthropic-version`, `content-type`, and
  `anthropic-beta` when each of its values is one of
  `message-batches-2024-09-24`, `token-counting-2024-11-01`,
  `server-side-fallback-2026-07-01`. `x-api-key` is the server's
  `ANTHROPIC_API_KEY`. Nothing else is forwarded.
- **Answer headers kept:** `content-type`, `request-id`, `retry-after`,
  `x-should-retry`. On a 429 the site adds `x-coere-limit` and replaces
  any the upstream sent under that name.

**The limit marker.** Every 429 on these routes and on Jev's carries
`x-coere-limit`, naming what refused the call: `spend-pending` (other
calls' expected costs fill a limit, `retry-after: 10`), `per-minute` (a
per minute lane, at most 30), `concurrency` (the live holds cap or the
overrun bound, 2) or `upstream` (Anthropic's or Jev's own 429, with its
own `retry-after`). The proxy's 504 for a call it cut at 285 seconds
carries `duration` (below). The value is one of these five and carries
nothing about the person. A Jev `usage_limit` 429 is a spent limit and carries
none. An extension that does not know the header ignores it, and a 429
without it reads as an ordinary rate limit. The site deploys before an
extension that reads it.

Errors on these routes use Anthropic's own shape, so the memory runtime's
error classes keep working unchanged:

| Case | Status and body |
|---|---|
| No, unknown or revoked token | `401 {type:'error', error:{type:'authentication_error', message:'signed_out'}}` |
| Suspended | `403 {…permission_error, message:'account_suspended'}` |
| Monthly, lifetime or daily limit, or the first build allowance, spent | `400 {…invalid_request_error, message:'You have reached your specified monthly usage limit on coere.ai.'}` (or `lifetime`, or `daily` for a daily limit the operator set; a spent first build allowance reads as `monthly`). The runtime reads a message that starts "You have reached your specified" as a spend limit: it holds the queue, tries again every hour and on Try now, so raising the limit in the admin panel lets work go on within the hour |
| Per minute limit | `429 {…rate_limit_error, message:'rate_limited'}` with `retry-after` and `x-coere-limit: per-minute` |
| Spend held by other calls (`pending`) | `429 {…rate_limit_error, message:'rate_limited'}` with `retry-after: 10` and `x-coere-limit: spend-pending` |
| Too many calls at once (`concurrency`) | `429 {…rate_limit_error, message:'rate_limited'}` with `retry-after: 2` and `x-coere-limit: concurrency` |
| Model not allowed | `404 {…not_found_error, message:'model: <name>'}` |
| Beta not allowed | `400 {…invalid_request_error, message:'Unexpected value(s) for the \`anthropic-beta\` header.'}` |
| Body too large | `413 {…request_too_large, message:'request_too_large'}` |
| The site's first build budget for the day is spent (section 8.10) | the spent limit `400` above, reading `daily` |
| Anthropic's own 429, 529 or other 5xx | its status and error type with a fixed message: `rate_limited` for a 429, `overloaded` for an overload, `upstream_error` for the rest. Anthropic's message names Coere's organization and its per minute limits, so it stays behind. `retry-after` and the 429's `x-coere-limit: upstream` are kept. A 4xx about the caller's own request passes as it is |
| The call ran past the proxy's 285 second cut | `504 {…timeout_error, message:'duration'}` with `x-coere-limit: duration` and `x-should-retry: false`. The same call would be cut again, so the extension splits the work or stops |
| Server has no key, or Anthropic refuses Coere's own account (upstream 401, 402 or 403, a 400 "Your credit balance is too low" or "You have reached your specified", a 429 `enforced_spend_limit_reached`) | `503 {…api_error, message:'unavailable'}`, which the runtime retries on its own |

**Metering.** A successful message writes one usage row per model from its
`usage` (input, output, cache write, cache read) priced by the table in
section 11. With a refusal fallback, each entry of `usage.iterations` is
priced at its own model, the declined attempt included, as the extension's
own counter does. The rows and the call's hold go in one `settle_call`
before the answer is sent: one round trip after Anthropic answers, where
there were two (`record_usage`, then the hold's delete). It is tried twice;
a retry after a first try that landed but whose answer was lost counts
the call twice, which over counts and only then. Before migration
20261125000000_proxy_settle has run, PostgREST answers `PGRST202` and the
proxy makes the two calls as before, deleting the hold only once every row
landed.
Batch results are read as they stream through; when the stream ends, one
row per model is written at half price and the batch is marked metered, so
reading the results twice counts once. When that write fails twice, the
read breaks instead of ending, so the extension reads again in a minute
rather than deleting a batch that was not metered.

`maxDuration` is 300 seconds on every route, which works on every Vercel
plan: it is the most Hobby allows and Pro's default with Fluid compute. Most
calls end well inside it. The v4 extension waits up to 330 seconds for a non
streaming call (600 before 2026-11-24). From 2026-11-25 the proxy ends the
upstream fetch itself at 285 seconds (`UPSTREAM_CUT_MS`), with the caller's
own abort beside it, and answers the marked `504` above, so the extension
no longer reads Vercel's bare 504 as a passing server error and sends the
same too long call again. A batch create and a batch delete are not cut,
since once Anthropic has either the proxy must store or forget its row.
The cut call may be billed upstream and is not metered; its hold stays
until it runs out (section 8.10). A Pro team may raise the Claude route to
800, Vercel's ceiling there; then HOLD_SECONDS becomes 860 and the
extension's wait 830 seconds.

### 8.5 Jev: `POST /api/v1/jev/v1/systemone`

Forwards to `https://api.typesafe.ai/v1/systemone` with `Authorization:
Bearer <JEV_API_KEY>`. Body at most 256 KiB, `model` one of `jev-1.14.0`,
`jev-1.13.0`. Metered from `usage.input_tokens`. With no `JEV_API_KEY` it
answers `403`, which sends the extension's classifier to Haiku at once.
Auth and limit errors are the same as 8.4's statuses with a plain
`{error:'…'}` body. A per minute 429 carries `x-coere-limit: per-minute`
and Jev's own 429 `upstream`; a spent limit's `usage_limit` 429 carries
none.

### 8.6 Memory

- **`POST /api/v1/memory/upload`** `{ bytes, digest }`. With the backup off,
  `409 memory_sync_off`. Over the plan's storage limit or 50 MiB,
  `413 too_large`. With the same digest already stored, `200 { skip: true }`.
  Otherwise `200 { skip: false, path, url }`, where `url` is a signed upload
  URL for `<user id>/incoming/<random>.coere` that lives 2 hours. Anything
  staged before is removed first, so an account holds at most one staged
  file, and an upload never committed cannot fill Storage.
- **`PUT <url>`** with the zip as the body and
  `content-type: application/vnd.coere.memory+zip`. This goes straight to
  Supabase Storage, so the file never passes through the site's 4.5 MB
  request limit. Exactly what `@supabase/storage-js` 2.118's
  `uploadToSignedUrl` sends, read from its source:
  - `url` is used as given:
    `<SUPABASE_URL>/storage/v1/object/upload/sign/memory/<path>?token=<jwt>`.
    The token in the query is the only permission. Send no
    `Authorization`, no `apikey` and no device token.
  - Method `PUT`. The body is the zip's raw bytes (an `ArrayBuffer` or
    `Uint8Array`), not a form: storage-js sends a `FormData` body only when
    handed a `Blob`.
  - Headers: `content-type: application/vnd.coere.memory+zip` (the bucket
    refuses any other type), `x-upsert: false` and
    `cache-control: max-age=3600`.
  - Success is `200` with JSON `{ "Key": "memory/<path>", "Id": "…" }`.
    A refusal is a 4xx with JSON `{ statusCode, error, message }`: a wrong
    type or an expired token (the address lives 2 hours), a file over the
    bucket's 50 MiB, or a second PUT to the same address, which conflicts
    because the address does not overwrite.
  - Storage answers the CORS preflight for any origin, so the extension
    needs no host permission for the Supabase host.
- **`POST /api/v1/memory/commit`** `{ path }`. The server reads the staged
  file, checks it is a `.coere` zip (the `mimetype` entry) under the limit,
  reads `manifest.json`, takes the counts from it, builds the index
  (section 8.7), writes the bytes over `<user id>/memory.coere` in one
  upsert (so a failed write keeps the old copy), writes
  `<user id>/index.json`, removes its own staged file, and upserts
  `memory_files`. A file holding sensitive memories while the person has
  them off is removed and answered `412 sensitive_off`, so the stored copy
  never holds what they opted out of. On that answer the stored file is
  read again by today's rule (a fact with a sensitivity, or anything in
  Health, Money, or Beliefs and values) and removed when it fails, since a
  copy stored before that rule has `includes_sensitive` false when only its
  facts were checked. Turning sensitive memories off reads it the same way
  (`stored-sensitive.ts`), and `scripts/memory/sweep-sensitive.mts` runs
  that check once over every such account at deploy. Answer
  `200 { bytes, digest, uploadedAt, counts: { memories, entities, links, chats, documents, sections } }`.
- **`GET /api/v1/memory`** answers `200 { url }`, a download link that lives
  60 seconds, or `404`.
- **`DELETE /api/v1/memory`** removes the file, the index and the row. `204`.

### 8.7 The memory index

`<user id>/index.json`, made at commit so the dashboard never unzips a
large file:

```ts
{ v: 1, digest: string, created: string, timeZone: string | null, self: string | null,
  sections: { key: string, name: string }[],
  entities: { id: string, kind: string, name: string, section: string, parent: string | null, importance: number }[],
  facts: { id: string, subject: string, under: string | null, kind: string, key: string | null,
           text: string, importance: number, status: string, sensitivity: string | null,
           first: string | null, last: string | null, sources: number }[],
  relations: { id: string, from: string, type: string, to: string }[],
  sources: { id: string, platform: string, title: string, capturedAt: string | null, messages: number }[],
  documents: { path: string, title: string }[],
  truncated: boolean }
```

Quotes stay in the `.coere` file and out of the index. Past 50,000 facts the
index keeps the most important and sets `truncated`.

### 8.8 Settings

- **`GET /api/v1/settings`** answers `200 { version, updatedAt, settings }`,
  where `settings` maps a synced key (section 6.6) to its value.
- **`PUT /api/v1/settings`** `{ settings }` merges the given keys and
  answers the same shape.

A value must be a JSON object of at most 8 KiB. An unknown key, or
`on`/`grantedAt` inside `coere.browser_use`, is refused with
`400 bad_request`. The whole record is at most 64 KiB.

### 8.9 Events

**`POST /api/v1/events`** `{ events: [{ kind, count, tokensSaved? }] }`,
at most 50 entries, each kind from section 6.7, each count from 1 to
100,000, `tokensSaved` from 0 to 100,000,000 and only on `context_import`
and `transfer`. `204`. Entries of one kind are summed and clamped: 5,000
`extract_chat` and 1,000 of any other kind a request, and `tokensSaved` at
most 1,000,000 for each use counted (`src/lib/v1/events.ts`). One
`record_app_events_capped` call then holds the account, across all its
devices, to 20,000 of a kind and 200,000,000 tokens saved a UTC day (a
device token costs nothing to mint, so a bound per device would bound
nothing), drops an entry with no room left,
stores the rest and adds it to the totals. Real batches sit far below
both bounds. A batch is clamped rather than refused, since the extension
keeps a refused batch and sends it again. Before migration
20261125000000_proxy_settle has run, `record_app_events` takes the batch
with the per request caps alone.

### 8.11 Organization

**`GET /api/v1/org`** answers `200 { org: { id, name, role, sharedSections, access } | null }`.
**`GET /api/v1/org/index`** answers the organization's merged index (the
shape of section 8.7, with a `contributor` user id on each fact) or `404`,
cut to the sections the member may read. One answer holds at most 5,000
facts, the most important first, and fewer when it would pass 4 MB (a
Vercel function answers at most 4.5 MB); `truncated` is then true. Only
members may read it. The Console's Organization section draws it with the
Memory page's own graph; reading the organization graph into context is
the next step after this build (section 14.5).

**`GET /api/v1/org/page`** answers what the Organization section shows,
in the shape of the site's `src/lib/org/page-data.ts`:

```ts
{ org: { id, name, plan, sharedSections: string[], defaultAccess: { read: "all" | string[], contribute: boolean },
         sections: { key, name }[] } | null,
  me: { userId, role: "admin" | "member", shareMemory: boolean, access, readable: string[] } | null,
  members: { userId, name, username: string | null, email: null, role, access: object | null, effective, shareMemory,
             joinedAt, tokensSaved, memoriesShared }[],
  invites: { id, name, role, createdAt, expiresAt }[],
  totals: { tokensSaved, memories, chats, members, costMicros, monthCostMicros } | null,
  myInvites: { id, orgName, role, invitedBy: string | null, expiresAt }[] }
```

`sections` is every section an admin may share: the base ones, then any
the graph or the settings name. A member's `email` is always null (kept so
the shape holds; accounts hold no email a person gave), and the open
`invites` are filled for an admin only. With no organization, `org`, `me` and
`totals` are null, `members` and `invites` empty, and `myInvites` holds the
invites waiting for the person.

**`POST /api/v1/org/{action}`** runs one action by the same rules the
site's dashboard ran (14.1), for the person the token belongs to and only
inside their own organization. Body at most 16 KiB.

| Action | Body | Who |
|---|---|---|
| `invite` | `{ login, role? }`, the username of an existing account, `role` `member` by default | refused for a device token; an admin on `/account`, at most 30 an hour |
| `revoke-invite` | `{ inviteId }` | admin |
| `accept`, `decline` | `{ inviteId }` | the invited person |
| `role` | `{ userId, role }` | admin; `role: 'admin'` is refused for a device token and done on `/account` |
| `access` | `{ userId, access }`, `{ read, contribute }` or `null` for the organization's default | admin |
| `remove` | `{ userId }` | admin, not on themselves |
| `leave` | `{}` | any member |
| `share` | `{ on }` | any member |
| `settings` | `{ name, sections, defaultAccess }` | admin |

Done answers `200 { notice }`, the line to show or null; the Console then
reads `/org/page` again. A rule's no answers `409 refused` with one of
these `reason`s and its `detail`: `not_member`, `not_admin`,
`last_admin`, `self`, `bad_login`, `no_account`, `in_org`, `pending`,
`too_many`, `invite_not_found`, `invite_expired`, `already_in_org`,
`bad_name`, `no_sections`, `web_session`. An invite, or making someone an
admin, answers `web_session` with the line "To invite someone or make an
admin, sign in at coere.ai/account.": a person let in with a copied
token would stay after the token is revoked. An unknown action is `404`,
a body that does not match `400 bad_request`. Invites, joins, leaving and removals write
the same security events as on the dashboard.

### 8.12 Account

These keep working for a suspended account, so a person can always see
where they are signed in, sign a browser out and stop the backup.

**`GET /api/v1/devices`** answers the connected browsers, newest first, at
most 50:
`200 { devices: [{ id, name, tokenHint, extensionVersion, createdAt, lastUsedAt, revokedAt, current }] }`,
where `current` marks the browser that asked.

**`POST /api/v1/devices/{id}/revoke`** revokes one of the caller's own
browsers (`revoked_reason = 'user'`) and writes `device_revoked`. `204`,
also for one already revoked. An id that is not one of theirs is `404`.
Revoking the calling browser signs it out, as `/auth/revoke` does.

**`POST /api/v1/account/memory`** `{ sync?, includeSensitive? }` turns
the memory backup switches off: at least one, each a boolean, nothing else
(`400` otherwise). Turning either on is `409 refused` with `reason:
'web_session'` and the line "To turn this on, sign in at coere.ai/account.
You can turn it off here.": a copied token could otherwise make the
person's own browser upload its memory, sensitive memories too, for the
copy to download. `sync: false` also removes the stored file, its index
and the person's part of their organization's graph, and writes
`memory_deleted`. `includeSensitive: false` removes the same three when
the stored file holds sensitive memories, so the copy never keeps what the
person opted out of, and the extension sends a copy without them soon
after: at once when the Console changed the switch, and at its next account
read (every 30 minutes) when `/account` did. A commit already under way
reads both switches again after its writes and removes its own file when
either went off. Answers `200 { memory: { sync, includeSensitive } }` as
they now stand. A suspended account may use it too, since off removes its
data.

**`POST /api/v1/account/delete`** `{ email }` never deletes. A copied
token could read the account from `GET /account` and type it, so after the
token and the body check it answers `409 refused` with `reason:
'web_session'` and the line "To delete your account, sign in at
coere.ai/account and delete it there." The account is deleted on
`/account` alone (section 7).

### 8.10 Limits

| What | Limit |
|---|---|
| Requests per minute per device | held in memory per server instance, in lanes (`src/lib/v1/lanes.ts`). The `default` lane, the plan's `requests_per_minute`, holds only the account, settings, events and memory routes, so a build never starves them. A message that is not Haiku, and every batch call, counts in `message`: five times that and at least 600, since a build with about 100 calls in flight starts about 300 a minute. A Haiku message counts in `haiku`, thirty times that and at least 2,000, since without Jev Haiku sorts every chat of a build. Jev calls and `count_tokens` each keep their own, ten times that and at least 1,000. A message's lane is chosen by its model, so its per minute check runs once the body is read. A refusal's `retry-after` is at most 30 seconds (MAX_RATE_RETRY_SECONDS), the longest the extension waits before giving an item up. The guard against a runaway loop on the model calls rests on the spend limits, the live holds cap and the overrun bound below |
| Monthly spend | the person's own `monthly_limit_micros` when the operator set one, else the plan's ($5 on Free, $20 on Plus, $100 on Team), per UTC month, once the account's free first build has finished, against the month's spend after that build, checked before every metered call |
| Lifetime spend | the person's own `lifetime_limit_micros` when set, else the plan's (null on every seeded plan, meaning none), against `user_totals.cost_micros`, checked before every metered call, always |
| First build allowance | the person's own `first_build_limit_micros` when set, else the plan's ($10 on every seeded plan), in place of the monthly and daily limits until the first memory build finishes, against everything spent since the free build began |
| Daily spend | the person's own `daily_limit_micros` when set, else the plan's: null on every seeded plan, meaning none. When the operator sets one, it applies per UTC day once the free first build has finished, against the day's spend after that build |
| Memory file | the plan's `storage_limit_bytes`, and never over 50 MiB, Supabase Storage's default project upload limit (fixed on Free), which a bucket limit cannot raise |
| `/auth/token` | 20 a minute per address |

**Spend reservations.** The checks above read spend
already recorded, which lands only after Anthropic answers. So before a
message or a batch is forwarded, the proxy holds it with
`reserve_spend()`. Each hold keeps two costs. Its worst case: input
counted as one token per two bytes of the request's JSON and 5,000 more
for each picture, priced as cache writes, plus `max_tokens` (or 64,000) of
output, at the asked model's price, half for a batch. Its expected cost:
input at three bytes a token, still as cache writes, plus
min(`max_tokens`, HOLD_OUTPUT_TOKENS = 2,000) of output, never above the
worst case (`anthropic/worst-case.ts`). A hold is let go once the call's
cost is known (`holdOutcome` in `src/lib/v1/hold-rules.ts`): in the same
`settle_call` that records a message's usage, in the same `store_batch`
that stores a new batch's reservation, when Anthropic answers an error,
which it does not bill, or when the connection to Anthropic never opened
(a refused connection, a name that did not resolve, a connect timeout or a
certificate the handshake refused: `neverSent` in
`anthropic/upstream-cut.ts`). A hold let go apart from a record is
deleted, then set to charge nothing if the delete failed, then deleted
again (`letHoldGo`), so one left behind never charges a call that cost
nothing. When Anthropic may have billed a call whose cost was not recorded
(the caller went, the 285 second cut, a connection that broke after it
opened, a failed read of the answer, or a record that failed twice), the
hold stays and runs out, so that spend keeps counting instead of
vanishing at once. A batch create is the exception: when its forward
fails its hold goes, since a batch the proxy never stored can be read by
no one, and its worst case may be more than the person has left. Its hold
stays only when the answer came and could not be read. When it runs out
unreleased, the next `reserve_spend` of the account records it as spend
(a `usage_events` row with status 504 and request id `expired_hold`)
before deleting it: its `charge_micros` when the proxy set one, else its
worst case (`keptCharge` in `hold-rules.ts`). The 285 second cut, a record
that failed with its cost unknown, and a function that died charge the
worst case. A call that ended early (its caller went, a connection that
broke, a failed read) is charged its expected cost and the most output it could
have made in the time it ran, at 300 tokens a second, never above its
worst case, so closing a tab mid build does not charge every call's worst
case. A cost known but not recorded is charged as it is. Until migration
20261125000000_proxy_settle, an expired hold was deleted for free, so a
call that outran the route could be repeated without end with nothing
charged. A hold is void after HOLD_SECONDS = 360 seconds, the route's 300
second `maxDuration` and a minute (900 before 2026-11-24, which kept a hold
ten minutes past a call Vercel cut off). Pending spend is every live hold
plus the `reserved_micros` of each batch not yet metered. A message is
checked against every limit in force and refused in this order:

1. its spent limit, the `usage_limit` 400, when its own expected cost does
   not fit beside the spend and the batches not yet metered;
2. `pending`, `429 rate_limited` with `retry-after: 10` and
   `x-coere-limit: spend-pending`, when spend plus every hold's expected
   cost plus its own would pass the limit: those holds go as each call
   answers, so a first build slows near its allowance and never stops for
   an hour on a limit that is not spent;
3. `concurrency`, `429` with `retry-after: 2` and `x-coere-limit:
   concurrency`, when the account already has MAX_LIVE_HOLDS = 128 live
   holds, or when spend plus every hold's worst case plus its own would
   pass the limit by more than the overrun bound, $5 (OVERRUN_MICROS in
   `src/lib/v1/hold-rules.ts`). With no other hold live, a call that alone
   passes a limit by more than $5 gets its spent limit instead. A
   concurrency refusal writes a `rate_limited` security event at most once
   a minute per device.

So all of an account's calls in flight together can pass a limit by at
most $5 even if every one used its worst case. With Sonnet at 16,000
`max_tokens` that bound is what limits calls in flight: for an extraction
of about 20k tokens (worst case about $0.26, expected about $0.087), about
57 Sonnet calls fit the $10 first build at once before anything is spent, about 38
at $5 spent, and near the limit `pending` refuses first. Haiku calls meet
the 128 cap. Holds made by the four argument `reserve_spend`, and the site
before the migration `20261124000000_build_lane_holds.sql` has run (it
falls back to that function on PostgREST's PGRST202), count at their worst
case. A batch keeps its old rules: its hold is its worst case. From
migration 20261125000000_proxy_settle, a batch that does not fit only
because of the message holds in flight (spend and the batches not yet
metered alone leave room) is `pending`, as a message is, not its spent
limit, which the extension would hold for an hour; spend or batches
filling the limit are still the limit. The four argument function keeps
the old answer.

**The site's first build budget.** Every new account gets a $10 first
build on Coere's key, and sign up needs only a username. So the seven
argument `reserve_spend` also refuses a call of an account still in its
first build as `site_budget` once today's first build spend across the
whole site (`first_build_daily`, kept per UTC day by a trigger on
`usage_events`), plus the reservations of every first build batch not yet
metered, plus the call's expected cost (a batch's worst case), passes
`site_settings` key `budget.first_build_daily`, `{"micros": N}`. The
migration seeds it at $1,000 a day, about a hundred whole first builds;
the operator changes it in the SQL editor, or deletes the row for no
ceiling. An account's own spent limit is named first. The proxy answers
it as the spent limit 400 reading `daily`, so the extension holds its
queue and tries again hourly, and logs that the budget is spent. A
batch's cost lands in the day's row only when its results are read, often
hours later or on another day, so first build batches count in flight
until they are metered. Message holds in flight are not counted, so the
budget can be passed by the messages in flight when it fills.

A batch may start while nothing is at a limit, since its worst case is
far above what it costs and a small plan could otherwise never batch; its
reservation then holds every other call back until its results are metered.
A batch never metered within 30 days (its results expire after 29), or
deleted before its results were read, is charged its reservation. So a limit can be passed by at most one batch's
worst case, never by an unbounded amount. While a spend limit holds the
extension's queue, it still polls and reads the batches it already sent,
and tests the limit again as soon as one is read (with one batch create
when no direct call is queued), so a reservation never holds it for good.

The first build allowance, and a daily limit when one is set, are held the
same way. Pending spend counts against whichever limit is in force when the
next call is checked, so any limit can be passed by one batch's worst case
at most, the same bound as the month.

**The free first build, then the monthly limit.** Every account gets one
free memory build, then its plan's monthly limit. `profiles.first_build_at`
is set by `record_app_events()` the first time a `memory_built` event
arrives, which the extension sends when a build finishes. Until then the
first build allowance ($10) applies in place of the monthly and daily
limits, against everything spent since the free build began, so an account
that never finishes a build still cannot spend without bound. After it, the
monthly limit applies to the UTC month's spend from `usage_monthly`, less
what the first build spent in the month it finished
(`first_build_mark_micros`), so the free build never counts against a
month: a free person who spends $9 on the first build still has the whole
$5 of that month after it. There is no daily limit unless the operator sets
one on `/admin/limits` or on an account's page; it then counts the UTC
day's spend after the first build the same way. The lifetime limit applies
throughout. `spend_state()` resolves all of this in one place, and
`device_auth()`, `reserve_spend()` and the admin pages read it.

The operator can reset the free first build on the account's page: the
allowance applies again, counting only what is spent after the reset, and
the monthly limit waits for the next finished build. Spend in that month
before the reset no longer counts against it.

**The person never sees a limit.** A signed in session cannot read any of
the limit columns, `spend_state()` or the holds. The dashboard shows only
the person's own use (section 7). `GET /api/v1/account` still answers the resolved monthly and lifetime
limits for the extension, which shows no number from them in v4. When a
limit is reached, the extension shows its usual limit message and tries
again each hour; a spent month lifts on the first of the next and a spent
day at the next UTC midnight. When several limits are spent, the refusal
names the one that lasts longest: lifetime, then the first build allowance,
then monthly, then daily.

## 9. The admin panel

`/statistics` becomes `/admin`, and `/statistics` redirects there. The guard
stays the USER and PASSWORD pair with its signed cookie, and an account
session never opens it. It keeps its own look (`stats.css`). Sections:

| Path | Shows |
|---|---|
| `/admin` | **Statistics**: the product's running totals (section 15). Accounts, organizations, total AI cost, tokens used, tokens saved, memories, chats, context imports, transfers, storage. Each by day and in total, with the top accounts and organizations by tokens saved. |
| `/admin/analytics` | Site analytics, as `/statistics` showed them. |
| `/admin/users` | Accounts: username, plan, status, organization, created, last seen, devices, this month's cost and requests, whether the free first build is used, tokens saved, memory file size. Sign ups by day. Opening an account shows its totals, each limit in force with its spend as the gate reads it (the first build against the allowance while it runs, then this month after the build, today when a daily limit is set, and the lifetime limit when there is one), and its knowledge graph. Actions: change plan, set the person's daily, first build, monthly and lifetime dollar limits (blank means the plan's, shown as the placeholder; a daily limit the plan does not set shows "Off (plan)"), reset the free first build, suspend or restore, revoke every device, and set a new password or username for a person who forgot theirs (each writes its own `admin_set_` event naming the account). Every page shows the username, never the placeholder email. |
| `/admin/organizations` | Every organization: name, members, plan, tokens saved, memories, chats, cost. **Create an organization** (name, plan, first admin picked from existing accounts by username). Opening one shows its members with their roles, access and totals, and the organization's knowledge graph, and lets the operator change its settings, add a member or admin from existing accounts, change roles, remove members and delete it. |
| `/admin/interested` | **Interested** (section 16): three lists behind one switch, Developers (`developer_waitlist`), Coere Connect and Coere for Teams (`product_interest` by product). Each shows its count, the count by day, the newest entries and a CSV download; **Export all** is every list in one CSV with a product column. `/admin/waitlist` redirects to the Developers list. |
| `/admin/launch` | **Launch countdown** (section 16): one plain block each for `/install` and `/try-teams`, with the countdown line the page shows (drawn by the page's own component), the moment in the operator's own time zone, +1 day, +1 week and 20 days from now as small text buttons, a show countdown switch, Save and one line that says whether it is saved. A moment in the past saves only after a confirm. |
| `/admin/database` | Every table's estimated rows, size, Row Level Security on or off and policy count, and the Storage bucket totals. |
| `/admin/security` | Sign ins and failures by day, rate limit hits, refused tokens, revoked devices, connect refusals, deleted accounts, and any table with Row Level Security off. |
| `/admin/cost` | AI spend today, this month and by day, storage bytes and their cost at $0.021 per GB month. For a range (today, this month, the last 30 days, all time): each model's requests, input, output, cache write and cache read tokens and cost, with a total row, and the top accounts by cost, tokens or requests, each with its limits in force and the spend against each. The sums come from `admin_usage_by_model()` and `admin_top_accounts()`, never from reading every call. |
| `/admin/limits` | **Limits**: each plan's daily, first build, monthly and lifetime limits in dollars and cents (a blank daily limit means off, a blank lifetime limit none), one daily limit set on every plan at once (blank turns it off on every plan), how many accounts override each limit with their own, and **Clear all** for each after a confirm. An account's own value always wins over its plan's. |

The admin panel reads memory through the server's secret key. Each time an
operator opens a person's or an organization's graph, it writes an
`admin_viewed_memory` security event naming the account or organization.

## 10. The database

One migration, `supabase/migrations/20261103000000_coere.sql` in the
frontend repository, holds everything: the site analytics tables and
functions, then the account tables below. It is safe to run again. Every
table has Row Level Security on. Policies use `(select auth.uid())`.
`anon` gets nothing. The server's secret key bypasses Row Level Security
and is the only thing that writes.

| Table | Columns | Who reads |
|---|---|---|
| `plans` | `id text pk, name, monthly_limit_micros bigint, lifetime_limit_micros bigint (null means none), daily_limit_micros bigint (null means none, the default), first_build_limit_micros bigint default 10000000, storage_limit_bytes bigint, requests_per_minute int, created_at`. Seeds `free` ($5 a month, 25 MiB, 60), `plus` ($20, 100 MiB, 120), `team` ($100, 500 MiB, 300), each with a $10 first build and no daily limit. | everyone signed in: `id`, `name`, `storage_limit_bytes`, `requests_per_minute` and `created_at`, never a spend limit |
| `profiles` | `id uuid pk references auth.users on delete cascade, email, username unique, display_name, plan_id references plans default 'free', monthly_limit_micros bigint (null means the plan's), lifetime_limit_micros bigint (null means the plan's), daily_limit_micros bigint (null means the plan's), first_build_limit_micros bigint (null means the plan's), first_build_at timestamptz (the first memory_built), first_build_mark_micros bigint default 0 (`user_totals.cost_micros` when the free build began, then when it finished), status ('active'\|'suspended'), memory_sync bool default true, include_sensitive bool default false, created_at, updated_at, last_seen_at`. `email` is the placeholder `<username>@users.coere.ai` (section 3.1), never shown. A trigger on `auth.users` insert makes the row. The username from the sign up data, and the count in `daily_totals.new_users`, wait for the email confirmation, which the server sets when it makes the account, so a user made around the site and never confirmed holds no username. | the owner, every column but the four limits, `first_build_at` and `first_build_mark_micros`; may update `display_name` only, everything else through the server |
| `devices` | `id uuid pk, user_id references profiles cascade, name, token_hash unique, token_hint, extension_id, extension_version, created_at, last_used_at, revoked_at, revoked_reason ('signed_out'\|'user'\|'admin'\|'account')` | the owner, every column but `token_hash` |
| `device_codes` | `code_hash pk, user_id cascade, challenge, extension_id, device_name, created_at, expires_at, used_at` | server only |
| `usage_events` | `id bigint identity pk, user_id references profiles on delete set null, device_id references devices on delete set null, kind ('message'\|'count_tokens'\|'batch_result'\|'jev'), model, input_tokens, output_tokens, cache_write_tokens, cache_read_tokens, cost_micros bigint, status smallint, duration_ms, request_id, created_at` | the owner |
| `usage_monthly` | `user_id cascade, month date, requests, input_tokens, output_tokens, cost_micros, updated_at, pk (user_id, month)` | the owner |
| `usage_daily` | `user_id cascade, day date (UTC), requests, input_tokens, output_tokens, cache_write_tokens, cache_read_tokens, cost_micros, updated_at, pk (user_id, day)`. Today's row is what a daily limit reads, when one is set. | server only |
| `usage_model_daily` | `day date, model text ('' when none), requests, input_tokens, output_tokens, cache_write_tokens, cache_read_tokens, cost_micros, updated_at, pk (day, model)`. No foreign key, so a deleted account's use stays. | server only |
| `ai_batches` | `id text pk, user_id cascade, device_id set null, request_count, reserved_micros bigint, created_at, metered_at` | server only |
| `spend_holds` | `id uuid pk, user_id cascade, amount_micros bigint, expected_micros bigint null, expires_at, created_at` | server only; `expected_micros` null on a hold the four argument `reserve_spend` made, read as its worst case |
| `memory_files` | `user_id pk cascade, object_path, index_path, bytes, index_bytes, digest, format_version, generator_version, memories, entities, links, chats, documents, sections, includes_quotes, includes_sensitive, device_id set null, uploaded_at` | the owner |
| `user_settings` | `user_id pk cascade, settings jsonb (object, at most 64 KiB), version bigint, updated_at, updated_by ('site'\|'extension')` | the owner |
| `app_events` | `id bigint identity pk, user_id set null, device_id set null, kind (section 6.7), count, created_at` | server only |
| `security_events` | `id bigint identity pk, user_id set null, org_id set null, kind, ip_hash, country, created_at`. Kinds: `sign_in`, `sign_in_failed`, `code_sent`, `sign_up`, `password_set`, `username_set`, `sign_out`, `device_connected`, `device_revoked`, `token_rejected`, `rate_limited`, `usage_limited`, `connect_refused`, `memory_deleted`, `memory_backup_on`, `account_deleted`, `org_created`, `org_deleted`, `org_invite_sent`, `org_joined`, `org_left`, `org_member_removed`, `admin_sign_in`, `admin_sign_in_failed`, `admin_viewed_memory`, `admin_set_password`, `admin_set_username` | server only |
| `organizations` | `id uuid pk, name (1 to 80), slug unique, plan_id references plans default 'team', shared_sections text[] default '{work}', default_access jsonb default '{"read":"all","contribute":true}', created_at, updated_at`. Made only by the Coere operator in the admin panel. | its members |
| `org_members` | `org_id cascade, user_id references profiles cascade unique, role ('admin'\|'member'), access jsonb (null means the organization's default_access), share_memory bool default true, added_by ('operator'\|'invite'), joined_at, pk (org_id, user_id)`. A person is in at most one organization. | members of the same organization |
| `org_invites` | `id uuid pk, org_id cascade, user_id references profiles cascade (the invited account; it must exist), role ('admin'\|'member'), invited_by set null, created_at, expires_at (7 days), accepted_at, declined_at, revoked_at` | the organization's admins, and the invited person |
| `org_memory` | `org_id pk cascade, index_path, index_bytes, entities, facts, relations, sources, contributors, updated_at` | members |
| `user_totals` | Running totals for one account (section 15) | the owner |
| `org_totals` | Running totals for one organization (section 15) | members |
| `daily_totals` | Running totals for the whole product, one row per day (section 15) | server only |
| `developer_waitlist` | `id bigint identity pk, email unique (stored lowercase), source, ip_hash, created_at` | server only |
| `product_interest` | `id bigint identity pk, email (stored lowercase, checked as an address), product ('connect'\|'teams'), source, ip_hash, created_at, unique (email, product)` | server only |
| `site_settings` | `key text pk, value jsonb (an object, at most 8 KiB), updated_at`. Seeds `launch.connect` and `launch.teams`, each `{"at": "2026-11-23T17:00:00.000Z", "show": true}`; a rerun keeps a saved moment. | server only |

`ip_hash` is the first 16 hex characters of HMAC-SHA256(address,
`SECURITY_SALT`). The address itself is never stored.

**Storage.** A private bucket `memory`, 50 MiB per object, types
`application/vnd.coere.memory+zip` and `application/json`. Each person's
files sit under a folder named by their user id. Policies on
`storage.objects` let a signed in person read and delete only objects whose
first folder is their own id. Nobody signed in may insert or update; uploads
come through signed upload URLs that the server makes.

**Functions** (`set search_path = ''`, executable by `service_role` only):

| Function | What it does |
|---|---|
| `device_auth(p_token_hash text)` | One row for a live token, with the columns of Appendix A, every limit and its spend among them (from `spend_state()`). Touches `last_used_at` and `last_seen_at` when older than 5 minutes. No row for an unknown or revoked token. |
| `spend_state(p_user uuid)` | Every spend limit of one account resolved (the person's own, else the plan's), each with the spend it is checked against, and whether the first build is done (section 8.10). |
| `reset_first_build(p_user uuid)` | The operator's reset: clears `first_build_at` and marks the spend so far, so the allowance counts from now and the monthly limit waits for the next finished build. False for no account. |
| `charge_unmetered_batch(p_user uuid, p_batch text)` | Marks a batch deleted before it was metered as metered, and records its reservation as its cost. |
| `reserve_spend(p_user uuid, p_amount bigint, p_ttl_seconds integer, p_batch boolean)` | Locks the profile, charges batches left unmetered for 30 days, and holds `p_amount` when it fits under every limit in force from `spend_state()` with every pending hold and batch reservation (section 8.10). Answers `hold_id`, or `refused` naming the limit: `lifetime`, `first_build`, `monthly` or `daily`, or `pending` for a message that fits but for other messages' holds. Kept unchanged for the site before 2026-11-24 and as the fallback. |
| `reserve_spend(p_user uuid, p_amount bigint, p_ttl_seconds integer, p_batch boolean, p_expected bigint, p_overrun bigint, p_max_live integer)` | The same lock and batch charge. A message holds `p_amount` (its worst case) and `p_expected` (never read above it), and is refused as its spent limit, then `pending`, then `concurrency` at `p_max_live` holds or past `p_overrun` (section 8.10). A batch keeps the four argument rules, but for `pending` when only message holds keep it out. Expired holds are charged as spend before they are deleted. While the account is in its first build it is also refused as `site_budget` once the site's first build spend today, with every first build batch not yet metered and the call's own cost, passes `budget.first_build_daily`. From `20261124000000_build_lane_holds.sql`, with the last two rules from `20261125000000_proxy_settle.sql`, granted to `service_role` only. |
| `settle_call(p_hold uuid, p_user uuid, p_device uuid, p_kind text, p_rows jsonb, p_status integer, p_duration_ms integer, p_request_id text)` | Writes a message's or a count's usage rows, one per model through `record_usage`, then deletes the call's hold (when `p_hold` is set and the account's), in one transaction, so a failed write keeps the hold (section 8.4). From `20261125000000_proxy_settle.sql`, granted to `service_role` only. |
| `store_batch(p_hold uuid, p_id text, p_user uuid, p_device uuid, p_request_count integer, p_reserved bigint)` | Stores a new batch as the caller's with its worst case as `reserved_micros`, and deletes the create's hold (when set and the account's) in the same transaction, so its cost is never held twice (section 8.4). False, with the hold kept, when the id is another account's. From `20261125000000_proxy_settle.sql`, granted to `service_role` only. |
| `hit_sign_up_limit(p_hash text, p_max integer, p_window_seconds integer)` | Counts one sign up attempt for an address hash in a fixed window and answers true past `p_max` (section 3.1). From `20261125000000_proxy_settle.sql`. |
| `record_app_events_capped(p_user uuid, p_device uuid, p_events jsonb, p_day_count integer, p_day_saved bigint)` | Clamps each entry to what the account has left today across all its devices, `p_day_count` a kind and `p_day_saved` tokens saved in all, drops an entry with none left, then calls `record_app_events` (section 8.9). Calls of one account take turns. From `20261125000000_proxy_settle.sql`. |
| `record_usage(...)` | Inserts a `usage_events` row and adds it to `usage_monthly`, `usage_daily`, `user_totals`, the person's `org_totals`, today's `daily_totals` and today's `usage_model_daily` row for its model in one statement. |
| `meter_batch(p_user, p_device, p_batch, p_rows jsonb, p_status, p_duration_ms, p_request_id)` | Marks a batch metered and writes its usage rows, one per model through `record_usage`, in one transaction, so a failed write leaves the batch unmetered for the next read. False when it is not the caller's or was metered already. |
| `record_app_events(p_user uuid, p_device uuid, p_events jsonb)` | Inserts the `app_events` rows of one batch and adds their counts and tokens saved to the same three totals. The first `memory_built` sets `first_build_at`. |
| `set_memory_totals(p_user uuid)` | Recomputes the person's memory counts in `user_totals` from `memory_files`, and their organization's from its members, after a commit or a delete. |
| `create_organization(p_name text, p_slug text, p_admin uuid, p_plan text)` | The operator's call: makes the organization, its totals row and its first admin in one statement. Refuses an admin already in an organization. |
| `org_drop_member(p_org uuid, p_user uuid, p_action text)` | Demotes (`demote`) or removes (`remove`) a member with the organization row locked, refusing with `last_admin` when they are its only admin, so two admins acting at once cannot leave it with none. Answers `ok`, `last_admin` or `not_member`. |
| `accept_org_invite(p_user uuid, p_invite uuid)` | Checks the invite is live and for this account, adds the member with the invite's role, marks the invite accepted. |
| `admin_table_stats()` | Each table in `public` and `storage`: estimated rows, total bytes, Row Level Security on, policy count. |
| `admin_storage_usage()` | Bytes and object count per bucket, and per user in `memory`. |
| `admin_usage_by_model(p_from date)` | Requests, the four token counts and cost per model from `usage_model_daily`, from a UTC day on (every day when null). |
| `admin_top_accounts(p_from date, p_limit integer)` | The top `p_limit` accounts by cost, by tokens and by requests together over the range (all time from `user_totals` when null), each with `spend_state()`. |

## 11. Prices

The site meters with the table dated 2026-11-25, USD per million tokens.
Cache writes cost 1.25 times input. Batch results cost half. It is the
table of `packages/memory/src/ai/prices.ts` as v4 builds it. v2 and v3
keep Sonnet 5.5 cache reads at $0.20 (the 2026-10-22 table) for their
local cap, so it can only stop early; the site meters Anthropic's $0.10,
since what it meters counts against the person's real limits.

| Model | Input | Output | Cache read | Cache write |
|---|---|---|---|---|
| `claude-opus-5-5` | 4 | 20 | 0.2 | 5 |
| `claude-sonnet-5-5` | 2 | 10 | 0.1 | 2.5 |
| `claude-haiku-5-5` | 0.1 | 0.5 | 0.01 | 0.125 |
| `claude-haiku-5-5`, prompt over 100K | 0.5 | 2.5 | 0.05 | 0.625 |
| `jev-1.14.0`, `jev-1.13.0` | 0.042 | 0 | 0 | 0.0525 |

When `prices.ts` changes, change the site's copy in the same week.

## 12. Settings on the site's server

| Variable | What it is |
|---|---|
| `SUPABASE_URL` | The project address |
| `SUPABASE_PUBLISHABLE_KEY` | The publishable key, used by the server's session client |
| `SUPABASE_SECRET_KEY` | The secret key. Server only |
| `ANTHROPIC_API_KEY` | Coere's Claude key. Server only |
| `JEV_API_KEY` | Coere's Jev key. Server only. Optional |
| `COERE_EXTENSION_IDS` | The extension ids allowed to connect, comma separated |
| `SECURITY_SALT` | The key for `ip_hash` |
| `USER`, `PASSWORD` | The admin guard |

Supabase's own settings (the owner sets these in the Supabase dashboard,
listed in the frontend README and `docs/launch.md` 4.4): Allow new users to
sign up off (the server makes every account with the secret key, which the
switch does not stop, so nobody can make one straight through Supabase),
the Email provider on (it keeps the placeholder emails and runs the
password sign in), Confirm email on or off (the server confirms each
account itself), Secure password change off, every other provider off,
every security notification email off, the Site URL set to the site, and
no session time limit or inactivity timeout. No sender, SMTP or email
template is set up. DNS publishes a null MX for `users.coere.ai`
(`users.coere.ai. MX 0 .`), so the placeholder domain accepts no mail even
behind a registrar's catch-all.

## 13. What coere.ai sees

The README's "What each version sends" gains a v4 paragraph:

- The cleaned request for memory goes to coere.ai and from there to
  Anthropic. Anthropic's terms for API data apply. coere.ai keeps no request
  and no answer; it logs the account, device, model, token counts, cost,
  status and duration.
- With the backup on (it is on by default), coere.ai holds a copy of the
  person's memory: memories with their quotes and the titles of the chats
  they come from, never the chats themselves. Sensitive memories are left
  out unless the person turns them on. Turning the backup off or deleting
  the account removes it.
- Synced settings and feature counts are stored with the account.
- Coere does not sell or share any of it, and does not train a model on it.
- Until the memory holds enough, Add my context to chats in Auto puts short
  excerpts of the closest saved chats in front of the person's message,
  with each chat's title, AI and date, after removing API keys, card
  numbers and passwords. They go to the AI site as part of the message,
  never to coere.ai. Suggest only shows them. Temporary chats, the current
  chat, AIs and chats left out of memory, sensitive chats unless Include
  sensitive memories is on, and forgotten words never go (section 6.9).

## 14. Organizations

This is Coere for Teams on coere.ai: a company and its people reading from
one shared knowledge graph, as the business film shows it (the company at
the center, its clients, people, projects and decisions around it).

### 14.1 The parts

The owner set these rules on 2026-11-03. They replace every earlier word
about organizations, in this file and in any builder's brief.

- **Only the Coere operator makes an organization.** A person cannot make
  one from their dashboard. In the admin panel (section 9) the operator
  enters the name, picks the plan (`team` by default) and picks an existing
  account as its first admin. The operator can later change any of the
  organization's settings, add or remove admins, and delete it.
- **Two roles: admin and member.** The first person added is an admin.
  - A **member** adds to the shared memory (their shared sections go into
    the organization's graph) and reads the graph.
  - An **admin** does what a member does, and also controls the
    organization's settings (name, shared sections), invites coworkers,
    removes members, makes a member an admin or an admin a member, and
    decides what each member can access.
  - There is no owner role. An organization always keeps at least one
    admin: the last admin cannot leave or be made a member, except by the
    operator.
- **Access.** What a member may do is an `access` object:
  `{ "read": "all" | [section keys], "contribute": boolean }`. The
  organization's `default_access` is `{ "read": "all", "contribute": true }`,
  so a new member can do everything until an admin narrows it. A member's
  own `access` (null means the default) overrides it. `read` decides which
  sections of the shared graph they see; `contribute` decides whether their
  memory goes into it. Admins always read everything.
- **A person is in at most one organization.**
- **Invites go only to existing accounts.** An admin invites a coworker by
  the username of their Coere account, with a role. With no such account,
  the site says the coworker must first make a Coere account (and gives the
  sign up link to send them); nothing is stored and nothing is emailed. A
  coworker already in an organization cannot be invited. The invited person
  sees the invite on `/dashboard/organization` and accepts or declines it. Invites expire after 7 days, and admins can see and revoke
  pending ones.

### 14.2 The shared knowledge graph

There is one graph per organization, built on the server from what its
members share.

1. When a member's memory file is committed (section 8.6) and their access
   lets them contribute, the server takes the part of their index that sits
   in the organization's shared sections, drops every sensitive memory
   (and every chat that reaches a shared section only through one, so its
   title stays out too), and writes it to
   `org/<org id>/members/<user id>.json` in the `memory` bucket.
2. It then merges every member's part into `org/<org id>/index.json`.
   Entities with the same section, kind and name (compared without case or
   extra spaces) become one. Facts keep the member who brought them as
   `contributor`. Relations follow the merged entities.
3. It updates `org_memory` and the organization's totals.

A member can turn off `share_memory`; their part is then removed and the
graph is merged again. Leaving or being removed does the same.

Every member reads the merged graph on `/dashboard/organization`. Members
read it through the server, which checks membership first. Storage
policies let nobody signed in read the `org/` folder directly.

### 14.3 The organization page

In the site's style. It holds:

- the organization's totals: tokens saved, memories, chats, AI cost this
  month, members
- the shared graph, drawn like the person's own graph with the organization
  at the center, and a searchable list of its memories with who brought
  each, limited to the sections the person may read
- members with role, joined date, tokens saved and memories shared
- for admins: invite a coworker, pending invites, each member's role and
  access (which sections they read, whether they contribute), remove a
  member, and the organization's settings (name, shared sections, default
  access)
- for everyone: share my memory, leave

With no organization, the page lists the person's pending invites with
Accept and Decline, and otherwise says their organization's admin adds
them, with a Book a demo link for a company that has no organization yet.

### 14.4 Deleting

Only the operator deletes an organization. It removes its `org/` folder,
its rows and its invites. Members keep their own accounts and memory.
Deleting an account first removes that person's part from their
organization's graph; the last admin of an organization cannot delete
their account until another admin is named.

### 14.5 Next steps, not in this build

The extension reading the organization graph into context and Cori, and a
v4 Teams edition that builds organization memory with the Teams prompts.

## 15. Running totals

The database keeps running totals, so the Statistics page and the
dashboards never add up the raw logs.

| Total | Grows when |
|---|---|
| `tokens_used` (input plus output, with cache tokens counted apart) | every metered model call |
| `cost_micros` | every metered call |
| `requests` | every metered call |
| `tokens_saved` | every `context_import` and `transfer` event, by its `tokensSaved` |
| `context_imports`, `transfers`, `extractions`, `cori_chats`, `action_runs` | the matching events |
| `memories`, `entities`, `links`, `chats` | set (not added) from the latest memory file at each commit or delete |
| `storage_bytes` | set from the latest memory file |

`user_totals` keeps them per account, `org_totals` per organization (the sum
of its members, and the merged graph's counts for memories, entities,
links and chats), and `daily_totals` per day for the whole product. All
three are written only by the functions in section 10, in the same
statement as the event that changes them. When an account is deleted, its
`user_totals` row goes with it; the day's totals and the organization's
past totals keep its numbers.

The raw logs (`usage_events`, `app_events`, `security_events`) stay too.
They are small: a row is a few numbers.

## 16. The developer waitlist and the coming soon pages

The developer marketing pages stay as they are. The site's waitlist button,
which today emails the team, links to `/developers/waitlist` instead and
reads "Join the waitlist". `/developer/waitlist` and `/developers` redirect
to it.

The page is one screen in the site's style: a heading and a short line
for developers (memory for your app's users from day one), a single email
field with **Join the waitlist**, and a line that joining gives 1,000 free
credits at launch. A server action checks the address, stores it in
`developer_waitlist` (a repeat signup answers the same thanks), counts
against 5 tries a minute per address, and shows a thank you in place of the
form. The page is public and indexed; the form's endpoint is not.

**Coming soon and I'm interested.** `/install` (Coere Connect) and
`/try-teams` (Coere for Teams) share one plain near black page. `/install` says
"Coming soon on the Chrome Web Store" with the Chrome mark set in the
heading in front of Chrome, the size of the letters; `/try-teams` says
"Coere for Teams is coming soon". Under the heading, the countdown is one
large line of digits, such as 19:16:00:09, with a small word under each
part. It is drawn on the visitor's clock after the page loads, rolls each
changing digit (a plain change with reduced motion), and at the moment says
the product is here. Under it, **I'm
interested** opens an email field in place. A server action checks the
address, counts against 5 tries a minute per network address and per email,
and stores it in `product_interest` with the product (`connect` or
`teams`); a repeat answers the same thanks. Then the form turns into a thank
you line. Watch the demo stays as the other way on. Both pages are `noindex`
and left out of the sitemap.

**The launch moment.** Each page counts to its row in `site_settings`
(`launch.connect`, `launch.teams`), read on the server with the secret key
through a cache tagged `launch`, so no visitor waits on the database. Saving
in `/admin/launch` expires the tag and both pages, so a change shows at
once. Without Supabase or a saved row, both count to `LAUNCH_AT` in
`src/site/content/launch.ts`. With `show` off, the page says coming soon
without the timer.


## Appendix A. Exact database signatures

The site's code and the migration must agree on these names and types.

```sql
-- Running totals. user_totals and org_totals share these counter columns;
-- daily_totals has them too, keyed by day, plus new_users and new_orgs.
--   requests bigint, input_tokens bigint, output_tokens bigint,
--   cache_read_tokens bigint, cache_write_tokens bigint, cost_micros bigint,
--   tokens_saved bigint, context_imports bigint, transfers bigint,
--   extractions bigint, cori_chats bigint, action_runs bigint,
--   memories integer, entities integer, links integer, chats integer,
--   storage_bytes bigint, updated_at timestamptz
-- user_totals: user_id uuid pk references profiles on delete cascade
-- org_totals:  org_id uuid pk references organizations on delete cascade, members integer
-- daily_totals: day date pk, new_users integer, new_orgs integer
-- Every counter defaults to 0 and is not null.

-- Every limit is already resolved: the person's own value when set, else
-- the plan's. lifetime_limit_micros null means no lifetime limit, and
-- daily_limit_micros null no daily limit (every seeded plan).
-- lifetime_cost_micros is user_totals.cost_micros. While first_build_done
-- is false, the first build allowance applies against
-- first_build_cost_micros (the spend since the free build began), and
-- month_cost_micros and day_cost_micros are 0. After, first_build_cost_micros
-- is 0, and the month's and the day's spend count only spend after the
-- first build finished.
spend_state(p_user uuid) returns table (
  monthly_limit_micros bigint, month_cost_micros bigint,
  lifetime_limit_micros bigint, lifetime_cost_micros bigint,
  daily_limit_micros bigint, day_cost_micros bigint,
  first_build_done boolean, first_build_limit_micros bigint, first_build_cost_micros bigint)

-- The limit and spend columns are spend_state()'s.
device_auth(p_token_hash text) returns table (
  device_id uuid, user_id uuid, status text, plan_id text,
  monthly_limit_micros bigint, lifetime_limit_micros bigint,
  storage_limit_bytes bigint, requests_per_minute integer,
  month_cost_micros bigint, lifetime_cost_micros bigint,
  memory_sync boolean, include_sensitive boolean, org_id uuid,
  daily_limit_micros bigint, day_cost_micros bigint, first_build_done boolean,
  first_build_limit_micros bigint, first_build_cost_micros bigint)

-- plans: daily_limit_micros bigint (null means none, the default),
--        first_build_limit_micros bigint not null default 10000000
-- profiles: daily_limit_micros bigint, first_build_limit_micros bigint (null
--   means the plan's), first_build_at timestamptz,
--   first_build_mark_micros bigint not null default 0
-- usage_daily: user_id uuid references profiles on delete cascade, day date,
--   requests, input_tokens, output_tokens, cache_write_tokens,
--   cache_read_tokens, cost_micros bigint, updated_at, pk (user_id, day)
-- usage_model_daily: day date, model text, the same counters, pk (day, model)
reset_first_build(p_user uuid) returns boolean

record_usage(p_user uuid, p_device uuid, p_kind text, p_model text,
  p_input bigint, p_output bigint, p_cache_write bigint, p_cache_read bigint,
  p_cost_micros bigint, p_status integer, p_duration_ms integer, p_request_id text) returns void

-- refused: 'lifetime', 'first_build', 'monthly', 'daily', or 'pending'
reserve_spend(p_user uuid, p_amount bigint, p_ttl_seconds integer, p_batch boolean)
  returns table (hold_id uuid, refused text)

-- 20261124000000_build_lane_holds.sql. refused: the five above or 'concurrency'.
-- spend_holds gains expected_micros bigint (null reads as amount_micros).
reserve_spend(p_user uuid, p_amount bigint, p_ttl_seconds integer, p_batch boolean,
  p_expected bigint, p_overrun bigint, p_max_live integer)
  returns table (hold_id uuid, refused text)

-- 20261125000000_proxy_settle.sql: the seven argument reserve_spend may also
-- refuse 'site_budget', and answers 'pending' for a batch kept out by message holds alone.
-- first_build_daily: day date pk, cost_micros bigint, updated_at timestamptz
-- sign_up_attempts: ip_hash text pk, window_start timestamptz, attempts integer
-- spend_holds gains charge_micros bigint: what it is charged when it runs out unreleased (null reads as amount_micros)
-- site_settings key budget.first_build_daily: {"micros": 1000000000}

-- p_rows as meter_batch takes them. Deletes p_hold only when it is p_user's.
settle_call(p_hold uuid, p_user uuid, p_device uuid, p_kind text, p_rows jsonb,
  p_status integer, p_duration_ms integer, p_request_id text) returns boolean

-- Deletes p_hold only once p_id is stored as p_user's.
store_batch(p_hold uuid, p_id text, p_user uuid, p_device uuid,
  p_request_count integer, p_reserved bigint) returns boolean

hit_sign_up_limit(p_hash text, p_max integer, p_window_seconds integer) returns boolean

record_app_events_capped(p_user uuid, p_device uuid, p_events jsonb,
  p_day_count integer, p_day_saved bigint) returns void

-- p_rows: [{"model", "input", "output", "cacheWrite", "cacheRead", "costMicros"}], one per model
meter_batch(p_user uuid, p_device uuid, p_batch text, p_rows jsonb,
  p_status integer, p_duration_ms integer, p_request_id text) returns boolean

-- p_events: [{"kind": "...", "count": 1, "tokensSaved": 0}], already validated by the route
record_app_events(p_user uuid, p_device uuid, p_events jsonb) returns void

-- Sets the memory columns of user_totals from memory_files, and when the
-- person is in an organization, its org_totals memory columns from org_memory.
set_memory_totals(p_user uuid) returns void
set_org_memory_totals(p_org uuid) returns void

create_organization(p_name text, p_slug text, p_admin uuid, p_plan text) returns uuid
accept_org_invite(p_user uuid, p_invite uuid) returns uuid

admin_table_stats() returns table (schema_name text, table_name text,
  row_estimate bigint, total_bytes bigint, rls_enabled boolean, policy_count integer)
admin_storage_usage() returns table (bucket_id text, folder text, objects bigint, bytes bigint)
admin_usage_by_model(p_from date) returns table (model text, requests bigint,
  input_tokens bigint, output_tokens bigint, cache_write_tokens bigint,
  cache_read_tokens bigint, cost_micros bigint)
admin_top_accounts(p_from date, p_limit integer) returns table (user_id uuid,
  email text, requests bigint, input_tokens bigint, output_tokens bigint,
  cache_write_tokens bigint, cache_read_tokens bigint, cost_micros bigint,
  monthly_limit_micros bigint, month_cost_micros bigint,
  lifetime_limit_micros bigint, lifetime_cost_micros bigint,
  daily_limit_micros bigint, day_cost_micros bigint,
  first_build_done boolean, first_build_limit_micros bigint, first_build_cost_micros bigint)
```

`extractions` grows with `extract_chat` and `extract_all` events,
`cori_chats` with `cori_chat`, and `action_runs` with `action_run`,
`rewrite` and `voice`. A person's usage also adds to their organization's
totals while they are a member. Every function above is `set search_path =
''`, revoked from `public`, `anon` and `authenticated`, and granted to
`service_role` only.

Shared site files that already exist: `src/lib/supabase.ts` (`supabase()`,
the secret key client), `src/lib/supabase/server.ts` (`sessionClient()`,
`accountsConfigured()`, `sessionCookieOptions`), `src/lib/auth/user.ts`
(`getUser()`, `requireUser(next)`, `safeNext()`), `src/lib/security/events.ts`
(`logSecurityEvent(kind, {userId, orgId, headers})`, `ipHash(headers)`) and
`src/lib/memory/index-types.ts` (the index types and Storage paths).
