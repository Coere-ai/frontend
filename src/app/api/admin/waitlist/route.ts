import { adminRoute } from "@/lib/admin/route";
import { loadWaitlist } from "@/lib/admin/waitlist";

// GET /api/admin/waitlist: the developer waitlist and its count by day.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return adminRoute("waitlist", loadWaitlist);
}
