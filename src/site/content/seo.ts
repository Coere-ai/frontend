import type { Product } from "./products";

/**
 * What each page says in search results and link previews: a title, a
 * description of about 160 characters at most, and the phrases it answers
 * best. Every claim here is one the page itself shows.
 */
type Seo = { title: string; description: string; keywords: string[] };

export const homeSeo: Seo = {
  title: "Coere | The memory layer you own, across every AI",
  description:
    "Coere is the AI memory layer you own. It saves your chats from ChatGPT, Claude, Gemini and more, and brings the right context into every new chat.",
  keywords: ["AI memory app", "memory for ChatGPT Claude and Gemini", "one memory across every AI"],
};

export const productSeo: Record<Product["slug"], Seo> = {
  connect: {
    title: "Coere Connect: one memory across ChatGPT, Claude and Gemini",
    description:
      "A Chrome extension that saves your chats from every AI, builds a memory graph you own, and adds the right context to each new chat as you type.",
    keywords: ["AI memory Chrome extension", "ChatGPT memory extension", "save Claude chats", "export ChatGPT conversations", "context as you type", "AI voice mode"],
  },
  solutions: {
    title: "Coere Solutions: shared AI memory for teams and clients",
    description:
      "One memory of your company, its people and its clients, built from the chats your team already has. One client per send, with a source on every answer.",
    keywords: ["shared AI memory for teams", "company AI knowledge base", "client memory", "AI for agencies", "confidential AI context", "team ChatGPT memory"],
  },
  forge: {
    title: "Coere Forge: memory API, MCP server and SDKs for AI apps",
    description:
      "Give your apps and AI agents a memory layer: the Coere API, an MCP server, and TypeScript and Python SDKs, with the person's permission on every call.",
    keywords: ["memory API for AI apps", "MCP memory server", "AI agent memory", "LLM long term memory", "RAG memory", "TypeScript SDK", "Python SDK"],
  },
  agents: {
    title: "Coere Agents: one worker, infinite possibilities",
    description:
      "Cori works from your memory: it drafts email in Gmail, adds calendar events, fixes writing, fills forms and splits research across workers, asking before it sends.",
    keywords: ["AI agent", "browser agent", "AI email assistant", "AI calendar assistant", "AI research agent", "AI form filler", "AI writing assistant"],
  },
};

/** Who each industry page is for, as people search for it. */
export const industryAudience: Record<string, string> = {
  legal: "law firms",
  finance: "financial advisors",
  technology: "software teams",
  commerce: "trading companies",
  consumer: "consumer brands",
  manufacturing: "manufacturers",
  energy: "energy companies",
  education: "teachers and schools",
};

export const industriesSeo: Seo = {
  title: "AI memory for every industry",
  description:
    "How a memory you own works in law, finance, technology, commerce, consumer brands, manufacturing, energy and education, with each client's memory kept apart.",
  keywords: ["AI for law firms", "AI for financial advisors", "AI for manufacturing", "AI for teachers", "industry AI memory"],
};

export const docsSeo: Seo = {
  title: "Developer docs: Coere memory API, MCP server and SDKs",
  description:
    "How to read and write a person's Coere memory from your app or agent: tokens and scopes, every endpoint, the MCP server, and the TypeScript and Python SDKs.",
  keywords: ["Coere API docs", "memory API documentation", "MCP server docs", "AI memory SDK"],
};

export const aboutSeo: Seo = {
  title: "About Coere: the team building the memory layer you own",
  description:
    "Why Coere exists, and the people building it. Coere is the memory layer you own, across every AI. Coere is not Cohere.",
  keywords: ["Coere team", "Coere founders", "about Coere AI"],
};
