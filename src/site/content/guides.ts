import { AI_LIST, pending, type Faq } from "./faqs";
import type { HeroCopy } from "./pages/types";

/**
 * The guide pages: one page for each question people search that Coere
 * answers better than a product page can. Each leads with a direct answer,
 * says what Coere supports today, and walks through the workflow.
 *
 * Every claim is one the site or the developer docs (content/docs) already
 * make. What Claude and Gemini's own imports do comes from their help pages,
 * linked on the page, as of November 2026. Nothing here is a customer, a
 * number we have not shown, or a feature that is not built.
 */
export type GuideSlug = "portable-ai-memory" | "chatgpt-to-claude-memory" | "ai-agent-memory";

/** A guide as the footer, sitemap and other guides list it. */
export type Guide = {
  slug: GuideSlug;
  /** Its name in links. */
  name: string;
  /** Who it is for, in a few words, over its name on a card. */
  kind: string;
  seo: { title: string; description: string; keywords: string[] };
};

export const guides: Guide[] = [
  {
    slug: "portable-ai-memory",
    name: "Portable AI memory",
    kind: "What it is",
    seo: {
      title: "Portable AI memory: one memory across every AI",
      description:
        "Portable AI memory follows you from one AI to the next. Coere saves your chats from ChatGPT, Claude, Gemini and six more, and builds one memory you own.",
      keywords: ["portable AI memory", "cross-AI memory", "universal AI memory", "persistent AI memory", "AI memory across apps", "AI memory that follows you", "user-owned AI memory", "shared AI memory"],
    },
  },
  {
    slug: "chatgpt-to-claude-memory",
    name: "ChatGPT to Claude memory",
    kind: "Switching AIs",
    seo: {
      title: "ChatGPT to Claude memory: bring your context with you",
      description:
        "How to move your ChatGPT memory to Claude: Claude's own import, Gemini's, and Coere, which keeps every chat and adds the right context to new Claude chats.",
      keywords: ["transfer ChatGPT memory to Claude", "ChatGPT to Claude memory", "import ChatGPT conversations", "move AI conversations between platforms", "share memory between ChatGPT and Gemini", "switch from ChatGPT to Claude"],
    },
  },
  {
    slug: "ai-agent-memory",
    name: "AI agent memory",
    kind: "For developers",
    seo: {
      title: "AI agent memory, with the user's permission",
      description:
        "Give your AI agent the memory of the person it works for. Coere Forge serves it over REST, MCP and TypeScript and Python SDKs, with scoped tokens they allow.",
      keywords: ["AI agent memory", "memory layer for AI agents", "long-term memory for AI agents", "shared memory MCP server", "persistent memory for LLMs", "user context API", "AI agent memory infrastructure"],
    },
  },
];

export function guideBySlug(slug: GuideSlug): Guide {
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) throw new Error(`No guide ${slug}`);
  return guide;
}

/** One step of a workflow: what to do, and what happens. */
export type Step = { title: string; text: string };

/** One way to do a thing, as a card: what it is and where to read more. */
export type Way = { name: string; text: string; link?: { href: string; label: string; external?: boolean } };

// ---------------------------------------------------------------- Portable AI memory

