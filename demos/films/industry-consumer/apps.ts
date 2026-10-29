import type { World } from "../../stage/world";
import { field } from "../../../scripts/industries/fields/consumer.mjs";

/**
 * Coere Forge's side of the promotion planner (field.app): the Apps page
 * of the v3 dashboard, paired with coere-server on Olivia's Mac, where the
 * app's ask from its own code waits for Allow, limited to Clients; then
 * its token, which the terminal's commands use; then the record of
 * what it was sent, as the server's context log keeps it (ids only, the
 * words read back from memory by the page). Shaped as the real access
 * layer answers (demos/films/v3/data/apps.json, baked from a real
 * coere-server), at the step the film is at.
 */

export const APP = field.app.name as string;
/** The code the app prints and the Allow card shows, so Olivia can tell it is hers. */
export const CODE = "4FHP-9WLT";

type Step = "asked" | "allowed" | "used";

const at = (ms: number) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");

/** What the terminal prints, as the SDK's connect and context example print it (sdk/python, examples/event-planner). */
export function terminalLines() {
  const a = field.app;
  const block = [
    "[Context from Coere, my saved memory. Use it if it helps.]",
    ...(a.sections as { path: string; facts: string[] }[]).flatMap((s) => [s.path, ...s.facts.map((x) => `- ${x}`)]),
    "[End of context from Coere]",
    "",
    `From ${a.from} chats`,
    ...(a.reasons as [string, string][]).map(([path, why]) => `  ${path}: ${why}`),
  ];
  return {
    connect: `uv run ${APP} --connect`,
    asked: `Open Apps in Coere and allow ${APP}. Code ${CODE}.`,
    allowed: `Allowed. The token is saved in ~/${APP}/.env.`,
    context: `uv run context.py "${a.ask}"`,
    out: block.join("\n"),
  };
}

type Section = { path: string; facts: string[] };

/**
 * The memory the planner's context call sent, as the Apps page reads it
 * back by id to say what went (console/apps/sent-memory.ts): each section
 * of field.app as a node with its path, and each line as a fact, without
 * the source the context block adds after it.
 */
const SENT = (field.app.sections as Section[]).map((sec, i) => {
  const steps = sec.path.split(" / ");
  const id = `ent_promo_${i + 1}`;
  return {
    id,
    records: sec.facts.map((_, n) => `fact_promo_${i + 1}_${n + 1}`),
    detail: {
      node: {
        id,
        kind: "topic",
        label: steps.at(-1)!,
        section: "sec_clients",
        parent: null,
        importance: 3,
        pinned: false,
        urgency: "none",
        facts: sec.facts.length,
        history: false,
        aliases: [],
        path: steps.slice(0, -1).map((label, k) => ({ id: `ent_promo_path_${k}`, label })),
        summary: null,
      },
      due: [],
      groups: [{ name: "facts", facts: sec.facts.map((text, n) => ({ id: `fact_promo_${i + 1}_${n + 1}`, text: text.replace(/\s*\([^)]*\)$/, "") })) }],
      earlier: [],
      relations: [],
      review: [],
    },
  };
});

export class Access {
  step: Step = "asked";
  private usedAt: string | null = null;

  /** `node` answers every other memory.node call, as the dashboard's memory does. */
  constructor(
    private readonly world: World,
    private readonly node: (id: string) => unknown = () => null,
  ) {}

  /** The planner has asked for context once: its token was used, and the call is on record. */
  use(): void {
    this.step = "used";
    this.usedAt = at(Date.now());
  }

  install(): void {
    const now = Date.now();
    const status = () => ({
      state: "ok",
      url: "http://127.0.0.1:7316",
      lastOkAt: new Date().toISOString(),
      nextTryAt: null,
      pending: 0,
      shareSensitive: false,
      apps: this.step === "asked" ? 0 : 1,
      suggestions: 0,
      connects: this.step === "asked" ? 1 : 0,
      demoOnServer: false,
    });
    const ask = { id: "con_01M65RT7QK2HX9VB4NDW8ZE3FA", name: APP, code: CODE, scopes: ["memory:read"], sections: ["Clients"], createdAt: at(now), expiresAt: at(now + 600_000) };
    const token = { id: "tok_01M65RT8B6WY3KQ1HZ5M7XN2CE", name: APP, scopes: ["memory:read"], sections: ["Clients"], hint: "R7PD", createdAt: at(now), lastUsedAt: null as string | null, expiresAt: null };
    const log = () => [
      {
        at: this.usedAt,
        token: token.id,
        target: null,
        chat: "5c1e0a7d93f2b64e8a1d07c5f39b2e6a4d8c1f07b3e95a62d4c8f1e0b7a3d915",
        first: false,
        client: null,
        items: SENT.map(({ id, records }) => ({ id, records })),
        tokens: 96,
        recorded: true,
      },
    ];
    this.world
      .engine("access.status", () => status())
      .engine("access.syncNow", () => status())
      .engine("access.tokens.list", () => (this.step === "asked" ? [] : [{ ...token, lastUsedAt: this.usedAt }]))
      .engine("access.contextLog", () => (this.step === "used" ? log() : []))
      // The Apps page reads what went back from memory, by id.
      .engine("memory.node", (m) => {
        const id = String((m.args as { id?: string } | undefined)?.id ?? "");
        return SENT.find((x) => x.id === id)?.detail ?? this.node(id);
      })
      .engine("memory.documents", () => [])
      .engine("access.connects.list", () => (this.step === "asked" ? [ask] : []))
      .engine("access.requests", () => [])
      .engine("access.suggestions.list", () => [])
      .engine("access.connects.decide", () => {
        this.step = "allowed";
        setTimeout(() => this.world.tell({ ch: "coere", type: "engine.event", event: { name: "access.status", status: status() } }), 0);
        return { tokenId: token.id };
      });
  }
}
