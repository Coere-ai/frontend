import { safePath } from "@/lib/analytics/ingest/validate";
import { loadSiteAnalytics } from "@/lib/analytics/query";
import type { Audience } from "@/lib/analytics/types";
import { isSignedIn } from "@/lib/auth/session";
import { supabaseConfigured } from "@/lib/supabase";

// GET /api/statistics/data?days&tz&audience&page
//
// The dashboard's only data source. Signed-in operators only: without a valid
// session this answers 404, not 401 — an endpoint that says "unauthorized"
// confirms it exists, and there is nothing to gain by telling a stranger that.
//
// `page` scopes every number to one path, normalised exactly the way the
// beacon normalises the paths it stores, so "/about/" and
// "/about" ask the same question. Absent, the answer is site-wide.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DAYS = 400;
const AUDIENCES = new Set<Audience>(["human", "bot", "all"]);

/** Never cached, never indexed, whatever the answer. */
const PRIVATE = { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow, noarchive" };

function notFound(): Response {
  return new Response("Not found", { status: 404, headers: PRIVATE });
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...PRIVATE, "content-type": "application/json; charset=utf-8" },
  });
}

/** A timezone the platform actually knows. An unknown one would throw deep
 *  inside the bucketing, so it is rejected at the edge and falls back to UTC. */
function safeTimeZone(raw: string | null): string {
  if (!raw || raw.length > 64) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: raw });
    return raw;
  } catch {
    return "UTC";
  }
}

export async function GET(req: Request): Promise<Response> {
  if (!(await isSignedIn())) return notFound();

  if (!supabaseConfigured()) {
    return json(503, { error: "Analytics storage is not configured." });
  }

  const url = new URL(req.url);
  const days = Math.min(
    MAX_DAYS,
    Math.max(1, Math.floor(Number(url.searchParams.get("days")) || 30)),
  );
  const tz = safeTimeZone(url.searchParams.get("tz"));
  const requested = url.searchParams.get("audience") as Audience | null;
  const audience: Audience =
    requested && AUDIENCES.has(requested) ? requested : "human";
  const rawPage = url.searchParams.get("page");
  const page = rawPage ? safePath(rawPage) : null;

  try {
    const payload = await loadSiteAnalytics(days, tz, audience, page);
    return json(200, payload);
  } catch (err) {
    console.error("[/api/statistics/data] read failed:", err);
    // The message could name a table or a column; the operator gets a stable
    // string and the detail goes to the server log.
    return json(500, { error: "Could not read site analytics." });
  }
}
