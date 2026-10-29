Every route below is one row of the route table in `packages/api/src/openapi/` and one operation (`operationId`) of `packages/api/openapi.json`. 46 operations in all: 32 an app may call (28 with an app token, 4 with no auth), and 14 internal. `/mcp` sits beside the table. <!-- src: packages/api/src/openapi/routes.ts:12-27 -->

Parameter and error tables in this section are generated from `packages/api/openapi.json`. Patterns are written as regular expressions. "Memory routes" (marked *memory*) answer `503 not_synced` before any memory has reached the server, once auth, scope and parameters pass, and carry `Coere-Synced-At` and `Coere-Memory-Version` on success. <!-- src: packages/api/src/openapi/route-spec.ts:42-43 -->

### Summary

| Method | Path | operationId | Auth | Scope | Notes |
|---|---|---|---|---|---|
| GET | `/v1/health` | `health` | none | | |
| GET | `/v1/openapi.json` | `openapi` | none | | |
| GET | `/v1/me` | `me` | token | any | |
| GET | `/v1/profile` | `profile` | token | `memory:read` | memory |
| GET | `/v1/style` | `style` | token | `memory:read` | memory |
| GET | `/v1/people/{id}/identity` | `people.identity` | token | `memory:read` | memory |
| GET | `/v1/core-pack` | `corePack` | token | `memory:read` | memory |
| GET | `/v1/sections` | `sections.list` | token | `memory:read` | memory |
| GET | `/v1/tree` | `tree` | token | `memory:read` | memory |
| GET | `/v1/nodes/{id}` | `nodes.get` | token | `memory:read` | memory |
| GET | `/v1/nodes/{id}/children` | `nodes.children` | token | `memory:read` | memory, paged |
| GET | `/v1/nodes/{id}/facts` | `nodes.facts` | token | `memory:read` | memory, paged |
| GET | `/v1/resolve` | `resolve` | token | `memory:read` | memory |
| GET | `/v1/facts` | `facts.list` | token | `memory:read` | memory, paged |
| GET | `/v1/facts/{id}` | `facts.get` | token | `memory:read` | memory |
| GET | `/v1/entities` | `entities.list` | token | `memory:read` | memory, paged |
| GET | `/v1/entities/{id}/related` | `entities.related` | token | `memory:read` | memory |
| GET | `/v1/upcoming` | `upcoming` | token | `memory:read` | memory, paged |
| GET | `/v1/search` | `search` | token | `memory:read` | memory |
| GET | `/v1/sources/{id}` | `sources.get` | token | `memory:read` | memory |
| POST | `/v1/context/draft` | `context.draft` | token | `memory:read` | memory |
| POST | `/v1/context/draft/sent` | `context.sent` | token | `memory:read` | |
| POST | `/v1/context` | `context` | token | `memory:read` | memory |
| GET | `/v1/changes` | `changes` | token | `memory:read` | memory |
| GET | `/v1/export.coere` | `export` | token | `memory:export` | memory |
| POST | `/v1/suggestions` | `suggestions.create` | token | `memory:suggest` | `Idempotency-Key` required |
| GET | `/v1/suggestions` | `suggestions.list` | token | `memory:suggest` | paged |
| GET | `/v1/suggestions/{id}` | `suggestions.get` | token | `memory:suggest` | |
| POST | `/v1/connect` | `connect.start` | none | | |
| POST | `/v1/connect/{id}/token` | `connect.token` | none | | |
| GET | `/v1/clients` | `clients.list` | token | `memory:read` | memory, paged, Coere for Teams |
| GET | `/v1/clients/{id}/card` | `clients.card` | token | `memory:read` | memory, Coere for Teams |

<!-- src: packages/api/src/openapi/routes-base.ts:5-33 --> <!-- src: packages/api/src/openapi/routes-tree.ts:16-98 --> <!-- src: packages/api/src/openapi/routes-find.ts:16-122 --> <!-- src: packages/api/src/openapi/routes-suggest.ts:9-41 --> <!-- src: packages/api/src/openapi/routes-context.ts:17-98 --> <!-- src: packages/api/src/openapi/routes-teams.ts:14-34 -->

