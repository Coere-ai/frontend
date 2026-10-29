import type { FilmCase, GridItem, HeroCopy } from "./types";

/** Coere Solutions' page, from what the Teams film shows. */
export const solutionsHero: HeroCopy = {
  eyebrow: "Coere Solutions",
  title: "One memory for the whole company",
  line: "Coere for Teams builds one memory of the company, its people and its clients from the chats your team already has.",
  checks: [
    "Company: the team, its way of working and its tools",
    "Clients: a folder for each, with contacts and promises",
    "One client per send: a draft about one never gets another's memory",
  ],
};

export const solutionsCases: FilmCase[] = [
  {
    key: "company",
    label: "Company and clients",
    title: "Company and clients",
    text: "Extract all saves every chat from the AIs your team uses, and the graph grows into Company and Clients as Coere reads them.",
    checks: ["Each client's contacts, promises and decisions", "A client the chats found waits in Review", "Ask Cori what the team promised a client"],
    film: "teams",
  },
  {
    key: "right-client",
    label: "The right client",
    title: "The right client in every chat",
    text: "Start a reply about a client and the blue line names the client the draft is about. What goes is on the line before you send.",
    checks: ["One client goes with each send", "Only what changed goes with a follow up", "Long context can go as a file (beta)"],
    film: "smartContext",
  },
  {
    key: "research",
    label: "Research",
    title: "Research split across many tabs",
    text: "A big task goes to several workers at once, each reading pages in a tab of its own. Their finds merge into one table.",
    checks: ["Watch each worker live, with Stop and Take over", "No row twice", "Every value names the page it came from"],
    film: "workers",
  },
];

export const solutionsGrid: GridItem[] = [
  { icon: "building", title: "Company memory", text: "Who the team is, how it works and the tools it uses, in one place." },
  { icon: "folder", title: "Client folders", text: "Each client with its contacts, promises and decisions." },
  { icon: "sparkle", title: "One client per send", text: "Every draft gets the client it is about, and only that one." },
  { icon: "chat", title: "Ask Cori", text: "What did we promise Kestrel Outdoor? Answered with each promise, its date and its AI." },
  { icon: "share", title: "Hand off a client", text: "Export one client to a file a teammate can import. The line says what it holds." },
  { icon: "lock", title: "Delete when work ends", text: "Delete everything about a client, then Coere checks nothing is left." },
  { icon: "columns", title: "Workers", text: "Many tabs of research merged into one table with sources." },
  { icon: "people", title: "Review first", text: "A client the chats found waits in Review until you keep it." },
];
