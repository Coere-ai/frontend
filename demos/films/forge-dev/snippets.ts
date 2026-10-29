/**
 * The same Coere lines in front of each AI's own call: context.forDraft
 * from the real @coere/client, as the site's docs write it, then the
 * block in front of what the user typed, sent with each provider's own
 * SDK (DeepSeek, Kimi, Perplexity, Grok and Meta's Llama API take the
 * OpenAI SDK at their own address). Copilot reads Coere over MCP, from
 * the server's /mcp route, with the placeholder address the site's MCP
 * samples use.
 */
export type Ai = "chatgpt" | "claude" | "gemini" | "deepseek" | "kimi" | "perplexity" | "grok" | "copilot" | "meta_ai";

const CTX = "const ctx = await coere.context.forDraft(text, { chat })";

/** An OpenAI compatible API: the OpenAI SDK at the provider's address. */
const compatible = (name: string, url: string, key: string, model: string) => `import OpenAI from 'openai'

const ${name} = new OpenAI({
  baseURL: '${url}',
  apiKey: process.env.${key},
})

${CTX}
const res = await ${name}.chat.completions.create({
  model: '${model}',
  messages: [{ role: 'user', content: ctx.block + text }],
})`;

export const SNIPPETS: Record<Ai, { file: string; code: string; via: string }> = {
  chatgpt: {
    file: "chatgpt.ts",
    via: "Context in",
    code: `import OpenAI from 'openai'

const openai = new OpenAI()

${CTX}
const res = await openai.responses.create({
  model: 'gpt-5',
  input: ctx.block + text,
})`,
  },
  claude: {
    file: "claude.ts",
    via: "Context in",
    code: `import Anthropic from '@anthropic-ai/sdk'

const claude = new Anthropic()

${CTX}
const msg = await claude.messages.create({
  model: 'claude-opus-5-5',
  max_tokens: 16000,
  messages: [{ role: 'user', content: ctx.block + text }],
})`,
  },
  gemini: {
    file: "gemini.ts",
    via: "Context in",
    code: `import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

${CTX}
const res = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: ctx.block + text,
})`,
  },
  deepseek: { file: "deepseek.ts", via: "Context in", code: compatible("deepseek", "https://api.deepseek.com", "DEEPSEEK_API_KEY", "deepseek-chat") },
  kimi: { file: "kimi.ts", via: "Context in", code: compatible("kimi", "https://api.moonshot.ai/v1", "MOONSHOT_API_KEY", "kimi-k2-turbo-preview") },
  perplexity: { file: "perplexity.ts", via: "Context in", code: compatible("pplx", "https://api.perplexity.ai", "PERPLEXITY_API_KEY", "sonar") },
  grok: { file: "grok.ts", via: "Context in", code: compatible("grok", "https://api.x.ai/v1", "XAI_API_KEY", "grok-4") },
  copilot: {
    file: ".vscode/mcp.json",
    via: "Over MCP",
    code: `{
  "servers": {
    "coere": {
      "type": "http",
      "url": "https://coere.example.com/mcp",
      "headers": { "Authorization": "Bearer coere_app_..." }
    }
  }
}`,
  },
  meta_ai: { file: "llama.ts", via: "Context in", code: compatible("llama", "https://api.llama.com/compat/v1/", "LLAMA_API_KEY", "Llama-4-Maverick-17B-128E-Instruct-FP8") },
};