export const portable = {
  hero: {
    eyebrow: "Portable AI memory",
    title: "Portable AI memory that follows you to every AI",
    line: "Coere is a portable AI memory layer that helps your context follow you across AI assistants. It saves your chats from every AI you use, builds one memory you own, and brings the right part into each new chat.",
    checks: [
      "Every AI: ChatGPT, Claude, Gemini and six more feed one memory",
      "Yours: saved on your computer, and nothing goes to an AI until you say yes",
      "Shown: a line above the chat box says what goes before you send",
    ],
  } satisfies HeroCopy,
  answer: {
    title: "What is portable AI memory?",
    paragraphs: [
      "Portable AI memory is memory about you that isn't locked inside one AI. ChatGPT, Claude and Gemini each keep their own memory, built from what you told that one assistant. Open another and it starts from nothing, so you explain your work, your projects and how you like to be answered all over again.",
      "A portable memory layer sits outside every assistant. It holds what you already said, keeps track of the chat each memory came from, and brings the right part into whichever AI you open next. The memory stays yours, not the assistant's.",
      "Coere is that layer. Coere Connect, a Chrome extension, builds it from the chats you already have.",
    ],
  },
  steps: [
    { title: "Pick your AIs", text: `Install Coere Connect and choose the AIs you use: ${AI_LIST}.` },
    { title: "Save every chat", text: "Extract all reads each AI and saves every chat on your computer. After that, new chats save by themselves." },
    { title: "Build your memory", text: "Coere asks what to build memory from, then grows a graph of sections and folders. Each memory sits beside the chats it came from." },
    { title: "Bring it into a new chat", text: "Start typing in any of your AIs. A line above the chat box says what Coere will add and which AIs it learned it from. Change it if you like, then press Enter." },
  ] satisfies Step[],
  today: [
    "Chrome: Coere Connect is a Chrome extension",
    `Nine AIs: ${AI_LIST}`,
    "On your computer: every chat is saved there, and memory follows a chat that changes",
    "Your say: nothing goes to an AI to build memory until you say yes",
    "Teams: Coere Solutions shares one memory across a company and its clients",
    "Apps: Coere Forge lets an app read your memory with a token you allow",
  ],
  faqs: [
    {
      q: "What is portable AI memory?",
      a: "Memory about you that moves with you from one AI assistant to the next, instead of staying inside the one you told. A portable memory layer like Coere keeps it outside every AI and brings the right part into each new chat.",
    },
    {
      q: "Can I move my memory from ChatGPT to Claude?",
      a: "Yes. Claude and Gemini can each import a summary of what another AI knows about you, by hand. Coere keeps every chat instead, and brings the right context into ChatGPT, Claude, Gemini and six more AIs each time you start a chat.",
      link: { href: "/chatgpt-to-claude-memory", label: "ChatGPT to Claude memory" },
    },
    {
      q: "Is a memory layer the same as chat history?",
      a: "No. Chat history is the list of your chats. Coere saves your chats and also builds a memory from them: sections, folders and memories, each tied to the chats it came from, so only the part a new chat needs goes in.",
    },
    {
      q: "Who owns the memory?",
      a: "You do. Every chat is saved on your computer, nothing goes to an AI to build memory until you say yes, and an app can read your memory only with a token you allow and can revoke.",
    },
    {
      q: "Can apps and AI agents use my portable memory?",
      a: "Yes, with your permission. Coere Forge gives an app or agent a token you allow, with scopes you choose, and the app reads your memory over an API, an MCP server or the TypeScript and Python SDKs.",
      link: { href: "/ai-agent-memory", label: "Memory for AI agents" },
    },
    pending,
  ] satisfies Faq[],
};

// ---------------------------------------------------------------- ChatGPT to Claude memory

