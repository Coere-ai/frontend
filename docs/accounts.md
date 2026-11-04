# Coere v4: accounts at coere.ai

Status: **the contract for the first build.** The coere-v2 repository holds
the extension side. The coere.ai website (the `frontend` repository) holds the
site side. Both repositories keep a copy of this file: here as
`docs/design/v4-account.md`, and in the frontend repository as
`docs/accounts.md`. When one copy changes, change the other one too.

This replaces the parts of coere-v2's `docs/design/hosted-service.md` that it
names. Sign in is by email (a one time code, or the link in the same email),
with an optional password, through Supabase Auth. It is not Google through
Auth.js. The site is the separate Next.js repository, not an `apps/web`
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

1. **Email code (the main way).** The person types an email. The server
   calls `auth.signInWithOtp({ email, options: { shouldCreateUser: true,
   emailRedirectTo } })`. The email holds a 6 digit code and a link. The
   person types the code; the server calls `auth.verifyOtp({ email, token,
   type: 'email' })`. A new email makes a new account.
2. **The link in the same email.** It goes to `/auth/confirm?token_hash=…&
   type=email&next=…`, a route handler that only checks the link's shape
   and redirects to `/auth/continue`. That page changes nothing when it
   loads, because mail scanners open every link and the link's token is the
   code's token too. Its button posts the token to a server action, which
   calls `auth.verifyOtp({ token_hash, type })` and redirects to `next`.
   When someone is already signed in, the page names that account first,
   so a link another person sent cannot swap the session unseen. `next`
   must be a path on this site: it is parsed the way a browser reads it and
   only a same origin path is kept.
3. **Password.** On `/sign-in`, "Use a password instead" shows email or
   username, and password. A username is turned into its email on the
   server with the secret key, and a wrong username gets the same answer as
   a wrong password.
4. **Create an account with a password.** `/sign-up` asks for email,
   password (at least 10 characters) and an optional username. The server
   calls `auth.signUp` with the username in `options.data.username`. The
   person confirms by the emailed link, which also lands on `/auth/confirm`.
5. **Later.** On `/dashboard/account` a person who came in by code can set
   a username and a password, and change either.

Usernames are 3 to 24 characters of `a-z`, `0-9` and `_`, stored lowercase,
unique.

Every sign in attempt counts against the address: 10 tries in 15 minutes,
then a short wait. A wrong code or password waits 800 ms, like the admin
guard. Each outcome writes a `security_events` row (section 8.9).

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
| `/sign-in` | Email code first, password second. A signed in person goes to `next` or `/dashboard`. |
| `/sign-up` | Create an account with a password. |
| `/auth/confirm` | Route handler for every emailed link. It checks the link and sends it on. |
| `/auth/continue` | The emailed link's confirm page. Its button spends the token. |
| `/connect` | Hands a connect code to the extension (section 4). |
| `/dashboard/...` | The person's dashboard (section 7). |
| `/admin/...` | The operator's panel (section 9). It keeps its own USER and PASSWORD guard, separate from accounts. |

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
4. **The person confirms.** The page shows the account's email and a
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

Anything else answers `{ok:false, reason:'unknown'}`.

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
- `tools/lint-manifest` and the build scans learn the v4 rules: no model
  host, no key, no fake key, no v3 marker, `externally_connectable` only in
  v4 and only with the site origins.

### 6.2 The account record

`chrome.storage.local` key `coere.account`:

```ts
{ v: 1, token: string, deviceId: string, userId: string,
  email: string, username: string | null, at: number }
```

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
  old, and on the bridge's `coere.backup`.
- It skips when the manifest's `digest` equals the last pushed digest, when
  the person turned the backup off, or when the file is over 64 MiB.
- Steps: `POST /api/v1/memory/upload`, then a `PUT` of the zip to the
  signed URL it returns, then `POST /api/v1/memory/commit`.
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
  wins.
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

