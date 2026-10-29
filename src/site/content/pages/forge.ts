import type { GridItem, HeroCopy } from "./types";

/**
 * Coere Forge's page. The facts come from the coere-v2 server and SDK code:
 * apps read memory with a token the person allowed, and nothing else.
 */
export const forgeHero: HeroCopy = {
  eyebrow: "Coere Forge",
  title: "Memory infrastructure for your apps",
  line: "A REST API, an MCP server and TypeScript and Python clients that let your apps and agents read a person's Coere memory, with their permission.",
  checks: [
    "Context for a draft: the memories a new chat would get, ready to put in front",
    "Permission first: the person presses Allow, and the token comes once",
    "Revoke any time: a token stops working at once",
  ],
};

export const forgeGrid: GridItem[] = [
  { icon: "sparkle", title: "Draft context", text: "POST /v1/context/draft answers with a block to prepend and each memory with why it goes." },
  { icon: "graph", title: "Read the tree", text: "The section tree, any node and its children, facts, entities and their relations." },
  { icon: "chat", title: "Search", text: "Keyword search across memory, with paths and facts for each hit." },
  { icon: "people", title: "Profile and style", text: "Who the person is, what is due soon, and how they like to write and be answered." },
  { icon: "pen", title: "Suggest a memory", text: "The one write an app has. Nothing changes until the person accepts it." },
  { icon: "plug", title: "MCP", text: "Up to fifteen tools at /mcp or over stdio, behind the same token and scopes." },
  { icon: "key", title: "Six scopes", text: "memory:read is on by default. Evidence, sensitive, suggest, export and identity are asked for." },
  { icon: "gauge", title: "Change feed", text: "Poll GET /v1/changes to follow what changed. There are no webhooks." },
];
