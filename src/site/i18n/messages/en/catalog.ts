/**
 * The words of the things the site lists in many places: the products,
 * their features, who Coere is for, the industries and the guides. The
 * lists themselves (slugs, pictures, links) stay in src/site/content.
 */
export const catalog = {
  products: {
    connect: {
      kind: "Memory for people",
      tagline: "Your memory, across every AI.",
      description: "A memory layer that belongs to you. It saves your chats from every AI you use and brings the right context into each new one.",
    },
    solutions: {
      kind: "Memory for teams",
      tagline: "One memory for the whole company.",
      description: "A shared memory for a company, its people and its clients. Every chat starts from what the team already knows.",
    },
    forge: {
      kind: "Memory for developers",
      tagline: "Memory infrastructure for your apps.",
      description: "The API, MCP server and SDKs that let your apps and agents use Coere as their memory layer, with the person's permission.",
    },
    agents: {
      kind: "Agents for every field",
      tagline: "One worker, infinite possibilities, built on your memory.",
      description: "Cori, the helper in Coere, in a version for each field. Each one works from your memory and splits big tasks across workers.",
    },
  },
  features: {
    memory: {
      name: "Memory",
      title: "Everything your chats taught it, in one graph",
      description: "Coere sorts what your chats say into sections and folders and draws it around you. Every memory keeps the messages it came from.",
    },
    extraction: {
      name: "Extraction",
      title: "Every chat you've had, saved in one place",
      description: "Extract all reads ChatGPT, Claude and Gemini and saves every chat on your computer. After that, new chats come in by themselves.",
    },
    "smart-context": {
      name: "Smart context",
      title: "The right context goes in as you type",
      description: "A line above the chat box says what Coere will add and which AIs it learned it from. One Enter sends your message with the context in front.",
    },
    voice: {
      name: "Voice",
      title: "Ask out loud and hear the answer",
      description: "Hold Right Option and talk. Cori shows your words as you say them and answers out loud when you let go.",
    },
    cori: {
      name: "Cori",
      title: "One helper on every AI",
      description: "Cori finds your old chats in plain words and answers how Coere works, on the dashboard, in the toolbar and on any AI site.",
    },
    actions: {
      name: "Actions",
      title: "Email written in your own style",
      description: "Ask Cori for an email and it writes it in its own Gmail tab with what your memory knows. It asks before it sends to anyone you didn't name.",
    },
    writer: {
      name: "Writer",
      title: "Fix your writing right where it is",
      description: "Select text in Gmail, Docs or a chat box. Cori fixes or improves it and marks each change in blue until you keep it or go back.",
    },
    "any-site": {
      name: "Any site",
      title: "Forms and quizzes from what you already know",
      description: "On any page Cori works step by step from your memory, asks before it submits, and stops when a page tries to give it orders.",
    },
    workers: {
      name: "Workers",
      title: "Research split across many tabs",
      description: "A big task runs in several tabs at once. What they find merges into one table, each value with the page it came from.",
    },
  },
  seeAllFeatures: "See all features",
  applications: {
    consumer: { name: "Consumer", summary: "One memory across every AI." },
    developer: { name: "Developer", summary: "Apps and agents that read memory." },
    business: { name: "Business", summary: "Company and client memory." },
  },
  industries: {
    finance: { name: "Finance", summary: "Every advisor starts from the full history.", uses: ["Client memory", "Meeting follow ups"], alt: "The New York Stock Exchange on Wall Street" },
    technology: { name: "Technology", summary: "Engineering context, from tool to tool.", uses: ["Project memory", "Agent context"], alt: "San Francisco at night with the Salesforce Tower" },
    commerce: { name: "Commerce", summary: "Deals and promises across every market.", uses: ["Account memory", "Partner history"], alt: "The Hong Kong skyline across Victoria Harbour" },
    consumer: { name: "Consumer", summary: "Shoppers known on every channel.", uses: ["Customer memory", "Support context"], alt: "A grocery store aisle with stocked shelves" },
    manufacturing: { name: "Manufacturing", summary: "What the line learned stays with the plant.", uses: ["Line and machine notes", "Handover memory"], alt: "Robot arms on a factory assembly line" },
    energy: { name: "Energy", summary: "Field knowledge that stays with the company.", uses: ["Site and asset notes", "Handover memory"], alt: "Wind turbines on the Livermore hills above the fog" },
    education: { name: "Education", summary: "Classes that pick up where they left off.", uses: ["Course memory", "Study context"], alt: "Sather Tower at UC Berkeley" },
    legal: { name: "Legal", summary: "Matters and precedents across the firm.", uses: ["Matter memory", "Client history"], alt: "The Supreme Court of the United States" },
  },
  guides: {
    "portable-ai-memory": { name: "Portable AI memory", kind: "What it is" },
    "chatgpt-to-claude-memory": { name: "ChatGPT to Claude memory", kind: "Switching AIs" },
    "ai-agent-memory": { name: "AI agent memory", kind: "For developers" },
  },
} as const;
