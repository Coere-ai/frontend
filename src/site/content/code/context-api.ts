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
