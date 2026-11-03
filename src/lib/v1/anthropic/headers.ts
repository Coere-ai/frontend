/**
 * Which headers cross the proxy (docs/accounts.md 8.4). Going up: the API
 * version, the content type, a checked beta header and Coere's key, and
 * nothing the extension sent besides. Coming back: the four the runtime
 * reads. Rate limit headers stay behind, since they describe Coere's whole
 * account rather than the person's.
 */

const ANSWER_HEADERS = ["content-type", "request-id", "retry-after", "x-should-retry"] as const;

export function upstreamHeaders(incoming: Headers, o: { apiKey: string; beta: string | null }): Headers {
  const out = new Headers();
  const version = incoming.get("anthropic-version");
  if (version) out.set("anthropic-version", version);
  const type = incoming.get("content-type");
  if (type) out.set("content-type", type);
  if (o.beta) out.set("anthropic-beta", o.beta);
  out.set("x-api-key", o.apiKey);
  return out;
}

/** The kept answer headers with the site's own no-store and noindex. */
export function answerHeaders(upstream: Headers): Headers {
  const out = new Headers({ "cache-control": "no-store", "x-robots-tag": "noindex" });
  for (const name of ANSWER_HEADERS) {
    const value = upstream.get(name);
    if (value !== null) out.set(name, value);
  }
  return out;
}
