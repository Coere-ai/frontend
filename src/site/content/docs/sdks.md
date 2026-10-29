Both SDKs have the same calls (camelCase in TypeScript, snake_case in Python), the same error classes and the same retry rules. Each call is one request; arguments equal to the server's default are not sent. <!-- src: packages/client/README.md:82-90 --> <!-- src: packages/client/src/call.ts:51-74 --> <!-- src: sdk/python/README.md:140-141 -->

### 7.1 TypeScript: `@coere/client`

Version `0.3.0`, `fetch` only, so it runs on Node 22, Deno and Bun. Answer types come from `@coere/api`. Not published; see [Quickstart](#23-first-calls). <!-- src: packages/client/package.json:1-12 --> <!-- src: packages/client/src/index.ts:1-6 -->

Exports: `Coere`, `ConnectOptions` (type), `DEFAULT_BASE_URL`, `ClientOptions` (type), `Page`, `PageRequest`, `ContextResource` and `DraftOptions` (types), `CreateOptions` (type), and every error class. <!-- src: packages/client/src/index.ts:8-14 -->

#### Constructor

```ts
new Coere(options?: ClientOptions)
```

| Option | Type | Default | Notes |
|---|---|---|---|
| `baseUrl` | `string` | `http://127.0.0.1:7337` | https, or http to a loopback host only. |
| `token` | `string` | none | A `coere_app_` token. Calls that need one throw `AuthenticationError` before sending without it. The client reads no environment. |
| `timeout` | `number` (ms) | `30000` | Per try. |
| `maxRetries` | `number` | `2` | Tries after the first. |
| `fetch` | `typeof fetch` | the global `fetch` | Any WHATWG fetch. |
| `sleep`, `random` | functions | | For tests. |

<!-- src: packages/client/src/options.ts:10-25 --> <!-- src: packages/client/src/options.ts:52-62 --> <!-- src: packages/client/src/transport.ts:34-43 -->

`coere.baseUrl` is the checked address. `coere.withOptions({ timeout?, maxRetries? })` returns a copy with the same server and token. `JSON.stringify(coere)` and `coere.toJSON()` give `{ baseUrl }` only; the token sits in a private field. Requests carry `User-Agent: coere-typescript/0.3.0`. <!-- src: packages/client/src/client.ts:75-89 --> <!-- src: packages/client/src/transport.ts:32 -->

#### Methods

| Method | Returns | Endpoint |
|---|---|---|
| `Coere.connect(options: ConnectOptions, onCode: (code: string) => void)` (static) | `Promise<string>` (the token) | `POST /v1/connect`, then `POST /v1/connect/{id}/token` |
| `health()` | `Promise<Health>` | `GET /v1/health` |
| `me()` | `Promise<Me>` | `GET /v1/me` |
| `profile()` | `Promise<PersonProfile>` | `GET /v1/profile` |
| `style(query?: { history? })` | `Promise<StyleSummary>` | `GET /v1/style` |
| `tree(query?: { root?, depth?, history? })` | `Promise<TreeNode>` (the root node, not the `Tree` wrapper) | `GET /v1/tree` |
| `resolve(path: string[] \| string)` | `Promise<Resolved>`; a string is split on `/` | `GET /v1/resolve` |
| `upcoming(query: { until, from?, overdue?, limit?, cursor? })` | `PageRequest<ApiFact>` | `GET /v1/upcoming` |
| `search(query: { q, kinds?, section?, history?, asOf?, limit? })` | `Promise<SearchResult>` | `GET /v1/search` |
| `corePack()` | `Promise<CorePackView>` | `GET /v1/core-pack` |
| `changes(query?: { since?, limit?, records? })` | `Promise<ChangeFeed>` | `GET /v1/changes` |
| `export(query?: { quotes? })` | `Promise<Uint8Array>` | `GET /v1/export.coere` |
| `context(body: { query, maxChars?, sections?, include? })` | `Promise<ContextBlock>` | `POST /v1/context` |
| `context.forDraft(draft: string, options?: DraftOptions)` | `Promise<DraftContext>` | `POST /v1/context/draft` |
| `context.sent(receipt: string)` | `Promise<number>` (lines recorded) | `POST /v1/context/draft/sent` |
| `nodes.get(id, query?: { history? })` | `Promise<NodeDetail>` | `GET /v1/nodes/{id}` |
| `nodes.children(id, query?: { limit?, cursor? })` | `PageRequest<ApiEntity>` | `GET /v1/nodes/{id}/children` |
| `nodes.facts(id, query?: { status?, kind?, key?, about?, limit?, cursor? })` | `PageRequest<ApiFact>` | `GET /v1/nodes/{id}/facts` |
| `facts.get(id)` | `Promise<FactDetail>` | `GET /v1/facts/{id}` |
| `facts.list(query?: { subject?, under?, section?, kind?, key?, status?, dueBefore?, minImportance?, pinned?, limit?, cursor? })` | `PageRequest<ApiFact>` | `GET /v1/facts` |
| `entities.list(query?: { kind?, q?, section?, limit?, cursor? })` | `PageRequest<ApiEntity>` | `GET /v1/entities` |
| `entities.related(id, query?: { type?, direction?, depth? })` | `Promise<RelatedEdge[]>` (the `data` array) | `GET /v1/entities/{id}/related` |
| `sections.list()` | `Promise<SectionSummary[]>` (the `data` array) | `GET /v1/sections` |
| `sources.get(id)` | `Promise<ApiSource>` | `GET /v1/sources/{id}` |
| `people.identity(id = 'me')` | `Promise<Identity>` | `GET /v1/people/{id}/identity` |
| `suggestions.create(body: SuggestionCreate, options?: { idempotencyKey? })` | `Promise<Suggestion>` | `POST /v1/suggestions` |
| `suggestions.get(id)` | `Promise<Suggestion>` | `GET /v1/suggestions/{id}` |
| `suggestions.list(query?: { status?, limit?, cursor? })` | `PageRequest<Suggestion>` | `GET /v1/suggestions` |
| `clients.list(query?: { limit?, cursor? })` | `PageRequest<Client>` | `GET /v1/clients` |
| `clients.card(id)` | `Promise<ClientCard>` | `GET /v1/clients/{id}/card` |

<!-- src: packages/client/src/client.ts:66-139 --> <!-- src: packages/client/src/resources/context.ts:14-51 --> <!-- src: packages/client/src/resources/nodes.ts:6-20 --> <!-- src: packages/client/src/resources/facts.ts:6-16 --> <!-- src: packages/client/src/resources/entities.ts:6-17 --> <!-- src: packages/client/src/resources/sections.ts:5-11 --> <!-- src: packages/client/src/resources/sources.ts:5-11 --> <!-- src: packages/client/src/resources/people.ts:5-16 --> <!-- src: packages/client/src/resources/suggestions.ts:3-29 --> <!-- src: packages/client/src/resources/clients.ts:10-22 -->

Query and body argument names and types are the route's own (`QueryOf<op>`, `BodyOf<op>`), so the parameter tables of [Endpoints](#5-endpoints) apply as written. <!-- src: packages/api/src/openapi/routes.ts:41-53 -->

**`DraftOptions`** = every field of the `POST /v1/context/draft` body except `draft` (`chat`, `target`, `firstMessage`, `budget`, `sections`, `standing`, `sensitive`, `skipRecent`, `record`, `also`), plus `idempotencyKey?: string`. A call that records (a `chat`, unless `record: 'later'`) sends an `Idempotency-Key`: yours, or a `crypto.randomUUID()` made once per call and reused on each retry. A call that does not record sends no key. <!-- src: packages/client/src/resources/context.ts:4-12 --> <!-- src: packages/client/src/resources/context.ts:33-46 -->

**`suggestions.create`** always sends an `Idempotency-Key`: `options.idempotencyKey`, or a `crypto.randomUUID()` per call. <!-- src: packages/client/src/resources/suggestions.ts:17-20 -->

**`ConnectOptions`**: `name: string`, `scopes: Scope[]`, `sections?: string[]`, `wait?: number` (ms to wait for the person, default `600000`, never past the request's own `expiresIn`), plus `baseUrl`, `fetch`, `timeout` and `sleep` from `ClientOptions`. It sends no token. `onCode` is required and gets the code to show. It throws `ConnectDeniedError` after Deny, `CodeExpiredError` when the request lapses, and `APITimeoutError` when `wait` runs out first. <!-- src: packages/client/src/connect.ts:14-66 -->

```ts
const token = await Coere.connect({ name: 'planner', scopes: ['memory:read'] }, (code) =>
  console.log(`Open Apps in Coere and allow planner. Code ${code}.`),
)
const coere = new Coere({ token })
```

<!-- src: packages/client/README.md:70-75 -->

#### Pages

A paged method returns a `PageRequest<T>`: `await` it for the first `Page<T>`, or `for await` over it to walk every item of every page. Nothing is sent until one of them is used. A `Page<T>` has `data`, `hasMore`, `nextCursor`, `nextPage(): Promise<Page<T> | null>`, `iterPages()` and is itself async iterable over items. <!-- src: packages/client/src/pages.ts:1-80 -->

```ts
for await (const child of coere.nodes.children('sec_school')) console.log(child.name)
```

<!-- src: packages/client/README.md:12 -->

### 7.2 Python: `coere`

Version `0.3.0`, Python 3.10 or later, built on `httpx2` and `pydantic` 2. Not on PyPI; install by path (see [Quickstart](#23-first-calls)). <!-- src: sdk/python/pyproject.toml:1-14 --> <!-- src: sdk/python/src/coere/_client.py:10 -->

Top-level exports: `coere` (the default client), `Coere`, `AsyncCoere`, `CursorPage`, `AsyncCursorPage`, `ChangeFeed`, `format`, `__version__`, and every error class. <!-- src: sdk/python/src/coere/__init__.py:50-76 -->

#### The default client

`from coere import coere` gives a client built on first use from `COERE_URL` (default `http://127.0.0.1:7337`) and `COERE_TOKEN`. Importing reads nothing; a missing token raises `AuthenticationError` ("Set COERE_TOKEN, or pass token= to Coere().") at the first call that needs one. The SDK never reads a `.env` file. <!-- src: sdk/python/src/coere/_default.py:1-47 --> <!-- src: sdk/python/src/coere/_config.py:1-30 --> <!-- src: sdk/python/src/coere/_base.py:75-78 -->

#### Constructor

```python
Coere(
    base_url: str | None = None,          # else COERE_URL, else http://127.0.0.1:7337
    token: str | None = None,             # else COERE_TOKEN
    *,
    timeout: float | httpx2.Timeout = httpx2.Timeout(30.0, connect=5.0),
    max_retries: int = 2,
    http_client: httpx2.Client | None = None,
)
```

`AsyncCoere` takes the same, with `http_client: httpx2.AsyncClient | None`. Both are context managers (`with` / `async with`) and have `close()` (a coroutine on `AsyncCoere`), `base_url`, and `with_options(timeout=None, max_retries=None)`, which returns a copy sharing the connections. `repr(client)` shows the base URL only. Requests carry `User-Agent: coere-python/0.3.0`. <!-- src: sdk/python/src/coere/_client.py:42-135 --> <!-- src: sdk/python/src/coere/_async_client.py:44-126 --> <!-- src: sdk/python/src/coere/_base.py:30 --> <!-- src: sdk/python/src/coere/_version.py:1 -->

#### Methods

All are methods of `Coere`; on `AsyncCoere` the same names are coroutines, and list calls return an `AsyncCursorPage` (await the call, then `async for`). <!-- src: sdk/python/src/coere/_async_client.py:128-177 -->

| Method | Returns | Endpoint |
|---|---|---|
| `Coere.connect(name, scopes, sections=None, on_code=None, timeout=600, *, base_url=None, http_client=None)` (classmethod) | `str` (the token) | `POST /v1/connect`, then polls |
| `health()` | `Health` | `GET /v1/health` |
| `me()` | `Me` | `GET /v1/me` |
| `profile()` | `PersonProfile` | `GET /v1/profile` |
| `style(history=False)` | `StyleSummary` | `GET /v1/style` |
| `tree(root=None, depth=2, history=False)` | `TreeNode` (the root) | `GET /v1/tree` |
| `resolve(path)` (a list of names, or one string split on `/`) | `Resolved` | `GET /v1/resolve` |
| `upcoming(until, from_=None, overdue=True, limit=50, cursor=None)` | `CursorPage[Fact]` | `GET /v1/upcoming` |
| `search(q, kinds=None, section=None, history=False, as_of=None, limit=20)` | `SearchResult` | `GET /v1/search` |
| `changes(since=None, limit=1000, records=False)` | `ChangeFeed` (iterable; `.next`, `.epoch`, `.data`) | `GET /v1/changes` |
| `core_pack()` | `CorePackView` | `GET /v1/core-pack` |
| `export(path, quotes=True)` | `Path` (writes the file) | `GET /v1/export.coere` |
| `context(query, max_chars=6000, sections=None, include=("profile", "upcoming"))` | `ContextBlock` | `POST /v1/context` |
| `context.for_draft(draft, *, chat=None, target=None, first_message=None, budget=None, sections=None, standing=None, sensitive=False, skip_recent=False, record=None, also=False, idempotency_key=None)` | `DraftContext` | `POST /v1/context/draft` |
| `context.sent(receipt)` | `int` (lines recorded) | `POST /v1/context/draft/sent` |
| `nodes.get(id, history=False)` | `NodeDetail` | `GET /v1/nodes/{id}` |
| `nodes.children(id, limit=50, cursor=None)` | `CursorPage[Entity]` | `GET /v1/nodes/{id}/children` |
| `nodes.facts(id, status="current", kind=None, key=None, about=False, limit=50, cursor=None)` | `CursorPage[Fact]` | `GET /v1/nodes/{id}/facts` |
| `facts.get(id)` | `FactDetail` | `GET /v1/facts/{id}` |
| `facts.list(subject=None, under=None, section=None, kind=None, key=None, status="current", due_before=None, min_importance=None, pinned=None, limit=50, cursor=None)` | `CursorPage[Fact]` | `GET /v1/facts` |
| `entities.list(kind=None, q=None, section=None, limit=50, cursor=None)` (`kind`: a string or a sequence) | `CursorPage[Entity]` | `GET /v1/entities` |
| `entities.related(id, type=None, direction="both", depth=1)` | `list[RelatedEdge]` | `GET /v1/entities/{id}/related` |
| `sections.list()` | `list[SectionSummary]` | `GET /v1/sections` |
| `sources.get(id)` | `Source` | `GET /v1/sources/{id}` |
| `people.identity(id="me")` | `Identity` | `GET /v1/people/{id}/identity` |
| `suggestions.create(text, kind="add", about=None, section=None, due=None, importance=None, note=None, idempotency_key=None)` (`due`: a `When` or a mapping) | `Suggestion` | `POST /v1/suggestions` |
| `suggestions.get(id)` | `Suggestion` | `GET /v1/suggestions/{id}` |
| `suggestions.list(status=None, limit=50, cursor=None)` | `CursorPage[Suggestion]` | `GET /v1/suggestions` |
| `clients.list(limit=50, cursor=None)` | `CursorPage[Client]` | `GET /v1/clients` |
| `clients.card(id)` | `ClientCard` | `GET /v1/clients/{id}/card` |

<!-- src: sdk/python/src/coere/_client.py:74-188 --> <!-- src: sdk/python/src/coere/resources/calls.py:33-116 --> <!-- src: sdk/python/src/coere/resources/context.py:70-114 --> <!-- src: sdk/python/src/coere/resources/nodes.py:38-59 --> <!-- src: sdk/python/src/coere/resources/facts.py:47-71 --> <!-- src: sdk/python/src/coere/resources/entities.py:39-57 --> <!-- src: sdk/python/src/coere/resources/sections.py:16-21 --> <!-- src: sdk/python/src/coere/resources/sources.py:15-20 --> <!-- src: sdk/python/src/coere/resources/people.py:15-25 --> <!-- src: sdk/python/src/coere/resources/suggestions.py:57-83 --> <!-- src: sdk/python/src/coere/resources/clients.py:26-36 -->

Notes:

- **Dates** (`until`, `from_`, `as_of`, `due_before`) take a `datetime.date`, an aware `datetime` or an ISO string. A naive `datetime` raises `ValueError`. <!-- src: sdk/python/src/coere/_dates.py:1-18 -->
- **`for_draft`** takes its options as keywords only. It sends an `Idempotency-Key` only when it records (a `chat`, unless `record="later"`): `idempotency_key`, or a `uuid4` made once per call. <!-- src: sdk/python/src/coere/resources/context.py:24-56 -->
- **`suggestions.create`** always sends an `Idempotency-Key`: `idempotency_key`, or a `uuid4` per call. <!-- src: sdk/python/src/coere/resources/suggestions.py:22-45 -->
- **`Coere.connect`** sends no token, even with `COERE_TOKEN` set, and is never retried. `on_code` defaults to printing `Open Apps in Coere and allow <name>. Code <code>.`. `timeout` is seconds to wait for the person, capped at the request's `expiresIn`. Raises `ConnectDeniedError`, `CodeExpiredError`, or `APITimeoutError`. `AsyncCoere.connect` is the same as a coroutine. <!-- src: sdk/python/src/coere/_client.py:74-104 --> <!-- src: sdk/python/src/coere/resources/connect.py:28-80 -->
- **Models** are pydantic 2, frozen, camelCase on the wire and snake_case in Python, with unknown fields kept in `model_extra`. A model's `repr` shows its id only; a `DraftContext` shows counts, never its block. <!-- src: sdk/python/src/coere/types/_model.py:18-30 --> <!-- src: sdk/python/README.md:228-253 -->
- **Pages**: a `CursorPage` iterates every item of every page; it has `data`, `has_more`, `next_cursor`, `next_page()` and `iter_pages()`. <!-- src: sdk/python/src/coere/_pagination.py:18-42 -->
- **Offline**: `coere.format.read_bundle(path)` reads a `.coere` file or folder into the same models with no server. <!-- src: sdk/python/src/coere/format.py:144 --> <!-- src: sdk/python/README.md:255-259 -->
- **Logging**: the `coere` logger writes at debug level the operation, status, milliseconds and attempt, never a query, body, header or token. <!-- src: sdk/python/src/coere/_log.py:1-16 -->

### 7.3 Errors in the SDKs

```text
CoereError
  APIConnectionError
    APITimeoutError
  APIResponseValidationError
  APIStatusError
    BadRequestError         400, 405, 413, 415
    AuthenticationError     401
    PermissionDeniedError   403
      ConnectDeniedError    403 connect_denied
    NotFoundError           404
    ConflictError           409
      EpochChangedError     410 epoch_changed
      ReceiptExpiredError   410 receipt_expired
      CodeExpiredError      410 code_expired
    RateLimitError          429
    NotSyncedError          503 not_synced
    InternalServerError     500, 501, 507 and other 5xx
```

<!-- src: packages/client/src/errors.ts:1-105 --> <!-- src: sdk/python/src/coere/_errors.py:16-100 --> <!-- src: sdk/python/README.md:177-198 -->

The class comes from the problem's `code` (see the table in [Errors](#10-errors)); for an answer with no known code it comes from the status (410 without a code maps to `EpochChangedError`). <!-- src: packages/client/src/problem.ts:44-81 --> <!-- src: sdk/python/src/coere/_errors.py:129-152 -->

| | TypeScript | Python |
|---|---|---|
| Fields on `APIStatusError` | `status`, `code`, `requestId`, `param`, `scope` (and `retryAfter` on `RateLimitError`) | `status_code`, `code`, `request_id`, `param`, `scope`, `retry_after` |
| Message | `"403 forbidden_scope: The token lacks a scope (memory:suggest)."`, built from the code's fixed title, never from the body | same |

<!-- src: packages/client/src/errors.ts:29-98 --> <!-- src: packages/client/src/problem.ts:60-64 --> <!-- src: sdk/python/src/coere/_errors.py:32-52 --> <!-- src: sdk/python/src/coere/_errors.py:160-179 -->

### 7.4 Retries and timeouts in the SDKs

- A try that fails on a dropped connection, a timeout, or `408`, `429`, `500`, `502`, `503` (not `not_synced`) or `504` is tried again, up to `maxRetries` / `max_retries` (default 2) times. <!-- src: packages/client/src/retry.ts:10-15 --> <!-- src: sdk/python/src/coere/_retry.py:15-23 -->
- Only calls that are safe to repeat are retried: every `GET`, the read only POSTs `context` and `context.draft`, and any call carrying an `Idempotency-Key`. `context.sent` and the connect calls are never sent twice. <!-- src: packages/client/src/call.ts:36-44 --> <!-- src: packages/client/src/call.ts:99 --> <!-- src: sdk/python/src/coere/_base.py:32-54 -->
- The wait is `min(8, 0.5 * 2**attempt)` seconds less up to 25 percent at random, or the server's `retryAfter` / `Retry-After` when it is 60 seconds or less. <!-- src: packages/client/src/retry.ts:17-29 --> <!-- src: sdk/python/src/coere/_retry.py:26-35 -->
- Timeout: 30 seconds per try (Python: 30 seconds with 5 to connect). <!-- src: packages/client/src/options.ts:56-57 --> <!-- src: sdk/python/src/coere/_client.py:42 -->
