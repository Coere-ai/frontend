import { agents, siteConfig } from "@/lib/site";
import { contactHref } from "./navigation";

/**
 * Questions people and AI search ask about Coere, each answered in a few
 * plain sentences that stand on their own. Every answer is something the
 * site or the developer docs (src/site/content/docs) already shows; nothing
 * here is new. Each list is drawn on its page by FaqSection and written
 * into that page's FAQPage data by faqGraph, word for word.
 */
export type Faq = { q: string; a: string; link?: { href: string; label: string } };

/** Every AI Coere saves chats from, as one line: "ChatGPT, Claude, ... and Kimi". */
export const AI_LIST = `${agents
  .slice(0, -1)
  .map((a) => a.name)
  .join(", ")} and ${agents.at(-1)?.name}`;

export const pending: Faq = {
  q: "Can I use Coere today?",
  a: "Not yet. Coere is in pre-launch and the waitlist is coming soon. Until it opens, you can email the founders about Coere for you, your team or your app.",
  link: { href: contactHref, label: "Email the founders" },
};

export const homeFaqs: Faq[] = [
  {
    q: "What is Coere?",
    a: "Coere is a portable AI memory layer you own. Coere Connect, a Chrome extension, saves your chats from the AIs you use on your computer, builds one memory graph from them, and adds the right context to each new chat as you type.",
    link: { href: "/portable-ai-memory", label: "What portable AI memory means" },
  },
  {
    q: "Which AIs does Coere work with?",
    a: `${AI_LIST}. They all feed the same memory, so a new chat on any of them starts from what you already said on the others.`,
  },
  {
    q: "How is Coere different from ChatGPT or Claude memory?",
    a: "Each AI's own memory is built from what you told that AI, and it stays inside that AI. Claude and Gemini can now import a summary from another AI by hand. Coere builds one memory from your chats on every AI, keeps each memory beside the chats it came from, and shows what goes into a chat on a line above the chat box before you send.",
    link: { href: "/chatgpt-to-claude-memory", label: "Moving from ChatGPT to Claude" },
  },
  {
    q: "Where is my memory kept, and who can read it?",
    a: "Every chat is saved on your computer. Coere asks what to build memory from, and nothing goes to an AI until you say yes. An app can read your memory only with a token you allow, and you can revoke that token at any time.",
  },
  {
    q: "Is Coere for teams and developers too?",
    a: "Yes. Coere Solutions builds one shared memory of a company and its clients, and a draft about one client only gets that client's memory. Coere Forge gives apps and AI agents a person's memory through an API, an MCP server and TypeScript and Python SDKs, with that person's permission.",
    link: { href: "/ai-agent-memory", label: "Memory for AI agents" },
  },
  {
    q: "Is Coere the same as Cohere?",
    a: `No. ${siteConfig.notCohere} Coere builds a memory layer for people, teams and apps.`,
  },
  pending,
];
