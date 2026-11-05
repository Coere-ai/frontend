/**
 * The answers every /api/v1 route gives (docs/accounts.md section 8): never
 * cached, never indexed, and no CORS headers, since the extension holds the
 * site as a host and pages never call these routes. Errors outside the
 * Anthropic routes are problem details.
 */

/** Headers on every answer. */
export const API_HEADERS: Readonly<Record<string, string>> = {
  "cache-control": "no-store",
  "x-robots-tag": "noindex",
};

/** The problem codes of section 8, with their status and title. */
export const PROBLEMS = {
  signed_out: { status: 401, title: "Not signed in" },
  suspended: { status: 403, title: "Account suspended" },
  invalid_grant: { status: 400, title: "Connect code not accepted" },
  bad_request: { status: 400, title: "Request not understood" },
  not_found: { status: 404, title: "Not found" },
  memory_sync_off: { status: 409, title: "Memory backup is off" },
  refused: { status: 409, title: "Not allowed" },
  sensitive_off: { status: 412, title: "Sensitive memories are off" },
  too_large: { status: 413, title: "Too large" },
  rate_limited: { status: 429, title: "Too many requests" },
  usage_limit: { status: 429, title: "Monthly limit reached" },
  unavailable: { status: 503, title: "Unavailable" },
} as const;

export type ProblemCode = keyof typeof PROBLEMS;

export const ERRORS_DOC = "https://www.coere.ai/docs/errors";

function headersWith(extra: Record<string, string> = {}): Headers {
  return new Headers({ ...API_HEADERS, ...extra });
}

export function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: headersWith({ "content-type": "application/json", ...extra }),
  });
}

export function noContent(): Response {
  return new Response(null, { status: 204, headers: headersWith() });
}

/**
 * The problem details body for a code, kept apart from the Response so the
 * tests can read it. `title` replaces the code's own, for a code that covers
 * two cases (a spent lifetime limit is still `usage_limit`).
 */
export function problemBody(code: ProblemCode, title?: string) {
  const p = PROBLEMS[code];
  return { type: `${ERRORS_DOC}#${code}`, title: title ?? p.title, status: p.status, code };
}

/** A problem details answer. `retryAfter` is in whole seconds. */
export function problem(code: ProblemCode, retryAfter?: number, title?: string): Response {
  const extra: Record<string, string> = { "content-type": "application/problem+json" };
  if (retryAfter !== undefined) extra["retry-after"] = String(Math.max(1, Math.ceil(retryAfter)));
  return new Response(JSON.stringify(problemBody(code, title)), {
    status: PROBLEMS[code].status,
    headers: headersWith(extra),
  });
}

/**
 * A `refused` answer: the request was understood and the rules said no,
 * such as removing an organization's last admin or a typed email that does
 * not match. `reason` names the rule for code, and `detail` is the line to
 * show the person as it is.
 */
export function refusal(reason: string, detail: string): Response {
  return new Response(JSON.stringify({ ...problemBody("refused"), reason, detail }), {
    status: PROBLEMS.refused.status,
    headers: headersWith({ "content-type": "application/problem+json" }),
  });
}
