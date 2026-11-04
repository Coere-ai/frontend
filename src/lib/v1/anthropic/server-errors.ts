/**
 * Upstream errors about Coere's own Anthropic account, not the caller's.
 *
 * Every call runs on Coere's one key, so a spent credit balance, Coere's
 * workspace spend limit, or a key Anthropic refuses is the server's problem.
 * Passed through, the extension reads them as the person's own billing,
 * spend cap or permission trouble and stops their queue (the spend cap until
 * next month). The proxy answers these as 503 `unavailable` instead, which
 * the extension retries on its own once Coere is fixed. The proxy's own
 * coere.ai usage limit is made before anything is forwarded, so a 400 with
 * "You have reached your specified" from upstream is always Coere's.
 */

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** The 400 messages Anthropic sends about the account itself, by how they start. */
const ACCOUNT_400 = ["Your credit balance is too low", "You have reached your specified"];

/** A short label for the log, or null when the error belongs to the request. */
export function serverAccountError(status: number, body: string): string | null {
  if (status === 401 || status === 402 || status === 403) return String(status);
  if (status !== 400 && status !== 429) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return null;
  }
  const error = isRecord(parsed) && isRecord(parsed.error) ? parsed.error : null;
  if (!error) return null;
  if (status === 429) {
    const code = isRecord(error.details) ? error.details.error_code : null;
    return code === "enforced_spend_limit_reached" ? "429 enforced_spend_limit_reached" : null;
  }
  const message = typeof error.message === "string" ? error.message : "";
  if (error.type === "invalid_request_error" && ACCOUNT_400.some((p) => message.startsWith(p))) return "400 account";
  return null;
}
