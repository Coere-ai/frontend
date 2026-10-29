API `v1` (API version `1.0`), server `0.3.0`, `.coere` format `1.0`. <!-- src: packages/api/src/version.ts:7-12 -->

> **Status of what is "public" today.**
> - There is no hosted Coere API. Every endpoint here is served by `coere-server`, a program the person runs on their own computer or their own host. A hosted service at `coere.ai` is planned and not built. <!-- src: docs/design/hosted-service.md:3-5 -->
> - Neither SDK is published to a package registry. `@coere/client` is a private workspace package, and the Python package carries the `Private :: Do Not Upload` classifier so PyPI refuses it; apps depend on it by path. <!-- src: packages/client/package.json:4 --> <!-- src: sdk/python/pyproject.toml:13-14 --> <!-- src: sdk/python/README.md:7-16 -->
> - Routes marked **internal** below are signed by the paired Coere extension (device auth) or take a pairing code. No app token can ever call them. They are listed so the reference is complete, not for apps to call. <!-- src: packages/api/src/scopes.ts:1-7 -->

## 1. Overview

Coere is a Chrome extension that saves a person's AI chats and builds a memory from them: sections, people, places and things (entities), facts about them, and relations between them. Coere v3 adds a small server, `coere-server`, that holds a read only copy of that memory so the person's own apps can read it while the browser is closed. <!-- src: apps/server/README.md:1-19 --> <!-- src: README.md:700 -->

What an app can do through the API:

- **Get the context for what its user typed.** `POST /v1/context/draft` answers what Coere's "silent import" would put in front of a message on a chat site: the person's standing "core pack" on a chat's first message, then the memories the draft calls for, each with its lines, path and a plain reason why it goes. The answer's `block` is ready to prepend to the message. With a conversation id (`chat`), a later message in the same chat gets only what changed. <!-- src: packages/api/src/openapi/routes-context.ts:17-26 --> <!-- src: packages/client/README.md:18-37 --> <!-- src: README.md:1444-1478 -->
- **Read memory directly**, with no AI involved: the person's profile and writing style, the section tree, one node and its children, facts by filter, entities and their relations, upcoming deadlines, keyword search, a person's identity, the change feed and a `.coere` export. <!-- src: packages/api/src/openapi/routes-tree.ts:12 --> <!-- src: packages/api/src/openapi/routes-find.ts:12 -->
- **Suggest a memory.** The only write an app can make is a suggestion; nothing changes until the person accepts it on the Memory page. <!-- src: packages/api/src/openapi/routes-suggest.ts:5 --> <!-- src: packages/api/openapi.json:6 -->
- **Ask for access from code** instead of the person pasting a token, through an "Allow this app" card on the dashboard's Apps page. <!-- src: packages/api/src/openapi/routes-context.ts:57-66 -->

The same data is also offered over **MCP** (Model Context Protocol), at `/mcp` on the same server and over stdio with `coere-server mcp`. <!-- src: apps/server/src/routes/mount.ts:26 --> <!-- src: apps/server/src/cli.ts:27 -->

What the server never has: the chats themselves, and held facts until the person confirms them. Sensitive facts reach it only after the person turns on "Let apps read sensitive memories". Apps never write memory. <!-- src: apps/server/README.md:8-19 -->

The OpenAPI document describes itself as: "The REST API of a Coere memory server. Apps read memory with an app token and may file suggestions, which the person accepts or dismisses. Only the paired Coere extension writes memory, through signed sync requests. Every memory object is its .coere record plus a view computed when read." <!-- src: packages/api/openapi.json:3-7 -->

