/**
 * The one message the framed extension sends the page around it
 * (docs/accounts.md 7): Sign out in the Console's rail, once the extension
 * has disconnected itself, asks the host page to sign the site session out
 * too. The extension posts it to the site's exact origin; the host takes it
 * only from the frame it made, at the frame's own extension origin, with
 * this type and nothing else. It carries no data. Pure, so a test pins
 * every refusal.
 */
export const SIGN_OUT_TYPE = "coere.sign_out";

/** What the check reads from a message event. */
export interface FrameMessage {
  origin: string;
  data: unknown;
  /** The window that sent it; the host compares it with its own frame's window. */
  source: unknown;
}

/** True only for the sign out ask from this frame: its window, its extension's origin, the fixed type. */
export function isSignOutAsk(m: FrameMessage, frame: { origin: string; window: unknown }): boolean {
  if (m.source === null || m.source !== frame.window || m.origin !== frame.origin) return false;
  const data = m.data;
  return typeof data === "object" && data !== null && !Array.isArray(data) && (data as { type?: unknown }).type === SIGN_OUT_TYPE && Object.keys(data).length === 1;
}