export const switching = {
  hero: {
    eyebrow: "ChatGPT to Claude",
    title: "Bring your ChatGPT memory to Claude",
    line: "Bring your existing AI context into a new assistant without starting from scratch. Coere saves your ChatGPT chats on your computer and adds the right context to each new Claude chat as you type.",
    checks: [
      "Every chat: not a one time summary",
      "Every way: ChatGPT, Claude, Gemini and six more share one memory",
      "Shown first: the line says what goes before you send",
    ],
  } satisfies HeroCopy,
  answer: {
    title: "Three ways to move ChatGPT memory to Claude",
    line: "As of November 2026, there are three ways to bring what ChatGPT knows about you into another AI.",
  },
  ways: [
    {
      name: "Claude's memory import",
      text: "Claude gives you a prompt to paste into ChatGPT. ChatGPT answers with what it knows about you, and you paste that into Claude's memory settings. A summary moves into Claude, each time you run it.",
      link: { href: "https://claude.com/import-memory", label: "Claude's import page", external: true },
    },
    {
      name: "Gemini's import",
      text: "Gemini takes a summary the same way, or the chats themselves from a ChatGPT export .zip. Google says it isn't available in the EEA, Switzerland or the UK.",
      link: { href: "https://support.google.com/gemini/answer/16868299", label: "Google's help page", external: true },
    },
    {
      name: "Coere Connect",
      text: "Coere saves every chat from ChatGPT, Claude and the other AIs you use on your computer, and builds one memory from them. In a new Claude chat it adds the right part as you type, and the line above the box shows what goes.",
      link: { href: "/products/connect", label: "Coere Connect" },
    },
  ] satisfies Way[],
  /** What moves with each way, from each one's own page. */
  table: {
    columns: ["Claude's import", "Gemini's import", "Coere"],
    rows: [
      { name: "What moves", cells: ["A summary of what ChatGPT knows about you", "A summary, or your chats' text from an export .zip", "Every chat, and a memory built from them"] },
      { name: "How often", cells: ["Each time you run it", "Each time you upload", "New chats save by themselves"] },
      { name: "Where it works", cells: ["Claude", "Gemini", "ChatGPT, Claude, Gemini and six more AIs"] },
      { name: "Where it is kept", cells: ["Your Claude account", "Your Google account", "Your computer"] },
    ],
    note: "From Claude's and Google's own pages and Coere's, November 2026.",
  },
  steps: [
    { title: "Install Coere Connect", text: "Pick ChatGPT, Claude and every other AI you use at setup. They all feed the same memory." },
    { title: "Save your ChatGPT chats", text: "Extract all reads ChatGPT and saves every chat on your computer, a row for each AI as it saves. New chats save by themselves after that." },
    { title: "Build your memory", text: "Coere asks what to build memory from, and nothing goes to an AI until you say yes. Each memory keeps the chats it came from." },
    { title: "Open Claude and type", text: "Start a new chat. The blue line above the chat box names what Coere will add and which AIs it learned it from. Change it if you like, then press Enter." },
  ] satisfies Step[],
  faqs: [
    {
      q: "Can I transfer my ChatGPT memory to Claude?",
      a: "Yes. Claude's memory import gives you a prompt to run in ChatGPT, and you paste the answer into Claude's memory settings. That moves a summary into Claude. Coere keeps every chat instead, and adds the right context to each new Claude chat as you type.",
    },
    {
      q: "Does Claude's import bring my ChatGPT chats?",
      a: "Claude's import page describes bringing over your preferences and context as memory, not the chats themselves. Coere saves the chats on your computer and builds its memory from them.",
    },
    {
      q: "Can I import ChatGPT conversations into Gemini?",
      a: "Yes. Gemini can take the chats from a ChatGPT export .zip, or a summary through a prompt. Google says the import isn't available in the EEA, Switzerland or the UK.",
    },
    {
      q: "Does Coere work the other way, from Claude to ChatGPT?",
      a: "Yes. ChatGPT, Claude, Gemini and six more AIs feed one memory, so context goes every way. Debug in Claude, then ask ChatGPT, and Coere carries the Claude chat over before you send.",
    },
    {
      q: "Will I still paste context into every new chat?",
      a: "No. That is what Coere replaces. You name the project and the right context goes in front of your message with one Enter. In Coere's side by side, the same chat took 240 tokens instead of 10.4k.",
    },
    {
      q: "Where are my chats kept?",
      a: "On your computer. Coere asks what to build memory from, and nothing goes to an AI to build memory until you say yes.",
    },
    pending,
  ] satisfies Faq[],
};

// ---------------------------------------------------------------- AI agent memory

