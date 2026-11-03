/**
 * How each Coere product compares with what people use today, with ChatGPT
 * and Claude's own memory as the baseline. Marks come from each product's
 * public features as of November 2026: "yes" it does it, "part" it does
 * some of it or only by hand, "no" it does not. Claude and Gemini can bring
 * in a summary or an export of another AI's chats by hand (since March
 * 2026), and mem0's OpenMemory extension shares one memory across several AI
 * sites, so those are marked as they are.
 */
export type Mark = "yes" | "part" | "no";

export type CompareTable = {
  key: string;
  label: string;
  /** The Coere product, first column. */
  coere: string;
  others: string[];
  rows: { name: string; detail: string; marks: Mark[] }[];
};

export const compareTables: CompareTable[] = [
  {
    key: "connect",
    label: "Coere Connect",
    coere: "Coere Connect",
    others: ["ChatGPT memory", "Claude memory", "Gemini", "OpenMemory"],
    rows: [
      { name: "Knows you on day one", detail: "Reads every chat you already had, on every AI", marks: ["yes", "no", "part", "part", "no"] },
      { name: "Truly universal", detail: "One memory in ChatGPT, Claude, Gemini and six more", marks: ["yes", "no", "no", "no", "yes"] },
      { name: "Structured memory layer", detail: "Sections and folders, each memory with its sources", marks: ["yes", "no", "no", "no", "part"] },
      { name: "Shows what goes in", detail: "The line above the box, yours to change before you send", marks: ["yes", "no", "no", "no", "no"] },
      { name: "Browser use from your memory", detail: "Email, calendar, forms and research in your tabs", marks: ["yes", "part", "part", "part", "no"] },
      { name: "Yours to keep", detail: "Saved on your computer, exported whenever you like", marks: ["yes", "no", "no", "no", "part"] },
      // ChatGPT's free plan has a lighter memory than its paid ones; Claude made memory free in March 2026.
      { name: "Free", detail: "The whole product, with no paid plan", marks: ["yes", "part", "yes", "yes", "yes"] },
    ],
  },
  {
    key: "forge",
    label: "Coere Forge",
    coere: "Coere Forge",
    others: ["ChatGPT memory", "Claude memory", "mem0", "Zep"],
    rows: [
      { name: "Knows your user on day one", detail: "Reads the memory they already built across every AI", marks: ["yes", "no", "no", "no", "no"] },
      { name: "The person says yes", detail: "Scoped tokens they can revoke at any time", marks: ["yes", "no", "no", "no", "no"] },
      { name: "API, MCP server and SDKs", detail: "TypeScript and Python, or any MCP client", marks: ["yes", "no", "no", "yes", "yes"] },
      { name: "Structured memory with sources", detail: "Every answer names the chat it came from", marks: ["yes", "no", "no", "part", "part"] },
      { name: "Fewer tokens per call", detail: "Only the context this request needs", marks: ["yes", "no", "no", "yes", "yes"] },
    ],
  },
  {
    key: "solutions",
    label: "Coere Solutions",
    coere: "Coere Solutions",
    others: ["ChatGPT memory", "Claude memory", "Glean"],
    rows: [
      { name: "Built from the team's AI chats", detail: "Every chat your team already had, on every AI", marks: ["yes", "no", "no", "no"] },
      { name: "A folder for every client", detail: "Contacts, promises and decisions, kept apart", marks: ["yes", "part", "part", "no"] },
      { name: "One client per send", detail: "A draft about one client never gets another's", marks: ["yes", "no", "no", "no"] },
      { name: "Works in every AI the team uses", detail: "ChatGPT, Claude, Gemini and more, one memory", marks: ["yes", "no", "no", "part"] },
      { name: "Hand off or delete a client", detail: "Export one client, or remove it and check", marks: ["yes", "part", "part", "no"] },
    ],
  },
];
