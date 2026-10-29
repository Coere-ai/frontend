| Limit | Value | Answer when passed |
|---|---|---|
| Requests per app token (every token route and `/mcp`) | 20 a second, bursts of 100 (token bucket), per token, never per IP | `429 rate_limited`, `Retry-After` header and `retryAfter` in the body <!-- src: apps/server/src/guards/rate.ts:5-12 --> <!-- src: apps/server/src/guards/rate.ts:46 --> <!-- src: apps/server/src/guards/rate.ts:74-90 --> |
| `POST /v1/context/draft` | 120 calls a minute per token (bucket of 120, refilled at 2 a second), on top of the above | `429 rate_limited` with `Retry-After` <!-- src: apps/server/src/views/draft-rate.ts:4-11 --> <!-- src: apps/server/src/routes/context-draft.ts:22-24 --> |
| `POST /v1/connect` | 10 asks a minute for the whole server | `429 rate_limited` with `Retry-After` <!-- src: apps/server/src/auth/connect.ts:28-29 --> <!-- src: apps/server/src/auth/connect.ts:107-115 --> |
| Pairing hellos (internal) | 10 a minute for the whole server; pairing locks after 5 wrong codes | `429`, `423 pairing_locked` <!-- src: apps/server/src/guards/rate.ts:47 --> <!-- src: apps/server/README.md:184-185 --> |
| Request body | 64 KiB (also on `/mcp`) | `413 payload_too_large` <!-- src: apps/server/src/guards/size.ts:16 --> <!-- src: apps/server/src/routes/mcp.ts:22 --> |
| `draft` | 1 to 20,000 characters, at least one non-space; only the newest 200 words matter | `400` <!-- src: packages/api/src/requests/context-draft.ts:12-13 --> <!-- src: packages/api/src/requests/context-draft.ts:35 --> |
| Draft `budget` | 100 to 8,000 tokens | `400` <!-- src: packages/api/src/requests/context-draft.ts:14-15 --> |
| Context receipt | 10 minutes, usable once | `410 receipt_expired` <!-- src: apps/server/src/trackers/receipts.ts:15 --> |
| Draft idempotency cache | 10 minutes, in process memory, at most 2,000 answers | <!-- src: apps/server/src/trackers/draft-cache.ts:15-17 --> |
| Suggestion idempotency answer | kept 1 day | <!-- src: apps/server/src/routes/suggestions.ts:30-31 --> |
| Access request | 10 minutes (`expiresIn: 600`), poll every 2 seconds (`pollAfter: 2`) | `410 code_expired` <!-- src: apps/server/src/auth/connect.ts:26-27 --> |
| Page size | `limit` default 50, max 200 (search: default 20, max 50; changes: default and max 1000) | `400` <!-- src: packages/api/src/requests/reads.ts:21-24 --> <!-- src: packages/api/src/requests/reads.ts:92-105 --> <!-- src: packages/api/src/requests/reads.ts:112-118 --> |
| Cursor | 1 to 4096 characters | `400` <!-- src: packages/api/src/cursor.ts:15 --> |
| Tree | 500 nodes, `depth` 1 to 4 (default 2) | cut, with `more` <!-- src: apps/server/src/views/tree.ts:15-20 --> <!-- src: packages/api/src/requests/reads.ts:29-35 --> |
| Upcoming window | `until` at most 366 days ahead | `400` with `param: "until"` <!-- src: apps/server/src/routes/upcoming.ts:17 --> |
| `resolve` path | 1 to 6 segments of 1 to 200 characters | `400` <!-- src: packages/api/src/requests/reads.ts:51-53 --> |
| Record ids in paths and filters | 1 to 400 characters | `400` (`param: "id"`), otherwise unknown ids are `404` <!-- src: packages/api/src/requests/fields.ts:17 --> |
| MCP `get_context` `max_chars` | 500 to 20,000 (REST `maxChars` allows 500 to 50,000) | tool error <!-- src: apps/server/src/mcp/tools.ts:121 --> <!-- src: packages/api/src/requests/writes.ts:12 --> |
| SDK retries | 2 after the first, waits capped at 8 s; a server `Retry-After` over 60 s is ignored | <!-- src: packages/client/src/retry.ts:17-29 --> |

`limits.json` at the repository root is not an API limit: it records measured paste limits of chat sites for the extension. <!-- src: limits.json:1-4 -->
