### 8.1 Connecting

**HTTP**: `/mcp` on the server, with `Authorization: Bearer coere_app_...`. It passes the same guard as every route (Host, Origin, 64 KiB body cap, token, rate limit). Only an app token may use it. The server is `@modelcontextprotocol/server` 2.3.0's `createMcpHandler` in its default stateless legacy mode, serving protocol versions 2025-11-25 and 2026-07-28. <!-- src: apps/server/src/routes/mcp.ts:8-41 --> <!-- src: apps/server/src/guards/route.ts:47 --> <!-- src: apps/server/package.json:22 -->

Claude Code, as the dashboard's token dialog writes it: <!-- src: apps/extension/src/console/apps/model.ts:164-176 -->

```bash
claude mcp add --transport http coere http://127.0.0.1:7337/mcp --header "Authorization: Bearer coere_app_..."
```

**stdio**: `coere-server mcp` speaks MCP on stdin and stdout and reads `COERE_URL` (default `http://127.0.0.1:7337`) and `COERE_TOKEN` from the environment. Its tools call the server's HTTP API, so scopes, section limits and the request log apply. It exits 2 when `COERE_TOKEN` is missing or `COERE_URL` is invalid, 1 when the server refuses the token or cannot be reached, and 0 when the client closes stdin. Messages for the person go to stderr. <!-- src: apps/server/src/cli/mcp.ts:5-62 --> <!-- src: apps/server/src/mcp/stdio.ts:10-26 -->

The config the dashboard writes for a client that launches commands: <!-- src: apps/extension/src/console/apps/model.ts:167-175 -->

```json
{
  "mcpServers": {
    "coere": {
      "command": "node",
      "args": ["/path/to/coere-v2/apps/server/dist/coere-server.mjs", "mcp"],
      "env": { "COERE_URL": "http://127.0.0.1:7337", "COERE_TOKEN": "coere_app_..." }
    }
  }
}
```

The server announces itself as `{ name: "coere", version: "0.3.0" }` with the `tools` and `resources` capabilities. <!-- src: apps/server/src/mcp/factory.ts:31-41 -->

### 8.2 Tools

Registered in this fixed order. Every token gets the first thirteen. `get_client_card` is inserted right after `get_identity` only on a Coere for Teams library. `suggest_memory` comes last, only for a token with `memory:suggest`. <!-- src: apps/server/src/mcp/tools.ts:11-21 --> <!-- src: apps/server/src/mcp/tools.ts:190-196 -->

Read tools carry the annotations `readOnlyHint: true`, `idempotentHint: true`, `openWorldHint: false`. `context_for_draft` and `suggest_memory` carry `readOnlyHint: false`, `destructiveHint: false`, `idempotentHint: false`, `openWorldHint: false`. <!-- src: apps/server/src/mcp/tools.ts:22-29 -->

| # | Tool | Arguments | Calls | Returns |
|---|---|---|---|---|
| 1 | `get_profile` | none | `GET /v1/profile` | `{ self: { id, name }, timeZone, now, about: [{ section, facts: CompactFact[] }], dueSoon: CompactFact[] }` |
| 2 | `search_memory` | `query` string 1 to 500; `section?` string 1 to 64 ("A section key, such as people."); `limit?` integer 1 to 20 | `GET /v1/search` | `{ hits: [{ id, name, kind, path, score, facts: CompactFact[] }], capped }` |
| 3 | `get_node` | `id` string 1 to 200 ("A record id from an earlier answer."); `history?` boolean | `GET /v1/nodes/{id}` | `{ node, children, moreChildren, facts, about, relations, counts }` (nodes as `CompactNode`, `moreChildren` the next cursor or null) |
| 4 | `list_children` | `id`; `cursor?` string 1 to 4096 | `GET /v1/nodes/{id}/children` | `{ children: CompactNode[], nextCursor }` |
| 5 | `resolve_path` | `segments` array of 1 to 6 strings, each 1 to 200 (section first, such as `["School", "CS 101"]`) | `GET /v1/resolve` | `{ node: CompactNode, path }` |
| 6 | `get_fact` | `id` | `GET /v1/facts/{id}` | `CompactFactDetail` |
| 7 | `find_people` | `query` string 1 to 200 | `GET /v1/entities` (kinds `person`, `group`, up to 20), then members of each matched group, then up to 10 facts each | `{ people: [{ id, name, kind, path, memberOf, facts }] }` |
| 8 | `related` | `id`; `type?` string 1 to 64 | `GET /v1/entities/{id}/related` | `{ relations: CompactEdge[] }` |
| 9 | `upcoming` | `until` day `YYYY-MM-DD`; `from?` day | `GET /v1/upcoming` (first page) | `{ facts: CompactFact[], more }` |
| 10 | `get_context` | `query` string 1 to 500; `max_chars?` integer 500 to 20000 | `POST /v1/context` | `{ text, items, truncated }` |
| 11 | `context_for_draft` | `draft` string 1 to 20000 ("What the person typed."); `chat?` string 1 to 200 ("Your conversation id."); `target?` string 1 to 64 ("The AI the message goes to."); `first_message?` boolean; `budget?` integer 100 to 8000 | `POST /v1/context/draft`, with `record: "now"` when `chat` is given | `{ block, items: [{ id, path, why, lines }] }` |
| 12 | `get_identity` | `id` string 1 to 200 ("A person id, or me.") | `GET /v1/people/{id}/identity` | `{ person: { id, name, path }, fields, values: [{ fact, kind, label, value }] }` |
| 13 | `get_style` | none | `GET /v1/style` | `{ writing, tone, answers }` (each `CompactFact[]`) |
| (Teams) | `get_client_card` | `id` string 1 to 200 ("A client id from the clients list.") | `GET /v1/clients/{id}/card` | `{ client: { id, name, path }, block, item: { id, path, why, lines } }` |
| (`memory:suggest`) | `suggest_memory` | `text` string 1 to 2000; `about?` id; `section?` string 1 to 64 ("A section key, such as plans."); `due_date?` day `YYYY-MM-DD` | `POST /v1/suggestions` (`due_date` becomes `due: { at }`) | `{ suggestion: Suggestion }` |

