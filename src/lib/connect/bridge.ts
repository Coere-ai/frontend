/**
 * Talking to the Coere extension from a page on this site
 * (docs/accounts.md section 5). The extension lists the site in
 * `externally_connectable`, which is what gives these pages
 * `chrome.runtime.sendMessage` at all. Browser only.
 */

type Runtime = {
  sendMessage: (extensionId: string, message: unknown, callback: (answer: unknown) => void) => void;
  lastError?: { message?: string };
};

export type BridgeResult = { ok: true; answer: unknown } | { ok: false; reason: "missing" | "no_answer" | "timeout" };

/** The page's `chrome.runtime`, or null in another browser or with no extension that lets this site in. */
export function extensionRuntime(): Runtime | null {
  const chrome = (globalThis as { chrome?: { runtime?: Partial<Runtime> } }).chrome;
  return typeof chrome?.runtime?.sendMessage === "function" ? (chrome.runtime as Runtime) : null;
}

/**
 * Sends one message and waits for the answer. The callback form works in
 * every Chrome that has the bridge; `lastError` set means no extension with
 * that id is listening.
 */
export function sendToExtension(extensionId: string, message: unknown, timeoutMs = 10_000): Promise<BridgeResult> {
  const runtime = extensionRuntime();
  if (!runtime) return Promise.resolve({ ok: false, reason: "missing" });
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ ok: false, reason: "timeout" }), timeoutMs);
    try {
      runtime.sendMessage(extensionId, message, (answer) => {
        clearTimeout(timer);
        resolve(runtime.lastError ? { ok: false, reason: "no_answer" } : { ok: true, answer });
      });
    } catch {
      clearTimeout(timer);
      resolve({ ok: false, reason: "no_answer" });
    }
  });
}
