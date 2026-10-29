### 4.1 App tokens

| Item | Value |
|---|---|
| Format | `coere_app_` followed by 52 characters of RFC 4648 base32 (`[A-Z2-7]`): 32 random bytes. Regex `^coere_app_[A-Z2-7]{52}$`. <!-- src: packages/api/src/tokens.ts:4-15 --> <!-- src: packages/api/openapi.json:13142-13160 --> |
| Header | `Authorization: Bearer coere_app_...` (scheme name case-insensitive). <!-- src: apps/server/src/guards/auth.ts:8-28 --> |
| OpenAPI security scheme | `appToken`: `type: http`, `scheme: bearer`. <!-- src: packages/api/openapi.json:13452-13457 --> |
| Never in a query string | A token only in the query is ignored, so the request is refused like one with no token. <!-- src: apps/server/src/guards/auth.ts:10-13 --> |
| Storage | The server keeps only the token's SHA-256 and its first four letters as a hint; it cannot show a token again. <!-- src: apps/server/src/auth/tokens.ts:56-58 --> <!-- src: packages/api/src/tokens.ts:38-41 --> <!-- src: apps/server/README.md:54-56 --> |
| Expiry | Optional, 1 to 3650 days, set when the token is made. An expired or revoked token is refused at once (`401 unauthorized`). <!-- src: packages/api/src/requests/device.ts:52-61 --> <!-- src: apps/server/src/auth/tokens.ts:99-117 --> |
| `lastUsedAt` | Updated at most once a minute. <!-- src: apps/server/src/auth/tokens.ts:53 --> |

A missing, malformed, unknown, revoked or expired token answers `401 unauthorized`. <!-- src: apps/server/src/auth/tokens.ts:99 --> <!-- src: apps/server/src/guards/auth.ts:21-25 -->

### 4.2 Scopes

| Scope | Grants | Default when the person adds an app |
|---|---|---|
| `memory:read` | Every read route: profile, style, sections, tree, nodes, facts, entities, relations, resolve, search, upcoming, context, context draft and sent, identity, core pack, sources, changes, clients. <!-- src: packages/api/src/openapi/routes-tree.ts:14 --> <!-- src: packages/api/src/openapi/routes-find.ts:14 --> <!-- src: packages/api/src/openapi/routes-context.ts:15 --> | on <!-- src: packages/api/src/scopes.ts:19-20 --> |
| `memory:evidence` | Quotes in evidence (`exact`, `prefix`, `suffix`), exemplar message refs, and the titles and URLs of the chats memories cite (`Source.title`, `Source.url`, `FactDetail.sources`); in draft answers, `chatRefs` on lines. Without it evidence keeps `src`, `role`, `at`, `msgSha256` and `stale` only. <!-- src: docs/design/access-v3.md:532-541 --> <!-- src: docs/design/v3-context-api.md:460-461 --> | off |
| `memory:sensitive` | Facts with a `sensitivity`, which reach the server only after the person turns on "Let apps read sensitive memories". Needed for `sensitive: true` on a draft call. <!-- src: docs/design/access-v3.md:538 --> <!-- src: apps/server/src/views/draft-context.ts:48-49 --> | off |
| `memory:suggest` | `POST/GET /v1/suggestions`, `GET /v1/suggestions/{id}`, and the MCP tool `suggest_memory`. <!-- src: packages/api/src/openapi/routes-suggest.ts:7 --> <!-- src: apps/server/src/mcp/tools.ts:192-196 --> | off |
| `memory:export` | `GET /v1/export.coere`. <!-- src: packages/api/src/openapi/routes-find.ts:110-117 --> | off |
| `memory:identity` | Contact values (emails, phones, links) of the person and of people in memory, in every route. Without it `GET /v1/people/{id}/identity` answers the other identity fields with no contact values. Shown on the Apps page as "Sees contact details". <!-- src: docs/design/v3-context-api.md:986-998 --> <!-- src: packages/client/README.md:61-64 --> | off |

The scope list in code, in order: `memory:read`, `memory:evidence`, `memory:sensitive`, `memory:suggest`, `memory:export`, `memory:identity`. <!-- src: packages/api/src/scopes.ts:9-16 -->

A token that lacks a route's scope gets `403 forbidden_scope` with `scope` naming the one needed (for example `"detail": "This route needs memory:suggest."`). <!-- src: apps/server/src/guards/scope.ts:5-31 --> <!-- src: packages/api/src/problems.ts:143 --> `GET /v1/me` takes any token whatever its scopes. <!-- src: apps/server/src/routes/me.ts:8-13 -->

