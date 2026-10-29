### 3.1 Base URL and transport

| Item | Value |
|---|---|
| Default base URL | `http://127.0.0.1:7337` <!-- src: packages/api/openapi.json:8-13 --> <!-- src: packages/client/src/options.ts:27 --> <!-- src: sdk/python/src/coere/_config.py:13 --> |
| REST prefix | `/v1` <!-- src: packages/api/src/version.ts:7 --> |
| MCP endpoint | `/mcp` (not under `/v1`) <!-- src: packages/api/src/openapi/routes.ts:32 --> |
| Default port | `7337`, changed with `--port` or `COERE_PORT` <!-- src: packages/api/src/version.ts:12 --> <!-- src: apps/server/src/config.ts:139-142 --> |
| Default bind | `127.0.0.1` (`localhost` is read as `127.0.0.1`), changed with `--host` or `COERE_HOST` <!-- src: apps/server/src/config.ts:137-138 --> |

- The server refuses to bind anything but `127.0.0.1` or `::1` unless `COERE_PUBLIC_URL` names the `https://` address of a proxy in front of it, or `COERE_BIND_ANY=container` is set inside a container. <!-- src: apps/server/src/config.ts:101-114 -->
- Both SDKs accept only an `https://` base URL, or plain `http://` to a loopback host (`127.x.x.x`, `localhost`, `[::1]`), with no query, fragment or credentials. <!-- src: packages/client/src/options.ts:29-48 --> <!-- src: sdk/python/src/coere/_config.py:15-26 -->
- To reach the server from another device, put TLS in front of it (the server README shows `tailscale serve 7337` and `caddy reverse-proxy --from coere.example.com --to 127.0.0.1:7337`) and set `COERE_PUBLIC_URL` and `COERE_TRUST_PROXY`. <!-- src: apps/server/README.md:129-171 -->

### 3.2 Who may send requests

The server is meant for programs, not web pages:

1. **Host.** The `Host` header must name `127.0.0.1`, `localhost`, `[::1]` or the host of `COERE_PUBLIC_URL`; anything else is `403 forbidden_host`. The port is not compared. <!-- src: apps/server/src/guards/host.ts:1-13 --> <!-- src: apps/server/src/guards/host.ts:44-63 -->
2. **Origin.** A request with no `Origin` header (curl, Python, Node, MCP clients) passes. A request with an `Origin` passes only if it is a paired extension's origin or one listed in `COERE_ALLOWED_ORIGINS`; every `OPTIONS` preflight is refused. The answer is `403 forbidden_origin`. The server never sends `Access-Control-Allow-Origin`. <!-- src: apps/server/src/guards/origin.ts:6-12 --> <!-- src: apps/server/src/guards/origin.ts:30-54 --> <!-- src: apps/server/src/app.ts:113 -->
3. **Body size.** At most 64 KiB for every app request (8 MiB gzip for the extension's sync push). Larger is `413 payload_too_large`. <!-- src: apps/server/src/guards/size.ts:7-16 -->
4. **Media type.** A `POST` body must be `Content-Type: application/json` (parameters such as `charset` are allowed), else `415 unsupported_media_type`. <!-- src: apps/server/src/guards/media.ts:6-24 -->
5. **Auth, scope and rate**, in that order (see [Authentication](#4-authentication) and [Limits](#9-limits)). <!-- src: apps/server/src/app.ts:139-146 -->

A path outside the route table answers `404 not_found`; a known path with the wrong method answers `405 method_not_allowed`. `HEAD` is answered like `GET`. <!-- src: apps/server/src/app.ts:148-150 --> <!-- src: apps/server/src/guards/route.ts:63-69 --> Paths under `/v1/chats/` are reserved for a later release and answer 404. <!-- src: packages/api/src/openapi/routes.ts:29-30 -->

### 3.3 Request encoding

- **JSON** in UTF-8, camelCase field names. The Python SDK maps them to snake_case. <!-- src: docs/design/access-v3.md:773-775 --> <!-- src: sdk/python/src/coere/types/_model.py:18-24 -->
- **Bodies are strict.** Every request schema is a strict object: an unknown field is `400 bad_request`. <!-- src: packages/api/src/requests/writes.ts:9-19 --> <!-- src: packages/api/src/requests/context-draft.ts:32-61 -->
- **Query lists repeat** the parameter: `?kind=person&kind=group`, `?segment=School&segment=CS%20101`. A parameter that is not a list may appear once. <!-- src: packages/api/src/requests/reads.ts:14-19 --> <!-- src: packages/api/src/requests/parse.ts:47-63 -->
- **Query booleans** are the words `true` and `false`; integers are plain decimal digits. <!-- src: packages/api/src/requests/parse.ts:27-32 -->
- **Unknown query parameters** are refused with `400 bad_request` on every memory and suggestion route (a route with no query refuses any query). <!-- src: packages/api/src/requests/parse.ts:53-56 --> <!-- src: apps/server/src/views/context.ts:92-96 -->
- **Path ids** are percent encoded; a source id such as `chatgpt:fake-climb` may hold `:` and `/`. Both SDKs keep `:` and `@` unencoded. An id of up to 400 characters that the server does not hold, or that the token may not see, answers `404 not_found`, never 400 or 403. <!-- src: packages/api/src/openapi/param-docs.ts:7 --> <!-- src: packages/api/src/requests/fields.ts:7-12 --> <!-- src: packages/client/src/call.ts:46-49 --> <!-- src: sdk/python/src/coere/_base.py:61-63 -->
- **Dates** in queries (`until`, `from`, `dueBefore`, `asOf`) are a day `YYYY-MM-DD` or a date-time **with an offset**; a naive date-time is refused. A day used as an upper bound runs to its last moment in the person's time zone. <!-- src: packages/api/src/requests/fields.ts:26-27 --> <!-- src: apps/server/src/routes/upcoming.ts:21-35 -->

### 3.4 Answers

Every answer carries: <!-- src: apps/server/src/app.ts:108-114 -->

| Header | Meaning |
|---|---|
| `Coere-Request-Id` | The request's id (`req_` + 26 letters), which the server log names. <!-- src: packages/api/src/openapi/headers.ts:8-11 --> <!-- src: apps/server/src/app.ts:99 --> |
| `Coere-Now` | The server clock urgency was computed against, to the second. <!-- src: packages/api/src/openapi/headers.ts:12 --> |
| `Cache-Control: no-store` and `X-Content-Type-Options: nosniff` | Always. <!-- src: apps/server/src/app.ts:111-112 --> |
| `Coere-Synced-At` | On a successful answer of a memory route, once memory exists: when the last push was applied. <!-- src: packages/api/src/openapi/headers.ts:13 --> <!-- src: apps/server/src/app.ts:65-81 --> |
| `Coere-Memory-Version` | Same condition: `<epoch>.<ackedSeq>` of the copy that answered. <!-- src: packages/api/src/openapi/headers.ts:14-17 --> |
| `Retry-After` | On `429`: seconds to wait. <!-- src: packages/api/src/openapi/headers.ts:22 --> |
| `Coere-Server-Sig` | Only on answers to the paired extension (internal). <!-- src: packages/api/src/openapi/headers.ts:18-21 --> |

Errors are RFC 9457 problem details with media type `application/problem+json`. See [Errors](#10-errors). <!-- src: packages/api/src/problems.ts:85 -->

Instants are UTC with `Z` (RFC 3339), optionally with milliseconds. Times in the person's world are `When` objects (`at` local date or date-time, optional `tz`, optional `approx`). <!-- src: packages/api/openapi.json:8967-8996 -->

### 3.5 Ids

Records keep the `.coere` format's ids: `sec_<key>` for sections, `ent_`, `fact_`, `rel_` and `act_` followed by a UUIDv7, and source ids `<platform>:<conversation id>`. <!-- src: packages/api/openapi.json:8937-8966 --> Ids the server makes are a prefix and 26 Crockford base32 letters (a ULID layout): `srv_`, `dev_`, `tok_` (app token), `sug_` (suggestion), `req_` (request), `snp_` (snapshot), `rcp_` (context receipt), `con_` (access request); the pattern is `^<prefix>_[0-7][0-9A-HJKMNP-TV-Z]{25}$`. <!-- src: packages/api/src/ids.ts:12-44 -->

### 3.6 Pagination

List routes take `limit` and an opaque `cursor` (1 to 4096 characters) and answer `{ "data": [...], "hasMore": boolean, "nextCursor": string | null }`. Pass `nextCursor` back as `cursor` for the next page. Defaults: `limit` 50, at most 200, except where an endpoint says otherwise. <!-- src: packages/api/src/requests/reads.ts:21-24 --> <!-- src: packages/api/src/cursor.ts:15 --> <!-- src: packages/api/openapi.json:11075-11104 -->

The cursor is sealed by the server and bound to its listing (the operation and its filters): a client can only hand it back unchanged. A malformed or foreign cursor is `400 bad_request`; a cursor made before the memory was replaced is `409 cursor_stale`, and you start again from the first page. <!-- src: packages/api/src/cursor.ts:4-13 --> <!-- src: packages/api/src/cursor.ts:89-102 -->

`GET /v1/changes` is not paged this way; it uses a feed position (`since` / `next`). `GET /v1/entities/{id}/related` and `GET /v1/sections` answer `{ "data": [...] }` without paging. <!-- src: packages/api/src/requests/reads.ts:107-117 --> <!-- src: packages/api/openapi.json:11182-11196 --> <!-- src: packages/api/openapi.json:10972-10986 -->

### 3.7 Idempotency

- `POST /v1/suggestions` **requires** an `Idempotency-Key` header: 1 to 255 visible ASCII characters (`^[\x21-\x7e]+$`), such as a UUID or a SHA-256. A retry with the same key and body gets the first answer and files nothing new; the same key with another body is `409 idempotency_conflict`. The first answer is kept a day; after that the suggestion row still holds its key. <!-- src: packages/api/src/requests/fields.ts:57-63 --> <!-- src: apps/server/src/routes/suggestions.ts:9-31 --> <!-- src: apps/server/src/routes/suggestions.ts:47-70 -->
- `POST /v1/context/draft` **accepts** an optional `Idempotency-Key`. An answer is kept ten minutes in the server process by token and key; a retry with the same body gets the very same answer (and the same receipt) and records nothing again; another body with the key is `409 idempotency_conflict`. A server restart forgets the cache. <!-- src: apps/server/src/trackers/draft-cache.ts:5-15 --> <!-- src: apps/server/src/views/draft-context.ts:139-146 -->

### 3.8 Versioning

Inside `/v1` a change only adds (optional fields, endpoints, enum values), and `API_VERSION` moves its minor number; a removal would mean a `/v2` beside `/v1`. `GET /v1/health` and `GET /v1/me` name the API version (`"api": "1.0"`). Clients should ignore fields and enum values they do not know; the Python models keep unknown fields in `model_extra`. <!-- src: packages/api/src/version.ts:1-9 --> <!-- src: docs/design/access-v3.md:806-811 --> <!-- src: sdk/python/README.md:241-248 -->

The OpenAPI 3.1 document is served at `GET /v1/openapi.json` and committed as `packages/api/openapi.json`; `pnpm api:openapi` rebuilds it from the route table and `pnpm api:openapi --check` fails when the committed file differs. <!-- src: tools/api-openapi/cli.ts:7-15 -->