<!-- src: apps/server/src/mcp/tools.ts:31-186 --> <!-- src: apps/server/src/mcp/reads.ts:15-93 --> <!-- src: apps/server/src/mcp/draft.ts:24-37 --> <!-- src: apps/server/src/mcp/people.ts:13-54 --> <!-- src: apps/server/src/mcp/clients.ts:10-17 -->

Tool descriptions, as registered: <!-- src: apps/server/src/mcp/tools.ts:46-185 -->

| Tool | Description |
|---|---|
| `get_profile` | Who the person is: current facts about them by section, and what is due soon. |
| `search_memory` | Search memory by words. Gives matching things with ids, paths, urgency and facts. |
| `get_node` | One thing or section by id, with its children, facts and relations. |
| `list_children` | A page of the things filed under a node. Pass nextCursor back for the next page. |
| `resolve_path` | The node at a path of names, section first, such as ["School", "CS 101"]. |
| `get_fact` | One fact by id, with its history and the chats it came from. |
| `find_people` | People and groups by name or alias, the members of matched groups, and their facts. |
| `related` | The current relations of a thing, such as member_of or friend_of. |
| `upcoming` | Deadlines and events up to a day, by time, overdue ones first. |
| `get_context` | Memory packed as text for a prompt: the person, facts relevant to a query, due soon. |
| `context_for_draft` | What Coere would add in front of what the person typed: a ready block, then each memory with why it goes. With a chat, later turns get only what changed. |
| `get_identity` | A person's identity by id, or me for the person: role, organization, location and contact details. |
| `get_style` | How the person likes to write and be answered: writing, tone and answer preferences. |
| `get_client_card` | A client's card by id: what it is, its current work, contacts, open promises and how it likes to work. |
| `suggest_memory` | Suggest one plain sentence for memory. The person accepts or dismisses it; nothing changes until then. |

Compact shapes: <!-- src: apps/server/src/mcp/compact.ts:22-140 -->

```ts
interface CompactFact { id: string; t: 'fact'; text: string; kind: string; path: string; urgency: UrgencyLevel; due: string | null; importance: number }
interface CompactNode { id: string; t: 'entity' | 'section'; name: string; kind: string; path: string; urgency: UrgencyLevel; due: string | null; importance: number | null }
interface CompactFactDetail extends CompactFact { history: CompactFact[]; sources: FactSourceRef[]; quotes: string[] } // quotes only with memory:evidence
interface CompactEdge { relation: string; type: string; direction: 'out' | 'in'; other: { id: string; name: string; kind: string; path: string } }
// path is one line of names: "School / Fake CS 101 / Project 1"; due is the UTC instant urgency is about, or null
```

**Answers and errors.** Every tool answers with `structuredContent` and the same JSON as a text content block. A failed call is a tool error (`isError: true`) whose text is `{ "error": { "code", "status", "message", "param" } }`, never a protocol error; an error that is not an API error reads `{ "code": "internal", "status": 500, "message": "The Coere server could not answer." }`. <!-- src: apps/server/src/mcp/answer.ts:1-27 -->

### 8.3 Resources

| URI | Name | Answers |
|---|---|---|
| `coere://profile` | `profile` | the same JSON as `get_profile` ("Who the person is and what is due soon.") |
| `coere://node/{id}` (template; lists nothing) | `node` | the same JSON as `get_node` ("One thing or section by id.") |

Both are `application/json`. <!-- src: apps/server/src/mcp/resources.ts:1-33 -->