**Section limits.** A token may also be limited to a list of section keys. Every read then sees only records filed in those sections; the person (the self entity) shows to every token. A record outside the token's sections answers `404 not_found`, never 403, and counts leave it out. <!-- src: docs/design/access-v3.md:543-550 --> <!-- src: apps/server/src/guards/scope.ts:7-12 -->

### 4.3 Getting a token

There are three ways. All three produce the same kind of token, checked by the same schema (name 1 to 64 plain characters, 1 to 6 scopes, optional 1 to 50 section keys, optional expiry 1 to 3650 days). <!-- src: packages/api/src/requests/device.ts:52-61 --> <!-- src: apps/server/src/cli/token.ts:9-14 -->

**1. The dashboard.** Apps page, **Add an app**: a name, scopes, sections and an optional expiry. The token appears once. <!-- src: docs/design/access-v3.md:523-527 -->

**2. The command line**, on the server's data folder: <!-- src: apps/server/src/cli/token.ts:16-18 -->

```bash
pnpm server:token create --name planner --scope memory:read,memory:suggest [--section people,plans] [--expires 90d] [--json]
pnpm server:token list
pnpm server:token revoke tok_...
# or, in Docker:
docker compose exec server node /app/coere-server.mjs token create --name planner --scope memory:read
```

<!-- src: apps/server/README.md:45-52 --> <!-- src: apps/server/README.md:86-91 --> `--expires` takes `90d` or `90` (days). <!-- src: apps/server/src/cli/args.ts:57-62 -->

**3. Ask from code ("Allow this app")**, with no token at all: <!-- src: packages/api/src/requests/connect.ts:6-12 --> <!-- src: apps/server/src/auth/connect.ts:16-32 -->

1. Your app makes 32 random bytes and keeps them secret.
2. `POST /v1/connect` with `name`, `scopes`, optional `sections` and `secretSha256` (lower case hex SHA-256 of the 32 bytes). The answer (`201`) is `{ "id": "con_...", "code": "QX4M-7KDP", "expiresIn": 600, "pollAfter": 2 }`. The server console prints `<name> asks for access. Open Apps in Coere to allow it.` <!-- src: apps/server/src/auth/connect.ts:125-146 --> <!-- src: apps/server/src/cli/serve.ts:29-31 -->
3. Show the person the `code`. The Apps page shows **Allow &lt;name&gt; to access Coere memory?** with the same code. The person may untick scopes (never add any) and then presses Allow or Deny. <!-- src: docs/design/v3-context-api.md:1032-1037 --> <!-- src: apps/server/src/auth/connect-poll.ts:46-70 -->
4. Poll `POST /v1/connect/{id}/token` with `{ "secret": "<the 32 bytes as unpadded base64url, 43 characters>" }` every `pollAfter` seconds:
   - `200 { "token": null, "pollAfter": 2 }` while the person decides;
   - `200 { "token": "coere_app_...", "pollAfter": 2 }` once, after Allow;
   - `403 connect_denied` after Deny;
   - `410 code_expired` after the ten minutes, or when the token was already taken;
   - `404 not_found` for an unknown id or a wrong secret (a wrong secret reads as an unknown id). <!-- src: apps/server/src/auth/connect-poll.ts:12-41 -->
5. Keep the token: it is handed out once. A token nobody took is revoked when the request expires. <!-- src: apps/server/src/auth/connect.ts:16-23 --> <!-- src: apps/server/src/auth/connect.ts:83-104 -->

The ask is limited to 10 a minute for the whole server (`429 rate_limited` with `Retry-After`). <!-- src: apps/server/src/auth/connect.ts:28-29 --> <!-- src: apps/server/src/routes/connect.ts:25-39 --> The SDKs wrap the whole flow as `Coere.connect` (TypeScript) and `Coere.connect` / `AsyncCoere.connect` (Python). <!-- src: packages/client/src/connect.ts:42-66 --> <!-- src: sdk/python/src/coere/_client.py:74-104 -->

There is no OAuth. MCP over HTTP uses the same static bearer token. <!-- src: docs/design/access-v3.md:1125-1128 -->

### 4.4 Device auth (internal)

The paired Coere extension signs its requests with `Authorization: Coere-Device ...` and a device secret (`coere_dev_` + 52 base32 letters, never shown to the person); every answer to it carries `Coere-Server-Sig`. OpenAPI security scheme `device` (`type: http`, `scheme: Coere-Device`). Pairing uses a code printed by `coere-server serve` or `coere-server pair` that works once for 10 minutes. None of this is available to apps. <!-- src: apps/server/src/guards/auth.ts:8-61 --> <!-- src: packages/api/src/tokens.ts:13-15 --> <!-- src: packages/api/openapi.json:13458-13462 --> <!-- src: apps/server/src/cli/serve.ts:16-27 -->
