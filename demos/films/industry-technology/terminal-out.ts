import { aiName, chatOf, cite, dayAt } from "./field";
import { DECISIONS, STACK } from "./memory";

/**
 * What the coding assistant's terminal shows. The first command is
 * coere-v2's own SDK example (sdk/python/examples/context.py), and it
 * prints what coere-server's context API answers, in the shape the v3
 * film's real run printed: the block, how many chats it came from, and why
 * each part goes. The second is the team's assistant, made up, which reads
 * the same context with its own token before it suggests a change.
 */

const ASK = "What should I know before changing the Ledger API webhook handler?";
const LEDGER = "Clients / Halcyon Health / Ledger API";

/** "Claude, Oct 23", where a line came from. */
const from = (chat: string): string => {
  const c = chatOf(chat);
  return `${aiName(c.platform)}, ${new Date(dayAt(-c.ago)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`;
};

export function terminalLines() {
  const stack = STACK.slice(0, 2);
  const decisions = DECISIONS.slice(0, 2);
  const context = [
    "[Context from Coere, my saved memory. Use it if it helps.]",
    `${LEDGER} / Tech stack`,
    ...stack.map((l) => `- ${l.text} ${cite(l.chat)}`),
    `${LEDGER} / Decisions`,
    ...decisions.map((l) => `- ${l.text} ${cite(l.chat)}`),
    "[End of context from Coere]",
    "",
    "From 11 chats",
    `  ${LEDGER} / Tech stack: The draft names it`,
    `  ${LEDGER} / Decisions: Shares words with the draft`,
  ].join("\n");

  const why = [decisions[0]!, stack[1]!, decisions[1]!];
  const width = Math.max(...why.map((l) => l.text.length)) + 3;
  const suggest = [
    "Token dev-assistant: read only, Clients and Company. 4 memories for the Ledger API.",
    "",
    "Change internal/webhook/invoice.go",
    "  1. Insert the event id into processed_events inside the invoice transaction.",
    "  2. On a conflict, skip the update and ack. The event was handled.",
    "  3. Ack only after commit. Leave redelivery to the consumer's backoff.",
    "Why",
    ...why.map((l) => `  ${l.text.padEnd(width)}${from(l.chat)}`),
    "Wrote the patch to webhook-idempotency.diff",
  ].join("\n");

  return {
    context: { command: `uv run context.py "${ASK}"`, out: context },
    suggest: { command: 'uv run dev-assistant "Make the invoice webhook safe to redeliver"', out: suggest },
  };
}
