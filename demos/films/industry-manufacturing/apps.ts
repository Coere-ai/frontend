import type { World } from "../../stage/world";
import { field } from "../../../scripts/industries/fields/manufacturing.mjs";

/**
 * Coere Forge's side of the line assistant (field.app): the Apps page
 * of the v3 dashboard, paired with coere-server on Luis's laptop, where the
 * app's ask from its own code waits for Allow, limited to Clients; then
 * its token, which the terminal's commands use. Shaped as the real
 * access layer answers (demos/films/v3/data/apps.json, baked from a real
 * coere-server), at the step the film is at.
 */

export const APP = field.app.name as string;
/** The code the app prints and the Allow card shows, so Luis can tell it is his. */
export const CODE = "4HTW-9LPC";

type Step = "asked" | "allowed";

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

export class Access {
  step: Step = "asked";

  constructor(private readonly world: World) {}

  install(): void {
    const now = Date.now();
    const status = () => ({
      state: "ok",
      url: "http://127.0.0.1:7316",
      lastOkAt: new Date().toISOString(),
      nextTryAt: null,
      pending: 0,
      shareSensitive: false,
      apps: this.step === "allowed" ? 1 : 0,
      suggestions: 0,
      connects: this.step === "asked" ? 1 : 0,
      demoOnServer: false,
    });
    const ask = { id: "con_01M6A2Q7TB4KX9RWDNV3HY8C5E", name: APP, code: CODE, scopes: ["memory:read"], sections: ["Clients"], createdAt: at(now), expiresAt: at(now + 600_000) };
    const token = { id: "tok_01M6A2Q8C1ZP7YQ4W9E6R2T3VK", name: APP, scopes: ["memory:read"], sections: ["Clients"], hint: "LN7R", createdAt: at(now), lastUsedAt: null, expiresAt: null };
    this.world
      .engine("access.status", () => status())
      .engine("access.syncNow", () => status())
      .engine("access.tokens.list", () => (this.step === "allowed" ? [token] : []))
      .engine("access.contextLog", () => [])
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
