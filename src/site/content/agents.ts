/**
 * Coere Agents: Cori, the helper in Coere, in a version for each field.
 * Each agent is the same Cori in its own color, working from the person's
 * or the team's memory with the actions and workers Cori already has. The
 * field agents are how we present Cori for a field; what each one does is
 * what Cori does in the films.
 */
export type Agent = {
  slug: "general" | "business" | "finance" | "tech";
  name: string;
  field: string;
  /** The agent's accent. Keep in step with scripts/agents/build-cori.mts. */
  color: string;
  art: string;
  line: string;
  tasks: string[];
};

const art = (slug: string) => `/preview/images/agents/cori-${slug}.svg`;

export const agents: Agent[] = [
  {
    slug: "general",
    name: "Cori",
    field: "General",
    color: "#5267f7",
    art: art("general"),
    line: "The helper in Coere for everything else: your email, your calendar, your writing and the forms in your way.",
    tasks: ["Draft an email in your style", "Put an event on your calendar", "Fill a form from what you know"],
  },
  {
    slug: "business",
    name: "Cori for Business",
    field: "Business",
    color: "#e07b24",
    art: art("business"),
    line: "Knows your company and every client, and keeps each client's memory to that client.",
    tasks: ["Recap what the team promised a client", "Write the follow up after a meeting", "Research a market across many tabs"],
  },
  {
    slug: "finance",
    name: "Cori for Finance",
    field: "Finance",
    color: "#14a06a",
    art: art("finance"),
    line: "Works from each client's history, and never invents a value: every number names the page it came from.",
    tasks: ["Prep for a client review", "Gather figures from many pages into one table", "Draft the summary for the client"],
  },
  {
    slug: "tech",
    name: "Cori for Tech",
    field: "Tech",
    color: "#0891b2",
    art: art("tech"),
    line: "Knows your projects and your stack, so a question about either starts from what you already decided.",
    tasks: ["Compare tools across many tabs", "Write the project update", "Answer from your stack, not a guess"],
  },
];
