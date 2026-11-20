import { siteConfig } from "@/lib/site";

/**
 * The questions on the home page, each answered in a few plain sentences
 * that stand on their own. {ais} is every AI Coere saves chats from, as a
 * list in the page's language. A `link` is the label of the link under
 * the answer; where it goes stays in src/site/content/faqs.ts.
 */
export const faqs = {
  home: [
    {
      q: "What is Coere?",
      a: "Coere is a portable AI memory layer you own. Coere Connect, a Chrome extension, saves your chats from the AIs you use on your computer, builds one memory graph from them, and adds the right context to each new chat as you type.",
      link: "What portable AI memory means",
    },
    {
      q: "Which AIs does Coere work with?",
      a: "{ais}. They all feed the same memory, so a new chat on any of them starts from what you already said on the others.",
    },
    {
      q: "How is Coere different from ChatGPT or Claude memory?",
      a: "Each AI's own memory is built from what you told that AI, and it stays inside that AI. Claude and Gemini can now import a summary from another AI by hand. Coere builds one memory from your chats on every AI, keeps each memory beside the chats it came from, and shows what goes into a chat on a line above the chat box before you send.",
      link: "Moving from ChatGPT to Claude",
    },
    {
      q: "Where is my memory kept, and who can read it?",
      a: "Every chat is saved on your computer. Coere asks what to build memory from, and nothing goes to an AI until you say yes. An app can read your memory only with a token you allow, and you can revoke that token at any time.",
    },
    {
      q: "Is Coere for teams and developers too?",
      a: "Yes. Coere Solutions builds one shared memory of a company and its clients, and a draft about one client only gets that client's memory. Coere Forge gives apps and AI agents a person's memory through an API, an MCP server and TypeScript and Python SDKs, with that person's permission.",
      link: "Memory for AI agents",
    },
    {
      q: "Is Coere the same as Cohere?",
      a: `No. ${siteConfig.notCohere} Coere builds a memory layer for people, teams and apps.`,
    },
    {
      q: "Can I use Coere today?",
      a: "Not yet. Coere is in pre-launch and the waitlist is open. Until launch, you can email the founders about Coere for you, your team or your app.",
      link: "Email the founders",
    },
  ],
} as const;
