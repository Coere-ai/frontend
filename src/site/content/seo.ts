import { siteConfig } from "@/lib/site";
import type { Product } from "./products";

/**
 * What each page says in search results and link previews: a title of
 * about 60 characters at most, a description of about 155, and the phrases
 * it answers best. Each page leads with a phrase of its own, so no two
 * compete for the same search. Every claim here is one the page itself
 * shows. A title that already starts with Coere is `absolute`, so it isn't
 * followed by "| Coere" as well.
 */
type Seo = { title: string; description: string; keywords: string[]; absolute?: boolean };

/** Home: the brand, and what Coere is. */
export const homeSeo: Seo = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: ["Coere memory", "Coere AI memory layer", "cross-AI memory", "user-owned AI memory", "AI memory across apps"],
  absolute: true,
};

/** Each product's own phrase: Connect cross-AI memory, Solutions team memory, Forge the memory API, Agents the agent. */
export const productSeo: Record<Product["slug"], Seo> = {
  connect: {
    title: "Coere Connect: one AI memory for ChatGPT, Claude and Gemini",
    description:
      "A Chrome extension that saves your chats from ChatGPT, Claude, Gemini and six more AIs on your computer and adds the right context to each new chat.",
    keywords: ["AI memory Chrome extension", "memory across ChatGPT Claude and Gemini", "same memory across AI assistants", "save AI chats", "context as you type"],
    absolute: true,
  },
  solutions: {
    title: "Coere Solutions: shared AI memory for teams and clients",
    description:
      "One memory of your company, its people and its clients, built from the chats your team already has. One client per send, with a source on every answer.",
    keywords: ["shared AI memory for teams", "team AI memory", "client memory", "AI for agencies", "company AI knowledge"],
    absolute: true,
  },
  forge: {
    title: "Coere Forge: AI memory API, MCP server and SDKs",
    description:
      "A user-permissioned AI memory API: REST, an MCP server, and TypeScript and Python SDKs that let your apps and agents read a person's Coere memory.",
    keywords: ["AI memory API", "user context API", "memory SDK for developers", "MCP memory server", "TypeScript SDK", "Python SDK"],
    absolute: true,
  },
  agents: {
    title: "Coere Agents: Cori, the AI agent that works from your memory",
    description:
      "Cori, the agent in Coere, works from your memory. It drafts email in Gmail, adds calendar events, fixes writing, fills forms and asks before it sends.",
    keywords: ["AI agent with memory", "browser agent", "AI email assistant", "AI research agent", "AI form filler"],
    absolute: true,
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
    "How to read a person's Coere memory from your app or agent: tokens and scopes, every endpoint, the MCP server, and the TypeScript and Python SDKs.",
  keywords: ["Coere API docs", "memory API documentation", "MCP server docs", "AI memory SDK"],
};

export const aboutSeo: Seo = {
  title: "About Coere: the team building the memory layer you own",
  description:
    "Why Coere exists and who is building it. Coere is the portable AI memory layer you own. It is not Cohere and is not affiliated with it.",
  keywords: ["Coere team", "Coere founders", "about Coere AI", "Coere not Cohere"],
  absolute: true,
};

/** The developer waitlist: memory for an app's users, and the launch credits. */
export const waitlistSeo: Seo = {
  title: "Developer waitlist: give your app's users memory",
  description:
    "Join the Coere Forge waitlist to give your app's users memory from day one, with their permission. Get 1,000 free credits at launch.",
  keywords: ["Coere Forge waitlist", "AI memory API waitlist", "user memory for apps", "Coere developer access"],
};
