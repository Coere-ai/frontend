import type { IndustryPage } from "./types";

/** Finance, technology, commerce, consumer and manufacturing. */
export const partOne: Record<string, IndustryPage> = {
  finance: {
    line: "Advisors and analysts start every conversation from the client's full history, not a blank page.",
    stories: [
      { product: "solutions", title: "Every client's history in one memory", text: "An advisory team keeps each client in its own folder: contacts, promises and decisions. A draft about one client never carries another's.", checks: ["A folder per client", "Ask Cori what the team promised", "Export a client for a handoff"], film: "teams" },
      { product: "connect", title: "Research that remembers", text: "An analyst works across ChatGPT, Claude and Gemini. Coere brings the earlier work into each new chat as they type.", checks: ["Prep chats come back on their own", "A line shows what goes", "Nothing new goes with a follow up"], film: "smartContext" },
      { product: "forge", title: "Client apps that know the client", text: "A firm's own app asks for context with the client's permission and gets the memories a chat would get.", checks: ["The person presses Allow", "Every send is on record", "Revoke stops it at once"], film: "v3" },
    ],
  },
  technology: {
    line: "Engineering context follows the work from tool to tool, so nobody explains the stack twice.",
    stories: [
      { product: "connect", title: "Your stack, remembered", text: "An engineer asks about a side project in a new chat and Coere adds what it knows about it, its tech stack included.", checks: ["Context as you type", "Long context can go as a file (beta)", "Remove anything before you send"], film: "smartContext" },
      { product: "forge", title: "Agents with a memory over MCP", text: "A team plugs Coere into its coding agent over MCP, so the agent can search memory and get context for a draft.", checks: ["Up to fifteen MCP tools", "Same token and scopes", "HTTP or stdio"], film: "v3" },
      { product: "solutions", title: "Research across many tabs", text: "Cori splits a market scan across workers. Their finds merge into one table, each value with its page.", checks: ["Watch each worker live", "No row twice", "Export CSV"], film: "workers" },
    ],
  },
  commerce: {
    line: "Deals, partners and promises stay with the company across every market and every handoff.",
    stories: [
      { product: "solutions", title: "Every account in one place", text: "A sales team's chats about each account file under that client, with its contacts and what was promised.", checks: ["Contacts with role and client", "Open promises with dates", "Review before a client is kept"], film: "teams" },
      { product: "connect", title: "Email in your own style", text: "Ask Cori for a follow up and he drafts it in its own Gmail tab with what your memory knows about the deal.", checks: ["Written in your style", "In a tab of its own", "Asks before writing to anyone you didn't name"], film: "actionsGmail" },
      { product: "forge", title: "A CRM that reads memory", text: "An internal tool asks Coere for an account's context before a call, with the person's say on what it may read.", checks: ["Scopes the person picks", "Section limits", "Revoke stops it at once"], film: "v3" },
    ],
  },
  consumer: {
    line: "People get an AI that already knows them, and keep the say over what it knows.",
    stories: [
      { product: "connect", title: "One memory across every AI", text: "A shopper's preferences, sizes and plans come with them to whichever AI they open next.", checks: ["Nine AIs feed one memory", "Saved on their computer", "Nothing goes to an AI until they say yes"], film: "memory" },
      { product: "forge", title: "An app that knows its users on day one", text: "A consumer app asks for access and starts from what the person already told their AIs.", checks: ["The person presses Allow", "Only what changed per chat", "No webhooks to run"], film: "v3" },
      { product: "solutions", title: "Support that remembers the customer", text: "A support team's memory of each customer goes with every reply, and only that customer's.", checks: ["One client per send", "Ask Cori for the history", "Delete when the work ends"], film: "teams" },
    ],
  },
  manufacturing: {
    line: "What the line learned stays with the plant, not with one shift.",
    stories: [
      { product: "solutions", title: "Plant knowledge that stays", text: "Notes on machines, suppliers and fixes file under the company, so the next shift starts from them.", checks: ["Company memory", "Ask Cori in plain words", "Hand a supplier to a teammate by file"], film: "teams" },
      { product: "connect", title: "Forms filled from memory", text: "Cori fills a supplier form from what memory knows, leaves unknown fields empty, and lets you submit it yourself.", checks: ["Never types a password or card number", "Asks before submitting", "Stops on a page that gives orders"], film: "actionsAnywhere" },
      { product: "forge", title: "Tools that read the plant's memory", text: "A maintenance tool asks Coere for what is due soon and the history behind a machine.", checks: ["Upcoming deadlines", "Facts with their sources", "Read only, except suggestions"], film: "v3" },
    ],
  },
};
