import { loadCost } from "@/lib/admin/cost-load";
import { adminRoute } from "@/lib/admin/route";

// GET /api/admin/cost: AI spend by day, model and account, and storage's cost.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return adminRoute("cost", loadCost);
}
