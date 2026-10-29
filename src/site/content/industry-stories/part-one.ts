import type { IndustryPage } from "./types";

/** Legal, finance and technology. Each story matches the demo it names. */
export const partOne: Record<string, IndustryPage> = {
  legal: {
    line: "Prepare every matter from everything you already worked out, with each client's memory kept to that client.",
    stories: [
      { product: "connect", demo: "context", title: "Deposition prep that starts from the record", text: "Ask for help with a deposition and Coere brings your outline, the key witness and the exhibit that matters into the chat.", checks: ["Your outline from last week", "The witness and the exhibits", "Shown on the line before you send"] },
      { product: "solutions", demo: "graph", title: "A knowledge graph of every client and matter", text: "Each client gets its own folder: contacts, matters, promises and filing deadlines, built from the firm's chats.", checks: ["Matters under each client", "Deadlines with their source", "Delete a client when the work ends"] },
      { product: "solutions", demo: "confidential", title: "Client confidentiality by design", text: "A draft about one client gets that client's memory and no one else's, and Cori answers from the matter with each source.", checks: ["One client per send", "Every answer names its chat", "Nothing from other matters"] },
      { product: "forge", demo: "app", title: "Firm tools that read the matter", text: "A matter desk built on Forge asks where a case stands and gets the same memory, with the person's permission.", checks: ["Token per tool", "Scopes and sections", "Revoke at any time"] },
    ],
  },
  finance: {
    line: "Every advisor starts from the client's full history, not a blank page.",
    stories: [
      { product: "connect", demo: "context", title: "Review prep from a year of conversations", text: "Ask for help with a client review and Coere brings the client's goals, worries and accounts into the chat.", checks: ["Goals in the client's words", "Allocation and drift", "What changed since last time"] },
      { product: "solutions", demo: "graph", title: "Every household in one memory", text: "Each client has a folder of contacts, accounts, promises and deadlines that every advisor on the team can use.", checks: ["Households and family members", "Promises with due dates", "Tax and estate deadlines"] },
      { product: "solutions", demo: "confidential", title: "One client at a time", text: "A note to one client carries only that client's memory, and Cori can say what the team promised them.", checks: ["One client per send", "Sources on every answer", "Nothing from other households"] },
      { product: "forge", demo: "app", title: "Review tools that know the client", text: "A review prep app built on Forge pulls the client's goals and accounts before the meeting.", checks: ["The person allows it", "Read only, except suggestions", "Every send on record"] },
    ],
  },
  technology: {
    line: "Your stack and decisions follow you from Claude to ChatGPT to your own tools, so nobody explains them twice.",
    stories: [
      { product: "connect", demo: "context", title: "Switch AIs without losing the stack", text: "Debug in Claude, then ask ChatGPT. Coere carries the Claude chat, the tech stack and the decisions over before you send.", checks: ["The chat you had in Claude", "Go, Postgres, NATS and where it runs", "Decisions like idempotent handlers"] },
      { product: "solutions", demo: "graph", title: "One memory of every project", text: "Each client project keeps its stack, its people, its promises and its launch dates, built from the team's chats.", checks: ["Stack and architecture notes", "Who owns what", "Launch dates and freezes"] },
      { product: "solutions", demo: "confidential", title: "Ask about the stack, get sources", text: "Cori answers what a project runs on from memory, with the chat each fact came from, and a draft to a client carries only that client.", checks: ["Answers with sources", "One client per send", "No guessing"] },
      { product: "forge", demo: "app", title: "Agents that know the codebase decisions", text: "A coding assistant built on Forge reads the project's stack and decisions before it suggests a change.", checks: ["Context API or MCP", "Scopes per token", "Every send on record"] },
    ],
  },
};
