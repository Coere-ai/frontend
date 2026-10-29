import type { GridItem, HeroCopy } from "./types";

/** Coere Agents' page. What the agents do is what Cori does in the films. */
export const agentsHero: HeroCopy = {
  eyebrow: "Coere Agents",
  title: "One worker, infinite possibilities",
  line: "Give Cori one task. It works from your memory, and when the job is big it becomes as many workers as the job needs, each in a tab of its own.",
  checks: [
    "Your memory: every worker starts from what you and your team know",
    "As many as it takes: one task can run in ten tabs at once",
    "Asks first: nothing is sent or submitted without you",
  ],
};

/** The workers film in its three parts, by the live film's chapters. */
export const workerParts = [
  {
    key: "split",
    title: "One task, many workers",
    text: "Ask for something that needs many pages read, like twenty companies with a person to contact at each. Cori splits it across workers, each searching in a tab of its own.",
    checks: ["Watch what each worker sees, live", "Stop or Take over any one of them", "The count climbs as rows come in"],
    part: { from: "handoff", to: "report" },
  },
  {
    key: "table",
    title: "One table, a source for every value",
    text: "What the workers find merges into one table with no row twice. Each value keeps the page it came from.",
    checks: ["No row twice", "Every value names its page", "Export CSV or Copy"],
    part: { from: "report", to: "stop-all" },
  },
  {
    key: "stop",
    title: "Stop all, any time",
    text: "Start another search in a new chat, or stop everything at once. Stop all ends every worker and closes their tabs.",
    checks: ["Stop all closes every tab", "Start again in a new chat", "Cori never invents a value"],
    part: { from: "stop-all" },
  },
];

export const agentsGrid: GridItem[] = [
  { icon: "graph", title: "Your memory", text: "Every agent starts from what your chats taught Coere." },
  { icon: "mail", title: "Email", text: "Drafts in your style, in a Gmail tab of its own." },
  { icon: "calendar", title: "Calendar", text: "Adds the event with the guests and time zone you said." },
  { icon: "pen", title: "Writing", text: "Fixes or improves text in Gmail, Docs and chat boxes." },
  { icon: "cursor", title: "Forms and quizzes", text: "Answers from memory and asks before it submits." },
  { icon: "mic", title: "Voice", text: "Hold Right Option and talk; it answers out loud." },
  { icon: "plug", title: "Workers", text: "One task in many tabs at once, merged into one table." },
  { icon: "lock", title: "You stay in charge", text: "Take over, hand back or stop on any page it works on." },
  { icon: "columns", title: "Research", text: "Reads many sites at once and brings back one table with a source for every value." },
  { icon: "sparkle", title: "Anything in a browser", text: "If you can do it on a page, a worker can do it from your memory." },
];