export const agentMemory = {
  hero: {
    eyebrow: "AI agent memory",
    title: "Give your AI agent the user's memory",
    line: "Long-term memory for AI agents, from the person they work for. Coere Forge lets your agent read the memory a person already built across ChatGPT, Claude, Gemini and more, over MCP, REST or the SDKs, with a token they allow.",
    checks: [
      "Day one: the agent starts from what the person already said",
      "Permission first: scoped tokens the person can revoke",
      "Any MCP client: up to fifteen tools at /mcp or over stdio",
    ],
  } satisfies HeroCopy,
  answer: {
    title: "What is AI agent memory?",
    paragraphs: [
      "AI agent memory is what lets an agent remember beyond one conversation: who it works for, what was decided and what is due. Without it, every run starts from an empty context window.",
      "Most agent memory tools store what the agent learns from its own conversations and data. Coere starts somewhere else: the memory a person already built from their chats across every AI. Your agent reads that memory with the person's permission, so it knows them from the first call.",
      "The two work together. Coere gives your agent the person, and your own store keeps the agent's own work.",
    ],
    reads: [
      "Profile: who the person is and what is due soon",
      "Style: how they like to write and be answered",
      "Memory: the section tree, facts, people and their relations",
      "Search: keyword search across memory, with paths",
      "Context: the block a draft needs, with why each memory goes",
    ],
  },
  steps: [
    { title: "Get a token the person allows", text: "The person adds your app on Coere's Apps page, or your code asks with Coere.connect and the person presses Allow. The token is handed out once." },
    { title: "Ask only for what you need", text: "memory:read is on by default. Evidence, sensitive, suggest, export and identity are asked for, and a token can be kept to a few sections." },
    { title: "Connect over MCP or the API", text: "Point any MCP client at /mcp with the token, or run coere-server mcp over stdio. Or call POST /v1/context/draft for the context a message needs." },
    { title: "Suggest, never write", text: "With memory:suggest an agent can suggest a memory. Nothing changes until the person accepts it on the Memory page." },
  ] satisfies Step[],
  today: [
    "API v1: a REST API with its own OpenAPI document",
    "MCP: over HTTP at /mcp or over stdio, protocol versions 2025-11-25 and 2026-07-28",
    "SDKs: TypeScript (@coere/client) and Python (coere), with the same calls",
    "Scoped tokens: six scopes, section limits, expiry and revoke",
    "Limits: 20 requests a second per token, in bursts of 100",
    "Changes: poll GET /v1/changes; there are no webhooks",
  ],
  status:
    "Today the API is served by coere-server, which the person runs on their own computer or host. A hosted service at coere.ai is planned, and neither SDK is on npm or PyPI yet.",
  faqs: [
    {
      q: "What is a memory layer for AI agents?",
      a: "A store an agent reads and writes outside its context window, so it can recall people, decisions and deadlines across runs. Coere's is the person's own memory, built from their chats across every AI, which an agent reads with their permission.",
    },
    {
      q: "How is Coere different from agent memory tools like mem0, Zep or Letta?",
      a: "Those help an agent store and recall what it learns from its own conversations and data. Coere gives an agent the memory a person already built across every AI they use, read with a token the person allows. An agent can use Coere for the person and its own store for its own work.",
    },
    {
      q: "Does Coere have an MCP server?",
      a: "Yes. The same memory and the same token are served as MCP tools at /mcp over HTTP, or over stdio with coere-server mcp. Every token gets thirteen tools, such as get_profile, search_memory and context_for_draft, and a token with memory:suggest also gets suggest_memory.",
      link: { href: "/resources/mcp", label: "Every MCP tool" },
    },
    {
      q: "Can an agent write to the user's memory?",
      a: "Only as a suggestion. An app's one write is POST /v1/suggestions, and nothing changes until the person accepts it on the Memory page.",
    },
    {
      q: "Is there a hosted Coere API?",
      a: "Not yet. Today the API is served by coere-server on the person's own computer or host. A hosted service at coere.ai is planned.",
    },
    {
      q: "Which languages and clients does it support?",
      a: "TypeScript and Python SDKs with the same calls, any HTTP client against the REST API, and any MCP client, such as Claude Code with claude mcp add.",
      link: { href: "/resources/sdks", label: "The SDKs" },
    },
    pending,
  ] satisfies Faq[],
};
