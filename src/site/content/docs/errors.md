Every error is an RFC 9457 problem, `Content-Type: application/problem+json`: <!-- src: packages/api/src/problems.ts:85-110 --> <!-- src: apps/server/src/routes/problem.ts:8-14 -->

```json
{
  "type": "https://coere.invalid/problems/forbidden_scope",
  "title": "The token lacks a scope.",
  "status": 403,
  "code": "forbidden_scope",
  "detail": "This route needs memory:suggest.",
  "scope": "memory:suggest"
}
```

<!-- src: tests/contract/cases/suggestion-without-the-suggest-scope.json -->

| Field | When |
|---|---|
| `type` | Always: `https://coere.invalid/problems/<code>`. |
| `title` | Always: the code's fixed title. |
| `status` | Always. |
| `code` | Always: one of the codes below. Branch on this. |
| `detail` | Sometimes, built from counts and parameter names only: `"The parameter <param> is missing or wrong."` (`bad_request` with a param), `"This route needs <scope>."` (`forbidden_scope`). |
| `param` | The parameter at fault, as the schemas spell it (`limit`, `due.at`, `Idempotency-Key`). |
| `scope` | The scope the route needs (`forbidden_scope`). |
| `retryAfter` | Seconds (`rate_limited`). |
| `candidates` | `ambiguous_path`: every node that matched. |
| `matched` | `path_not_found`: how far the path resolved. |
| `ackedSeq`, `demo` | Internal (sync and pairing). |

<!-- src: packages/api/src/problems.ts:4-11 --> <!-- src: packages/api/src/problems.ts:126-169 --> No problem ever holds a query, memory text or a token. <!-- src: packages/api/src/problems.ts:4-9 -->

### 10.1 All codes

| Code | Status | Title | SDK class | Who sees it |
|---|---|---|---|---|
| `bad_request` | 400 | A parameter is missing or wrong. | `BadRequestError` | apps |
| `bad_batch` | 400 | A sync line is not a valid record. | none | internal (sync) |
| `unauthorized` | 401 | The request has no valid token. | `AuthenticationError` | apps |
| `bad_signature` | 401 | The device signature does not match. | none | internal |
| `stale_request` | 401 | The request time is too far from the server clock. | none | internal |
| `replayed` | 401 | The server has seen this request before. | none | internal |
| `forbidden_scope` | 403 | The token lacks a scope. | `PermissionDeniedError` | apps |
| `forbidden_host` | 403 | The Host header names another server. | `PermissionDeniedError` | apps |
| `forbidden_origin` | 403 | Requests from this origin are refused. | `PermissionDeniedError` | apps |
| `connect_denied` | 403 | The person denied this access request. | `ConnectDeniedError` | apps |
| `not_found` | 404 | No memory has this id. | `NotFoundError` | apps |
| `path_not_found` | 404 | No node is at this path. | `NotFoundError` | apps |
| `method_not_allowed` | 405 | This route does not take this method. | `BadRequestError` | apps |
| `seq_gap` | 409 | The batch does not start where the server stopped. | none | internal (sync) |
| `library_mismatch` | 409 | This server holds another library. | none | internal (pairing) |
| `ambiguous_path` | 409 | More than one node matches this path. | `ConflictError` | apps |
| `cursor_stale` | 409 | The memory was replaced since this cursor was made. | `ConflictError` | apps |
| `idempotency_conflict` | 409 | This key was used with another body. | `ConflictError` | apps |
| `epoch_changed` | 410 | The memory was replaced since this feed position. | `EpochChangedError` | apps |
| `code_expired` | 410 | The code is no longer live. | `CodeExpiredError` | apps (access requests), internal (pairing) |
| `receipt_expired` | 410 | The receipt expired or was used. | `ReceiptExpiredError` | apps |
| `payload_too_large` | 413 | The body is too large. | `BadRequestError` | apps |
| `unsupported_media_type` | 415 | This route does not take this media type. | `BadRequestError` | apps |
| `pairing_locked` | 423 | Too many wrong pairing codes. | none | internal |
| `rate_limited` | 429 | Too many requests. | `RateLimitError` | apps |
| `internal` | 500 | The server failed. Its log has the request id. | `InternalServerError` | apps |
| `not_implemented` | 501 | This route is not built yet. | `InternalServerError` | apps (Teams library on a non-Teams build) |
| `not_synced` | 503 | Coere has no memory here yet. | `NotSyncedError` | apps |
| `insufficient_storage` | 507 | The server disk is full. | `InternalServerError` | internal (sync) |

<!-- src: packages/api/src/problems.ts:45-80 --> <!-- src: packages/api/src/problems.ts:13-31 -->

What each status means for an app:

- **400**: fix the request; `param` names the field. <!-- src: packages/api/src/problems.ts:141-142 -->
- **401**: the token is missing, malformed, unknown, revoked or expired. <!-- src: apps/server/src/auth/tokens.ts:99-108 -->
- **403**: `forbidden_scope` names the scope to ask for; `forbidden_host` / `forbidden_origin` mean the request came through a name or a browser page the server does not serve. <!-- src: apps/server/src/guards/host.ts:56-63 --> <!-- src: apps/server/src/guards/origin.ts:42-54 -->
- **404**: the id does not exist **or** the token may not see it; the two are deliberately the same. <!-- src: packages/client/src/errors.ts:70-73 -->
- **409**: `cursor_stale` start paging again; `ambiguous_path` pick one of `candidates`; `idempotency_conflict` use a new key.
- **410**: `epoch_changed` read the change feed from the start; `receipt_expired` ask for the context again; `code_expired` ask for access again. <!-- src: packages/client/src/errors.ts:77-88 -->
- **429**: wait `Retry-After` seconds.
- **503 `not_synced`**: the server is paired but no memory has arrived; retrying soon will not help, since memory arrives when the person syncs. <!-- src: packages/client/src/errors.ts:99-102 --> <!-- src: packages/client/src/retry.ts:12-15 -->
