import { safePath } from "@/lib/analytics/ingest/validate";
import { loadSiteAnalytics } from "@/lib/analytics/query";
import type { Audience } from "@/lib/analytics/types";
import { clampDays, safeTimeZone } from "@/lib/admin/http";
import { adminRoute } from "@/lib/admin/route";

// GET /api/admin/analytics?days&tz&audience&page
//
// The site analytics panel's only data source. Signed in operators only:
// without the admin session this answers 404, not 401.
//
// `page` scopes every number to one path, normalised exactly the way the
// beacon normalises the paths it stores, so "/about/" and "/about" ask the
// same question. Absent, the answer is site wide.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DAYS = 400;
const AUDIENCES = new Set<Audience>(["human", "bot", "all"]);

export async function GET(req: Request): Promise<Response> {
  return adminRoute("analytics", async () => {
    const url = new URL(req.url);
    const days = clampDays(url.searchParams.get("days"), 30, MAX_DAYS);
    const tz = safeTimeZone(url.searchParams.get("tz"));
    const requested = url.searchParams.get("audience") as Audience | null;
    const audience: Audience = requested && AUDIENCES.has(requested) ? requested : "human";
    const rawPage = url.searchParams.get("page");
    const page = rawPage ? safePath(rawPage) : null;
    return loadSiteAnalytics(days, tz, audience, page);
  });
}
