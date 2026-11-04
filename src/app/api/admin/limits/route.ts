import { loadLimits } from "@/lib/admin/limits-load";
import { adminRoute } from "@/lib/admin/route";

// GET /api/admin/limits: each plan's spend limits and how many accounts
// override each one.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return adminRoute("limits", loadLimits);
}