`console.open` stays the one way in. In v4:

| Asked for | Opens |
|---|---|
| `home` | `<site>/dashboard` |
| `memory` | `<site>/dashboard/memory` |
| `statistics` | `<site>/dashboard/usage` |
| `settings` with no part | `<site>/dashboard/settings` |
| `library`, `cori`, Settings parts `folder`, `import`, `logs`, `transfer`, `ais` | the local `console.html` as today |

Signed out, any of the site ones opens the connect page instead. The
toolbar popup's dashboard button goes to the site. Settings in the
extension gains an Account card: the email, **Manage on coere.ai** and
**Disconnect**. In v4 the local dashboard hides Statistics, Benchmarks and
Evals, and the memory settings drop the monthly spend cap, since the plan
on coere.ai sets the limit.

## 7. The person's dashboard on coere.ai

Pages under `/dashboard`, in the site's own style (white, neutral ink,
Coere blue, the site's buttons and form fields). Reads go through the
person's own Supabase session, so Row Level Security decides what they see.
Writes that need more go through the server with the secret key after the
session is checked.

| Page | What it shows and does |
|---|---|
| `/dashboard` | Connected browsers, memory counts, this month's usage against the plan, the last backup, and buttons that use the bridge: Open library, Back up now. |
| `/dashboard/memory` | The memory graph (the product's flat graph, laid out by the same `layoutTree`), a searchable list of memories by section, and the source of each. Built from the stored index (section 8.7). Download the `.coere` file. **Edit in Coere** opens the local Memory page through the bridge. |
| `/dashboard/chats` | The chats memory came from: title, AI, when it was saved, message count. Titles only. Chat text stays in the browser. |
| `/dashboard/usage` | Cost and tokens by day, by model and by kind, against the monthly limit, and the lifetime spend against the lifetime limit when there is one. |
| `/dashboard/settings` | The synced settings (section 6.6), the memory backup switch and the sensitive memories switch. A change bumps the version, and the page sends `coere.settings` through the bridge so the extension pulls at once. |
| `/dashboard/organization` | Section 14: create an organization or join one, its members and roles, invites, the shared knowledge graph and the organization's totals. |
| `/dashboard/account` | Email, username, password, connected browsers with **Revoke**, download everything, delete the memory copy, delete the account. |

**Deleting the account** asks the person to type their email. The server
then removes every object under their Storage folder, revokes their
devices, and calls `auth.admin.deleteUser`, which removes their rows
through the foreign keys. Usage rows keep their numbers with the person
cut off (`user_id` set to null), so the cost history stays whole and names
nobody. It writes `account_deleted` with no user id.

**Turning the backup off** removes the stored file and its index, and the
extension stops pushing.

## 8. The API

All routes are Next.js route handlers with `runtime = "nodejs"` and
`dynamic = "force-dynamic"`. Every answer carries `cache-control: no-store`
and `x-robots-tag: noindex`. There are no CORS headers: the extension holds
the site as a host, and pages never call these routes.

Auth is `Authorization: Bearer <device token>` except on `/auth/token`. One
database call, `device_auth(token_hash)` (section 10), checks the token and
returns the account, its plan and this month's spend.

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
| `too_large` | 413 | A body or file over its limit |
| `rate_limited` | 429 | Too many requests this minute, with `Retry-After` |
| `usage_limit` | 429 | The monthly or the lifetime limit is spent |
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

### 8.4 Anthropic: `/api/v1/anthropic/v1/...`

The paths the extension uses, and nothing else:

| Method | Path | Note |
|---|---|---|
| POST | `v1/messages` | metered |
| POST | `v1/messages/count_tokens` | counted, cost 0 |
| POST | `v1/messages/batches` | the batch id is stored as the caller's |
| GET | `v1/messages/batches` | answers only the caller's own batches |
| GET | `v1/messages/batches/{id}` | own batches only |
| POST | `v1/messages/batches/{id}/cancel` | own batches only |
| DELETE | `v1/messages/batches/{id}` | own batches only |
| GET | `v1/messages/batches/{id}/results` | own batches only, streamed, metered once at batch price |

Another path answers 404. Before forwarding:

- **Body.** At most 4 MiB.
- **Each request's params** (one for a message, each entry for a batch):
  `model` is one of `claude-opus-5-5`, `claude-sonnet-5-5`,
  `claude-haiku-5-5`; `max_tokens` is at most 64,000; `stream` is not
  true.
- **Headers forwarded:** `anthropic-version`, `content-type`, and
  `anthropic-beta` when each of its values is one of
  `message-batches-2024-09-24`, `token-counting-2024-11-01`,
  `server-side-fallback-2026-07-01`. `x-api-key` is the server's
  `ANTHROPIC_API_KEY`. Nothing else is forwarded.
- **Answer headers kept:** `content-type`, `request-id`, `retry-after`,
  `x-should-retry`.

Errors on these routes use Anthropic's own shape, so the memory runtime's
error classes keep working unchanged:

| Case | Status and body |
|---|---|
| No, unknown or revoked token | `401 {type:'error', error:{type:'authentication_error', message:'signed_out'}}` |
| Suspended | `403 {…permission_error, message:'account_suspended'}` |
| Monthly or lifetime limit spent | `400 {…invalid_request_error, message:'You have reached your specified monthly usage limit on coere.ai.'}` (or `lifetime`). The runtime reads a message that starts "You have reached your specified" as a spend limit: it holds the queue, tries again every hour and on Try now, so raising the limit in the admin panel lets work go on within the hour |
| Per minute limit | `429 {…rate_limit_error, message:'rate_limited'}` with `retry-after` |
| Model not allowed | `404 {…not_found_error, message:'model: <name>'}` |
| Beta not allowed | `400 {…invalid_request_error, message:'Unexpected value(s) for the \`anthropic-beta\` header.'}` |
| Body too large | `413 {…request_too_large, message:'request_too_large'}` |
| Server has no key | `503 {…api_error, message:'unavailable'}` |

**Metering.** A successful message writes one usage row from its `usage`
(input, output, cache write, cache read) priced by the table in section 11.
Batch results are read as they stream through; when the stream ends, one
row per model is written at half price and the batch is marked metered, so
reading the results twice counts once.

`maxDuration` is 300 seconds, since a long answer can take minutes.

### 8.5 Jev: `POST /api/v1/jev/v1/systemone`

Forwards to `https://api.typesafe.ai/v1/systemone` with `Authorization:
Bearer <JEV_API_KEY>`. Body at most 256 KiB, `model` one of `jev-1.14.0`,
`jev-1.13.0`. Metered from `usage.input_tokens`. With no `JEV_API_KEY` it
answers `403`, which sends the extension's classifier to Haiku at once.
Auth and limit errors are the same as 8.4's statuses with a plain
`{error:'…'}` body.

### 8.6 Memory

- **`POST /api/v1/memory/upload`** `{ bytes, digest }`. With the backup off,
  `409 memory_sync_off`. Over the plan's storage limit or 64 MiB,
  `413 too_large`. With the same digest already stored, `200 { skip: true }`.
  Otherwise `200 { skip: false, path, url }`, where `url` is a signed upload
  URL for `<user id>/incoming/<random>.coere` that lives 2 hours.
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
    bucket's 64 MiB, or a second PUT to the same address, which conflicts
    because the address does not overwrite.
  - Storage answers the CORS preflight for any origin, so the extension
    needs no host permission for the Supabase host.
- **`POST /api/v1/memory/commit`** `{ path }`. The server reads the staged
  file, checks it is a `.coere` zip (the `mimetype` entry) under the limit,
  reads `manifest.json`, takes the counts from it, builds the index
  (section 8.7), moves the file to `<user id>/memory.coere`, writes
  `<user id>/index.json`, removes anything left in `incoming/`, and upserts
  `memory_files`. Answer
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
and `transfer`. `204`. One `record_app_events` call stores the batch and
adds it to the totals.

### 8.11 Organization

**`GET /api/v1/org`** answers `200 { org: { id, name, role, sharedSections, access } | null }`.
**`GET /api/v1/org/index`** answers the organization's merged index (the
shape of section 8.7, with a `contributor` user id on each fact) or `404`,
cut to the sections the member may read. Only members may read it. The extension uses these to show the
organization in Settings; reading the organization graph into context is
the next step after this build (section 14.5).

