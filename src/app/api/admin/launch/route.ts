import { adminRoute } from "@/lib/admin/route";
import { loadAdminLaunch } from "@/lib/launch/store";

// GET /api/admin/launch: each product's launch moment, read fresh, and
// whether it is saved or the default.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return adminRoute("launch", loadAdminLaunch);
}