There are **no webhooks**. To follow changes, poll [`GET /v1/changes`](#get-v1changes). <!-- src: packages/api/src/openapi/routes.ts:17-27 -->

## 2. Quickstart

Requirements: Node 22.13 or later for the server, pnpm 10, and uv for the Python SDK. <!-- src: README.md:1357-1358 --> <!-- src: apps/server/package.json:6-8 -->

### 2.1 Fastest path: a server with made up memory, no browser

This is what `pnpm planner` does for its demo: seed a fresh data folder from the fixture file, make a token, then serve. <!-- src: tools/planner-run/memory.ts:57-72 -->

```bash
# From the repository root
pnpm install
node apps/server/build.mjs        # builds apps/server/dist/coere-server.mjs

export COERE_DATA_DIR="$HOME/.coere/demo-server"   # a separate data folder for the demo

# Seed the copy from a .coere file (run with the server stopped)
node apps/server/dist/coere-server.mjs import examples/event-planner/fixtures/fake-memory.coere --demo

# Make an app token; it is printed once
node apps/server/dist/coere-server.mjs token create --name my-app --scope memory:read,memory:suggest

# Serve on http://127.0.0.1:7337
node apps/server/dist/coere-server.mjs serve
```

<!-- src: apps/server/src/cli.ts:20-28 --> <!-- src: apps/server/src/cli/import.ts:21-33 --> <!-- src: apps/server/src/cli/token.ts:16-18 --> <!-- src: apps/server/src/config.ts:149 -->

The fixture's dates were written for Thursday, October 15, 2026; the planner demo also sets `COERE_NOW=2026-10-15T17:00:00Z`, a testing setting that fixes the clock the routes read, so urgency reads as it did that day. It is optional. <!-- src: tools/planner-run/memory.ts:64 --> <!-- src: tools/gen-fake-memory/constants.ts:8 --> <!-- src: apps/server/src/config.ts:30 -->

### 2.2 With your own memory

```bash
pnpm install
pnpm build:v3       # the v3 extension, into apps/extension/.output/chrome-mv3-v3
pnpm server         # prints the address and a pairing code
```

Load the v3 build in Chrome, open the dashboard's **Apps** page, type the address and the pairing code, and press **Connect**. Then choose **Add an app** to make a token, or let your app ask for one with [`Coere.connect`](#43-getting-a-token). <!-- src: README.md:1424-1440 -->

`pnpm server` builds the server bundle if any source is newer, then runs `node apps/server/dist/coere-server.mjs serve`. <!-- src: tools/launch/scripts.ts:26-41 -->

### 2.3 First calls

```bash
export COERE_TOKEN=coere_app_...     # the token printed above

curl -s http://127.0.0.1:7337/v1/health
curl -s -H "Authorization: Bearer $COERE_TOKEN" http://127.0.0.1:7337/v1/me
curl -s -X POST http://127.0.0.1:7337/v1/context/draft \
  -H "Authorization: Bearer $COERE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"draft": "dinner with my climbing friends friday", "chat": "chat-1"}'
```

Python (the SDK reads `COERE_URL` and `COERE_TOKEN`): <!-- src: sdk/python/src/coere/_config.py:18-30 -->

```python
from coere import coere

ctx = coere.context.for_draft("dinner with my climbing friends friday", chat="chat-1")
print(ctx.block, end="")
for item in ctx.items:
    print(" / ".join(item.path), item.why)
```

<!-- src: README.md:1463-1470 -->

TypeScript (the client reads no environment; pass the token): <!-- src: packages/client/src/options.ts:4-9 -->

```ts
import { Coere } from '@coere/client'

const coere = new Coere({ token: process.env.COERE_TOKEN })
const ctx = await coere.context.forDraft('dinner with my climbing friends friday', { chat: 'chat-1' })
console.log(ctx.block) // put this in front of the message you send to your model
for (const item of ctx.items) console.log(item.path.join(' / '), item.why)
```

<!-- src: README.md:1450-1461 -->

Installing the SDKs (neither is on a registry):

- Python: depend on the folder by path. <!-- src: sdk/python/README.md:10-16 -->

  ```toml
  [project]
  dependencies = ["coere"]

  [tool.uv.sources]
  coere = { path = "../coere-v2/sdk/python" }
  ```

- TypeScript: `@coere/client` is a pnpm workspace package (`"private": true`, entry `./src/index.ts`), used from inside this repository, as `packages/client/examples/chat.ts` does: `COERE_TOKEN=coere_app_... npx tsx packages/client/examples/chat.ts`. <!-- src: packages/client/package.json:1-12 --> <!-- src: packages/client/examples/chat.ts:6 -->
