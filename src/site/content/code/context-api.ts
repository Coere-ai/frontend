import type { CodeSample } from "@/site/blocks/code-tabs";

/**
 * The Context API in a few lines, copied from the coere-v2 README's Context
 * API section. Keep these in step with it: they are what a developer will
 * paste first.
 */
export const contextSamples: CodeSample[] = [
  {
    label: "TypeScript",
    language: "ts",
    code: `import { Coere } from '@coere/client'

const token = await Coere.connect({ name: 'planner', scopes: ['memory:read'] }, (code) =>
  console.log(\`Open Apps in Coere and check the code \${code}\`),
)
const coere = new Coere({ token })
const ctx = await coere.context.forDraft('dinner with my climbing friends friday', { chat: 'chat-1' })
console.log(ctx.block) // put this in front of the message you send to your model
for (const item of ctx.items) console.log(item.path.join(' / '), item.why)`,
  },
  {
    label: "Python",
    language: "python",
    code: `from coere import coere

ctx = coere.context.for_draft("dinner with my climbing friends friday", chat="chat-1")
print(ctx.block, end="")
for item in ctx.items:
    print(" / ".join(item.path), item.why)`,
  },
];

/** Connecting an agent over MCP, as the dashboard's token dialog writes it. */
export const mcpSamples: CodeSample[] = [
  {
    label: "Claude Code",
    language: "bash",
    code: `claude mcp add --transport http coere http://127.0.0.1:7337/mcp --header "Authorization: Bearer coere_app_..."`,
  },
  {
    label: "MCP config",
    language: "json",
    code: `{
  "mcpServers": {
    "coere": {
      "command": "node",
      "args": ["/path/to/coere-v2/apps/server/dist/coere-server.mjs", "mcp"],
      "env": { "COERE_URL": "http://127.0.0.1:7337", "COERE_TOKEN": "coere_app_..." }
    }
  }
}`,
  },
  {
    label: "curl",
    language: "bash",
    code: `curl -s -X POST http://127.0.0.1:7337/v1/context/draft \\
  -H "Authorization: Bearer $COERE_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"draft": "dinner with my climbing friends friday", "chat": "chat-1"}'`,
  },
];
