import type { Messages } from "@/site/i18n/messages/types";

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

/** Each agent's color and art, in the cards' order. The words are in the messages (productPages.agents.agents). */
const base: Pick<Agent, "slug" | "color" | "art">[] = [
  { slug: "general", color: "#5267f7", art: art("general") },
  { slug: "business", color: "#e07b24", art: art("business") },
  { slug: "finance", color: "#14a06a", art: art("finance") },
  { slug: "tech", color: "#0891b2", art: art("tech") },
];

/** The agents in a language. */
export function agentsIn(words: Messages["productPages"]["agents"]): Agent[] {
  return base.map((agent) => {
    const copy = words.agents[agent.slug];
    return { ...agent, ...copy, tasks: [...copy.tasks] };
  });
}
