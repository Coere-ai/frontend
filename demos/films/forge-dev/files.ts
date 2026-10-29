/**
 * The developer's small app as it stands before the film: prep-coach, an
 * interview coach that sends what its user typed to Claude. The film adds
 * Coere to it (film.ts), with the calls the site's docs use.
 */
export type FileName = ".env" | ".gitignore" | "app.ts" | "package.json" | "tsconfig.json";

export const FILES: Record<FileName, string> = {
  ".env": "ANTHROPIC_API_KEY=sk-ant-api03-••••••••••••••••••••\n",
  ".gitignore": "node_modules\n.env\n",
  "app.ts": `import Anthropic from '@anthropic-ai/sdk'

const claude = new Anthropic()

export async function reply(text: string) {
  const msg = await claude.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    messages: [{ role: 'user', content: text }],
  })
  return msg.content.find((b) => b.type === 'text')?.text
}

console.log(await reply(process.argv[2]))
`,
  "package.json": `{
  "name": "prep-coach",
  "private": true,
  "type": "module",
  "dependencies": {
    "@anthropic-ai/sdk": "latest",
    "@coere/client": "link:../coere-v2/packages/client"
  },
  "devDependencies": {
    "tsx": "latest"
  }
}
`,
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true
  }
}
`,
};

/** The explorer's order, folders first, as VS Code sorts it. */
export const TREE: FileName[] = [".env", ".gitignore", "app.ts", "package.json", "tsconfig.json"];
