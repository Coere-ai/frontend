import { clampDays } from "@/lib/admin/http";
import { adminRoute } from "@/lib/admin/route";
import { loadSecurity } from "@/lib/admin/security";

// GET /api/admin/security?days: the security log over the last 1 to 90 days.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const days = clampDays(new URL(req.url).searchParams.get("days"), 30, 90);
  return adminRoute("security", () => loadSecurity(days));
}