The 14 internal routes are listed in [5.10](#510-internal-routes).

---

### 5.1 Server

#### GET /v1/health

Whether the server is up, its versions, and whether a device is paired. Needs no token and names nothing about memory. <!-- src: packages/api/src/openapi/routes-base.ts:6-13 --> <!-- src: apps/server/src/routes/health.ts:5-20 -->

**Parameters**: none.

**Success**: `200`: `application/json` `Health`. Headers: `Coere-Request-Id`, `Coere-Now`.

**Errors** (status and `code`, as the OpenAPI document lists them): `403` `forbidden_host`, `forbidden_origin`; `500` `internal`.

Example answer (a recorded contract case): <!-- src: tests/contract/cases/health.json -->

```json
{ "ok": true, "server": "0.3.0", "api": "1.0", "format": "1.0", "paired": true }
```

#### GET /v1/openapi.json

This document, `packages/api/openapi.json`, as `application/json`. <!-- src: packages/api/src/openapi/routes-base.ts:15-22 --> <!-- src: apps/server/src/routes/openapi.ts:12 -->

**Parameters**: none.

**Success**: `200`: `application/json` object. Headers: `Coere-Request-Id`, `Coere-Now`.

**Errors** (status and `code`, as the OpenAPI document lists them): `403` `forbidden_host`, `forbidden_origin`; `500` `internal`.

#### GET /v1/me

The token, the memory it reads and the server. Works for any token whatever its scopes, so an app can tell the person why a call would fail before making it. Counts are of what the token may see. <!-- src: packages/api/src/openapi/routes-base.ts:24-31 --> <!-- src: apps/server/src/routes/me.ts:8-46 -->

**Parameters**: none.

**Success**: `200`: `application/json` `Me`. Headers: `Coere-Request-Id`, `Coere-Now`.

**Errors** (status and `code`, as the OpenAPI document lists them): `401` `unauthorized`; `403` `forbidden_host`, `forbidden_origin`; `429` `rate_limited`; `500` `internal`.

Example answer: <!-- src: tests/contract/cases/me.json -->

```json
{
  "token": {
    "id": "tok_01JAFAKE000000000000000002",
    "name": "fake-reader",
    "scopes": ["memory:read"],
    "sections": null,
    "createdAt": "2026-10-14T12:00:00Z",
    "lastUsedAt": null,
    "expiresAt": null
  },
  "memory": {
    "library": "fa4e0000000000000000000000000001",
    "demo": false,
    "syncedAt": "2026-10-15T16:00:00Z",
    "version": "fa4e000000000001.4127",
    "timeZone": "America/Los_Angeles",
    "counts": { "sections": 11, "entities": 23, "facts": 27, "relations": 7 }
  },
  "server": { "version": "0.3.0", "api": "1.0", "format": "1.0" }
}
```

---

### 5.2 The person

#### GET /v1/profile

Who the person is: their self entity, time zone, the server's `now`, current facts by section, style, and up to 10 facts due soon. <!-- src: packages/api/src/openapi/routes-tree.ts:17-25 --> <!-- src: packages/api/openapi.json:10870-10931 -->

**Parameters**: none. A query parameter of any name is refused with `400 bad_request`. <!-- src: apps/server/src/views/context.ts:95 -->

**Success**: `200`: `application/json` `PersonProfile`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

Answer: [`PersonProfile`](#personprofile).

#### GET /v1/style

How the person writes and wants answers: facts grouped as `writing`, `tone` and `answers`, plus style profile snapshots. <!-- src: packages/api/src/openapi/routes-tree.ts:26-35 --> <!-- src: packages/api/openapi.json:10834-10869 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `history` | query | boolean | no | `false` |  | Also superseded and retired records. |

**Success**: `200`: `application/json` `StyleSummary`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

Answer: [`StyleSummary`](#stylesummary).

#### GET /v1/people/{id}/identity

A person's identity block; pass `me` as the id for the person. `fields` holds role, organization, location, time zone and pronouns (the current fact of each, or `null`). `values` holds contact values (email, phone, link) and is empty without `memory:identity`. Only the self and person nodes have an identity: any other id, such as a group's, answers `404 not_found`. <!-- src: packages/api/src/openapi/routes-context.ts:38-47 --> <!-- src: docs/design/v3-context-api.md:1154-1163 --> <!-- src: packages/client/src/resources/people.ts:7-15 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `id` | path | string | yes |  | min length 1, max length 400 | A record id, percent encoded: a source id may hold a slash. |

**Success**: `200`: `application/json` `Identity`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `404` `not_found`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

Example answer (token with `memory:read` and `memory:identity`; `path` shortened): <!-- src: tests/contract/cases/identity-of-fake-theo-with-contact-details.json -->

```json
{
  "person": {
    "id": "ent_0199a5c1-8a00-7000-8000-000000000022",
    "name": "Fake Theo",
    "path": [
      { "id": "sec_people", "name": "People", "kind": "section" },
      { "id": "ent_0199a5c1-8a00-7000-8000-000000000020", "name": "Fake Climbing Crew", "kind": "group" },
      { "id": "ent_0199a5c1-8a00-7000-8000-000000000022", "name": "Fake Theo", "kind": "person" }
    ]
  },
  "fields": {
    "role": { "fact": "fact_0199a5c1-8a00-7000-8000-000000000154", "value": "Fake Theo works as a route setter at the Fake Boulder Gym." },
    "organization": null, "location": null, "timeZone": null, "pronouns": null
  },
  "values": [
    { "fact": "fact_0199a5c1-8a00-7000-8000-000000000150", "key": "email", "kind": "email", "label": null,
      "value": "theo@fakeclimb.invalid", "sources": ["claude"], "at": "2026-10-13T16:00:00Z" }
  ]
}
```

#### GET /v1/core-pack

The core pack a chat's first message gets, before any tracker: its lines by part (`identity`, `answers`, `style`, `pinned`, `company`), the `about` line, and a token count. <!-- src: packages/api/src/openapi/routes-context.ts:48-56 --> <!-- src: packages/api/openapi.json:13067-13113 -->

**Parameters**: none. A query parameter of any name is refused with `400 bad_request`. <!-- src: apps/server/src/views/context.ts:95 -->

**Success**: `200`: `application/json` `CorePackView`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

Example answer (two of five lines shown): <!-- src: tests/contract/cases/core-pack.json -->

```json
{
  "lines": [
    { "record": "fact_0199a5c1-8a00-7000-8000-000000000112", "part": "answers", "text": "Fake Sam wants short answers with the code first." },
    { "record": "core_0b7f89ef4fca9889", "part": "pinned", "text": "Fake Sam likes each answer to end with one next step." }
  ],
  "about": "I am Fake Sam.",
  "tokens": 60
}
```

---

### 5.3 The tree

#### GET /v1/sections

Every section in order, with counts (`entities`, `facts`, `due`) and urgency. Not paged. <!-- src: packages/api/src/openapi/routes-tree.ts:36-44 --> <!-- src: packages/api/openapi.json:10932-10986 -->

**Parameters**: none. A query parameter of any name is refused with `400 bad_request`. <!-- src: apps/server/src/views/context.ts:95 -->

**Success**: `200`: `application/json` `SectionList`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

#### GET /v1/tree

The tree from a root, to a depth, capped at 500 nodes breadth first. With no `root` it starts at a node with id `memory` and kind `memory`, whose children are the sections; do not ask `nodes.get` about it. A node whose children were cut says how many in `more`. A root the token may not see answers 404. <!-- src: packages/api/src/openapi/routes-tree.ts:45-54 --> <!-- src: apps/server/src/views/tree.ts:10-21 --> <!-- src: apps/server/src/routes/tree.ts:6-17 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `root` | query | string | no |  | min length 1, max length 400 | A section or entity id to start from. Every section when left out. |
| `depth` | query | integer | no | `2` | min 1, max 4 | How many levels to go down. |
| `history` | query | boolean | no | `false` |  | Also superseded and retired records. |

**Success**: `200`: `application/json` `Tree`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

#### GET /v1/nodes/{id}

A section or entity with its first page of children, facts filed there, facts about it filed elsewhere (`about`), up to 50 relations, and counts. A section id works wherever a node id does. <!-- src: packages/api/src/openapi/routes-tree.ts:55-65 --> <!-- src: packages/api/openapi.json:11197-11264 --> <!-- src: packages/client/src/resources/nodes.ts:5 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `id` | path | string | yes |  | min length 1, max length 400 | A record id, percent encoded: a source id may hold a slash. |
| `history` | query | boolean | no | `false` |  | Also superseded and retired records. |

**Success**: `200`: `application/json` `NodeDetail`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `404` `not_found`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

#### GET /v1/nodes/{id}/children

A page of a node's children (entities). <!-- src: packages/api/src/openapi/routes-tree.ts:66-76 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `id` | path | string | yes |  | min length 1, max length 400 | A record id, percent encoded: a source id may hold a slash. |
| `limit` | query | integer | no | `50` | min 1, max 200 | At most this many items. |
| `cursor` | query | string | no |  | min length 1, max length 4096 | The nextCursor of the page before. |

**Success**: `200`: `application/json` `EntityPage`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `404` `not_found`; `409` `cursor_stale`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

Example (`?limit=2` on `sec_people`; one item shown and its fields shortened): <!-- src: tests/contract/cases/node-children-first-page-of-two.json -->

```json
{
  "data": [
    { "t": "entity", "id": "ent_0199a5c1-8a00-7000-8000-000000000020", "section": "sec_people",
      "kind": "group", "name": "Fake Climbing Crew", "importance": 3, "status": "active", "origin": "extracted",
      "recorded": { "...": "..." }, "evidence": ["..."], "by": "act_0199a5c1-8a00-7000-8000-0000000000a1", "view": { "...": "..." } }
  ],
  "hasMore": true,
  "nextCursor": "pNdhcFCZVWQ7BR0tt4tUjkz42AnifKAg..."
}
```

#### GET /v1/nodes/{id}/facts

A page of the facts filed at a node, or with `about=true` the facts about it filed elsewhere. <!-- src: packages/api/src/openapi/routes-tree.ts:77-87 --> <!-- src: packages/api/src/openapi/param-docs.ts:15 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `id` | path | string | yes |  | min length 1, max length 400 | A record id, percent encoded: a source id may hold a slash. |
| `status` | query | `"current"` \| `"history"` \| `"all"` | no | `"current"` |  | Which records to keep, by status. |
| `kind` | query | `"attribute"` \| `"preference"` \| `"style"` \| `"goal"` \| `"task"` \| `"event"` \| `"decision"` \| `"constraint"` \| `"instruction"` \| `"note"` | no |  |  | A fact kind to keep. |
| `key` | query | string | no |  | pattern `^[a-z][a-z0-9_]{0,40}(\.[a-z][a-z0-9_]{0,40}){0,3}$` | A fact key, such as due or writing.tone. |
| `about` | query | boolean | no | `false` |  | false: facts filed here. true: facts about this node, filed elsewhere. |
| `limit` | query | integer | no | `50` | min 1, max 200 | At most this many items. |
| `cursor` | query | string | no |  | min length 1, max length 4096 | The nextCursor of the page before. |

**Success**: `200`: `application/json` `FactPage`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `404` `not_found`; `409` `cursor_stale`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

#### GET /v1/resolve

The node a path of names leads to, section first, such as `?segment=School&segment=Fake%20CS%20101`. Aliases count as names. <!-- src: packages/api/src/openapi/routes-tree.ts:88-97 --> <!-- src: tests/contract/cases/resolve-through-an-alias.json -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `segment` | query | array of string | yes |  | min items 1, max items 6, each: min length 1, max length 200 | One name of the path, section first. Repeat it for each level. |

**Success**: `200`: `application/json` `Resolved`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `404` `path_not_found`; `409` `ambiguous_path`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

`404 path_not_found` carries `matched`, the steps that did resolve; `409 ambiguous_path` carries `candidates`, every node that matched: <!-- src: packages/api/src/problems.ts:103-106 --> <!-- src: tests/contract/cases/resolve-a-name-two-things-share.json -->

```json
{
  "type": "https://coere.invalid/problems/ambiguous_path",
  "title": "More than one node matches this path.",
  "status": 409,
  "code": "ambiguous_path",
  "candidates": [
    { "id": "ent_0199a5c1-8a00-7000-8000-000000000024", "name": "Fake Alex", "kind": "person" },
    { "id": "ent_0199a5c1-8a00-7000-8000-000000000025", "name": "Fake Alex", "kind": "person" }
  ]
}
```

---

### 5.4 Finding memory

#### GET /v1/facts

A page of facts by subject, place, kind, key, status or due time. <!-- src: packages/api/src/openapi/routes-find.ts:17-26 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `subject` | query | string | no |  | min length 1, max length 400 | Facts about this entity. |
| `under` | query | string | no |  | min length 1, max length 400 | Facts filed under this section or entity. |
| `section` | query | string | no |  | pattern `^[a-z0-9_]{1,40}$` | A section key, such as plans. |
| `kind` | query | `"attribute"` \| `"preference"` \| `"style"` \| `"goal"` \| `"task"` \| `"event"` \| `"decision"` \| `"constraint"` \| `"instruction"` \| `"note"` | no |  |  | A fact kind to keep. |
| `key` | query | string | no |  | pattern `^[a-z][a-z0-9_]{0,40}(\.[a-z][a-z0-9_]{0,40}){0,3}$` | A fact key, such as due or writing.tone. |
| `status` | query | `"current"` \| `"history"` \| `"all"` | no | `"current"` |  | Which records to keep, by status. |
| `dueBefore` | query | string (date `YYYY-MM-DD`, or date-time with offset) | no |  |  | Facts due before this day or instant. |
| `minImportance` | query | integer | no |  | min 1, max 5 | Facts at least this important, 1 to 5. |
| `pinned` | query | boolean | no |  |  | Only pinned facts, or only unpinned ones. |
| `limit` | query | integer | no | `50` | min 1, max 200 | At most this many items. |
| `cursor` | query | string | no |  | min length 1, max length 4096 | The nextCursor of the page before. |

**Success**: `200`: `application/json` `FactPage`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `409` `cursor_stale`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

Example (`?dueBefore=2026-10-21&subject=ent_...041`; `evidence`, `recorded` and `specifics` as stored): <!-- src: tests/contract/cases/facts-due-before-a-day.json -->

```json
{
  "data": [
    {
      "t": "fact",
      "id": "fact_0199a5c1-8a00-7000-8000-000000000107",
      "importance": 4,
      "status": "active",
      "origin": "extracted",
      "kind": "task",
      "key": "due",
      "text": "Project 1 for Fake CS 101 is due Oct 20 at 11:59pm.",
      "basis": "user_stated",
      "urgency": { "due": { "at": "2026-10-20T23:59", "tz": "America/Los_Angeles" } },
      "recorded": { "first": "2026-10-08T17:03:00Z", "last": "2026-10-08T17:03:00Z" },
      "evidence": [
        { "src": "claude:fake-school#m2", "role": "user", "at": "2026-10-08T17:03:00Z",
          "msgSha256": "e6f005f70d6fdec1fcf03f7d2eee83ea81aa475132df04bfeae66e10c7d994ec" }
      ],
      "by": "act_0199a5c1-8a00-7000-8000-0000000000a2",
      "subject": "ent_0199a5c1-8a00-7000-8000-000000000041",
      "under": "ent_0199a5c1-8a00-7000-8000-000000000041",
      "specifics": [
        { "type": "datetime", "text": "Oct 20 at 11:59pm", "ev": 0,
          "value": { "type": "when", "when": { "at": "2026-10-20T23:59", "tz": "America/Los_Angeles" } } }
      ],
      "view": {
        "path": [
          { "id": "sec_school", "name": "School", "kind": "section" },
          { "id": "ent_0199a5c1-8a00-7000-8000-000000000040", "name": "Fake CS 101", "kind": "course" },
          { "id": "ent_0199a5c1-8a00-7000-8000-000000000041", "name": "Project 1", "kind": "project" }
        ],
        "current": true,
        "urgency": { "level": "upcoming", "at": "2026-10-21T06:59:59.999Z", "label": "Due Oct 20" },
        "subject": { "id": "ent_0199a5c1-8a00-7000-8000-000000000041", "name": "Project 1", "kind": "project" }
      }
    }
  ],
  "hasMore": false,
  "nextCursor": null
}
```

#### GET /v1/facts/{id}

One fact with its `history` (earlier versions) and `sources` (the chats it came from: id, platform, and title and URL only with `memory:evidence`). <!-- src: packages/api/src/openapi/routes-find.ts:27-36 --> <!-- src: packages/api/openapi.json:11265-11302 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `id` | path | string | yes |  | min length 1, max length 400 | A record id, percent encoded: a source id may hold a slash. |

**Success**: `200`: `application/json` `FactDetail`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `404` `not_found`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

#### GET /v1/entities

A page of entities by kind, name or alias, and section. `q` matches names and aliases only; use `search` for words in facts. <!-- src: packages/api/src/openapi/routes-find.ts:37-46 --> <!-- src: packages/api/src/openapi/param-docs.ts:38 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `kind` | query | array of `"self"` \| `"person"` \| `"organization"` \| `"group"` \| `"project"` \| `"course"` \| `"task"` \| `"event"` \| `"place"` \| `"product"` \| `"document"` \| `"topic"` \| `"folder"` \| `"other"` or string | no |  | min items 1, max items 16, each: pattern `^x-[a-z0-9-]{1,32}$` | An entity kind to keep. Repeat it for more than one. |
| `q` | query | string | no |  | min length 1, max length 200 | Words to find in names and aliases only. |
| `section` | query | string | no |  | pattern `^[a-z0-9_]{1,40}$` | A section key, such as plans. |
| `limit` | query | integer | no | `50` | min 1, max 200 | At most this many items. |
| `cursor` | query | string | no |  | min length 1, max length 4096 | The nextCursor of the page before. |

**Success**: `200`: `application/json` `EntityPage`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `409` `cursor_stale`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

#### GET /v1/entities/{id}/related

The current relations of an entity, one or two hops out, each with its direction (`out` or `in`) and the other end. Answers `{ "data": [...] }`, not paged. <!-- src: packages/api/src/openapi/routes-find.ts:47-57 --> <!-- src: packages/api/openapi.json:11135-11196 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `id` | path | string | yes |  | min length 1, max length 400 | A record id, percent encoded: a source id may hold a slash. |
| `type` | query | string | no |  | min length 1, max length 64 | A relation type to keep. |
| `direction` | query | `"out"` \| `"in"` \| `"both"` | no | `"both"` |  | Relations from this entity, to it, or both. |
| `depth` | query | integer | no | `1` | min 1, max 2 | How many levels to go down. |

**Success**: `200`: `application/json` `RelatedList`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `404` `not_found`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

#### GET /v1/upcoming

Deadlines and events by due or start time, from `from` (now when left out) to `until`, at most 366 days ahead of the server clock. With `overdue` (the default) open deadlines already past come first, stale ones included. Done and cancelled tasks are not upcoming. `until` more than 366 days ahead is `400` with `param: "until"`; `from` after `until` is `400` with `param: "from"`. <!-- src: packages/api/src/openapi/routes-find.ts:58-67 --> <!-- src: apps/server/src/routes/upcoming.ts:9-51 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `until` | query | string (date `YYYY-MM-DD`, or date-time with offset) | yes |  |  | The last day or instant to look at, at most 366 days ahead. |
| `from` | query | string (date `YYYY-MM-DD`, or date-time with offset) | no |  |  | The first day or instant to look at. Now when left out. |
| `overdue` | query | boolean | no | `true` |  | Also what is already overdue. |
| `limit` | query | integer | no | `50` | min 1, max 200 | At most this many items. |
| `cursor` | query | string | no |  | min length 1, max length 4096 | The nextCursor of the page before. |

**Success**: `200`: `application/json` `FactPage`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `409` `cursor_stale`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

#### GET /v1/search

Keyword search over memory, the same as the Memory page. Each hit is a node with up to 3 matching facts, scores and highlight ranges (`[start, end]` pairs). `open` is a node's detail when the query names one, else `null`. There is no total count, since a count would tell a token what it cannot read. `capped` is a boolean passed through from the shared memory search; the API code does not document its meaning. <!-- src: packages/api/src/responses/reads.ts:153-163 --> <!-- src: apps/server/src/routes/search.ts:66 --> <!-- src: packages/api/src/openapi/routes-find.ts:68-77 --> <!-- src: packages/api/openapi.json:11541-11715 --> <!-- src: tests/contract/cases/search-a-name-opens-the-node.json -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `q` | query | string | yes |  | min length 1, max length 500 | Words to find. |
| `kinds` | query | array of `"fact"` \| `"entity"` | no |  | min items 1, max items 2 | fact, entity, or both. Repeat it for both. |
| `section` | query | string | no |  | pattern `^[a-z0-9_]{1,40}$` | A section key, such as plans. |
| `history` | query | boolean | no | `false` |  | Also superseded and retired records. |
| `asOf` | query | string (date `YYYY-MM-DD`, or date-time with offset) | no |  |  | Search memory as it stood on this day or instant. |
| `limit` | query | integer | no | `20` | min 1, max 50 | At most this many items. |

**Success**: `200`: `application/json` `SearchResult`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

#### GET /v1/sources/{id}

A chat that memories cite: its platform, times and message count, never its text. `title` and `url` come only with `memory:evidence`. A source no visible memory cites answers 404. <!-- src: packages/api/src/openapi/routes-find.ts:88-97 --> <!-- src: packages/client/src/resources/sources.ts:4 --> <!-- src: tests/contract/cases/source-no-memory-cites.json -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `id` | path | string | yes |  | min length 1, max length 400 | A record id, percent encoded: a source id may hold a slash. |

**Success**: `200`: `application/json` `ApiSource`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `404` `not_found`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

Example (without `memory:evidence`): <!-- src: tests/contract/cases/source-without-the-evidence-scope.json -->

```json
{
  "t": "source",
  "id": "chatgpt:fake-climb",
  "platform": "chatgpt",
  "createdAt": "2026-10-03T16:00:00Z",
  "updatedAt": "2026-10-03T16:48:00Z",
  "capturedAt": "2026-10-03T16:48:00Z",
  "messages": 17,
  "convSha256": "bd452114dc1e41bb8f02da8e02a2a6b1a322ddb53a324d1afbb3e4a3684fc2ad",
  "view": { "path": [], "current": true, "urgency": { "level": "none", "at": null, "label": null } }
}
```

---

### 5.5 Context

#### POST /v1/context/draft

What Coere's silent import would add in front of what a person typed. Options left out take the person's own settings, so an app that sends only `draft` and `chat` gets what the person's own chats get. The draft is read to choose and dropped: it travels only in this body and no answer, log, receipt or problem repeats it. <!-- src: packages/api/src/openapi/routes-context.ts:17-26 --> <!-- src: packages/api/src/requests/context-draft.ts:6-31 --> <!-- src: docs/design/v3-context-api.md:424-432 -->

How recording works: <!-- src: apps/server/src/views/draft-context.ts:96-112 --> <!-- src: packages/client/README.md:31-44 -->

- **No `chat`**: every call is a fresh chat and nothing is recorded.
- **`chat` given** (and `record` absent or `"now"`): the items count as sent when the answer comes back (`recorded: true`), so the next message in that chat gets only what changed. Use the same `chat` for every message of one conversation.
- **`chat` and `record: "later"`**: nothing is recorded yet; the answer holds a `receipt`. After your app really sends, call [`POST /v1/context/draft/sent`](#post-v1contextdraftsent). A receipt works once and lasts ten minutes.
- `firstMessage: true` with a `chat` starts that chat over, so it gets the core pack whole. <!-- src: apps/server/src/views/draft-context.ts:86 -->
- Each `target` keeps its own trackers per app. <!-- src: packages/api/src/requests/context-draft.ts:39 -->

Extra rules beyond the schema: `record` without `chat` is `400` (`param: "record"`); `sensitive: true` without `memory:sensitive` is `403 forbidden_scope` (`scope: "memory:sensitive"`); a `sections` entry outside the token's own sections is `400` (`param: "sections"`). <!-- src: packages/api/src/requests/context-draft.ts:57-61 --> <!-- src: apps/server/src/views/draft-context.ts:45-53 --> This route has its own rate limit, 120 calls a minute per token (see [Limits](#9-limits)). A Coere for Teams library on a server built without the Teams edition answers `501 not_implemented`. <!-- src: apps/server/src/views/draft-rate.ts:4-11 --> <!-- src: apps/server/src/views/draft-context.ts:46-47 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `draft` | body | string | yes |  | min length 1, max length 20000, pattern `\S` | What the person typed. Text with no word in it asks for nothing. Read to choose, then dropped; never stored or logged. |
| `chat` | body | string | no |  | pattern `^[A-Za-z0-9._:-]{1,200}$` | Your conversation id. Absent: every call is a fresh chat and nothing is recorded. |
| `target` | body | string | no |  | pattern `^[A-Za-z0-9._:-]{1,64}$` | The AI or part of your app the message goes to; it keeps trackers of its own. |
| `firstMessage` | body | boolean | no |  |  | true: a new chat, which gets the core pack whole. false: no core pack this time. Absent: the trackers decide. |
| `budget` | body | integer | no |  | min 100, max 8000 | Token budget for the answer. Absent: the person's own setting. |
| `sections` | body | array of string | no |  | min items 1, max items 50, each: pattern `^[a-z0-9_]{1,40}$` | Narrows the token's own sections; never widens them. A section the token may not read is 400 with param sections. |
| `standing` | body | boolean | no |  |  | The core pack on or off. Absent: follows the person's "Add my standing instructions" setting. |
| `sensitive` | body | boolean | no | `false` |  | Include sensitive memories. Needs the memory:sensitive scope (else 403 forbidden_scope). |
| `skipRecent` | body | boolean | no | `false` |  | Skip what this AI got in the last 7 days, for this app. |
| `record` | body | `"now"` \| `"later"` | no |  |  | "now" counts the items as sent at once (the default when chat is given); "later" returns a receipt for /v1/context/draft/sent. Requires chat. |
| `also` | body | boolean | no | `false` |  | Also return the matches under the gates (the also array). |

**Success**: `200`: `application/json` `DraftContext`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `413` `payload_too_large`; `415` `unsupported_media_type`; `429` `rate_limited`; `500` `internal`; `501` `not_implemented`; `503` `not_synced`.

Also possible, though the OpenAPI document does not list it for this route: `409 idempotency_conflict` when an `Idempotency-Key` is reused with another body. <!-- src: apps/server/src/views/draft-context.ts:142 -->

Answer fields ([`DraftContext`](#draftcontext)): `memoryVersion`, `chat`, `first` (whether this was a chat's first message), `client` (Teams only), `items` (what goes), `also` (matches under the gates, only with `also: true`), `topic`, `fromChats`, `sources`, `tokens`, `chars`, `block` (the text to prepend, byte for byte what v2 writes), `receipt` (only with `record: "later"`), `recorded`, and `vectors` (`"loading"` until the embedding model has loaded at server start, then `"ready"`). Each item has `id`, `kind` (`core`, `client`, `node`, `chat`), `path`, `reason`, `via`, `why`, `changedOnly`, `tokens`, `version`, `lines`, `sources`, `fromChats` and, for a chat item, `chat`. <!-- src: packages/api/openapi.json:12435-12831 --> <!-- src: docs/design/v3-context-api.md:385 -->

Example. Request: <!-- src: tests/contract/cases/context-for-a-draft-that-names-the-crew.json -->

```json
{ "draft": "Can you help me plan dinner with the Fake Climbing Crew on Friday?", "chat": "conv_81", "target": "claude" }
```

Answer (the `items` array shortened to one item and one line each; the full answer has three items):

```json
{
  "memoryVersion": "fa4e000000000001.4127",
  "chat": "conv_81",
  "first": true,
  "client": null,
  "items": [
    {
      "id": "core",
      "kind": "core",
      "path": ["About me"],
      "reason": "standing",
      "via": null,
      "why": "Goes with the first message of every chat",
      "changedOnly": false,
      "tokens": 65,
      "version": "9b82f5ec9cd47f42",
      "lines": [
        { "record": "core:about", "text": "I am Fake Sam.", "platform": null, "at": null, "date": null, "chats": 0 }
      ],
      "sources": [],
      "fromChats": 3
    },
    {
      "id": "ent_0199a5c1-8a00-7000-8000-000000000021",
      "kind": "node",
      "path": ["People", "Fake Climbing Crew", "Fake Maya"],
      "reason": "name",
      "via": { "id": "ent_0199a5c1-8a00-7000-8000-000000000020", "path": ["People", "Fake Climbing Crew"] },
      "why": "Comes with Fake Climbing Crew",
      "changedOnly": false,
      "tokens": 28,
      "version": "c4490b8dad7753b7",
      "lines": [
        { "record": "fact_0199a5c1-8a00-7000-8000-000000000120", "text": "Fake Maya does not eat shellfish.",
          "platform": "chatgpt", "at": "2026-10-03T16:09:00Z", "date": "Oct 3, 2026", "chats": 1 }
      ],
      "sources": ["chatgpt"],
      "fromChats": 1
    }
  ],
  "also": [],
  "topic": ["About me", "Fake Maya", "Fake Theo"],
  "fromChats": 4,
  "sources": ["claude", "chatgpt"],
  "tokens": 204,
  "chars": 734,
  "block": "[Context from Coere, my saved memory. Use it if it helps.]\nAbout me\n- I am Fake Sam.\n- Fake Sam wants short answers with the code first.\n...\nPeople / Fake Climbing Crew / Fake Maya\n- Fake Maya does not eat shellfish. (ChatGPT, Oct 3, 2026)\n...\n[End of context from Coere]\n\n",
  "receipt": null,
  "recorded": true,
  "vectors": "loading"
}
```

The same request with `"record": "later"` answers `"receipt": "rcp_01M50838M0V1QZNCW0YGSTQWT3"` and `"recorded": false`. <!-- src: tests/contract/cases/context-recorded-after-the-send.json -->

#### POST /v1/context/draft/sent

Count the items of an answer asked with `record: "later"` as sent. Answers how many lines were recorded. Unknown receipt, or another token's: `404 not_found` with `param: "receipt"`. Used already or past its ten minutes: `410 receipt_expired` (an expired receipt is kept a day so it reads as expired). Never retry this call. <!-- src: packages/api/src/openapi/routes-context.ts:27-37 --> <!-- src: apps/server/src/routes/context-draft.ts:28-37 --> <!-- src: apps/server/src/trackers/receipts.ts:5-17 --> <!-- src: apps/server/src/trackers/receipts.ts:93-100 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `receipt` | body | string | yes |  | pattern `^rcp_[0-7][0-9A-HJKMNP-TV-Z]{25}$` | The receipt of an answer asked with record "later": rcp_ and 26 letters. |

**Success**: `200`: `application/json` `DraftSent`. Headers: `Coere-Request-Id`, `Coere-Now`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `404` `not_found`; `410` `receipt_expired`; `413` `payload_too_large`; `415` `unsupported_media_type`; `429` `rate_limited`; `500` `internal`.

Example: request `{ "receipt": "rcp_01M50838M0V1QZNCW0YGSTQWT3" }`, answer `{ "recorded": 11 }`. <!-- src: tests/contract/cases/context-sent-with-its-receipt.json -->

#### POST /v1/context

The older (v3.0) context call: memory packed as plain text for a topic, with the person's profile and upcoming items by default. Reads only. <!-- src: packages/api/src/openapi/routes-find.ts:78-87 --> <!-- src: packages/client/README.md:49-50 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `query` | body | string | yes |  | min length 1, max length 500 | The topic to pack memory for. |
| `maxChars` | body | integer | no | `6000` | min 500, max 50000 | Size cap of the packed text, in characters. |
| `sections` | body | array of string | no |  | min items 1, max items 50, each: pattern `^[a-z0-9_]{1,40}$` | Section keys to read from. |
| `include` | body | array of `"profile"` \| `"upcoming"` | no | `["profile", "upcoming"]` | max items 2 | Extra parts to add: the profile and what is upcoming. |

**Success**: `200`: `application/json` `ContextBlock`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `413` `payload_too_large`; `415` `unsupported_media_type`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

Answer: `{ "text": string, "items": [{ "id", "t": "fact" | "entity", "section" }], "truncated": boolean }`. Example (`{ "query": "dinner with my climbing friends" }`, text cut): <!-- src: packages/api/openapi.json:11716-11758 --> <!-- src: tests/contract/cases/context-for-a-dinner-plan.json -->

```text
Memory of Fake Sam. Time zone America/Los_Angeles. Now Thu Oct 15 2026, 10:00 AM.
About
- Fake Sam is vegetarian. (Preferences) [fact_0199a5c1-8a00-7000-8000-000000000102]
...
Relevant
- Fake Theo climbs on Wednesdays. (People / Fake Climbing Crew / Fake Theo) [fact_0199a5c1-8a00-7000-8000-000000000122]
...
Due soon
- Return the Fake Library Book by Oct 13. (Plans and deadlines / Fake Library Book; overdue by 1 day) [fact_0199a5c1-8a00-7000-8000-000000000131]
```

---

### 5.6 Changes and export

#### GET /v1/changes

What changed in the server's copy since a feed position, in the server's own order. A position is `<epoch>.<seq>`; leave `since` out (or empty) to read from the start, and pass the answer's `next` back as `since` to read on. A put shows only when the token may see the record now; a `remove` or `forget` shows with its id and type only. With `records=true` each change carries `record`, the record as the token reads it now, or `null`. A position from replaced memory answers `410 epoch_changed`: read from the start again. A malformed `since` is `400` with `param: "since"`. <!-- src: packages/api/src/openapi/routes-find.ts:98-107 --> <!-- src: apps/server/src/routes/changes.ts:11-63 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `since` | query | string | no |  | max length 1024 | The next value of an earlier answer. The start when left out. |
| `limit` | query | integer | no | `1000` | min 1, max 1000 | At most this many items. |
| `records` | query | boolean | no | `false` |  |  |

**Success**: `200`: `application/json` `ChangeFeed`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `410` `epoch_changed`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

Example (`?limit=5`, one change shown): <!-- src: tests/contract/cases/changes-from-the-start.json -->

```json
{ "data": [{ "seq": 1, "id": "sec_fake_hobbies", "t": "section", "op": "put" }], "next": "fa4e000000000001.5", "epoch": "fa4e000000000001" }
```

#### GET /v1/export.coere

The server's copy as a `.coere` file (`application/vnd.coere.memory+zip`, `Content-Disposition: attachment; filename="memory.coere"`), holding only what the token may read: no held fact, sensitive facts only with `memory:sensitive`, only its sections and the person, and without `memory:evidence` no quote, chat title, link or exemplar. <!-- src: packages/api/src/openapi/routes-find.ts:108-118 --> <!-- src: apps/server/src/routes/export.ts:5-23 --> <!-- src: packages/api/src/openapi/route-spec.ts:20 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `quotes` | query | boolean | no | `true` |  | Keep evidence quotes in the file, when the token may see them. |

**Success**: `200`: `application/vnd.coere.memory+zip` (file). Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

---

### 5.7 Suggestions

The one thing an app may write. A suggestion waits as `pending` until the extension's next sync pass carries it to the Memory page, where the person accepts or dismisses it. A token reads only its own suggestions, newest first; another app's answer 404. <!-- src: packages/api/src/openapi/routes-suggest.ts:5 --> <!-- src: apps/server/src/routes/suggestions.ts:9-16 -->

#### POST /v1/suggestions

File a suggestion. Answers `202`. Rules beyond the schema (also expressed as JSON Schema `allOf` rules in the OpenAPI document): `correct` and `forget` must name the record they are `about`; only an `add` may name a `section`; a `forget` has no `due`; for `add` and `correct`, `text` is one plain line (no control characters). <!-- src: packages/api/src/openapi/routes-suggest.ts:10-20 --> <!-- src: packages/api/src/requests/writes.ts:23-80 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `Idempotency-Key` | header | string | yes |  | min length 1, max length 255, pattern `^[\x21-\x7e]+$` | One key per suggestion, sent again on each retry. The same key with another body is a conflict. |
| `kind` | body | `"add"` \| `"correct"` \| `"forget"` | no | `"add"` |  | add (the default), correct or forget. |
| `text` | body | string | yes |  | min length 1, max length 2000 | The suggestion. For add and correct it must be one plain line (no control characters). |
| `about` | body | string | no |  | min length 1, max length 400 | The record a correct or forget is about. Required for correct and forget. |
| `section` | body | string | no |  | pattern `^[a-z0-9_]{1,40}$` | Section key to file into. Only an add may name a section. |
| `due` | body | object | no |  |  | A time in the person's world (the format's when). Not allowed on a forget. |
| `due.at` | body | string | yes |  | pattern `^[0-9]{4}(-[0-9]{2}(-[0-9]{2}(T[0-9]{2}:[0-9]{2}(:[0-9]{2})?)?)?)?$` | Local date or date time, reduced precision allowed (2026, 2026-10, 2026-10-23, 2026-10-23T20:30). |
| `due.tz` | body | string | no |  | pattern `^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){0,2}$\|^UTC$` | IANA zone, or UTC. Without it the time is floating. |
| `due.approx` | body | `true` | no |  |  | Marks the time as approximate. |
| `importance` | body | integer | no |  | min 1, max 5 | 1 trivia to 5 critical. |
| `note` | body | string | no |  | min length 1, max length 500, pattern `^[^\x00-\x1f\x7f-\x9f]*$` | One plain line for the person, such as where the suggestion came from. |

**Success**: `202`: `application/json` `Suggestion`. Headers: `Coere-Request-Id`, `Coere-Now`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `409` `idempotency_conflict`; `413` `payload_too_large`; `415` `unsupported_media_type`; `429` `rate_limited`; `500` `internal`.

Example. Request (token with `memory:read` and `memory:suggest`, header `Idempotency-Key: fake-key-3`): <!-- src: tests/contract/cases/file-a-suggestion.json -->

```json
{ "text": "Fake Sam wants a fake rest day after the comp.", "section": "plans" }
```

Answer `202`:

```json
{
  "id": "sug_01M50838M08EVTQ4KQWT7GZPTF",
  "kind": "add",
  "status": "pending",
  "createdAt": "2026-10-15T17:00:00.000Z",
  "deliveredAt": null,
  "decidedAt": null,
  "resultIds": []
}
```

#### GET /v1/suggestions

A page of this token's own suggestions. <!-- src: packages/api/src/openapi/routes-suggest.ts:21-30 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `status` | query | `"pending"` \| `"accepted"` \| `"dismissed"` \| `"expired"` | no |  |  | Only suggestions with this status. |
| `limit` | query | integer | no | `50` | min 1, max 200 | At most this many items. |
| `cursor` | query | string | no |  | min length 1, max length 4096 | The nextCursor of the page before. |

**Success**: `200`: `application/json` `SuggestionPage`. Headers: `Coere-Request-Id`, `Coere-Now`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `409` `cursor_stale`; `429` `rate_limited`; `500` `internal`.

#### GET /v1/suggestions/{id}

One of this token's suggestions. `status` is `pending`, `accepted`, `dismissed` or `expired`; `resultIds` names the records an accepted suggestion became. <!-- src: packages/api/src/openapi/routes-suggest.ts:31-40 --> <!-- src: packages/api/src/requests/writes.ts:24 --> <!-- src: packages/api/openapi.json:11959-12020 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `id` | path | string | yes |  | min length 1, max length 400 | A record id, percent encoded: a source id may hold a slash. |

**Success**: `200`: `application/json` `Suggestion`. Headers: `Coere-Request-Id`, `Coere-Now`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `404` `not_found`; `429` `rate_limited`; `500` `internal`.

---

### 5.8 Access requests

See [4.3](#43-getting-a-token) for the whole flow. These two routes take no token; only the Host and Origin checks stand before them. They read the real clock. <!-- src: apps/server/src/routes/connect.ts:9-16 -->

#### POST /v1/connect

Ask the person for access. The Apps page shows the request with its code. Answers `201`. Limited to 10 asks a minute for the whole server. <!-- src: packages/api/src/openapi/routes-context.ts:57-66 --> <!-- src: apps/server/src/auth/connect.ts:28-29 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `name` | body | string | yes |  | min length 1, max length 64, pattern `^[^\x00-\x1f\x7f-\x9f]*$` | What the Allow card calls the app, as in "Allow planner to access Coere memory?". |
| `scopes` | body | array of `"memory:read"` \| `"memory:evidence"` \| `"memory:sensitive"` \| `"memory:suggest"` \| `"memory:export"` \| `"memory:identity"` | yes |  | min items 1, max items 6 | Scopes asked for. The person may untick some before Allow, never add. |
| `sections` | body | array of string | no |  | min items 1, max items 50, each: pattern `^[a-z0-9_]{1,40}$` | Section keys asked for. Left out: every section. |
| `secretSha256` | body | string | yes |  | pattern `^[0-9a-f]{64}$` | Lower case hex SHA-256 of 32 random bytes your app keeps secret. |

**Success**: `201`: `application/json` `ConnectStarted`. Headers: `Coere-Request-Id`, `Coere-Now`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `403` `forbidden_host`, `forbidden_origin`; `413` `payload_too_large`; `415` `unsupported_media_type`; `429` `rate_limited`; `500` `internal`.

Example. Request: <!-- src: tests/contract/cases/connect-asks-for-access.json -->

```json
{ "name": "fake planner", "scopes": ["memory:read", "memory:identity"], "secretSha256": "abababababababababababababababababababababababababababababababab" }
```

Answer `201`: `{ "id": "con_01K7FAKE0000000000000000CN", "code": "QX4M-7KDP", "expiresIn": 600, "pollAfter": 2 }`. The code is 8 Crockford base32 letters in two groups of four. <!-- src: apps/server/src/auth/connect.ts:51-57 --> <!-- src: packages/api/openapi.json:13114-13141 -->

#### POST /v1/connect/{id}/token

Poll an access request: the token once the person allowed it, else `null`. See [4.3](#43-getting-a-token) for every answer. <!-- src: packages/api/src/openapi/routes-context.ts:67-77 --> <!-- src: apps/server/src/auth/connect-poll.ts:24-41 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `id` | path | string | yes |  | min length 1, max length 400 | A record id, percent encoded: a source id may hold a slash. |
| `secret` | body | string | yes |  | pattern `^[A-Za-z0-9_-]{43}$` | The 32 secret bytes themselves, as unpadded base64url (43 characters). |

**Success**: `200`: `application/json` `ConnectPoll`. Headers: `Coere-Request-Id`, `Coere-Now`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `403` `forbidden_host`, `forbidden_origin`, `connect_denied`; `404` `not_found`; `410` `code_expired`; `413` `payload_too_large`; `415` `unsupported_media_type`; `429` `rate_limited`; `500` `internal`.

Note: the OpenAPI document lists `429 rate_limited` for this route, but no code path in the server answers it here (the guard's rate buckets apply only to app tokens and pairing hellos). <!-- src: packages/api/src/openapi/problems-of.ts:22 --> <!-- src: apps/server/src/guards/rate.ts:74-90 -->

---

### 5.9 Coere for Teams: clients

These routes serve a Coere for Teams library. On an ordinary Coere library both answer `404 not_found`, as they do for a client the token may not read. On a server built without the Teams edition, `clients.card` answers `501 not_implemented`. <!-- src: packages/api/src/openapi/routes-teams.ts:4-10 --> <!-- src: apps/server/src/routes/clients.ts:22-25 --> <!-- src: tests/contract/cases/clients-of-a-coere-library.json -->

#### GET /v1/clients

A page of the kept clients this token may read, by name. Each client: `id`, `name`, `key`, `section` (`client_...`), `path`, `domains`. <!-- src: packages/api/src/openapi/routes-teams.ts:14-23 --> <!-- src: packages/api/openapi.json:13317-13355 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `limit` | query | integer | no | `50` | min 1, max 200 | At most this many items. |
| `cursor` | query | string | no |  | min length 1, max length 4096 | The nextCursor of the page before. |

**Success**: `200`: `application/json` `ClientPage`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `404` `not_found`; `409` `cursor_stale`; `429` `rate_limited`; `500` `internal`; `503` `not_synced`.

#### GET /v1/clients/{id}/card

The card a send about this client carries: what it is, its work, contacts, promises and ways. Answers `{ client, item, block }`, where `item` is a `DraftItem` and `block` the card alone as text. <!-- src: packages/api/src/openapi/routes-teams.ts:24-33 --> <!-- src: packages/api/openapi.json:13386-13410 -->

**Parameters**

| Name | In | Type | Required | Default | Constraints | Description |
|---|---|---|---|---|---|---|
| `id` | path | string | yes |  | min length 1, max length 400 | A record id, percent encoded: a source id may hold a slash. |

**Success**: `200`: `application/json` `ClientCard`. Headers: `Coere-Request-Id`, `Coere-Now`, `Coere-Synced-At`, `Coere-Memory-Version`.

**Errors** (status and `code`, as the OpenAPI document lists them): `400` `bad_request`; `401` `unauthorized`; `403` `forbidden_scope`, `forbidden_host`, `forbidden_origin`; `404` `not_found`; `429` `rate_limited`; `500` `internal`; `501` `not_implemented`; `503` `not_synced`.

---

### 5.10 Internal routes

**Internal. Not for apps.** These answer only the paired Coere extension (device signature) or a pairing code, and no app token can be granted them. <!-- src: packages/api/src/scopes.ts:1-7 --> <!-- src: packages/api/src/openapi/routes-device.ts:12 -->

| Method | Path | operationId | Auth | What it does |
|---|---|---|---|---|
| DELETE | `/v1/connect/{id}` | `connect.deny` | device | Deny an app's access request. |
| GET | `/v1/context-log` | `contextLog.list` | device | The newest context calls apps made: ids and counts, never text (`token`, `limit` 1 to 1000, default 100). |
| POST | `/v1/pair/hello` | `pair.hello` | pairing code | Start pairing: the server proves it knows the code. |
| POST | `/v1/pair/finish` | `pair.finish` | pairing code | Finish pairing: the extension proves it knows the code and gets the device secret. |
| GET | `/v1/sync/state` | `sync.state` | device | What the server holds: library, epoch, the last applied change and any snapshot under way. |
| POST | `/v1/sync/push` | `sync.push` | device | Apply one batch of record lines (`application/vnd.coere.sync+jsonl`, `Content-Encoding: gzip`, at most 8 MiB) in one transaction. |
| GET | `/v1/sync/inbox` | `sync.inbox` | device | New suggestions from apps, and the reads apps made of facts. |
| POST | `/v1/sync/inbox/ack` | `sync.inboxAck` | device | What the extension stored and applied, and the person's decisions. |
| POST | `/v1/sync/reset` | `sync.reset` | device | Replace the server's copy with another library, after the person's click. |
| GET | `/v1/tokens` | `tokens.list` | device | Every live app token, without the tokens themselves. |
| POST | `/v1/tokens` | `tokens.create` | device | Make an app token (`name`, `scopes`, `sections`, `expiresInDays`, `connect`). The answer holds it, once. |
| DELETE | `/v1/tokens/{id}` | `tokens.revoke` | device | Revoke an app token at once. |
| GET | `/v1/requests` | `requests.list` | device | The request log: who, which operation, how it went (`actor`, `limit` 1 to 1000, default 200). |
| DELETE | `/v1/devices/self` | `devices.removeSelf` | device | Disconnect: the server forgets this device. |

<!-- src: packages/api/src/openapi/routes-context.ts:78-97 --> <!-- src: packages/api/src/openapi/routes-device.ts:14-132 --> <!-- src: packages/api/src/requests/device.ts:52-72 --> <!-- src: packages/api/src/sync/types.ts:8-13 -->
