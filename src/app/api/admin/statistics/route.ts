import { adminRoute } from "@/lib/admin/route";
import { loadStatistics } from "@/lib/admin/statistics";

// GET /api/admin/statistics: the product's running totals for /admin.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return adminRoute("statistics", loadStatistics);
}
