/**
 * The answers every admin data route gives. Each one is never cached and
 * never indexed. A signed out caller gets a bare 404, not a 401, because a
 * route that says "unauthorized" confirms it exists. Pure, so the tests can
 * pin the headers and the parsing.
 */

export const PRIVATE = { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow, noarchive" } as const;

export function notFound(): Response {
  return new Response("Not found", { status: 404, headers: PRIVATE });
}

export function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...PRIVATE, "content-type": "application/json; charset=utf-8" },
  });
}

/** A file to save, such as the waitlist's CSV. The name is fixed by the caller, never taken from a request. */
export function download(body: string, fileName: string, type: string): Response {
  return new Response(body, {
    status: 200,
    headers: { ...PRIVATE, "content-type": `${type}; charset=utf-8`, "content-disposition": `attachment; filename="${fileName}"` },
  });
}

/** A time zone the platform knows. An unknown one would throw deep inside the bucketing, so it falls back to UTC here. */
export function safeTimeZone(raw: string | null): string {
  if (!raw || raw.length > 64) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: raw });
    return raw;
  } catch {
    return "UTC";
  }
}

/** A whole number of days from a query, kept between 1 and `max`. */
export function clampDays(raw: string | null, fallback: number, max: number): number {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n < 1) return Math.min(fallback, max);
  return Math.min(max, n);
}

/** A row id from a query or a form: a uuid and nothing else. */
export const isUuid = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
