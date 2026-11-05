/**
 * The one message the site still sends the Coere extension
 * (docs/accounts.md section 5): `coere.hello`, which the dashboard host
 * page uses to find Coere in this browser before it frames the Console.
 * The extension answers a small object and never chat text, memory text or
 * the token. Pure, so the shapes are tested on their own.
 */

export const helloMessage = () => ({ type: "coere.hello" }) as const;

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
