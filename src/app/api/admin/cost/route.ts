import { loadCost } from "@/lib/admin/cost-load";
import { adminRoute } from "@/lib/admin/route";

// GET /api/admin/cost?range=today|month|30d|all: AI spend by day, the range
// split by model and by account, and storage's cost.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const range = new URL(req.url).searchParams.get("range");
  return adminRoute("cost", () => loadCost(range));
}
