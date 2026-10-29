Adapted from `sdk/python/examples/`, `packages/client/examples/` and `examples/event-planner/`. The Python ones run with `COERE_URL` and `COERE_TOKEN` set, as `uv run python examples/<name>.py` from `sdk/python`. <!-- src: sdk/python/README.md:261-270 -->

### 11.1 Context for a message (Python)

```python
from coere import coere

ctx = coere.context.for_draft("dinner with my climbing friends friday")
print(ctx.block, end="")
print(f"From {ctx.from_chats} {'chat' if ctx.from_chats == 1 else 'chats'}")
for item in ctx.items:
    print(f"  {' / '.join(item.path)}: {item.why}")
```

<!-- src: sdk/python/examples/context.py:13-18 -->

### 11.2 A chat loop: one conversation id per session (TypeScript)

```ts
import { Coere } from '@coere/client'

const coere = new Coere({ baseUrl: process.env.COERE_URL, token: process.env.COERE_TOKEN })
const conversation = `chat-${crypto.randomUUID()}`

async function onUserLine(line: string) {
  const draft = line.trim()
  if (draft === '') return
  const ctx = await coere.context.forDraft(draft, { chat: conversation })
  console.log(ctx.block + draft) // what would go to the model
  console.log(`From ${ctx.fromChats} chats:`)
  for (const item of ctx.items) console.log(`  ${item.path.join(' / ')}: ${item.why}`)
}
```

<!-- src: packages/client/examples/chat.ts:14-33 -->

### 11.3 Count the context as sent only after you send (both SDKs)

```ts
const held = await coere.context.forDraft(userText, { chat: conversationId, record: 'later' })
await sendToModel(held.block + userText)
await coere.context.sent(held.receipt!)
```

```python
held = coere.context.for_draft(user_text, chat=conversation_id, record="later")
send(held.block + user_text)
coere.context.sent(held.receipt)
```

<!-- src: packages/client/README.md:38-42 --> <!-- src: sdk/python/README.md:80-84 -->

### 11.4 Ask for access, then save the token (Python, from the event planner)

```python
import coere

try:
    token = coere.Coere.connect("planner", scopes=("memory:read", "memory:identity", "memory:suggest"), base_url=url)
except coere.ConnectDeniedError:
    ...  # the person pressed Deny
except (coere.CodeExpiredError, coere.APITimeoutError):
    ...  # the request ran out; ask again
```

<!-- src: examples/event-planner/src/event_planner/connect.py:19-44 -->

### 11.5 Ask for access with raw HTTP (Python standard library)

The same flow as `Coere.connect`, without the SDK: <!-- src: sdk/python/src/coere/resources/connect.py:51-80 -->

```python
import base64, hashlib, json, secrets, time, urllib.request

BASE = "http://127.0.0.1:7337"

def post(path, body):
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as res:   # raises HTTPError on 403 connect_denied, 410 code_expired
        return json.load(res)

raw = secrets.token_bytes(32)
started = post("/v1/connect", {"name": "my-app", "scopes": ["memory:read"],
                               "secretSha256": hashlib.sha256(raw).hexdigest()})
print(f"Open Apps in Coere and allow my-app. Code {started['code']}.")
secret = base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")
deadline = time.time() + started["expiresIn"]
pause = started["pollAfter"]
while time.time() < deadline:
    time.sleep(pause)
    poll = post(f"/v1/connect/{started['id']}/token", {"secret": secret})
    if poll["token"] is not None:
        token = poll["token"]   # shown once: store it
        break
    pause = max(1, poll["pollAfter"])
```

### 11.6 Walk the tree (Python)

```python
from coere import NotFoundError, coere

root = coere.tree(depth=1)
print("Sections:", ", ".join(child.name for child in root.children or []))
try:
    found = coere.resolve(["School", "Fake CS 101"])
except NotFoundError:
    print("Nothing is at that path, or this token may not see it.")
else:
    for child in coere.nodes.children(found.node.id):   # iterating walks every page
        print("  ", child.name, f"({child.kind})")
```

<!-- src: sdk/python/examples/walk_tree.py:11-24 -->

### 11.7 Search (Python)

```python
from coere import coere

result = coere.search("cs 101 project deadline")
for hit in result.hits:
    print(" / ".join(step.name for step in hit.node.path))
    for match in hit.facts:
        label = match.fact.view.urgency.label if match.fact.view else None
        print("  ", match.fact.text, f"({label})" if label else "")
```

<!-- src: sdk/python/examples/search.py:11-17 -->

### 11.8 Suggest a memory (Python)

```python
from coere import PermissionDeniedError, coere

try:
    suggestion = coere.suggestions.create("Fake Sam wants a fake rest day after the comp.",
                                          section="plans", note="Filed by the example script.")
except PermissionDeniedError as e:
    print(e)   # 403 forbidden_scope: The token lacks a scope (memory:suggest).
else:
    print("Filed", suggestion.id, suggestion.status)
    print("Now", coere.suggestions.get(suggestion.id).status)
```

<!-- src: sdk/python/examples/suggest.py:14-21 -->

With a stable key, so running the same plan twice files nothing new (from the event planner): <!-- src: examples/event-planner/src/event_planner/remember.py:26-35 -->

```python
coere.suggestions.create(
    kind="add",
    text=suggestion_text(plan),
    section="plans",
    due=When(at=plan.start, tz=plan.timezone),
    importance=3,
    note="From the event planner.",
    idempotency_key=hashlib.sha256(plan.model_dump_json().encode()).hexdigest(),
)
```

### 11.9 Profile (Python)

```python
from coere import coere

profile = coere.profile()
print(profile.self.name, profile.time_zone)
for group in profile.by_section:
    print(f"{group.section.name}: {len(group.facts)} facts")
for fact in profile.due_soon:
    print("due:", fact.text, fact.view.urgency.label if fact.view else "")
```

<!-- src: sdk/python/examples/profile.py:9-15 -->

### 11.10 The event planner

`examples/event-planner` is a full app on the Python SDK: it gets the draft context for the user's request, gives Claude five read tools over the SDK, checks the plan in code, prints it and writes a calendar file; `--remember` files the plan as a suggestion. Run it with no key on made up memory with `pnpm planner`, or on your own memory with `uv run --project examples/event-planner planner --connect` and then `uv run --project examples/event-planner planner "Plan a dinner with my climbing friends next Friday"`. <!-- src: examples/event-planner/README.md:1-75 -->
