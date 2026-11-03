/**
 * The messages a dashboard page sends the Coere extension, and how it reads
 * the answers (docs/accounts.md section 5). The extension answers a small
 * object and never chat text, memory text or the token. Pure, so the shapes
 * are tested on their own.
 */

/** The local pages `coere.open` may open. */
export const OPEN_TARGETS = [
  "library",
  "memory",
  "home",
  "cori",
  "settings-folder",
  "settings-import",
  "settings-logs",
  "settings-transfer",
] as const;

export type OpenTarget = (typeof OPEN_TARGETS)[number];

export type BridgeMessage =
  | { type: "coere.hello" }
  | { type: "coere.open"; target: OpenTarget }
  | { type: "coere.backup" }
  | { type: "coere.settings" };

export const helloMessage = (): BridgeMessage => ({ type: "coere.hello" });
export const openMessage = (target: OpenTarget): BridgeMessage => ({ type: "coere.open", target });
export const backupMessage = (): BridgeMessage => ({ type: "coere.backup" });
export const settingsMessage = (): BridgeMessage => ({ type: "coere.settings" });

/** What `coere.hello` tells the page about Coere in this browser. */
export interface Hello {
  version: string;
  build: number;
  signedIn: boolean;
  userId: string | null;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** The hello answer, or null when the answer is not one (another extension, or an old Coere). */
export function readHello(answer: unknown): Hello | null {
  if (!isObject(answer) || answer.ok !== true) return null;
  return {
    version: typeof answer.version === "string" ? answer.version.slice(0, 40) : "",
    build: typeof answer.build === "number" ? answer.build : 0,
    signedIn: answer.signedIn === true,
    userId: typeof answer.userId === "string" ? answer.userId : null,
  };
}

/** Whether Coere did what was asked: only `{ ok: true }` counts. */
export const answeredOk = (answer: unknown): boolean => isObject(answer) && answer.ok === true;