### 8.10 Limits

| What | Limit |
|---|---|
| Requests per minute per device | the plan's `requests_per_minute`, held in memory per server instance |
| Monthly spend | the person's own `monthly_limit_micros` when the operator set one, else the plan's, checked before every metered call |
| Lifetime spend | the person's own `lifetime_limit_micros` when set, else the plan's (null on every seeded plan, meaning none), against `user_totals.cost_micros`, checked before every metered call |
| Memory file | the plan's `storage_limit_bytes`, and never over 64 MiB |
| `/auth/token` | 20 a minute per address |

## 9. The admin panel

`/statistics` becomes `/admin`, and `/statistics` redirects there. The guard
stays the USER and PASSWORD pair with its signed cookie, and an account
session never opens it. It keeps its own look (`stats.css`). Sections:

| Path | Shows |
|---|---|
| `/admin` | **Statistics**: the product's running totals (section 15). Accounts, organizations, total AI cost, tokens used, tokens saved, memories, chats, context imports, transfers, storage. Each by day and in total, with the top accounts and organizations by tokens saved. |
| `/admin/analytics` | Site analytics, as `/statistics` showed them. |
| `/admin/users` | Accounts: email, username, plan, status, organization, created, last seen, devices, this month's cost and requests, tokens saved, memory file size. Sign ups by day. Opening an account shows its totals and its knowledge graph. Actions: change plan, set the person's monthly and lifetime dollar limits (blank means the plan's), suspend or restore, revoke every device. |
| `/admin/organizations` | Every organization: name, members, plan, tokens saved, memories, chats, cost. **Create an organization** (name, plan, first admin picked from existing accounts by email). Opening one shows its members with their roles, access and totals, and the organization's knowledge graph, and lets the operator change its settings, add a member or admin from existing accounts, change roles, remove members and delete it. |
| `/admin/waitlist` | The developer waitlist (section 16): emails, when they joined, the count by day, and a CSV download. |
| `/admin/database` | Every table's estimated rows, size, Row Level Security on or off and policy count, and the Storage bucket totals. |
| `/admin/security` | Sign ins and failures by day, rate limit hits, refused tokens, revoked devices, connect refusals, deleted accounts, and any table with Row Level Security off. |
| `/admin/cost` | AI spend by day, model and account, this month and the last 24 hours, storage bytes and their cost at $0.021 per GB month. |

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
| `plans` | `id text pk, name, monthly_limit_micros bigint, lifetime_limit_micros bigint (null means none), storage_limit_bytes bigint, requests_per_minute int, created_at`. Seeds `free` ($5, 25 MiB, 60), `plus` ($20, 100 MiB, 120), `team` ($100, 500 MiB, 300). | everyone signed in |
| `profiles` | `id uuid pk references auth.users on delete cascade, email, username unique, display_name, plan_id references plans default 'free', monthly_limit_micros bigint (null means the plan's), lifetime_limit_micros bigint (null means the plan's), status ('active'\|'suspended'), memory_sync bool default true, include_sensitive bool default false, created_at, updated_at, last_seen_at`. A trigger on `auth.users` insert makes the row. The username from the sign up data, and the count in `daily_totals.new_users`, wait for the first email confirmation, so an address nobody confirms holds no username. | the owner; may update `display_name` only, everything else through the server |
| `devices` | `id uuid pk, user_id references profiles cascade, name, token_hash unique, token_hint, extension_id, extension_version, created_at, last_used_at, revoked_at, revoked_reason ('signed_out'\|'user'\|'admin'\|'account')` | the owner, every column but `token_hash` |
| `device_codes` | `code_hash pk, user_id cascade, challenge, extension_id, device_name, created_at, expires_at, used_at` | server only |
| `usage_events` | `id bigint identity pk, user_id references profiles on delete set null, device_id references devices on delete set null, kind ('message'\|'count_tokens'\|'batch_result'\|'jev'), model, input_tokens, output_tokens, cache_write_tokens, cache_read_tokens, cost_micros bigint, status smallint, duration_ms, request_id, created_at` | the owner |
| `usage_monthly` | `user_id cascade, month date, requests, input_tokens, output_tokens, cost_micros, updated_at, pk (user_id, month)` | the owner |
| `ai_batches` | `id text pk, user_id cascade, device_id set null, request_count, created_at, metered_at` | server only |
| `memory_files` | `user_id pk cascade, object_path, index_path, bytes, index_bytes, digest, format_version, generator_version, memories, entities, links, chats, documents, sections, includes_quotes, includes_sensitive, device_id set null, uploaded_at` | the owner |
| `user_settings` | `user_id pk cascade, settings jsonb (object, at most 64 KiB), version bigint, updated_at, updated_by ('site'\|'extension')` | the owner |
| `app_events` | `id bigint identity pk, user_id set null, device_id set null, kind (section 6.7), count, created_at` | server only |
| `security_events` | `id bigint identity pk, user_id set null, org_id set null, kind, ip_hash, country, created_at`. Kinds: `sign_in`, `sign_in_failed`, `code_sent`, `sign_up`, `password_set`, `username_set`, `sign_out`, `device_connected`, `device_revoked`, `token_rejected`, `rate_limited`, `usage_limited`, `connect_refused`, `memory_deleted`, `account_deleted`, `org_created`, `org_deleted`, `org_invite_sent`, `org_joined`, `org_left`, `org_member_removed`, `admin_sign_in`, `admin_sign_in_failed`, `admin_viewed_memory` | server only |
| `organizations` | `id uuid pk, name (1 to 80), slug unique, plan_id references plans default 'team', shared_sections text[] default '{work}', default_access jsonb default '{"read":"all","contribute":true}', created_at, updated_at`. Made only by the Coere operator in the admin panel. | its members |
| `org_members` | `org_id cascade, user_id references profiles cascade unique, role ('admin'\|'member'), access jsonb (null means the organization's default_access), share_memory bool default true, added_by ('operator'\|'invite'), joined_at, pk (org_id, user_id)`. A person is in at most one organization. | members of the same organization |
| `org_invites` | `id uuid pk, org_id cascade, user_id references profiles cascade (the invited account; it must exist), role ('admin'\|'member'), invited_by set null, created_at, expires_at (7 days), accepted_at, declined_at, revoked_at` | the organization's admins, and the invited person |
| `org_memory` | `org_id pk cascade, index_path, index_bytes, entities, facts, relations, sources, contributors, updated_at` | members |
| `user_totals` | Running totals for one account (section 15) | the owner |
| `org_totals` | Running totals for one organization (section 15) | members |
| `daily_totals` | Running totals for the whole product, one row per day (section 15) | server only |
| `developer_waitlist` | `id bigint identity pk, email unique (stored lowercase), source, ip_hash, created_at` | server only |

`ip_hash` is the first 16 hex characters of HMAC-SHA256(address,
`SECURITY_SALT`). The address itself is never stored.

**Storage.** A private bucket `memory`, 64 MiB per object, types
`application/vnd.coere.memory+zip` and `application/json`. Each person's
files sit under a folder named by their user id. Policies on
`storage.objects` let a signed in person read and delete only objects whose
first folder is their own id. Nobody signed in may insert or update; uploads
come through signed upload URLs that the server makes.

**Functions** (`set search_path = ''`, executable by `service_role` only):

| Function | What it does |
|---|---|
| `device_auth(p_token_hash text)` | One row for a live token: `device_id, user_id, status, plan_id, monthly_limit_micros, storage_limit_bytes, requests_per_minute, month_cost_micros, memory_sync, include_sensitive`. Touches `last_used_at` and `last_seen_at` when older than 5 minutes. No row for an unknown or revoked token. |
| `record_usage(...)` | Inserts a `usage_events` row and adds it to `usage_monthly`, `user_totals`, the person's `org_totals` and today's `daily_totals` in one statement. |
| `record_app_events(p_user uuid, p_device uuid, p_events jsonb)` | Inserts the `app_events` rows of one batch and adds their counts and tokens saved to the same three totals. |
| `set_memory_totals(p_user uuid)` | Recomputes the person's memory counts in `user_totals` from `memory_files`, and their organization's from its members, after a commit or a delete. |
| `create_organization(p_name text, p_slug text, p_admin uuid, p_plan text)` | The operator's call: makes the organization, its totals row and its first admin in one statement. Refuses an admin already in an organization. |
| `accept_org_invite(p_user uuid, p_invite uuid)` | Checks the invite is live and for this account, adds the member with the invite's role, marks the invite accepted. |
| `admin_table_stats()` | Each table in `public` and `storage`: estimated rows, total bytes, Row Level Security on, policy count. |
| `admin_storage_usage()` | Bytes and object count per bucket, and per user in `memory`. |

## 11. Prices

The site meters with the same table as `packages/memory/src/ai/prices.ts`
(dated 2026-10-22), USD per million tokens. Cache writes cost 1.25 times
input. Batch results cost half.

| Model | Input | Output | Cache read | Cache write |
|---|---|---|---|---|
| `claude-opus-5-5` | 4 | 20 | 0.2 | 5 |
| `claude-sonnet-5-5` | 2 | 10 | 0.2 | 2.5 |
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
listed in the frontend README): email sign in on, email confirmation on,
the Site URL and redirect URLs set to the site, the magic link email
holding both `{{ .Token }}` and the `/auth/confirm` link, and no session
time limit or inactivity timeout.

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
  the email or username of their Coere account, with a role. With no such
  account, the site says the coworker must first make a Coere account (and
  gives the sign up link to send them); nothing is stored and no email is
  sent. A coworker already in an organization cannot be invited. The
  invited person sees the invite on `/dashboard/organization` and accepts or
  declines it. Invites expire after 7 days, and admins can see and revoke
  pending ones.

### 14.2 The shared knowledge graph

There is one graph per organization, built on the server from what its
members share.

1. When a member's memory file is committed (section 8.6) and their access
   lets them contribute, the server takes the part of their index that sits
   in the organization's shared sections, drops every sensitive memory, and
   writes it to
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

## 16. The developer waitlist

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

-- monthly_limit_micros and lifetime_limit_micros are already resolved:
-- the person's own value when set, else the plan's. lifetime_limit_micros
-- null means no lifetime limit. lifetime_cost_micros is user_totals.cost_micros.
device_auth(p_token_hash text) returns table (
  device_id uuid, user_id uuid, status text, plan_id text,
  monthly_limit_micros bigint, lifetime_limit_micros bigint,
  storage_limit_bytes bigint, requests_per_minute integer,
  month_cost_micros bigint, lifetime_cost_micros bigint,
  memory_sync boolean, include_sensitive boolean, org_id uuid)

record_usage(p_user uuid, p_device uuid, p_kind text, p_model text,
  p_input integer, p_output integer, p_cache_write integer, p_cache_read integer,
  p_cost_micros bigint, p_status integer, p_duration_ms integer, p_request_id text) returns void

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
